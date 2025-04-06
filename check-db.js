import https from 'https';
import fs from 'fs';

// Read anon key from .env file
const envContent = fs.readFileSync('./.env', 'utf8');
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const anonKey = anonKeyMatch ? anonKeyMatch[1] : null;

if (!anonKey) {
  console.error('Could not find VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const projectId = 'jraqpyndhlkusevqmspy';
const apiUrl = `https://${projectId}.supabase.co`;

console.log('Using project ID:', projectId);
console.log('Using API URL:', apiUrl);

// Function to make a request to the Supabase REST API
function makeRequest(path, callback) {
  const options = {
    hostname: `${projectId}.supabase.co`,
    path,
    method: 'GET',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        if (data.trim() === '') {
          callback({});
          return;
        }
        
        const jsonData = JSON.parse(data);
        callback(jsonData);
      } catch (e) {
        console.error('Error parsing response:', e.message);
        console.log('Raw response:', data);
        console.log('Status code:', res.statusCode);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('Error making request:', error.message);
  });
  
  req.end();
}

// Get information about database schemas
console.log('\nGetting database information...');
makeRequest('/rest/v1/rpc/pg_schemas', (data) => {
  console.log('\nDatabase Schemas:');
  if (Array.isArray(data)) {
    data.forEach(schema => {
      console.log(`- ${schema.schema_name}`);
    });
  } else {
    console.log('Could not retrieve schemas:', data);
  }
  
  // Get list of tables in public schema
  console.log('\nChecking tables in public schema...');
  makeRequest('/rest/v1/?apikey=' + anonKey, (data) => {
    console.log('\nPublic Tables:');
    if (typeof data === 'object' && data !== null) {
      const tables = Object.keys(data.definitions || {});
      if (tables.length > 0) {
        tables.forEach(table => {
          console.log(`- ${table}`);
        });
      } else {
        console.log('No tables found in public schema');
      }
    } else {
      console.log('Could not retrieve tables:', data);
    }
    
    // Get Supabase auth configuration
    console.log('\nChecking auth configuration...');
    makeRequest('/rest/v1/rpc/auth_config', (data) => {
      console.log('\nAuth Configuration:');
      console.log(data);
    });
  });
});
