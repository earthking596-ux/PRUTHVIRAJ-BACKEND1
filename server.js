const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// --- Import Routes ---
const userRoutes = require('./routes/userRoutes');
const formRoutes = require("./routes/formRoutes"); 

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middlewares ---

// CORS middleware
app.use(cors()); // यह लाइन फ्रंटएंड से रिक्वेस्ट को स्वीकार करने के लिए जोड़ी गई है।

app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- JWT Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// --- Schemas ---
const surveySchema = new mongoose.Schema({
  emailFromForm: String,
  name: String,
  gmailId: String,
  question1Answer: String,
  question2Answer: String,
  question3Answer: String,
  question4Answer: String,
  question5Answer: String,
  question6Answer: String,
  question9Answer: String,
  question10Answer: String,
  submissionDate: { type: Date, default: Date.now }
});
const Survey = mongoose.model('Survey', surveySchema);

const cyberSurveySchema = new mongoose.Schema({
  emailFromForm: String,
  name: String,
  gmailId: String,
  q1DefOfCyberSafety: String,
  q2RoleOfParents: String,
  q3OnlineSafetyTips: String,
  q4SignsOfCyberbullying: String,
  q5OnlinePredatorBehavior: String,
  q6DataProtectionMeasures: String,
  q7ReportingOnlineAbuse: String,
  q8SafeOnlineShopping: String,
  q9LegalConsequences: String,
  q10OnlinePrivacyAwareness: String,
  submissionDate: { type: Date, default: Date.now }
});
const CyberSurvey = mongoose.model('CyberSurvey', cyberSurveySchema);

// MongoDB Schema and Model
const formDataSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const FormData = mongoose.model('FormData', formDataSchema);

// --- API Routes ---
app.use('/api/users', userRoutes);
app.use("/api/form", formRoutes);

app.get('/', (req, res) => {
  res.send('Server is running!');
});


app.post('/api/form/submit', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log('Received data from Google Apps Script:', { name, email, message });

    const newEntry = new FormData({ name, email, message });
    await newEntry.save();
    
    res.status(200).send('Data saved successfully');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
