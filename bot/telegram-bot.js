const { Telegraf } = require('telegraf');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Telegram bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const API_URL = process.env.API_URL || 'http://localhost:5000';

// Authorized users and their roles
const authorizedUsers = {
  // Telegram user IDs mapped to roles
  // e.g., '12345678': 'admin'
};

// Authorization middleware
const authorize = (ctx, allowedRoles = ['admin', 'alpha']) => {
  const userId = ctx.from.id.toString();
  const userRole = authorizedUsers[userId];
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    ctx.reply('Unauthorized: You do not have permission to use this command.');
    return false;
  }
  
  return true;
};

// Start command
bot.start((ctx) => {
  ctx.reply('Welcome to Pastidatang Bot! Use /help to see available commands.');
});

// Help command
bot.help((ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/dashboard [division] - View dashboard data\n' +
    '/users - View all users (admin only)\n' +
    '/status - Check system status'
  );
});

// Dashboard command
bot.command('dashboard', async (ctx) => {
  const args = ctx.message.text.split(' ');
  const division = args[1]; // Optional division parameter
  
  if (!division && !authorize(ctx, ['admin', 'alpha'])) {
    return; // Only admins can view all dashboards
  }
  
  try {
    const userId = ctx.from.id.toString();
    const userRole = authorizedUsers[userId] || 'guest';
    
    // Make API request to backend
    let url = `${API_URL}/api/dashboards`;
    if (division) {
      url += `?division=${encodeURIComponent(division)}`;
    }
    
    const response = await axios.get(url, {
      headers: { 
        Authorization: `Bearer ${process.env.BOT_API_TOKEN}`,
        'User-Role': userRole
      }
    });
    
    const data = response.data;
    
    if (data.length === 0) {
      ctx.reply('No dashboard data found.');
      return;
    }
    
    // Format dashboard data for display
    const formattedData = data.map(item => 
      `Division: ${item.division}\nStatus: ${item.status}\nUpdated: ${new Date(item.updated_at).toLocaleString()}`
    ).join('\n\n');
    
    ctx.reply(`Dashboard Data:\n\n${formattedData}`);
    
  } catch (error) {
    console.error('Error fetching dashboard:', error.message);
    ctx.reply('Error fetching dashboard data. Please try again later.');
  }
});

// Users command (admin only)
bot.command('users', async (ctx) => {
  if (!authorize(ctx, ['admin'])) return;
  
  try {
    const response = await axios.get(`${API_URL}/api/users`, {
      headers: { Authorization: `Bearer ${process.env.BOT_API_TOKEN}` }
    });
    
    const data = response.data;
    
    if (data.length === 0) {
      ctx.reply('No users found.');
      return;
    }
    
    // Format user data for display
    const formattedData = data.map(user => 
      `User: ${user.email}\nRole: ${user.role}\nDivision: ${user.division}\nStatus: ${user.active ? 'Active' : 'Inactive'}`
    ).join('\n\n');
    
    ctx.reply(`User Data:\n\n${formattedData}`);
    
  } catch (error) {
    console.error('Error fetching users:', error.message);
    ctx.reply('Error fetching user data. Please try again later.');
  }
});

// Status command
bot.command('status', async (ctx) => {
  try {
    const response = await axios.get(`${API_URL}/api/status`);
    const { status, uptime, activeSessions } = response.data;
    
    ctx.reply(
      `System Status: ${status}\n` +
      `Uptime: ${uptime}\n` +
      `Active Sessions: ${activeSessions}`
    );
    
  } catch (error) {
    console.error('Error checking status:', error.message);
    ctx.reply('Error checking system status. Please try again later.');
  }
});

// Error handler
bot.catch((err, ctx) => {
  console.error('Telegram bot error:', err);
  ctx.reply('An error occurred while processing your request.');
});

// Launch the bot
bot.launch()
  .then(() => console.log('Telegram bot started'))
  .catch(err => console.error('Failed to start Telegram bot:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));