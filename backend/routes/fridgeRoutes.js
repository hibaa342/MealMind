const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_API = process.env.PYTHON_API_URL || 'http://localhost:5001';

router.post('/detect', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename    : req.file.originalname,
            contentType : req.file.mimetype,
        });

        const response = await fetch(`${PYTHON_API}/detect`, {
            method : 'POST',
            body   : formData,
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Fridge detection error:', error);
        res.status(500).json({ error: 'Detection failed' });
    }
});

module.exports = router;