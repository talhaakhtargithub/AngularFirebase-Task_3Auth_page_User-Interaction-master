// controllers/realTeacherController.js
const RealTeacher = require('../models/RealTeacher');

// Get all real teachers
exports.getAllRealTeachers = async (req, res) => {
    try {
        const teachers = await RealTeacher.find();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching teachers' });
    }
};

// Get a real teacher by id
exports.getRealTeacherById = async (req, res) => {
    try {
        const teacher = await RealTeacher.findOne({ id: req.params.id });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching teacher' });
    }
};
