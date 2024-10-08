const Student = require('../models/Student');
const fs = require('fs');
const path = require('path');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students' });
    }
};

// Get a student by identification number
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.params.id });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching student' });
    }
};

// Create a new student
exports.createStudent = async (req, res, io) => {
    const { firstName, lastName, semester, id, dateOfBirth, dateOfAdmission, degreeTitle, yearOfStudy } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    const newStudent = new Student({
        firstName,
        lastName,
        semester,
        id,
        dateOfBirth,
        dateOfAdmission,
        degreeTitle,
        yearOfStudy,
        uploadPicture,
    });

    try {
        await newStudent.save();
        io.emit('studentCreated', newStudent); // Emit event when a new student is created
        res.status(201).json(newStudent);
    } catch (err) {
        res.status(500).json({ message: 'Error adding student' });
    }
};

// Update a student
exports.updateStudent = async (req, res, io) => {
    const { firstName, lastName, semester, dateOfBirth, dateOfAdmission, degreeTitle, yearOfStudy } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { id: req.params.id },
            { firstName, lastName, semester, dateOfBirth, dateOfAdmission, degreeTitle, yearOfStudy, uploadPicture },
            { new: true }
        );

        if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
        
        io.emit('studentUpdated', updatedStudent); // Emit event when a student is updated
        res.json(updatedStudent);
    } catch (err) {
        res.status(500).json({ message: 'Error updating student' });
    }
};

// Delete a student
exports.deleteStudent = async (req, res, io) => {
    try {
        // Find the student to delete
        const studentToDelete = await Student.findOne({ id: req.params.id });
        if (!studentToDelete) return res.status(404).json({ message: 'Student not found' });
        
        // Delete the student's picture if it exists
        if (studentToDelete.uploadPicture) {
            const picturePath = path.join(__dirname, '../uploads', studentToDelete.uploadPicture);
            fs.unlink(picturePath, err => {
                if (err) {
                    console.error(`Failed to delete picture for student ${req.params.id}:`, err);
                } else {
                    console.log(`Deleted picture for student ${req.params.id}`);
                }
            });
        }

        // Delete the student record
        const result = await Student.deleteOne({ id: req.params.id });
        io.emit('studentDeleted', req.params.id); // Emit event when a student is deleted
        res.status(204).end(); // No content
        
        // Check if there are no students left and delete all pictures
        const studentCount = await Student.countDocuments();
        if (studentCount === 0) {
            await deleteAllPictures();
        }
    } catch (err) {
        res.status(500).json({ message: 'Error deleting student' });
    }
};

// Check identification number for uniqueness
exports.checkidExists = async (req, res) => {
    try {
        const student = await Student.findOne({ id: req.params.id });
        if (student) return res.status(400).json({ message: 'Identification number already exists' });
        res.json({ message: 'Identification number is available' });
    } catch (err) {
        res.status(500).json({ message: 'Error checking identification number' });
    }
};

// Function to delete all student pictures
const deleteAllPictures = async () => {
    const picturesDir = path.join(__dirname, '../uploads'); // Update this path as needed

    fs.readdir(picturesDir, (err, files) => {
        if (err) {
            console.error('Error reading pictures directory:', err);
            return;
        }

        // Delete each file in the directory
        files.forEach(file => {
            fs.unlink(path.join(picturesDir, file), err => {
                if (err) {
                    console.error(`Failed to delete file: ${file}`, err);
                } else {
                    console.log(`Deleted file: ${file}`);
                }
            });
        });
    });
};
