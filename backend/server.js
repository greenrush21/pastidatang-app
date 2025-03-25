const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Authorization Middleware
const authorize = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Dashboard API Endpoint
app.get('/api/dashboards', authenticate, async (req, res) => {
  const { role, division } = req.user;

  let query = supabase.from('dashboards').select('*');
  
  if (role !== 'admin' && role !== 'alpha') {
    query = query.eq('division', division);
  }

  const { data, error } = await query;

  if (error) return res.status(500).json({ error });
  res.json(data);
});

// System Settings API Endpoint - Admin/Alpha only
app.patch('/api/system-settings', 
  authenticate,
  authorize(['admin', 'alpha']),
  async (req, res) => {
    const { settings } = req.body;
    
    // Update system settings logic
    const { data, error } = await supabase
      .from('system_settings')
      .update(settings)
      .eq('id', 1);  // Assuming a single row for system settings
    
    if (error) return res.status(500).json({ error });
    res.json(data);
  }
);

// User Management API Endpoint - Admin/Alpha only
app.get('/api/users', 
  authenticate,
  authorize(['admin', 'alpha']),
  async (req, res) => {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) return res.status(500).json({ error });
    res.json(data);
  }
);

// Webhook handler for bot integration
app.post('/api/webhook', async (req, res) => {
  const { message } = req.body;
  
  // Process incoming bot messages
  console.log('Received webhook:', message);
  
  // Example: Save message to database
  const { data, error } = await supabase
    .from('bot_messages')
    .insert([{ message, processed: false }]);
  
  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});