const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/report');

const app = express();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Ooops, Something went wrong!');
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ 
    secret: process.env.SESSION_SECRET || 'default_secret', // Use environment variable for secret
    resave: false,
    saveUninitialized: true
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/image/logonew.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'image', 'logonew.png'));
  });

// Middleware to check authentication
app.use((req, res, next) => {
    const publicRoutes = ['/auth/login', '/auth/register', '/'];
    if (req.path === '/') {
        if (req.session.user) {
            return res.redirect('/auth/profile');
        }
        return res.render('landing');
    }
    if (!req.session.user && !publicRoutes.includes(req.path)) {
        return res.redirect('/auth/login');
    }
    next();
});

// Register routes
app.use('/auth', authRoutes);
app.use('/', authRoutes);


// Mock authentication middleware
app.use((req, res, next) => {
    // Simulate logged-in user
    req.user = { id: 1 }; // Replace with real authentication
    next();
});

app.use('/report', reportRoutes);

app.get('/report', (req, res) => {
    // Fetch reports from database
    const reports = // your database query
    res.render('report/index', { report: reports });
});
app.get('/report', (req, res) => {
    // Fetch reports from your database
    const reports = // your database query to get all reports
    
    // Render the template, passing 'reports' as the variable name
    res.render('report/index', { reports: reports });
});




// Sample discussion posts (in a real app, this would be from a database)
let discussionPosts = [
    {
        id: 1,
        username: 'OceanLover23',
        title: 'Plastic Pollution: A Global Crisis',
        content: 'Every year, millions of tons of plastic waste end up in our oceans, causing devastating effects on marine life and ecosystems.',
        timestamp: new Date()
    },
    {
        id: 2,
        username: 'MarineConservation',
        title: 'Solutions to Ocean Pollution',
        content: 'We need a multi-pronged approach: reducing single-use plastics, improving waste management, and supporting ocean cleanup initiatives.',
        timestamp: new Date()
    }
];


// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});