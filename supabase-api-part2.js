import https from 'https';
import fs from 'fs';
import path from 'path';

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

// Command definitions for Part 2 (more advanced operations)
const commands = {
  // Table operations
  'table-info': () => {
    if (!requireParams(['project_id', 'table_name'])) return;
    const projectId = process.argv[3];
    const tableName = process.argv[4];
    
    // Use SQL to get table information
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const query = `
      SELECT 
        column_name, 
        data_type,
        column_default,
        is_nullable
      FROM 
        information_schema.columns 
      WHERE 
        table_name = '${tableName}' AND 
        table_schema = 'public'
      ORDER BY 
        ordinal_position;
    `;
    
    const postData = { query };
    
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error getting table info:', data.error.message || data.error);
        return;
      }
      
      console.log(`Table: ${tableName}`);
      console.log('Columns:');
      
      if (data.result && Array.isArray(data.result)) {
        if (data.result.length === 0) {
          console.log(`Table '${tableName}' not found or has no columns`);
        } else {
          const columnPadding = Math.max(...data.result.map(col => col.column_name.length)) + 2;
          const typePadding = Math.max(...data.result.map(col => col.data_type.length)) + 2;
          
          console.log(`${'Column'.padEnd(columnPadding)} ${'Type'.padEnd(typePadding)} ${'Nullable'.padEnd(10)} Default`);
          console.log(`${'-'.repeat(columnPadding-1)} ${'-'.repeat(typePadding-1)} ${'-'.repeat(9)} ${'-'.repeat(10)}`);
          
          data.result.forEach(column => {
            console.log(
              `${column.column_name.padEnd(columnPadding)} ` +
              `${column.data_type.padEnd(typePadding)} ` +
              `${column.is_nullable.padEnd(10)} ` +
              `${column.column_default || ''}`
            );
          });
        }
      }
      
      // Get constraints
      const constraintQuery = `
        SELECT
          c.conname as constraint_name,
          c.contype as constraint_type,
          array_to_string(array_agg(a.attname), ', ') as columns
        FROM
          pg_constraint c
          JOIN pg_class t ON c.conrelid = t.oid
          JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = t.oid
        WHERE
          t.relname = '${tableName}' AND
          t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        GROUP BY
          c.conname, c.contype
        ORDER BY
          c.conname;
      `;
      
      const constraintData = { query: constraintQuery };
      
      makeRequest(options, (data) => {
        if (!data.error && data.result && Array.isArray(data.result) && data.result.length > 0) {
          console.log('\nConstraints:');
          data.result.forEach(constraint => {
            const typeName = {
              'p': 'PRIMARY KEY',
              'f': 'FOREIGN KEY',
              'u': 'UNIQUE',
              'c': 'CHECK'
            }[constraint.constraint_type] || constraint.constraint_type;
            
            console.log(`- ${constraint.constraint_name} (${typeName}): ${constraint.columns}`);
          });
        }
      }, JSON.stringify(constraintData));
    }, JSON.stringify(postData));
  },
  
  'create-table': () => {
    if (!requireParams(['project_id', 'sql_file'])) return;
    const projectId = process.argv[3];
    const sqlFile = process.argv[4];
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`Error: SQL file not found: ${sqlFile}`);
      return;
    }
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = { query: sql };
    
    console.log(`Creating table using SQL from: ${sqlFile}`);
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error creating table:', data.error.message || data.error);
        return;
      }
      
      console.log('Table created successfully!');
    }, JSON.stringify(postData));
  },
  
  'drop-table': () => {
    if (!requireParams(['project_id', 'table_name'])) return;
    const projectId = process.argv[3];
    const tableName = process.argv[4];
    
    // Ask for confirmation
    console.log(`⚠️ WARNING: This will DROP table '${tableName}' and ALL DATA will be LOST!`);
    console.log('To confirm, add a third parameter "confirm"');
    
    if (process.argv[5] !== 'confirm') {
      console.log('Operation cancelled due to missing confirmation');
      return;
    }
    
    // Execute DROP TABLE
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const query = `DROP TABLE IF EXISTS public."${tableName}" CASCADE;`;
    const postData = { query };
    
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error dropping table:', data.error.message || data.error);
        return;
      }
      
      console.log(`Table '${tableName}' dropped successfully!`);
    }, JSON.stringify(postData));
  },
  
  // Edge Function operations
  'create-function': () => {
    if (!requireParams(['project_id', 'function_name', 'js_file'])) return;
    const projectId = process.argv[3];
    const functionName = process.argv[4];
    const jsFile = process.argv[5];
    
    if (!fs.existsSync(jsFile)) {
      console.error(`Error: JavaScript file not found: ${jsFile}`);
      return;
    }
    
    const code = fs.readFileSync(jsFile, 'utf8');
    
    // Create the function
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/functions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = {
      name: functionName,
      verify_jwt: false,
      body: code
    };
    
    console.log(`Creating edge function '${functionName}'...`);
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error creating function:', data.error.message || data.error);
        return;
      }
      
      console.log(`Edge function '${functionName}' created successfully!`);
      console.log(`Function ID: ${data.id}`);
      console.log(`Status: ${data.status}`);
    }, JSON.stringify(postData));
  },
  
  'delete-function': () => {
    if (!requireParams(['project_id', 'function_name'])) return;
    const projectId = process.argv[3];
    const functionName = process.argv[4];
    
    // First get the function ID
    const listOptions = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/functions`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    makeRequest(listOptions, (data) => {
      if (!Array.isArray(data)) {
        console.error('Error: Failed to get functions list');
        return;
      }
      
      const func = data.find(f => f.name === functionName);
      if (!func) {
        console.error(`Error: Function '${functionName}' not found`);
        return;
      }
      
      // Now delete the function
      const deleteOptions = {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${projectId}/functions/${func.id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      makeRequest(deleteOptions, () => {
        console.log(`Function '${functionName}' (ID: ${func.id}) deleted successfully!`);
      });
    });
  },
  
  // Database backup and restore
  'create-backup': () => {
    if (!requireParams(['project_id'])) return;
    const projectId = process.argv[3];
    
    // Check if the output directory exists or create it
    const backupDir = './supabase-backups';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Dump schema
    const schemaOptions = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const schemaQuery = `
      SELECT 
        'CREATE TABLE IF NOT EXISTS ' ||
        quote_ident(schemaname) || '.' || quote_ident(tablename) ||
        ' (' ||
        array_to_string(
          array_agg(
            quote_ident(column_name) || ' ' ||
            data_type ||
            CASE WHEN character_maximum_length IS NOT NULL 
              THEN '(' || character_maximum_length || ')' 
              ELSE '' 
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END
          ), ', ') ||
        ');' as create_statement
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      GROUP BY 
        schemaname, tablename;
    `;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `supabase-${projectId}-${timestamp}.sql`);
    
    console.log(`Creating backup of project ${projectId}...`);
    console.log(`Backup file: ${backupFile}`);
    
    fs.writeFileSync(backupFile, '-- Supabase schema backup\n-- Generated: ' + new Date().toISOString() + '\n\n');
    
    // Get schema
    makeRequest(schemaOptions, (data) => {
      if (data.error) {
        console.error('Error getting schema:', data.error.message || data.error);
        return;
      }
      
      if (data.result && Array.isArray(data.result)) {
        // Write CREATE TABLE statements
        fs.appendFileSync(backupFile, '-- Table definitions\n');
        data.result.forEach(item => {
          fs.appendFileSync(backupFile, item.create_statement + '\n\n');
        });
        
        // Now get data from each table
        const tablesQuery = `
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public';
        `;
        
        makeRequest(schemaOptions, (tableData) => {
          if (tableData.error || !tableData.result) {
            console.error('Error getting tables:', tableData.error?.message || 'Unknown error');
            return;
          }
          
          if (Array.isArray(tableData.result) && tableData.result.length > 0) {
            fs.appendFileSync(backupFile, '-- Table data\n');
            
            // Process tables sequentially to avoid overwhelming the API
            let tableIndex = 0;
            
            function processNextTable() {
              if (tableIndex >= tableData.result.length) {
                console.log('Backup completed successfully!');
                return;
              }
              
              const tableName = tableData.result[tableIndex].tablename;
              console.log(`Backing up data from table: ${tableName}`);
              
              const dataQuery = `SELECT * FROM public."${tableName}";`;
              makeRequest(schemaOptions, (rowData) => {
                if (rowData.error) {
                  console.error(`Error getting data from table ${tableName}:`, rowData.error.message || rowData.error);
                } else if (rowData.result && Array.isArray(rowData.result) && rowData.result.length > 0) {
                  // Generate INSERT statements
                  fs.appendFileSync(backupFile, `-- Data for table: ${tableName}\n`);
                  
                  const columns = Object.keys(rowData.result[0]);
                  const columnList = columns.map(c => `"${c}"`).join(', ');
                  
                  rowData.result.forEach(row => {
                    const values = columns.map(col => {
                      const val = row[col];
                      if (val === null) return 'NULL';
                      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                      return val;
                    }).join(', ');
                    
                    fs.appendFileSync(backupFile, `INSERT INTO public."${tableName}" (${columnList}) VALUES (${values});\n`);
                  });
                  
                  fs.appendFileSync(backupFile, '\n');
                }
                
                tableIndex++;
                processNextTable();
              }, JSON.stringify({ query: dataQuery }));
            }
            
            processNextTable();
          } else {
            console.log('No tables found to backup data from');
            console.log('Backup completed (schema only)!');
          }
        }, JSON.stringify({ query: tablesQuery }));
      }
    }, JSON.stringify({ query: schemaQuery }));
  },
  
  // Migration Operations
  'apply-migration': () => {
    if (!requireParams(['project_id', 'name', 'sql_file'])) return;
    const projectId = process.argv[3];
    const migrationName = process.argv[4];
    const sqlFile = process.argv[5];
    
    if (!fs.existsSync(sqlFile)) {
      console.error(`Error: SQL file '${sqlFile}' does not exist`);
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/sql`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log(`Applying migration '${migrationName}'...`);
    
    const postData = { query: sqlContent };
    
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error applying migration:', data.error.message || data.error);
        return;
      }
      
      console.log(`Migration '${migrationName}' applied successfully!`);
    }, JSON.stringify(postData));
  },
  
  // Deploy edge function
  'deploy-function': () => {
    if (!requireParams(['project_id', 'function_name', 'js_file'])) return;
    const projectId = process.argv[3];
    const functionName = process.argv[4];
    const jsFile = process.argv[5];
    
    if (!fs.existsSync(jsFile)) {
      console.error(`Error: JavaScript file '${jsFile}' does not exist`);
      return;
    }
    
    const functionContent = fs.readFileSync(jsFile, 'utf8');
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${projectId}/functions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log(`Deploying edge function '${functionName}'...`);
    
    const postData = {
      name: functionName,
      body: functionContent,
      verify_jwt: true
    };
    
    makeRequest(options, (data) => {
      if (data.error) {
        console.error('Error deploying function:', data.error.message || data.error);
        return;
      }
      
      console.log(`Edge function '${functionName}' deployed successfully!`);
      console.log(`Function ID: ${data.id}`);
      console.log(`Status: ${data.status}`);
    }, JSON.stringify(postData));
  },
  
  // Help command for part 2
  'help': () => {
    console.log('Supabase API CLI (Part 2) - Available commands:\n');
    console.log('Table Operations:');
    console.log('  table-info <project_id> <table_name>     Get detailed information about a table');
    console.log('  create-table <project_id> <sql_file>     Create a table using SQL from file');
    console.log('  drop-table <project_id> <table_name>     Drop a table (requires confirmation)');
    console.log('\nEdge Function Operations:');
    console.log('  create-function <project_id> <n> <js_file>   Create an edge function from JS file');
    console.log('  delete-function <project_id> <n>            Delete an edge function');
    console.log('  deploy-function <project_id> <n> <js_file>  Deploy an edge function from JS file');
    console.log('\nMigration Operations:');
    console.log('  apply-migration <project_id> <name> <sql_file>  Apply a migration from SQL file');
    console.log('\nBackup Operations:');
    console.log('  create-backup <project_id>               Create a backup of schema and data');
    console.log('\nFor more commands, check the first script (supabase-api.js)');
  }
};

// Migration functions for programmatic access
export async function applyMigration({ project_id, name, query }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${project_id}/sql`,
      method: 'POST',
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
    }, JSON.stringify({ query }));
  });
}

export async function deployEdgeFunction({ project_id, name, function_content }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${project_id}/functions`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const postData = {
      name,
      body: function_content,
      verify_jwt: true
    };
    
    makeRequest(options, (data) => {
      if (data.error) {
        reject(new Error(data.error.message || data.error));
      } else {
        resolve(data);
      }
    }, JSON.stringify(postData));
  });
}

// Execute the requested command if called directly via node
// In ES modules, we check if this is the main module by checking import.meta.url
if (import.meta.url === `file://${process.argv[1]}`) {
  if (commands[command]) {
    commands[command]();
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Run `node supabase-api-part2.js help` for a list of available commands');
  }
}

// Export the commands and helper functions
export { requireParams, makeRequest };
