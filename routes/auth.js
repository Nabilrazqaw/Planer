const express = require('express');
const session = require('express-session');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const jwt = require('jsonwebtoken');


// landing
router.get('/landing', (req, res) => {
    res.render('landing');
});

router.get('/information', (req, res) => {
    res.render('information');
});

router.get('/home', (req, res) => {
    res.render('home');
});

router.get('/report', (req, res) => {
    res.render('report');
});

// render halaman tantangan
router.get('/tantangan', (req, res) => {
    res.render('tantangan');
});

// render halaman map
router.get('/map', (req, res) => {
    res.render('map');
});

// render halaman map
router.get('/map23', (req, res) => {
    res.render('map23');
});

// render halaman map
router.get('/map22', (req, res) => {
    res.render('map22');
});

// render halaman map
router.get('/mapcoor', (req, res) => {
    res.render('mapcoor');
});

// render halaman map
router.get('/games', (req, res) => {
    res.render('games');
});

// render halaman siklus
router.get('/siklus', (req, res) => {
    res.render('siklus');
});

// render halaman diskusi
router.get('/diskusi', (req, res) => {
    res.render('diskusi');
});
router.get('/diskusi', (req, res) => {
    // Define your posts array or fetch from database
    const posts = [
        {
            title: 'Ocean Pollution Impact',
            username: 'EcoWarrior',
            content: 'Plastic waste is destroying marine ecosystems.',
            timestamp: new Date()
        },
        // Add more sample posts if needed
    ];

    // Pass the posts to the view
    res.render('diskusi', { posts: posts });
});

// render halaman donasi
router.get('/donasi', (req, res) => {
    res.render('donasi');
});

// render halaman register
router.get('/register', (req, res) => {
    res.render('register');
});

// render halaman dashboard
router.get('/dashboard', (req, res) => {
    res.render('dashboard', { user: req.session.user });
});

// render halaman profile
router.get('/profile', (req, res) => {
    res.render('profile', { user: req.session.user });
});

// render halaman login
router.get('/login', (req, res) => {
    res.render('login');
});

// render halaman edit profile 
router.get('/edit-profile', (req, res) => {
    res.render('edit-profile', { user: req.session.user });
});

// render halaman edit report 
router.get('/report-edit', (req, res) => {
    res.render('report-edit', { user: req.session.user });
});

// proses register user
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    // Perbaikan: Menggunakan hashedPassword, bukan password mentah
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.redirect('/auth/login');
    });
});


// proses login user
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const user = result[0];
            
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = user;
                res.redirect('/auth/dashboard');
            } else {
                res.send('Incorrect password');
            }
        } else {
            res.send('User not found');
        }
    });
});


// middleware untuk cek autentikasi
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

router.get('/logout', (req, res) => {
    // Destroy the session or clear the user data
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/'); 
    });
});

// Rute untuk mengupdate profil (misalnya POST)
router.post('/edit-profile', (req, res) => {
    // Logika untuk memperbarui profil pengguna
    // Misalnya, ambil data dari req.body dan simpan ke database
    // Setelah berhasil, redirect ke profil atau dashboard
    res.redirect('/auth/profile');
});

// render halaman update profile
router.get('/update-profile', (req, res) => {
    const userId = req.session.user.id;
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            const userData = result[0];
            res.render('update-profile', { user: userData });
        } else {
            res.redirect('/auth/profile');
        }
    });
});

// proses update profile
router.post('/update-profile', checkAuth, (req, res) => {
    const userId = req.session.user.id;
    const {
        name,
        alamat,
        nomor_telepon,
    } = req.body;

    const updateQuery = `
        UPDATE users 
        SET 
            name = ?,
            alamat = ?,
            nomor_telepon = ?
        WHERE id = ?
    `;

    const values = [
        name || null,
        alamat || null,
        nomor_telepon || null,
        userId
    ];

    db.query(updateQuery, values, (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            res.send('Terjadi kesalahan saat mengupdate profile');
            return;
        }

        // Update session with new data
        req.session.user = {
            ...req.session.user,
            name,
            alamat,
            nomor_telepon,
        };

        res.redirect('/auth/profile');
    });
});

// Enhanced error logging
const logger = {
    error: (msg, err) => {
        console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, {
            error: err.message,
            stack: err.stack,
            details: err
        });
    }
};

// Re

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};



router.get('/logout', checkAuth, (req, res) => {
    // Clear the user's session
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).render('error', { 
                message: 'Could not log out. Please try again.',
                error: err 
            });
        }

        // Clear any authentication cookies
        res.clearCookie('jwt');  // Clear JWT cookie if used
        res.clearCookie('connect.sid');  // Clear session cookie

        // Redirect to login page with a logout success message
        res.redirect('/auth/login?logout=success');
    });
});

module.exports = router;