const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();
const app = express();

// CORS configuration - allow all origins for flexibility
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) are allowed'), false);
    }
  }
});

// Models
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'photographer'], required: true },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: function() { return this.role === 'client' ? 'approved' : 'pending'; } }
});
const User = mongoose.model('User', userSchema);

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  portfolio: [String],
  pricing: { hourly: Number, packages: [String] },
  specialization: [String],
  location: String,
  experience: Number,
  bio: String,
  ratings: { type: Number, default: 0 }
});
const Profile = mongoose.model('Profile', profileSchema);

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

const agreementSchema = new mongoose.Schema({
  photographerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  note: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  contactDetails: String,
  contractDone: { type: Boolean, default: false },
  contractDuration: String,
  paymentDone: { type: Boolean, default: false },
  review: { type: String, default: '' }
});
const Agreement = mongoose.model('Agreement', agreementSchema);

const postSchema = new mongoose.Schema({
  photographer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image: { type: String, required: true },
  title: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/photobook', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    // Set admin credentials if no admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        email: 'admin@example.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('Admin created: admin@example.com');
    } else {
      console.log('Admin already exists');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: 'Invalid admin token' });
    req.admin = admin;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid admin token' });
  }
};

// Routes

// Registration
app.post('/api/auth/register', upload.array('portfolio', 5), async (req, res) => {
  try {
    const { name, email, password, role, pricing, specialization, location, experience, bio } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    if (role === 'photographer') {
      const profile = new Profile({
        userId: user._id,
        portfolio: req.files.map(file => path.join('uploads', file.filename)),
        pricing: JSON.parse(pricing || '{}'),
        specialization: specialization ? specialization.split(',') : [],
        location,
        experience,
        bio
      });
      await profile.save();
    }

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.role === 'photographer' && user.verificationStatus !== 'approved') {
      return res.status(403).json({ message: 'Verification is pending', status: 'pending' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// Admin login
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all verified photographer profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'name email verificationStatus');
    const profilesWithAccessibleImages = profiles
      .filter(p => p.userId && p.userId.verificationStatus === 'approved')
      .map(profile => ({
        ...profile._doc,
        portfolio: profile.portfolio.map(filePath => {
          try {
            fs.accessSync(path.join(__dirname, filePath));
            return filePath;
          } catch (err) {
            return null;
          }
        }).filter(Boolean)
      }));
    res.json(profilesWithAccessibleImages);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: get pending photographer profiles
app.get('/api/admin/profiles/pending', adminMiddleware, async (req, res) => {
  try {
    const pendingProfiles = await Profile.find()
      .where('userId')
      .in(await User.find({ verificationStatus: 'pending', role: 'photographer' }).distinct('_id'))
      .populate('userId', 'name email');
    res.json(pendingProfiles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending profiles' });
  }
});

// Admin: approve photographer profile
app.post('/api/admin/profiles/approve/:id', adminMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('userId');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    profile.userId.verificationStatus = 'approved';
    await profile.userId.save();
    res.json({ message: 'Profile approved' });
  } catch (err) {
    console.error('Error approving profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Photographer creates a post
app.post('/api/posts', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'photographer' || req.user.verificationStatus !== 'approved') {
      return res.status(403).json({ message: 'Only verified photographers can post' });
    }
    const { title, description } = req.body;
    const image = req.file ? path.join('uploads', req.file.filename) : null;
    if (!image) return res.status(400).json({ message: 'Image is required' });
    const post = new Post({
      photographer: req.user._id,
      image,
      title,
      description
    });
    await post.save();
    res.status(201).json({ message: 'Post created', post });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Get posts for a photographer
app.get('/api/posts/:photographerId', async (req, res) => {
  try {
    const posts = await Post.find({ photographer: req.params.photographerId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Client sends agreement
app.post('/api/agreements', authMiddleware, async (req, res) => {
  try {
    const agreement = new Agreement({
      photographerId: req.body.photographerId,
      clientId: req.user._id,
      note: req.body.note
    });
    await agreement.save();
    res.status(201).json({ message: 'Agreement sent' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send agreement' });
  }
});

// Photographer views agreements (all statuses)
app.get('/api/agreements/photographer', authMiddleware, async (req, res) => {
  try {
    const agreements = await Agreement.find({ photographerId: req.user._id })
      .populate('clientId', 'name email');
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agreements' });
  }
});

// Photographer accepts agreement
app.post('/api/agreements/:id/accept', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement || agreement.photographerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    agreement.status = 'accepted';
    agreement.contactDetails = req.body.contactDetails;
    await agreement.save();
    res.json({ message: 'Agreement accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept agreement' });
  }
});

// Photographer rejects agreement
app.post('/api/agreements/:id/reject', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement || agreement.photographerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    agreement.status = 'rejected';
    await agreement.save();
    res.json({ message: 'Agreement rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject agreement' });
  }
});

// Contract agreement and duration
app.post('/api/agreements/:id/contract', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    agreement.contractDone = req.body.contractDone;
    agreement.contractDuration = req.body.contractDuration;
    await agreement.save();
    res.json({ message: 'Contract updated', agreement });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update contract' });
  }
});

// Payment status
app.post('/api/agreements/:id/payment', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    agreement.paymentDone = req.body.paymentDone;
    await agreement.save();
    res.json({ message: 'Payment status updated', agreement });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment status' });
  }
});

// Client review
app.post('/api/agreements/:id/review', authMiddleware, async (req, res) => {
  try {
    const agreement = await Agreement.findById(req.params.id);
    if (!agreement) return res.status(404).json({ message: 'Agreement not found' });
    agreement.review = req.body.review;
    await agreement.save();
    res.json({ message: 'Review submitted', agreement });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
});

// Client views all agreements (all statuses)
app.get('/api/agreements/client', authMiddleware, async (req, res) => {
  try {
    const agreements = await Agreement.find({ clientId: req.user._id })
      .populate('photographerId', 'name email');
    res.json(agreements);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch agreements' });
  }
});

app.listen(process.env.PORT || 5000, () => console.log(`Server running on port ${process.env.PORT || 5000}`));