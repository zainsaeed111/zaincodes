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
    const token = localStorage.getItem('REACT_APP_GITHUB_TOKEN') || process.env.REACT_APP_GITHUB_TOKEN;

    if (!token) {
        throw new Error('GitHub Token not found. Please add it in Admin Settings or Vercel Environment Variables.');
    }

    try {
        // 1. Get the current file's SHA (required by GitHub API for updates)
        const getFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getFileResponse.ok) {
            throw new Error('Failed to fetch current data from GitHub.');
        }

        const fileData = await getFileResponse.json();
        const sha = fileData.sha;

        // 2. Prepare the update
        const content = b64EncodeUnicode(JSON.stringify(newData, null, 2));

        const updateResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DATA_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'Update portfolio data via Admin Panel',
                content: content,
                sha: sha,
                branch: 'main' // Ensure we target the production branch
            })
        });

        if (!updateResponse.ok) {
            const error = await updateResponse.json();
            throw new Error(error.message || 'Failed to push updates to GitHub.');
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
        const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${DATA_PATH}`);
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
