import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { initScheduler } from './services/schedulerService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://dailywin.space',
        'https://www.dailywin.space',
        'https://dailywinai.netlify.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/paystack', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'DAILYWIN AI Backend is running' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initScheduler(); // Start the midnight task
});
