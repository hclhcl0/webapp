const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const conn = new Client();
const filesToUpload = [
  'pasted-image.png',
  'pasted-image-1.png',
  'pasted-image-2.png',
  'pasted-image-3.png',
  'pasted-image-4.png',
  'pasted-image-5.png'
];

conn.on('ready', () => {
  console.log('SSH Ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP Ready');
    
    let uploaded = 0;
    for (const file of filesToUpload) {
      const localPath = path.join(__dirname, 'media', file);
      const remotePath = `/tmp/${file}`;
      
      if (fs.existsSync(localPath)) {
        sftp.fastPut(localPath, remotePath, (err) => {
          if (err) console.error('Failed to upload', file, err);
          else console.log('Uploaded', file);
          
          uploaded++;
          if (uploaded === filesToUpload.length) {
            console.log('All files uploaded. Exiting.');
            conn.end();
            process.exit(0);
          }
        });
      } else {
        console.log('File not found locally:', file);
        uploaded++;
        if (uploaded === filesToUpload.length) {
          console.log('All files uploaded. Exiting.');
          conn.end();
          process.exit(0);
        }
      }
    }
  });
}).connect({
  host: '172.16.0.31',
  port: 22,
  username: 'cdc',
  password: process.env.SSH_PASS
});

conn.on('error', (err) => {
  console.error('SSH Connection Error:', err);
});
