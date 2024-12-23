const { body, validationResult } = require('express-validator');

const validateReport = [
    body('sector')
        .notEmpty()
        .isIn(['Beach', 'River', 'Lake', 'Urban Area', 'Forest'])
        .withMessage('Invalid sector selected'),
    
    body('location')
        .notEmpty()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Location must be between 3 and 100 characters'),
    
    body('message')
        .notEmpty()
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    
    body('report_date')
        .notEmpty()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom((value) => {
            const date = new Date(value);
            const now = new Date();
            if (date > now) {
                throw new Error('Report date cannot be in the future');
            }
            return true;
        }),
    
    body('status')
        .notEmpty()
        .isIn(['Pending', 'In Progress', 'Resolved'])
        .withMessage('Invalid status selected'),
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// middleware/report.js
const { Report } = require('../models');

const reportMiddleware = {
    // Middleware to check if report exists
    checkReportExists: async (req, res, next) => {
        try {
            const report = await Report.findByPk(req.params.id);
            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }
            req.report = report;
            next();
        } catch (error) {
            next(error);
        }
    },

    // Middleware to check if user owns the report
    checkReportOwnership: async (req, res, next) => {
        if (req.report.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized to modify this report' });
        }
        next();
    },

    // Middleware to sanitize report data
    sanitizeReportData: (req, res, next) => {
        if (req.body.message) {
            req.body.message = req.body.message.trim();
        }
        if (req.body.location) {
            req.body.location = req.body.location.trim();
        }
        next();
    }
};

// routes/reports.js
const express = require('express');
const router = express.Router();
const { Report } = require('../models');

router.post('/submit-report',
    authMiddleware,
    validateReport,
    handleValidationErrors,
    reportMiddleware.sanitizeReportData,
    async (req, res) => {
        try {
            const report = await Report.create({
                ...req.body,
                userId: req.user.id
            });
            
            res.status(201).json({
                message: 'Report submitted successfully',
                report
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error submitting report',
                error: error.message
            });
        }
    }
);

router.put('/update-report/:id',
    authMiddleware,
    reportMiddleware.checkReportExists,
    reportMiddleware.checkReportOwnership,
    validateReport,
    handleValidationErrors,
    reportMiddleware.sanitizeReportData,
    async (req, res) => {
        try {
            await req.report.update(req.body);
            res.json({
                message: 'Report updated successfully',
                report: req.report
            });
        } catch (error) {
            res.status(500).json({
                message: 'Error updating report',
                error: error.message
            });
        }
    }
);

router.delete('/delete-report/:id',
    authMiddleware,
    reportMiddleware.checkReportExists,
    reportMiddleware.checkReportOwnership,
    async (req, res) => {
        try {
            await req.report.destroy();
            res.json({ message: 'Report deleted successfully' });
        } catch (error) {
            res.status(500).json({
                message: 'Error deleting report',
                error: error.message
            });
        }
    }
);

router.get('/reports',
    authMiddleware,
    async (req, res) => {
        try {
            const reports = await Report.findAll({
                where: req.user.role === 'admin' ? {} : { userId: req.user.id },
                order: [['createdAt', 'DESC']]
            });
            res.json(reports);
        } catch (error) {
            res.status(500).json({
                message: 'Error fetching reports',
                error: error.message
            });
        }
    }
);

module.exports = {
    authMiddleware,
    validateReport,
    handleValidationErrors,
    reportMiddleware,
    router
};