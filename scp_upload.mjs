const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
  console.log('SSH Ready');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    console.log('SFTP Ready');
    
    sftp.fastPut('db_export.json', '/tmp/db_export.json', (err) => {
      if (err) throw err;
      console.log('Uploaded db_export.json');
      
      sftp.fastPut('import_db.mjs', '/tmp/import_db.mjs', (err) => {
        if (err) throw err;
        console.log('Uploaded import_db.mjs');
        
        sftp.fastPut('media.zip', '/tmp/media.zip', (err) => {
          if (err) throw err;
          console.log('Uploaded media.zip');
          conn.end();
          process.exit(0);
        });
      });
    });
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
