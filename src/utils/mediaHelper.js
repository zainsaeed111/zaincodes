/**
 * Media Helper for ZainCodes Portfolio
 * Handles zero-cost video embeds (YouTube, Vimeo, Google Drive, MP4)
 * and multi-screenshot gallery parsing
 */

/**
 * Extracts embed details for any free video hosting provider
 * @param {string} url 
 * @returns {{ type: 'youtube' | 'vimeo' | 'gdrive' | 'html5', embedUrl: string } | null}
 */
export function getVideoEmbedInfo(url) {
  if (!url || typeof url !== 'string' || !url.trim() || url.trim() === '#') {
    return null;
  }

  const clean = url.trim();

  // 1. YouTube (standard, short, embed, or shorts)
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      id: ytMatch[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
    };
  }

  // 2. Vimeo
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
  if (vimeoMatch && (vimeoMatch[3] || vimeoMatch[1])) {
    const id = vimeoMatch[3] || vimeoMatch[1];
    return {
      type: 'vimeo',
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`
    };
  }

  // 3. Google Drive Video Preview
  const gdriveMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch && gdriveMatch[1]) {
    return {
      type: 'gdrive',
      id: gdriveMatch[1],
      embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`
    };
  }

  // 4. Direct HTML5 Video (.mp4, .webm, .ogg)
  const isDirectFile = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(clean);
  const isCloudinaryVideo = clean.includes('cloudinary.com') && clean.includes('/video/');

  if (isDirectFile || isCloudinaryVideo) {
    return {
      type: 'html5',
      embedUrl: clean
    };
  }

  // Fallback: If it's a URL, attempt HTML5 video tag
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return {
      type: 'html5',
      embedUrl: clean
    };
  }

  return null;
}

/**
 * Normalizes multi-screenshot inputs (array or string) into a clean URL array
 * @param {string[] | string} input 
 * @returns {string[]}
 */
export function normalizeScreenshots(input) {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(s => String(s).trim()).filter(s => s && s !== '#');
  }
  if (typeof input === 'string') {
    return input
      .split(/[\n,]/)
      .map(s => s.trim())
      .filter(s => s && s !== '#');
  }
  return [];
}
