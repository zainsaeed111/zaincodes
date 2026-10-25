/**
 * Free Resume Manager & Downloader for ZainCodes Portfolio
 * Allows zero-cost resume upload (Base64/Local) and one-click direct download
 */

/**
 * Initiates direct download of Zain Saeed's Resume
 */
export function downloadResume() {
  const fileData = localStorage.getItem('resumeFileData');
  const fileName = localStorage.getItem('resumeFileName') || 'Zain_Saeed_Mobile_Developer_Resume.pdf';
  const customLink = localStorage.getItem('resumeLink');

  // 1. Direct Base64 File Download (Uploaded in Admin Panel)
  if (fileData && fileData.startsWith('data:')) {
    try {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true, method: 'direct_download' };
    } catch (e) {
      console.error('Base64 download error, trying fallback:', e);
    }
  }

  // 2. Custom Link (Google Drive, GitHub, Dropbox, etc.)
  if (customLink && customLink.trim() && customLink !== '""') {
    let cleanUrl = customLink.trim().replace(/^['"]|['"]$/g, '');
    
    // Auto-convert Google Drive view links to direct download links
    if (cleanUrl.includes('drive.google.com/file/d/')) {
      const fileIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        cleanUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    }

    const win = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      return { success: true, method: 'external_link' };
    }
  }

  // 3. Fallback: Download official default resume document or public PDF
  try {
    const defaultLink = document.createElement('a');
    defaultLink.href = '/resume.pdf';
    defaultLink.download = 'Zain_Saeed_Resume.pdf';
    document.body.appendChild(defaultLink);
    defaultLink.click();
    document.body.removeChild(defaultLink);
    return { success: true, method: 'public_fallback' };
  } catch (err) {
    // Ultimate fallback: open contact section
    window.location.href = '#contact';
    return { success: false, method: 'contact' };
  }
}

/**
 * Validates and reads an uploaded resume file into Base64 format
 * @param {File} file 
 * @returns {Promise<{ name: string, size: string, dataUrl: string }>}
 */
export function processResumeUpload(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided.'));
      return;
    }

    // Limit to 4.5 MB to respect localStorage limits safely
    const MAX_BYTES = 4.5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      reject(new Error('File size exceeds 4.5 MB. Please upload a smaller PDF or compress it.'));
      return;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
      reject(new Error('Please upload a valid PDF document (.pdf).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const sizeKB = (file.size / 1024).toFixed(1) + ' KB';
      resolve({
        name: file.name,
        size: sizeKB,
        dataUrl: reader.result,
        updatedAt: new Date().toLocaleDateString()
      });
    };
    reader.onerror = () => reject(new Error('Failed to read the file. Please try again.'));
    reader.readAsDataURL(file);
  });
}
