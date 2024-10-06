// models/courseModel.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    Code: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    }
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
