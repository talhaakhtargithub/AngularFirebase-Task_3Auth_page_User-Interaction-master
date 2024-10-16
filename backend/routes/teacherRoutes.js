const express = require('express');
const router = express.Router();
const { createOrUpdateTeacher, getAllTeachers, getTeacherByid, updateTeacherByid, deleteTeacher, checkidExists } = require('../controllers/teacherController');
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
router.get('/:id', getTeacherByid);
router.put('/:id', upload.single('uploadPicture'), updateTeacherByid);
router.delete('/:id', deleteTeacher);
router.get('/check/:id', checkidExists);

module.exports = router;
