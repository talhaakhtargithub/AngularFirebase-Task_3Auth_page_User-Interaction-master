const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Import Routes
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const realTeacherRoutes = require('./routes/realTeacherRoutes');
const realStudentRoutes = require('./routes/realStudentRoutes');
const courseRoutes = require('./routes/courseRoutes');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
});

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for CORS
app.use(
    cors({
        origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    })
);

// Serve static files (e.g., images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up routes with the Socket.IO instance where required
app.use('/api/students', studentRoutes(io)); // Pass the io instance to student routes
app.use('/api/teachers', teacherRoutes); // Routes for teacher API
app.use('/realstudents', realStudentRoutes(io)); // Pass the io instance to real student data
app.use('/realteachers', realTeacherRoutes); // Routes for real teacher data
app.use('/api/courses', courseRoutes); // Routes for courses API

// Root route for API home
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process if unable to connect
    });


// Handle invalid routes (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Socket.IO events
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});
