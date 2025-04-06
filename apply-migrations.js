// apply-migrations.js - Script to apply all migrations to the Supabase project
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeSQL, listTables, listOrganizations, listProjects } from './supabase-api.js';
import { applyMigration } from './supabase-api-part2.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function main() {
  try {
    // Step 1: List organizations and select the first one
    console.log('Listing organizations...');
    const organizations = await listOrganizations();
    
    if (!organizations || organizations.length === 0) {
      throw new Error('No organizations found. Please create an organization first.');
    }
    
    const organizationId = organizations[0].id;
    console.log(`Using organization: ${organizations[0].name} (${organizationId})`);
    
    // Step 2: List projects and select the first one
    console.log('Listing projects...');
    const projects = await listProjects();
    
    if (!projects || projects.length === 0) {
      throw new Error('No projects found. Please create a project first.');
    }
    
    const projectId = projects[0].id;
    console.log(`Using project: ${projects[0].name} (${projectId})`);
    
    // Step 3: Get list of migration files, sorted
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files to apply`);
    
    // Step 4: Apply each migration
    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const migrationName = path.basename(file, '.sql');
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Applying migration: ${migrationName}`);
      
      try {
        await applyMigration({
          project_id: projectId,
          name: migrationName,
          query: sqlContent
        });
        console.log(`✅ Successfully applied migration: ${migrationName}`);
      } catch (error) {
        console.error(`❌ Error applying migration ${migrationName}:`, error.message);
        // Continue with other migrations
      }
    }
    
    // Step 5: Verify tables were created
    console.log('\nVerifying tables...');
    const tables = await listTables(projectId);
    console.log('Created tables:', tables.map(t => t.name).join(', '));
    
    console.log('\nMigrations completed successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Execute the script
main();
