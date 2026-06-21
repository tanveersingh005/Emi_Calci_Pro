const fs = require('fs');
const path = require('path');

// Auto-copy preview image from sandbox brain directory to project root
const src = 'C:\\Users\\harry\\.gemini\\antigravity\\brain\\8c409f34-7c1f-4a97-ab09-ae4f0694c66b\\media__1782019439882.png';
const dest = path.join(__dirname, 'workspace_preview.png');

if (fs.existsSync(src)) {
  try {
    fs.copyFileSync(src, dest);
  } catch (err) {
    console.error('Preview image copy error:', err);
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
