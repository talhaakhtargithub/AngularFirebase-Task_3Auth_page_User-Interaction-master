// controllers/coursesController.js
const Course = require('../models/Course'); // Assuming you have a Course model

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find(); // Fetch all courses from the database
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving courses', error });
    }
};

// Create a new course
exports.createCourse = async (req, res) => {
    const newCourse = new Course(req.body);
    try {
        const savedCourse = await newCourse.save(); // Save the new course to the database
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating course', error });
    }
};

// Get a course by Code
exports.getCourseByCode = async (req, res) => {
    try {
        const course = await Course.findOne({ Code: req.params.code });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving course', error });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        const updatedCourse = await Course.findOneAndUpdate(
            { Code: req.params.code },
            req.body,
            { new: true } // Return the updated course
        );
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error updating course', error });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const deletedCourse = await Course.findOneAndDelete({ Code: req.params.code });
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error });
    }
};
