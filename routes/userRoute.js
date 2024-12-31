const express = require('express');
const router = express.Router();
const path = require('path');

// Router for page
router.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'SignIn', 'signin.html'));
});
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'SignUp', 'signup.html'));
});
router.get('/onboarding1', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'Onboarding1', 'onboarding1.html'));
});
router.get('/onboarding2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'Onboarding2', 'onboarding2.html'));
});
router.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'Homepage', 'homepage.html'));
});
router.get('/homepage2', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'Page', 'Homepage', 'homepage2.html'));
});


// Default route
router.get('/', (req, res) => {
  res.redirect('/signin');
});

module.exports = router;