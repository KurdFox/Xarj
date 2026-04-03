import fs from 'fs';
import path from 'path';

// This script is just to ensure the server file is ready for production
// In a real scenario, we might use esbuild to bundle server.ts
// For now, we'll just ensure the dist directory exists and copy server.ts if needed
const distPath = path.join(process.cwd(), 'dist');
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}
console.log('Build server script completed.');
