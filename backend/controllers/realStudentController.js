const RealStudent = require('../models/RealStudent');
const mongoose = require('mongoose');

// Get all real students
exports.getAllRealStudents = async (req, res) => {
    try {
        const students = await RealStudent.find();

        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' });
        }

        // Emit event to notify clients
        if (req.io) {
            req.io.emit('studentsUpdated', students);
        }

        res.json(students);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ message: 'Error fetching students' });
    }
};


exports.getRealStudentById = async (req, res) => {
    try {
        const student = await RealStudent.find({ id: parseInt(req.params.id) }); // Match by the 'id' field

        if (!student) {
            console.error(`Student not found for id: ${req.params.id}`);
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (err) {
        console.error('Error fetching student:', err); // Log the error
        res.status(500).json({ message: 'Error fetching student' });
    }
};


// Add a new student
exports.addRealStudent = async (req, res) => {
    const newStudent = new RealStudent(req.body);

    try {
        const savedStudent = await newStudent.save();

        // Emit event to notify clients
        if (req.io) {
            req.io.emit('studentAdded', savedStudent);
        }

        res.status(201).json(savedStudent);
    } catch (err) {
        console.error('Error adding student:', err);
        res.status(500).json({ message: 'Error adding student' });
    }
};
