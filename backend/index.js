require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const connectDB = require('./config/connectDb');
const userRoutes = require('./routes/UserRoutes');
const productRoutes = require('./routes/ProductRoutes');
const planningRoutes = require('./routes/planning');
const notificationRoutes = require('./routes/NotificationRoutes');
const fridgeRoutes = require('./routes/fridgeRoutes');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const upload = multer({ dest: uploadsDir });

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fridge', fridgeRoutes);


// Temporary route to prevent PlanningPage fetch errors
app.get('/api/orders', (req, res) => res.json([]));

// Route Whisper transcription
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    const cleanup = () => {
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    };

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file received.' });
        }

        if (!process.env.GROQ_API_KEY) {
            cleanup();
            return res.status(500).json({ error: 'GROQ_API_KEY missing in backend/.env' });
        }

        const size = fs.statSync(req.file.path).size;
        if (size < 500) {
            cleanup();
            return res.status(400).json({ error: 'Recording too short. Please speak longer.' });
        }

        let mime = req.file.mimetype?.startsWith('audio/') ? req.file.mimetype : 'audio/webm';
        // Whisper prefers simple types (not "audio/webm;codecs=opus")
        if (mime.includes('webm')) mime = 'audio/webm';
        else if (mime.includes('mp4')) mime = 'audio/mp4';
        else if (mime.includes('ogg')) mime = 'audio/ogg';
        const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm';
        const filename = `recording.${ext}`;

        // Native FormData + Blob (Node 18+) - avoids "Could not parse multipart form" with the form-data package
        const audioBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        form.append('file', new Blob([audioBuffer], { type: mime }), filename);
        form.append('model', 'whisper-large-v3-turbo');
        form.append('language', 'en');

        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: form,
        });

        const data = await response.json();
        cleanup();

        if (!response.ok) {
            const msg = data?.error?.message || `Whisper HTTP ${response.status}`;
            console.error('Whisper API error:', msg);
            return res.status(response.status).json({ error: msg });
        }

        const text = (data.text || '').trim();
        if (!text) {
            return res.status(422).json({ error: 'Whisper did not return any text.' });
        }

        console.log('Transcription OK:', text);
        res.json({ text });
    } catch (err) {
        console.error('Whisper error:', err);
        cleanup();
        res.status(500).json({ error: err.message || 'Transcription failed' });
    }
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});