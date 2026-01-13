import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Route Imports
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ShipmentsRoutes from './routes/Adminshipments.js';
import contactRouter from './routes/contactRoutes.js';
import adminAccountRouter from './routes/adminAccountRoutes.js';
import adminNotificationsRouter from './routes/adminNotificationsRoutes.js';
import clientAccountRouter from './routes/clientAccountRoutes.js';
import clientShipmentsRouter from './routes/clientShipments.js';
import adminTrucksRouter from './routes/adminTruck.js'; // Fixed typo (adminTruck -> adminTrucks)
import publicShipmentsRouter from './routes/publicShipments.js'; // <--- 1. IMPORT THIS
import shipmentRoutes from './routes/clientShipments.js';
import reportRoutes from './routes/reportRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import { sendBookingConfirmation } from './path/to/your/emailFile.js';
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/admin', activityRoutes);
// Auth Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);

// Public Shipment Routes (Fixes the 404)
// This enables: http://localhost:5000/api/shipments/track/...
app.use('/api/shipments', publicShipmentsRouter); // <--- 2. MOUNT THIS
app.use('/api', shipmentRoutes);
// Admin Feature Routes
app.use('/api', adminTrucksRouter);
app.use('/api', ShipmentsRoutes);
app.use('/api/user/contact', contactRouter);
app.use('/api/admin', adminAccountRouter);
app.use('/api', adminNotificationsRouter);
app.use('/api/reports', reportRoutes);
// Client Feature Routes
app.use('/api/client', clientShipmentsRouter);
app.use('/api/client', clientAccountRouter);

// Root
app.get('/', (req, res) => res.send('MAR Transport Backend (ESM)'));
app.get('/test-email', async (req, res) => {
  console.log("🛠️ TEST ROUTE HIT: Starting Email Test...");

  // Mock Data (Fake Shipment) to test PDF & Email
  const fakeShipment = {
    trackingId: "TEST-123",
    contactPhone: "9999999999",
    pickupLocation: "Chennai Test Hub",
    deliveryLocation: "Bangalore Test Hub",
    goodsType: "Electronics",
    quantity: 10,
    weight: 50,
    price: 1000
  };

  try {
    console.log("👉 Calling sendBookingConfirmation...");
    
    // We await this to catch errors immediately
    await sendBookingConfirmation(
      "your-actual-email@gmail.com", // ⚠️ REPLACE THIS with your own email to test
      "Test User", 
      fakeShipment
    );

    console.log("✅ Email function finished without crashing.");
    res.send("<h1>Check your inbox!</h1><p>If you see this, the code ran successfully.</p>");
  } catch (error) {
    console.error("❌ CRITICAL ERROR IN TEST ROUTE:", error);
    res.status(500).send(`<h1>Failed</h1><p>${error.message}</p>`);
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));