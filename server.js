import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { nanoid } from 'nanoid';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { File } from './models/file.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/filesharing');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueId = nanoid(10);
    cb(null, `${uniqueId}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { file } = req;
    const downloadId = nanoid(10);
    
    const newFile = new File({
      filename: file.originalname,
      path: file.path,
      size: file.size,
      downloadId
    });
    
    await newFile.save();
    
    res.json({
      success: true,
      downloadLink: `/download/${downloadId}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Handle file download
app.get('/download/:downloadId', async (req, res) => {
  try {
    const file = await File.findOne({ downloadId: req.params.downloadId });
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    res.download(file.path, file.filename);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});