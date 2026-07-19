const fs = require('fs');
let c = fs.readFileSync('scripts/migrations.mjs', 'utf8');
c = c.replace(/DO \$ BEGIN/g, () => 'DO $$ BEGIN');
c = c.replace(/END \$;/g, () => 'END $$;');
fs.writeFileSync('scripts/migrations.mjs', c, 'utf8');
console.log('Fixed $$');
