/**
 * /api/photos
 *
 * Returns a JSON array of image filenames found in the /images directory.
 * Called by the admin interface to detect files that have no Supabase
 * metadata entry yet (unregistered photos).
 *
 * Vercel runs this as a serverless Node.js function. It has access to
 * the filesystem of the deployed project at build time via process.cwd().
 *
 * Response: { files: ["filename1.jpg", "filename2.jpg", ...] }
 */

const fs   = require('fs');
const path = require('path');

// Image file extensions to include
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

module.exports = (req, res) => {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const imagesDir = path.join(process.cwd(), 'images');

    // If the directory doesn't exist, return empty array gracefully
    if (!fs.existsSync(imagesDir)) {
      return res.status(200).json({ files: [] });
    }

    const all = fs.readdirSync(imagesDir);

    // Filter to image files only, exclude hidden files
    const files = all.filter(name => {
      if (name.startsWith('.')) return false;
      const ext = path.extname(name).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext);
    });

    // Sort alphabetically for consistent ordering
    files.sort();

    res.status(200).json({ files });

  } catch (err) {
    console.error('[api/photos] Error reading images directory:', err);
    res.status(500).json({ error: 'Could not read images directory' });
  }
};
