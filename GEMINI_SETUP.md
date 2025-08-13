# 🚀 Gemini AI Integration Setup Guide

This guide will help you set up the Gemini AI integration for code analysis in your DBug platform.

## 📋 Prerequisites

1. **Google AI Studio Account**: You need a Google account to access Gemini API
2. **Node.js**: Ensure you have Node.js installed (version 16 or higher)
3. **MongoDB**: Make sure MongoDB is running locally or you have a connection string

## 🔑 Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key (it starts with "AIza...")
5. **Keep this key secure and never commit it to version control**

## ⚙️ Step 2: Configure Server Environment

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Create a `.env` file:**
   ```bash
   # On Windows (PowerShell)
   New-Item -Path ".env" -ItemType File
   
   # On macOS/Linux
   touch .env
   ```

3. **Add the following content to `.env`:**
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb://localhost:27017/dbug
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # AI API Keys
   GOOGLE_GENERATIVE_AI_API_KEY=AIza...your-actual-api-key-here
   
   # JWT Secret
   JWT_SECRET=your-jwt-secret-here
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Replace `AIza...your-actual-api-key-here` with your actual Gemini API key**

## ⚙️ Step 3: Configure Client Environment

1. **Navigate to the client directory:**
   ```bash
   cd ../client
   ```

2. **Create a `.env.local` file:**
   ```bash
   # On Windows (PowerShell)
   New-Item -Path ".env.local" -ItemType File
   
   # On macOS/Linux
   touch .env.local
   ```

3. **Add the following content to `.env.local`:**
   ```env
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-nextauth-secret-here
   NEXTAUTH_URL=http://localhost:3000
   
   # GitHub OAuth
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:5000
   
   # Server URL for GitHub API forwarding
   NEXT_PUBLIC_SERVER_URL=http://localhost:5000
   ```

## 🧪 Step 4: Test the Integration

1. **Test Gemini API (Server):**
   ```bash
   cd ../server
   node test-gemini.js
   ```

2. **Expected output if successful:**
   ```
   🧪 Testing Gemini API integration...
   📤 Sending test prompt to Gemini...
   ✅ Gemini API Response: Gemini API is working correctly!
   🎉 Gemini API integration is working correctly!
   ```

3. **If you get an error, check:**
   - API key is correct and not expired
   - You have sufficient API quota
   - Your API key is not restricted

## 🚀 Step 5: Start the Application

1. **Start the server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client (in a new terminal):**
   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser and go to:** `http://localhost:3000`

## 🎯 Step 6: Test AI Code Analysis

1. Navigate to the debugger page
2. Open a code file or write some code
3. Click the "Analyze Code" button in the AI Debugger panel
4. The AI should analyze your code and provide suggestions

## 🔧 Troubleshooting

### Common Issues:

1. **"Gemini API key not configured"**
   - Check that `.env` file exists in server directory
   - Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set correctly

2. **"AI analysis failed"**
   - Check server console for detailed error messages
   - Verify your API key is valid and has sufficient quota
   - Ensure the server is running on port 5000

3. **"Failed to parse AI response"**
   - This is usually a parsing issue with the AI response
   - Check the server logs for the raw AI response

4. **CORS errors**
   - Ensure the server is running and accessible
   - Check that `NEXT_PUBLIC_API_URL` points to the correct server URL

### API Quota Issues:

- Gemini API has rate limits and quotas
- Free tier: 15 requests per minute, 1500 requests per day
- Paid tier: Higher limits available
- Check your usage at [Google AI Studio](https://makersuite.google.com/app/apikey)

## 📚 API Endpoints

The following AI endpoints are now available:

- `POST /api/ai/debug` - Debug code with Gemini
- `POST /api/ai/analyze` - Analyze code complexity and maintainability
- `POST /api/ai/suggestions` - Get code improvement suggestions
- `GET /api/ai/providers` - Get available AI providers

## 🎉 Success!

Once everything is working, you should see:
- AI analysis working in the debugger panel
- Real-time code suggestions and fixes
- Integration with the Gemini AI model
- Proper error handling and user feedback

## 🔒 Security Notes

- Never commit your `.env` files to version control
- Keep your API keys secure
- Consider implementing proper authentication for production use
- Monitor your API usage to avoid unexpected charges

## 📞 Support

If you encounter issues:
1. Check the server console for error messages
2. Verify your API key is working with the test script
3. Ensure all environment variables are set correctly
4. Check that both server and client are running

---

**Happy coding with AI-powered debugging! 🚀✨**
