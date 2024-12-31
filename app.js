// Import express module
const express = require('express');

// Import path module
const path = require('path');

// Initialize express app
const app = express();

// Define port
const port = 3000;

// Import userRoute
const userRoute = require('./routes/userRoute');
// const locationRoute = require('./routes/locationRoute');

// 
const { loadData } = require('./models/locationModel');

// Define static folder
// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'views', 'Page')));

app.use(express.static(path.join(__dirname, 'views', 'Page', 'SignIn')));
app.use(express.static(path.join(__dirname, 'views', 'Page', 'SignUp')));
app.use(express.static(path.join(__dirname, 'views', 'Page', 'Onboarding1')));
app.use(express.static(path.join(__dirname, 'views', 'Page', 'Onboarding2')));
app.use(express.static(path.join(__dirname, 'views', 'Page', 'Homepage')));
// app.use(express.static(path.join(__dirname, 'views', 'Page', 'PlanDetails')));
// app.use(express.static(path.join(__dirname, 'views', 'Page', 'Planning')));

app.use('/', userRoute);
// app.use('/api', locationRoute);

// 
loadData();
app.get('/locations', async (req, res) => {
  // console.log(global.data.locations[0]);
  res.json(global.data.locations);
});
app.get('/tags', async (req, res) => {
  res.json(global.data.tags);
});
app.get('/users', async (req, res) => {
  res.json(global.data.users);
});

// Function to load image of location's records
async function loadFetch() {
  const { default: fetch } = await import('node-fetch');

  app.get('/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('Missing image URL');
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(response.status).send(response.statusText);
      }

      const imageBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      res.set('Content-Type', response.headers.get('content-type'));
      res.send(buffer);
    } catch (error) {
      console.error('Error fetching image:', error);
      res.status(500).send('Error fetching image');
    }
  });
}

loadFetch();

// start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});