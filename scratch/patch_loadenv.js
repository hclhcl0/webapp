const fs = require('fs');

const pathJS = 'node_modules/payload/dist/bin/loadEnv.js';
const pathTS = 'node_modules/payload/src/bin/loadEnv.ts';

if (fs.existsSync(pathJS)) {
  let content = fs.readFileSync(pathJS, 'utf8');
  content = content.replace("const nextEnvImport = require('@next/env');", "import * as nextEnvImport from '@next/env';");
  fs.writeFileSync(pathJS, content);
  console.log("Patched loadEnv.js");
}

if (fs.existsSync(pathTS)) {
  let content = fs.readFileSync(pathTS, 'utf8');
  content = content.replace("const nextEnvImport = require('@next/env');", "import * as nextEnvImport from '@next/env';");
  fs.writeFileSync(pathTS, content);
  console.log("Patched loadEnv.ts");
}
