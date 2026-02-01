// Quick Test for Database Tables
// This script will test if database tables exist

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing environment variables.');
  console.error('Please ensure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  const tables = ['projects', 'users', 'statuses', 'labels', 'priorities', 'sizes', 'tasks'];
  const results = {};

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist') || error.code === 'PGRST116') {
          results[table] = 'Does not exist';
        } else {
          results[table] = `Error: ${error.message}`;
        }
      } else {
        results[table] = 'Exists';
      }
    } catch (err) {
      results[table] = `Error: ${err.message}`;
    }
  }

  console.log('\n=== Database Table Test Results ===');
  for (const [table, result] of Object.entries(results)) {
    console.log(`${table}: ${result}`);
  }

  const allExist = Object.values(results).every(r => r === 'Exists');
  
  if (allExist) {
    console.log('\n✅ All tables exist!');
  } else {
    console.log('\n❌ Some tables are missing.');
    console.log('\nPlease run the SQL schema in Supabase.');
  }
}

testTables();
