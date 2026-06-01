/**
 * /api/photos
 *
 * Returns a JSON array of image filenames found in the /images directory.
 * Called by the admin interface to detect files that have no Supabase
 * metadata entry yet (unregistered photos).
 */

const fs   = require('fs');
const path = require('path');

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Try multiple candidate paths — Vercel's cwd can differ by runtime version
  const candidates = [
    path.join(process.cwd(), 'images'),
    path.join(process.cwd(), '..', 'images'),
    path.join(__dirname, '..', 'images'),
    path.join(__dirname, '..', '..', 'images'),
  ];

  let imagesDir = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      imagesDir = candidate;
      break;
    }
  }

  // Diagnostic info — visible in Vercel function logs
  console.log('[api/photos] cwd:', process.cwd());
  console.log('[api/photos] __dirname:', __dirname);
  console.log('[api/photos] candidates tried:', candidates);
  console.log('[api/photos] resolved to:', imagesDir);

  if (!imagesDir) {
    // Return empty with diagnostic info so we can debug without breaking the admin
    return res.status(200).json({
      files: [],
      debug: {
        cwd: process.cwd(),
        dirname: __dirname,
        candidates
      }
    });
  }

  try {
    const all   = fs.readdirSync(imagesDir);
    const files = all.filter(name => {
      if (name.startsWith('.')) return false;
      return IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase());
    });
    files.sort();
    res.status(200).json({ files });
  } catch (err) {
    console.error('[api/photos] Error reading directory:', err);
    res.status(500).json({ error: err.message });
  }
};
