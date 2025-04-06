import https from 'https';
import fs from 'fs';

// Read anon key from .env file
const envContent = fs.readFileSync('./.env', 'utf8');
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
const anonKey = anonKeyMatch ? anonKeyMatch[1] : null;

const urlMatch = envContent.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const supabaseUrl = urlMatch ? urlMatch[1] : null;

if (!anonKey || !supabaseUrl) {
  console.error('Could not find required environment variables in .env file');
  process.exit(1);
}

const accessToken = 'sbp_0fd7b6ae9046f6436f7ee482cba8ca0cdbf7f043';
const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

console.log('Project Information:');
console.log('--------------------');
console.log('Project ID:', projectId);
console.log('Supabase URL:', supabaseUrl);

// Management API request function
function managementRequest(path, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
            resolve({});
            return;
          }
          
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          console.error('Error parsing response:', e.message);
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error making request:', error.message);
      reject(error);
    });
    
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    
    req.end();
  });
}

// SQL execution helper
async function executeSQL(query) {
  const postData = { query };
  return managementRequest(`/v1/projects/${projectId}/sql`, 'POST', postData);
}

// Get project information
async function getProjectInfo() {
  try {
    console.log('\nRetrieving project details...');
    const projectInfo = await managementRequest(`/v1/projects/${projectId}`);
    console.log('Project Details:');
    console.log(`Name: ${projectInfo.name}`);
    console.log(`Region: ${projectInfo.region}`);
    console.log(`Status: ${projectInfo.status}`);
    if (projectInfo.database) {
      console.log(`Database Host: ${projectInfo.database.host}`);
      console.log(`Postgres Version: ${projectInfo.database.version}`);
    }
    
    // Get database schemas
    console.log('\nRetrieving database schemas...');
    const schemasResult = await executeSQL("SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast') ORDER BY schema_name;");
    
    if (schemasResult.error) {
      console.error('Error retrieving schemas:', schemasResult.error.message || schemasResult.error);
    } else if (schemasResult.result && Array.isArray(schemasResult.result)) {
      console.log('Database Schemas:');
      schemasResult.result.forEach(schema => {
        console.log(`- ${schema.schema_name}`);
      });
    }
    
    // Get public tables
    console.log('\nRetrieving public tables...');
    const tablesResult = await executeSQL("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    
    if (tablesResult.error) {
      console.error('Error retrieving tables:', tablesResult.error.message || tablesResult.error);
    } else if (tablesResult.result && Array.isArray(tablesResult.result)) {
      console.log('Public Tables:');
      if (tablesResult.result.length === 0) {
        console.log('No public tables found');
      } else {
        tablesResult.result.forEach(table => {
          console.log(`- ${table.table_name}`);
        });
      }
    }
    
    // Get auth tables
    console.log('\nRetrieving auth tables...');
    const authTablesResult = await executeSQL("SELECT table_name FROM information_schema.tables WHERE table_schema = 'auth' ORDER BY table_name;");
    
    if (authTablesResult.error) {
      console.error('Error retrieving auth tables:', authTablesResult.error.message || authTablesResult.error);
    } else if (authTablesResult.result && Array.isArray(authTablesResult.result)) {
      console.log('Auth Tables:');
      authTablesResult.result.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Get storage tables
    console.log('\nRetrieving storage tables...');
    const storageTablesResult = await executeSQL("SELECT table_name FROM information_schema.tables WHERE table_schema = 'storage' ORDER BY table_name;");
    
    if (storageTablesResult.error) {
      console.error('Error retrieving storage tables:', storageTablesResult.error.message || storageTablesResult.error);
    } else if (storageTablesResult.result && Array.isArray(storageTablesResult.result)) {
      console.log('Storage Tables:');
      storageTablesResult.result.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }
    
    // Get functions
    console.log('\nRetrieving edge functions...');
    const functions = await managementRequest(`/v1/projects/${projectId}/functions`);
    console.log('Edge Functions:');
    if (Array.isArray(functions) && functions.length > 0) {
      functions.forEach(func => {
        console.log(`- ${func.name} (Status: ${func.status})`);
      });
    } else {
      console.log('No edge functions found');
    }

  } catch (error) {
    console.error('Error getting project information:', error.message);
  }
}

// Run the main function
getProjectInfo();
