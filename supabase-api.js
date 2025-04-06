import https from 'https';
import fs from 'fs';

const token = 'sbp_0fd7b6ae9046f6436f7ee482cba8ca0cdbf7f043';
const command = process.argv[2] || 'help';

// Helper functions
function makeRequest(options, callback, postData = null) {
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        // Some endpoints might return empty responses
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
  
  if (postData) {
    req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
  }
  
  req.end();
}

function requireParams(params) {
  for (const [index, param] of params.entries()) {
    if (!process.argv[index + 3]) {
      console.error(`Error: Missing parameter: ${param}`);
      return false;
    }
  }
  return true;
}

// Command definitions
const commands = {
  // Organization commands
  'list-orgs': () => {
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/organizations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      console.log('Organizations:');
      data.forEach(org => {
        console.log(`- ${org.name} (ID: ${org.id})`);
      });
    });
  },
  
  // Project commands
  'list-projects': () => {
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/projects',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      console.log('Projects:');
      data.forEach(project => {
        console.log(`- ${project.name} (ID: ${project.id})`);
      });
    });
  },
  
  'get-project': () => {
    if (!requireParams(['project_id'])) return;
    const projectId = process.argv[3];
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      console.log('Project Details:');
      console.log(JSON.stringify(data, null, 2));
    });
  },
  
  // Database structure commands
  'list-tables': () => {
    if (!requireParams(['project_id'])) return;
    const projectId = process.argv[3];
    
    // Get tables via REST API
    const options = {
      hostname: `${projectId}.supabase.co`,
      path: `/rest/v1/rpc/pg_tables?select=schemaname,tablename`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': `${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    makeRequest(options, (data) => {
      if (!Array.isArray(data)) {
        console.error('Error: Unexpected response format');
        console.log('Raw data:', data);
        return;
      }
      
      console.log('Tables:');
      const publicTables = data.filter(t => t.schemaname === 'public');
      if (publicTables.length === 0) {
        console.log('No tables found in the public schema');
      } else {
        publicTables.forEach(table => {
          console.log(`- ${table.schemaname}.${table.tablename}`);
        });
      }
      
      // Also show tables in other non-system schemas
      const otherSchemaTables = data.filter(t => t.schemaname !== 'public' && 
                                         !['pg_catalog', 'information_schema'].includes(t.schemaname));
      if (otherSchemaTables.length > 0) {
        console.log('\nOther schema tables:');
        otherSchemaTables.forEach(table => {
          console.log(`- ${table.schemaname}.${table.tablename}`);
        });
      }
    });
  },
  
  // SQL execution commands
  'run-sql': () => {
    if (!requireParams(['project_id', 'sql_query'])) return;
    const projectId = process.argv[3];
    const sqlQuery = process.argv[4];
    
    // Check if the query is a file path
    let query = sqlQuery;
    if (sqlQuery.endsWith('.sql') && fs.existsSync(sqlQuery)) {
      query = fs.readFileSync(sqlQuery, 'utf8');
      console.log(`Running SQL from file: ${sqlQuery}`);
    }
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = {
      query: query
    };
    
    makeRequest(options, (data) => {
      console.log('SQL Result:');
      
      if (data.error) {
        console.error('Error executing SQL:');
        console.error(data.error.message || data.error);
        return;
      }
      
      if (data.result) {
        console.log(JSON.stringify(data.result, null, 2));
      } else {
        console.log('Query executed successfully (no results returned)');
      }
    }, JSON.stringify(postData));
  },
  
  // Function management
  'list-functions': () => {
    if (!requireParams(['project_id'])) return;
    const projectId = process.argv[3];
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/functions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      console.log('Edge Functions:');
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(func => {
          console.log(`- ${func.name} (ID: ${func.id}, Status: ${func.status})`);
        });
      } else {
        console.log('No edge functions found');
      }
    });
  },
  
  // Migration management
  'list-migrations': () => {
    if (!requireParams(['project_id'])) return;
    const projectId = process.argv[3];
    
    // Run SQL to get migration information from schema_migrations table
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const query = 'SELECT * FROM supabase_migrations.schema_migrations ORDER BY version ASC;';
    const postData = { query };
    
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error retrieving migrations:', data.error.message || data.error);
        return;
      }
      
      console.log('Database Migrations:');
      if (data.result && Array.isArray(data.result)) {
        if (data.result.length === 0) {
          console.log('No migrations found');
        } else {
          data.result.forEach(migration => {
            console.log(`- Version: ${migration.version}, Status: ${migration.status}, Name: ${migration.name}`);
          });
        }
      } else {
        console.log('Unable to retrieve migrations (table might not exist yet)');
      }
    }, JSON.stringify(postData));
  },
  
  // Help command
  'help': () => {
    console.log('Supabase API CLI - Available commands:');
    console.log('');
    console.log('Organization Commands:');
    console.log('  list-orgs                      List all organizations');
    console.log('');
    console.log('Project Commands:');
    console.log('  list-projects                  List all projects');
    console.log('  get-project <project_id>       Get project details');
    console.log('');
    console.log('Database Structure Commands:');
    console.log('  list-tables <project_id>       List all tables in the database');
    console.log('');
    console.log('SQL Commands:');
    console.log('  run-sql <project_id> <query>   Execute SQL query (string or .sql file)');
    console.log('');
    console.log('Function Management:');
    console.log('  list-functions <project_id>    List all edge functions');
    console.log('');
    console.log('Migration Management:');
    console.log('  list-migrations <project_id>   List all database migrations');
  }
};

// Functions for programmatic access
export async function listOrganizations() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/organizations',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      if (data.error) {
        reject(new Error(data.error.message || data.error));
      } else {
        resolve(data);
      }
    });
  });
}

export async function listProjects() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: '/v1/projects',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(options, (data) => {
      if (data.error) {
        reject(new Error(data.error.message || data.error));
      } else {
        resolve(data);
      }
    });
  });
}

export async function executeSQL(projectId, query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = { query };
    
    makeRequest(options, (data) => {
      if (data.error) {
        reject(new Error(data.error.message || data.error));
      } else {
        resolve(data);
      }
    }, JSON.stringify(postData));
  });
}

export async function listTables(projectId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectId}.supabase.co`,
      path: `/rest/v1/rpc/pg_tables?select=schemaname,tablename`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': `${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    makeRequest(options, (data) => {
      if (!Array.isArray(data)) {
        reject(new Error('Unexpected response format'));
      } else {
        // Filter to only return public tables
        const publicTables = data.filter(t => t.schemaname === 'public');
        resolve(publicTables);
      }
    });
  });
}

// Execute the requested command if called directly via node
// In ES modules, we check if this is the main module by checking import.meta.url
if (import.meta.url === `file://${process.argv[1]}`) {
  if (commands[command]) {
    commands[command]();
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Run `node supabase-api.js help` for a list of available commands');
  }
}

// Export helper functions
export { makeRequest, requireParams };
