const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function checkBlocks() {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, 'server', 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.log('Database file not found:', dbPath);
    return;
  }
  
  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);
  
  try {
    // Check if blocks table exists
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='blocks'");
    if (result.length === 0) {
      console.log('Blocks table does not exist');
      return;
    }
    
    // Get all blocks
    const blocks = db.exec("SELECT id, name, title, is_visible FROM blocks");
    if (blocks.length > 0) {
      console.log('Blocks in database:');
      const columns = blocks[0].columns;
      const rows = blocks[0].values;
      rows.forEach(row => {
        const obj = {};
        columns.forEach((col, i) => obj[col] = row[i]);
        console.log(`  ${obj.id}: ${obj.name} - "${obj.title}" (visible: ${obj.is_visible})`);
      });
    } else {
      console.log('No blocks found in database');
    }
    
    // Check for documents block specifically
    const docsBlock = db.exec("SELECT * FROM blocks WHERE name = 'documents'");
    if (docsBlock.length > 0 && docsBlock[0].values.length > 0) {
      console.log('\n✅ Documents block found in database');
      const docRow = docsBlock[0].values[0];
      console.log('  ID:', docRow[0]);
      console.log('  Items:', docRow[8]); // items field
    } else {
      console.log('\n❌ Documents block NOT found in database');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkBlocks().catch(console.error);