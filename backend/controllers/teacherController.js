const Teacher = require('../models/Teacher');

// Create or update a teacher
exports.createOrUpdateTeacher = async (req, res) => {
    const { firstName, lastName, cnic, semester, courses } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    try {
        // Check if teacher exists
        let teacher = await Teacher.findOne({ cnic });

        if (teacher) {
            // Update existing teacher
            teacher.firstName = firstName;
            teacher.lastName = lastName;
            teacher.semester = semester;
            teacher.courses = JSON.parse(courses);
            teacher.uploadPicture = uploadPicture ? uploadPicture : teacher.uploadPicture; // Keep old picture if not updated

            await teacher.save();
            return res.json({ message: 'Teacher updated successfully!', teacher });
        } else {
            // Create new teacher
            const newTeacher = new Teacher({
                firstName,
                lastName,
                cnic,
                semester,
                courses: JSON.parse(courses),
                uploadPicture,
            });

            await newTeacher.save();
            return res.status(201).json({ message: 'Teacher added successfully!', teacher: newTeacher });
        }
    } catch (error) {
        console.error('Error creating/updating teacher:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all teachers
exports.getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a teacher by CNIC
exports.getTeacherByCnic = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ cnic: req.params.cnic });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a teacher by CNIC
exports.updateTeacherByCnic = async (req, res) => {
    const { firstName, lastName, semester, courses } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    try {
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { cnic: req.params.cnic },
            { firstName, lastName, semester, courses: JSON.parse(courses), uploadPicture },
            { new: true }
        );

        if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(updatedTeacher);
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a teacher by CNIC
exports.deleteTeacher = async (req, res) => {
    try {
        const { cnic } = req.params;
        const result = await Teacher.findOneAndDelete({ cnic });

        if (!result) {
            return res.status(404).json({ message: 'Teacher not found!' });
        }

        res.json({ message: 'Teacher deleted successfully!' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if CNIC exists
exports.checkCnicExists = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ cnic: req.params.cnic });
        if (teacher) return res.status(400).json({ message: 'CNIC already exists' });
        res.json({ message: 'CNIC is available' });
    } catch (error) {
        console.error('Error checking CNIC:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
