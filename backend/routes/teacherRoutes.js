const express = require('express');
const router = express.Router();
const { createOrUpdateTeacher, getAllTeachers, getTeacherByCnic, updateTeacherByCnic, deleteTeacher, checkCnicExists } = require('../controllers/teacherController');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    }
});
const upload = multer({ storage });

// Routes
router.post('/', upload.single('uploadPicture'), createOrUpdateTeacher);
router.get('/', getAllTeachers);
router.get('/:cnic', getTeacherByCnic);
router.put('/:cnic', upload.single('uploadPicture'), updateTeacherByCnic);
router.delete('/:cnic', deleteTeacher);
router.get('/check/:cnic', checkCnicExists);

module.exports = router;
