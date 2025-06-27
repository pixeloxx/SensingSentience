import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
// Helper to resolve config.js from USB or fallback to default
export async function loadConfig() {
  // Default config path (relative to this file)
let configPath = path.join(projectRoot, 'config.js');

//check if config.js exists in the project root
  if (!fs.existsSync(configPath)) {
    console.log(`config not found in project root: ${configPath}`);
  } 

  // Common USB mount points
  const usbPaths = [
    '/media',                // Linux
    '/mnt',                  // Linux
    '/Volumes',              // macOS
    'E:\\', 'F:\\', 'G:\\',  // Windows (add more if needed)
  ];

  // Try to find config.js on any USB drive
  for (const base of usbPaths) {
    try {
      if (fs.existsSync(base)) {
        const entries = fs.readdirSync(base);
        for (const entry of entries) {
          const usbDir = path.join(base, entry);
          const candidate = path.join(usbDir, 'config.js');
          if (fs.existsSync(candidate)) {
            configPath = candidate;
            console.log(`Using config from USB: ${candidate}`);
            break;
          }
        }
      }
      if (!configPath.endsWith('config.js')) break;
    } catch (e) {
      // Ignore errors for non-existent drives
    }
  }

  // Dynamic import (ESM)
  const configModule = await import(configPath.startsWith('/') || configPath.match(/^[A-Z]:\\/) 
    ? `file://${configPath}` 
    : configPath);

  return configModule.config;
}