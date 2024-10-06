const express = require('express');
const multer = require('multer');
const {
    createStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    checkIdentificationNumberExists
} = require('../controllers/studentController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Save files with a unique name
    }
});

const upload = multer({ storage }); // Use the storage configuration

// Middleware to set up Socket.IO
const setupSocketIO = (io) => {
    // Routes
    router.post('/', upload.single('uploadPicture'), (req, res) => createStudent(req, res, io));
    router.get('/', getAllStudents);
    router.get('/:id', getStudentById);
    router.put('/:id', upload.single('uploadPicture'), (req, res) => updateStudent(req, res, io));
    router.delete('/:id', (req, res) => deleteStudent(req, res, io));
    router.get('/check/:id', checkIdentificationNumberExists);

    return router;
};

module.exports = setupSocketIO; // Export function to set up routes with Socket.IO
