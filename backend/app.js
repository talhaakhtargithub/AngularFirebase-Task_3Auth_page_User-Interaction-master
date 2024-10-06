const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // For handling file paths
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const realTeacherRoutes = require('./routes/realTeacherRoutes'); // Import the new route for teachers
const realStudentRoutes = require('./routes/realStudentRoutes'); // Import the new route
const courseRoutes = require('./routes/courseRoutes'); // Import the course routes
const http = require('http');
const { Server } = require('socket.io');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server);

// Middleware for CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200', // Allow requests from this origin (Angular app)
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    credentials: true // Enable credentials (cookies, authorization headers, etc.)
}));

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files for images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up routes with Socket.IO instance
app.use('/api/students', studentRoutes(io)); // Pass the io instance to student routes
app.use('/api/teachers', teacherRoutes); // Routes for teacher API
app.use('/realstudents', realStudentRoutes(io));  // Pass the io instance to real student data
app.use('/realteachers', realTeacherRoutes);  // New route for real teacher data
app.use('/api/courses', courseRoutes); // Routes for courses API

// Root route for API home
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(port, () => { // Use the HTTP server
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit the process with failure
    });

// 404 error handler for invalid routes
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global error handler for server errors
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ error: 'Internal Server Error' });
});

// Socket.IO connection event
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
