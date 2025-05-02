const http = require('http');
const fs = require('fs');
const path = require('path');

// Check if swagger.json exists and is valid
try {
  const swaggerPath = path.join(__dirname, 'swagger.json');
  const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
  const swaggerJson = JSON.parse(swaggerContent);
  
  console.log('✅ swagger.json exists and is valid JSON');
  
  // Check if it has paths defined
  if (swaggerJson.paths && Object.keys(swaggerJson.paths).length > 0) {
    console.log(`✅ swagger.json has ${Object.keys(swaggerJson.paths).length} paths defined`);
  } else {
    console.log('❌ swagger.json does not have any paths defined');
  }
} catch (error) {
  console.error('❌ Error reading or parsing swagger.json:', error.message);
}

// Check if swagger-ui-express is installed
try {
  require('swagger-ui-express');
  console.log('✅ swagger-ui-express is installed');
} catch (error) {
  console.error('❌ swagger-ui-express is not installed:', error.message);
}

console.log('\nTo fix any issues:');
console.log('1. Make sure swagger.json is valid and has paths defined');
console.log('2. Install swagger-ui-express: npm install swagger-ui-express --save');
console.log('3. Restart the server: npm run dev');
console.log('4. Access the Swagger UI at: http://localhost:5000/api/docs');