const fs = require('fs');

const pathJS = 'node_modules/payload/dist/bin/loadEnv.js';
const pathTS = 'node_modules/payload/src/bin/loadEnv.ts';

const patch = (filePath) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    // We already patched it to import * as nextEnvImport.
    // Let's replace the whole file content to be absolutely sure.
    const newContent = `
import { findUpSync } from '../utilities/findUp.js';
import * as nextEnvImport from '@next/env';
const loadEnvConfig = nextEnvImport.loadEnvConfig || (nextEnvImport.default && nextEnvImport.default.loadEnvConfig) || nextEnvImport;

export function loadEnv(path) {
    if (path?.length) {
        loadEnvConfig(path, true);
        return;
    }
    const dev = process.env.NODE_ENV !== 'production';
    const loaded = loadEnvConfig(process.cwd(), dev);
    const loadedEnvFiles = loaded && loaded.loadedEnvFiles;
    if (!loadedEnvFiles?.length) {
        findUpSync({
            condition: (dir)=>{
                const l = loadEnvConfig(dir, true);
                if (l && l.loadedEnvFiles?.length) {
                    return true;
                }
            },
            dir: process.cwd()
        });
    }
}
`;
    fs.writeFileSync(filePath, newContent);
    console.log("Patched " + filePath);
  }
};

patch(pathJS);
patch(pathTS);
