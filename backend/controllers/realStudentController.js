const RealStudent = require('../models/RealStudent');

// Get all real students
exports.getAllRealStudents = async (req, res) => {
    try {
        const students = await RealStudent.find();

        // Check if students were found
        if (!students || students.length === 0) {
            return res.status(404).json({ message: 'No students found' }); // Handle case where no students are found
        }

        // Emit the event when data is fetched
        if (req.io) {
            req.io.emit('studentsUpdated', students); // Emit event to clients with the updated students
        }

        res.json(students); // Send students data
    } catch (err) {
        console.error('Error fetching students:', err); // Log the error
        res.status(500).json({ message: 'Error fetching students' }); // Send error response
    }
};

// Get a real student by id
exports.getRealStudentById = async (req, res) => {
    try {
        const student = await RealStudent.findOne({ _id: req.params.id }); // Use _id for querying by MongoDB ObjectId
        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student); // Send the found student
    } catch (err) {
        console.error('Error fetching student:', err); // Log the error
        res.status(500).json({ message: 'Error fetching student' }); // Send error response
    }
};

// Optionally, add a method to handle adding a new student
exports.addRealStudent = async (req, res) => {
    const newStudent = new RealStudent(req.body);
    try {
        const savedStudent = await newStudent.save();
        
        // Emit event after adding a new student
        if (req.io) {
            req.io.emit('studentAdded', savedStudent); // Notify clients about the new student
        }

        res.status(201).json(savedStudent); // Send the newly created student
    } catch (err) {
        console.error('Error adding student:', err); // Log the error
        res.status(500).json({ message: 'Error adding student' }); // Send error response
    }
};
