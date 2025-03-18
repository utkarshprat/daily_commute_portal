const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

const connectDB = require('./config/db'); // Import the database connection function
const app = express();

// Connect to the database
connectDB()
  .then(() => console.log('Connected to the database successfully'))
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); // Exit the process if database connection fails
  });

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON requests

console.log('--- Before requiring routes ---');

// Import routes
let authRoutes, commuteRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  commuteRoutes = require('./routes/commuteRoutes');
  console.log('Auth Routes and Commute Routes loaded successfully.');
} catch (error) {
  console.error('Error loading routes:', error.message);
  process.exit(1); // Exit process if routes fail to load
}

// Route setup
app.use('/api/auth', authRoutes);
app.use('/api/commute', commuteRoutes);

// Handle undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
