# AI Dungeon Master Setup Guide

## Overview
This project includes a comprehensive AI-powered Dungeon Master system that can assist with running D&D 3.5e games. The DM has access to 17 specialized tools for managing combat, environments, story elements, and more.

## Features

### AI Dungeon Master Panel
- **Sliding Chat Interface**: Accessible from the right side of the screen
- **Multiple AI Personalities**: Choose from 4 different DM styles
- **Real-time Responses**: Powered by OpenAI's GPT models
- **Game Integration**: Full access to campaign and character data

### AI Personalities Available
1. **Experienced Wise Mentor** - Patient, educational, focuses on learning
2. **Dramatic Storyteller** - Theatrical, immersive, rich descriptions  
3. **Tactical Strategist** - Tactical focus, combat optimization
4. **Mysterious Guide** - Enigmatic, cryptic, discovery-focused

### MCP Server Tools (17 available)
- **Combat Management**: initiative, damage, status effects
- **Environment Control**: weather, lighting, terrain
- **Story Elements**: NPCs, quests, lore
- **Game Mechanics**: dice rolling, rule lookups
- **Character Management**: stats, equipment, spells

## Setup Instructions

### 1. Install Dependencies
The required packages are already installed:
- `openai` - OpenAI API client
- `dotenv` - Environment variable loading

### 2. Configure OpenAI API
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your API key:
   ```bash
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
4. Restart the development server:
   ```bash
   npm run dev
   ```

### 3. Using the DM Chat Panel

#### Opening the Panel
- Click the "DM" button in the bottom-right corner
- Or use keyboard shortcut: `Ctrl+D`

#### Configuration
- Click the ⚙️ settings button in the chat header
- Select your preferred AI personality
- Check connection status

#### Chat Features
- Type messages and press Enter to send
- DM responds with contextual game assistance
- All responses are aware of your current campaign state

## Status Indicators
- 🟢 **Green**: AI configured and ready
- 🟡 **Orange**: Initializing connection
- 🔴 **Red**: Configuration needed

## Keyboard Shortcuts
- `Ctrl+D`: Toggle DM chat panel
- `Enter`: Send message
- `Escape`: Close panel

## Troubleshooting

### "Configuration needed" Error
- Ensure `.env` file exists with valid `OPENAI_API_KEY`
- Restart development server after adding API key
- Check browser console for detailed error messages

### API Connection Issues
- Verify your OpenAI API key is active
- Check your OpenAI account has available credits
- Ensure internet connectivity

### Chat Panel Not Appearing
- Check browser console for JavaScript errors
- Verify development server is running on correct port
- Try refreshing the page

## Development

### File Structure
```
src/
├── ai/
│   ├── config.ts      # AI configuration and personalities
│   ├── dmAgent.ts     # OpenAI client wrapper
├── ui/
│   └── dmChat.ts      # Chat panel interface
└── mcp-server/
    └── src/index.ts   # MCP server with D&D tools
```

### Adding New AI Personalities
Edit `src/ai/config.ts` and add to the `AI_PERSONALITIES` object:

```typescript
new_personality: {
  key: 'new_personality',
  name: 'New Personality Name',
  description: 'Brief description',
  systemPrompt: 'Detailed personality prompt...'
}
```

### Environment Variables
- `OPENAI_API_KEY`: Required - Your OpenAI API key
- `OPENAI_MODEL`: Optional - Model to use (default: gpt-4)
- `OPENAI_TEMPERATURE`: Optional - Response creativity (default: 0.7)
- `OPENAI_MAX_TOKENS`: Optional - Response length limit (default: 1000)

## Security Notes
- `.env` files are automatically gitignored
- API keys are never exposed to the browser
- All API calls are made server-side only

## Support
If you encounter issues:
1. Check the browser developer console
2. Verify your `.env` configuration
3. Ensure the development server is running
4. Check your OpenAI API key and credits
