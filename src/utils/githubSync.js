/**
 * Utility for synchronizing portfolio data with GitHub
 * Allows real-time global persistence by committing changes to the repository
 */

const GITHUB_REPO = 'zainsaeed111/zaincodes';
const DATA_PATH = 'src/data/portfolioData.json';

/**
 * Pushes updated portfolio data to GitHub
 * @param {Object} newData - The complete portfolio data object
 * @returns {Promise<Object>} - Result of the operation
 */
export const pushToGitHub = async (newData) => {
    const rawToken = localStorage.getItem('REACT_APP_GITHUB_TOKEN') || process.env.REACT_APP_GITHUB_TOKEN;

    if (!rawToken || !rawToken.trim()) {
        throw new Error('GitHub Token not found. Please add it in Admin Settings.');
    }

    let cleanToken = rawToken.trim().replace(/^['"]|['"]$/g, '');
    cleanToken = cleanToken.replace(/^(token|bearer)\s+/i, '');
    const authHeader = cleanToken.startsWith('github_pat_') 
        ? `Bearer ${cleanToken}` 
        : `token ${cleanToken}`;

    try {
        // 1. Get the current file's SHA (required by GitHub API for updates)
        const getFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}?ref=master`, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getFileResponse.ok) {
            const errJson = await getFileResponse.json().catch(() => ({}));
            const errMsg = errJson.message || `HTTP ${getFileResponse.status} ${getFileResponse.statusText}`;
            if (getFileResponse.status === 401) {
                throw new Error('Invalid GitHub Token (Bad credentials). Please generate a new Personal Access Token with repo scope.');
            }
            if (getFileResponse.status === 403 || getFileResponse.status === 404) {
                throw new Error(`GitHub Access Error (${errMsg}). Ensure your token has 'repo' scope permissions.`);
            }
            throw new Error(`Failed to fetch from GitHub: ${errMsg}`);
        }

        const fileData = await getFileResponse.json();
        const sha = fileData.sha;

        // 2. Prepare the update
        const content = b64EncodeUnicode(JSON.stringify(newData, null, 2));

        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'Update portfolio data via Admin Panel',
                content: content,
                sha: sha,
                branch: 'master' // Target the production branch
            })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json().catch(() => ({}));
            throw new Error(error.message || `Failed to push updates to GitHub (Status ${updateResponse.status}).`);
        }

        return await updateResponse.json();
    } catch (error) {
        console.error('GitHub Sync Error:', error);
        throw error;
    }
};

/**
 * Fetches the latest data directly from the GitHub repository
 * Useful for immediate updates without waiting for a new Vercel build
 */
export const fetchLatestGitHubData = async () => {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/master/${DATA_PATH}?t=${Date.now()}`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch latest global data:', error);
        return null;
    }
};

// Helper for Unicode-safe Base64 encoding
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
