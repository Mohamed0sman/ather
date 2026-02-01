/**
 * Script to run the Supabase schema automatically
 * Usage: node run-schema.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing environment variables.');
  console.error('Please ensure .env.local has:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runSchema() {
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Running SQL schema...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    // If exec_sql doesn't exist, try a different approach
    if (error && error.message.includes('function')) {
      console.log('exec_sql function not found, trying direct query...');
      
      // Use the REST API directly
      const response = await fetch(`${supabaseUrl}/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
        },
        body: JSON.stringify({ sql }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      console.log('Schema executed successfully!');
    } else if (error) {
      throw error;
    } else {
      console.log('Schema executed successfully!');
    }
    
    console.log('\nDatabase setup complete!');
  } catch (error) {
    console.error('Error running schema:', error.message);
    console.log('\nPlease run the SQL manually in Supabase Dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Click SQL Editor');
    console.log('4. Copy content from supabase-schema.sql');
    console.log('5. Click Run\n');
    process.exit(1);
  }
}

runSchema();
