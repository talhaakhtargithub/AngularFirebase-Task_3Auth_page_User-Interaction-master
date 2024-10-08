// models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    semester: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    dateOfAdmission: { type: Date, required: true },
    degreeTitle: { type: String, required: true },
    yearOfStudy: { type: String, required: true },
    uploadPicture: { type: String } // Store the filename of the uploaded picture
});

module.exports = mongoose.model('Student', studentSchema);
