const express = require('express');
const {
    getAllRealStudents,
    getRealStudentById,
    addRealStudent, // Assuming you have an add method
} = require('../controllers/realStudentController');

const router = express.Router();

// Middleware to attach the Socket.IO instance to the request object
const attachSocket = (req, res, next) => {
    req.io = req.app.get('io'); // Attach io instance to the request from app
    next();
};

// Routes
router.get('/', attachSocket, getAllRealStudents);        // Get all students
router.get('/:id', attachSocket, getRealStudentById);     // Get a student by id

// Optional: Route to add a new student (if implemented in the controller)
router.post('/', attachSocket, addRealStudent);           // Add a new student

module.exports = (io) => {
    // Store io instance in app
    router.use((req, res, next) => {
        req.app.set('io', io);
        next();
    });
    return router;
};
