const express = require('express');
const {
    getAllRealStudents,
    getRealStudentById,
    addRealStudent,
} = require('../controllers/realStudentController');

const router = express.Router();

// Middleware to attach Socket.IO instance to the request
const attachSocket = (req, res, next) => {
    req.io = req.app.get('io'); // Attach io instance to request
    next();
};

// Routes
router.get('/', attachSocket, getAllRealStudents);        // Get all students
router.get('/:id', attachSocket, getRealStudentById);     // Get student by ID
router.post('/', attachSocket, addRealStudent);           // Add a new student

// Export the router with a function to attach `io`
module.exports = (io) => {
    router.use((req, res, next) => {
        req.app.set('io', io); // Save io instance in the app object
        next();
    });
    return router;
};
