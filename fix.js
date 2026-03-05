const fs = require('fs');
let api = fs.readFileSync('pages/api/upload.js', 'utf8');
api = api.replace(
  "onBeforeGenerateToken: async (pathname) => {",
  "onBeforeGenerateToken: async (pathname) => {\n        token: process.env.BLOB_READ_WRITE_TOKEN,"
);
fs.writeFileSync('pages/api/upload.js', api);
console.log('Done!');