
// app.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/dbConnect');
const path = require('path');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON

const corsConfig = {
  origin: "https://houria-red.vercel.app/",
  // origin: "http://localhost:5173",
  credentials: true,
}
app.options("", cors(corsConfig));
app.use(cors(corsConfig));

// Use __dirname directly
app.use('/public', express.static(path.join(__dirname, 'public')));


// Routes
app.use('/api/merchandise', require('./routes/merchandiseRoutes'));
app.use('/api/falcon_ids', require('./routes/falconIdsRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Basic route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
