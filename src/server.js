const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for internal viewing/admin if needed, though usually protected)
app.use('/uploads', express.static('uploads'));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const parentRoutes = require('./routes/parentRoutes');
const requestRoutes = require('./routes/requestRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const staffRoutes = require('./routes/staffRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');

// Mount Routes securely through /api namespace
app.use('/api/auth', authRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/superadmin', superAdminRoutes);

app.use((err, req, res, next) => {
  console.error("Global Error Handler Caught:", err.message, "Field:", err.field);
  res.status(500).json({ error: err.message, field: err.field });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
