const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

let swaggerDocument;

try {
  // Load the Swagger specification from the JSON file
  const swaggerPath = path.join(__dirname, '../swagger.json');
  const swaggerContent = fs.readFileSync(swaggerPath, 'utf8');
  swaggerDocument = JSON.parse(swaggerContent);
  
  console.log(`Loaded Swagger document with ${Object.keys(swaggerDocument.paths || {}).length} paths`);
} catch (error) {
  console.error('Error loading Swagger document:', error.message);
  // Provide a minimal fallback swagger document
  swaggerDocument = {
    openapi: '3.0.0',
    info: {
      title: 'School Vaccination Portal API',
      version: '1.0.0',
      description: 'API documentation for the School Vaccination Portal (Error loading full documentation)'
    },
    paths: {}
  };
}

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', (req, res, next) => {
  try {
    const uiHtml = swaggerUi.generateHTML(swaggerDocument, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'School Vaccination Portal API Documentation'
    });
    res.send(uiHtml);
  } catch (error) {
    console.error('Error generating Swagger UI:', error.message);
    next(error);
  }
});

// Endpoint to get the Swagger JSON
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

module.exports = router;