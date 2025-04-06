// deploy-edge-functions.js - Script to deploy edge functions to Supabase
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { listProjects } from './supabase-api.js';
import { deployEdgeFunction } from './supabase-api-part2.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EDGE_FUNCTIONS_DIR = path.join(__dirname, 'edge-functions');

async function main() {
  try {
    // Step 1: List projects and select the first one
    console.log('Listing projects...');
    const projects = await listProjects();
    
    if (!projects || projects.length === 0) {
      throw new Error('No projects found. Please create a project first.');
    }
    
    const projectId = projects[0].id;
    console.log(`Using project: ${projects[0].name} (${projectId})`);
    
    // Step 2: Get list of edge function files
    const functionFiles = fs.readdirSync(EDGE_FUNCTIONS_DIR)
      .filter(file => file.endsWith('.js'));
    
    console.log(`Found ${functionFiles.length} edge functions to deploy`);
    
    // Step 3: Deploy each edge function
    for (const file of functionFiles) {
      const filePath = path.join(EDGE_FUNCTIONS_DIR, file);
      const functionName = path.basename(file, '.js');
      const functionContent = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Deploying edge function: ${functionName}`);
      
      try {
        await deployEdgeFunction({
          project_id: projectId,
          name: functionName,
          function_content: functionContent
        });
        console.log(`✅ Successfully deployed edge function: ${functionName}`);
      } catch (error) {
        console.error(`❌ Error deploying function ${functionName}:`, error.message);
        // Continue with other functions
      }
    }
    
    console.log('\nEdge function deployment completed!');
  } catch (error) {
    console.error('Error deploying edge functions:', error);
    process.exit(1);
  }
}

// Execute the script
main();
