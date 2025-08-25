import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { handleDMRequest } from './dmHandler.js';

// Load environment variables from api/.env
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'DM AI Server' 
  });
});

// DM chat endpoint
app.post('/api/dm/chat', async (req, res) => {
  try {
    const { message, personality, gameContext, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    const response = await handleDMRequest({
      message,
      personality: personality || 'experienced_wise_mentor',
      gameContext,
      conversationHistory
    });

    res.json(response);
  } catch (error) {
    console.error('Error in /api/dm/chat:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Configuration endpoint
app.get('/api/dm/config', (req, res) => {
  res.json({
    hasApiKey: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4',
    personalities: ['experienced_wise_mentor', 'dramatic_storyteller', 'tactical_strategist', 'mysterious_guide'],
    status: process.env.OPENAI_API_KEY ? 'ready' : 'needs_configuration'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🎲 DM AI Server running on http://localhost:${port}`);
  console.log(`📝 API endpoints:`);
  console.log(`   POST /api/dm/chat - Chat with AI DM`);
  console.log(`   GET  /api/dm/config - Check configuration`);
  console.log(`   GET  /health - Health check`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  OPENAI_API_KEY not found in environment variables');
    console.warn('   Please add your OpenAI API key to .env file');
  } else {
    console.log('✅ OpenAI API key configured');
  }
});

export default app;
