// models/RealTeacher.js
const mongoose = require('mongoose');

const realTeacherSchema = new mongoose.Schema({
    id: Number,
    Name: String,
    Attendance_Status: String,
    No_of_times_Erased: Number,
    Time: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RealTeacher', realTeacherSchema, 'teacher_real_data');
