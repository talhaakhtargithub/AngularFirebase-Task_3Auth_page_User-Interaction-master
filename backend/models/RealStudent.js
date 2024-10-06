// models/RealStudent.js
const mongoose = require('mongoose');

const realStudentSchema = new mongoose.Schema({
    id: Number,
    Name: String,
    Attendance_status: String,
    Focused: Number,
    Non_Serious: Number,
    Demotivated: Number,
    Time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RealStudent', realStudentSchema, 'student_real_data'); 
