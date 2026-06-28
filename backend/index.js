require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const connectDB = require('./config/connectDb');
const userRoutes = require('./routes/UserRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');
const productRoutes = require('./routes/ProductRoutes');
const planningRoutes = require('./routes/planning');
const fridgeRoutes = require('./routes/fridgeRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes');
const stripeRoutes = require('./routes/stripeRoutes');
//const chatRoutes   = require('./routes/chatRoutes');

const app = express();

// On crée le dossier "uploads" s'il n'existe pas encore
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
const upload = multer({ dest: uploadsDir });

// Middleware
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/user', userProfileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/fridge', fridgeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/stripe', stripeRoutes);
//app.use('/api/chat',   chatRoutes);

// Route temporaire pour éviter des erreurs de fetch sur la page Planning
app.get('/api/orders', (req, res) => res.json([]));

// Route de transcription audio (Whisper via Groq)
app.post('/api/transcribe', upload.single('file'), async (req, res) => {

    // Supprime le fichier audio temporaire après traitement
    const deleteTempFile = () => {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    };

    try {
        // Étape 1 : vérifier qu'un fichier a bien été envoyé
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file received.' });
        }

        // Étape 2 : vérifier que la clé API Groq est configurée
        if (!process.env.GROQ_API_KEY) {
            deleteTempFile();
            return res.status(500).json({ error: 'GROQ_API_KEY missing in backend/.env' });
        }

        // Étape 3 : vérifier que l'enregistrement n'est pas trop court
        const fileSize = fs.statSync(req.file.path).size;
        if (fileSize < 500) {
            deleteTempFile();
            return res.status(400).json({ error: 'Recording too short. Please speak longer.' });
        }

        // Étape 4 : déterminer le type audio (Whisper préfère les types simples,
        // sans les détails type "codecs=opus" ajoutés par le navigateur)
        let mimeType = 'audio/webm';
        if (req.file.mimetype && req.file.mimetype.startsWith('audio/')) {
            mimeType = req.file.mimetype;
        }

        if (mimeType.includes('webm')) {
            mimeType = 'audio/webm';
        } else if (mimeType.includes('mp4')) {
            mimeType = 'audio/mp4';
        } else if (mimeType.includes('ogg')) {
            mimeType = 'audio/ogg';
        }

        let fileExtension = 'webm';
        if (mimeType.includes('mp4')) {
            fileExtension = 'm4a';
        } else if (mimeType.includes('ogg')) {
            fileExtension = 'ogg';
        }

        const filename = `recording.${fileExtension}`;

        // Étape 5 : envoyer le fichier audio à l'API Whisper (Groq)
        const audioBuffer = fs.readFileSync(req.file.path);
        const form = new FormData();
        form.append('file', new Blob([audioBuffer], { type: mimeType }), filename);
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
        deleteTempFile();

        // Étape 6 : vérifier que la réponse de Whisper est correcte
        if (!response.ok) {
            let errorMessage = `Whisper HTTP ${response.status}`;
            if (data && data.error && data.error.message) {
                errorMessage = data.error.message;
            }
            console.error('Whisper API error:', errorMessage);
            return res.status(response.status).json({ error: errorMessage });
        }

        const text = (data.text || '').trim();
        if (!text) {
            return res.status(422).json({ error: 'Whisper did not return any text.' });
        }

        console.log('Transcription OK:', text);
        res.json({ text });

    } catch (err) {
        console.error('Whisper error:', err);
        deleteTempFile();
        res.status(500).json({ error: err.message || 'Transcription failed' });
    }
});

// Gestion globale des erreurs
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
