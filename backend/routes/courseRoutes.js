// routes/coursesRoutes.js
const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/courseController');

// Get all courses
router.get('/', coursesController.getAllCourses);

// Create a new course
router.post('/', coursesController.createCourse);

// Get a course by Code
router.get('/:code', coursesController.getCourseByCode);

// Update a course
router.put('/:code', coursesController.updateCourse);

// Delete a course
router.delete('/:code', coursesController.deleteCourse);

module.exports = router;
