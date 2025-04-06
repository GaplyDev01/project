import https from 'https';

const projectId = 'jraqpyndhlkusevqmspy';
const token = 'sbp_0fd7b6ae9046f6436f7ee482cba8ca0cdbf7f043';

const options = {
  hostname: 'api.supabase.com',
  path: `/v1/projects/${projectId}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
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
      const project = JSON.parse(data);
      console.log('Project Details:');
      console.log('--------------');
      console.log(`Name: ${project.name}`);
      console.log(`ID: ${project.id}`);
      
      // Construct API URL based on project ID
      const apiUrl = `https://${projectId}.supabase.co`;
      console.log(`API URL: ${apiUrl}`);
      
      // Get the anon key
      const anonKeyOptions = {
        hostname: 'api.supabase.com',
        path: `/v1/projects/${projectId}/api-keys`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      const keyReq = https.request(anonKeyOptions, (keyRes) => {
        let keyData = '';
        
        keyRes.on('data', (chunk) => {
          keyData += chunk;
        });
        
        keyRes.on('end', () => {
          try {
            const keys = JSON.parse(keyData);
            const anonKey = keys.find(key => key.name === 'anon' || key.name === 'public');
            if (anonKey) {
              console.log(`Anon Key: ${anonKey.api_key}`);
              
              // Output .env file format
              console.log('\n.env File Content:');
              console.log('--------------');
              console.log(`VITE_SUPABASE_URL=${apiUrl}`);
              console.log(`VITE_SUPABASE_ANON_KEY=${anonKey.api_key}`);
            } else {
              console.log('Anon key not found');
            }
          } catch (e) {
            console.error('Error parsing API keys response:', e.message);
            console.log('Raw response:', keyData);
          }
        });
      });
      
      keyReq.on('error', (error) => {
        console.error('Error getting API keys:', error.message);
      });
      
      keyReq.end();
      
    } catch (e) {
      console.error('Error parsing project response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

req.end();
