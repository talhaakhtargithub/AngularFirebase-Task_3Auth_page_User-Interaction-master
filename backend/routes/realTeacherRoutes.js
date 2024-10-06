// routes/realTeacherRoutes.js
const express = require('express');
const { getAllRealTeachers, getRealTeacherById } = require('../controllers/realTeacherController');

const router = express.Router();

// Routes
router.get('/', getAllRealTeachers);        // Get all teachers
router.get('/:id', getRealTeacherById);     // Get a teacher by id

module.exports = router;
