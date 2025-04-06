import https from 'https';

const options = {
  hostname: 'api.supabase.com',
  path: '/v1/projects',
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sbp_0fd7b6ae9046f6436f7ee482cba8ca0cdbf7f043',
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
      const projects = JSON.parse(data);
      console.log('Projects found:', projects.length);
      projects.forEach(project => {
        console.log(`- ${project.name} (ID: ${project.id})`);
      });
    } catch (e) {
      console.error('Error parsing response:', e.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error making request:', error.message);
});

req.end();
