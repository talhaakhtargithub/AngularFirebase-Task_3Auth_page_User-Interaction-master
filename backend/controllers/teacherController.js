const Teacher = require('../models/Teacher');

// Create or update a teacher
exports.createOrUpdateTeacher = async (req, res) => {
    const { firstName, lastName, id, semester, courses } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    try {
        // Check if teacher exists
        let teacher = await Teacher.findOne({ id });

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
                id,
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

// Get a teacher by id
exports.getTeacherByid = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ id: req.params.id });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a teacher by id
exports.updateTeacherByid = async (req, res) => {
    const { firstName, lastName, semester, courses } = req.body;
    const uploadPicture = req.file ? req.file.filename : null;

    try {
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { id: req.params.id },
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

// Delete a teacher by id
exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Teacher.findOneAndDelete({ id });

        if (!result) {
            return res.status(404).json({ message: 'Teacher not found!' });
        }

        res.json({ message: 'Teacher deleted successfully!' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Check if id exists
exports.checkidExists = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ id: req.params.id });
        if (teacher) return res.status(400).json({ message: 'id already exists' });
        res.json({ message: 'id is available' });
    } catch (error) {
        console.error('Error checking id:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
