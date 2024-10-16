const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  semester: { type: String, required: true },
  courses: { type: [String], required: true }, // Array of courses
  uploadPicture: { type: String } // Path to uploaded picture
});

const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
