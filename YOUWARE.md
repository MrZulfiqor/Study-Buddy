# AI Study Buddy - React Application

This is an AI-powered study assistant application built with React 18, TypeScript, Vite, and Tailwind CSS.

## Project Overview

AI Study Buddy helps students understand any topic by:
- Explaining complex content clearly and concisely
- Generating practice quizzes with multiple-choice questions
- Creating structured study notes with bullet points
- Supporting both text input and file uploads

## Core Features

### AI-Powered Learning Tools
- **Clear Explanation Mode**: Uses "simple_explanation" AI configuration to provide clear, professional explanations
- **Quiz Generator**: Creates 3 multiple-choice questions with explanations using "quiz_generator" configuration
- **Smart Notes**: Generates hierarchical bullet-point study notes using "notes_generator" configuration

### User Interface
- **Dark/Light Mode Toggle**: Smooth theme switching with persistent visual preferences
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Tabbed Results**: Organized display of explanations, quizzes, and notes
- **Interactive Quiz**: Real-time quiz taking with immediate feedback and scoring

## Technical Architecture

### AI Integration
- **AI SDK**: Uses `ai` and `@ai-sdk/openai` packages for text generation
- **Configuration**: AI models and prompts defined in `yw_manifest.json` under `ai_config`
- **API Endpoint**: All AI requests go through `https://api.youware.com/public/v1/ai`
- **Error Handling**: Comprehensive logging with request/response tracking and user-friendly error messages

### Component Structure
- **Single Page Application**: All functionality contained in `src/App.tsx`
- **State Management**: React useState hooks for local state management
- **File Handling**: FileReader API for text file uploads
- **TypeScript**: Full type safety with interfaces for quiz questions and results

### AI Configurations
```json
{
  "simple_explanation": {
    "model": "openai-gpt-4o",
    "system_prompt": "Expert educator treating all input as general educational content, not code..."
  },
  "quiz_generator": {
    "model": "openai-gpt-4o", 
    "system_prompt": "Educational assessment with JSON structure..."
  },
  "notes_generator": {
    "model": "openai-gpt-4o",
    "system_prompt": "Master note-taker creating hierarchical bullets..."
  }
}
```

## Development Commands

- **Install dependencies**: `npm install`
- **Build project**: `npm run build`
- **Development server**: `npm run dev`

## Key Implementation Details

### AI Request Pattern
All AI functions follow this pattern:
1. Validate configuration from `globalThis.ywConfig.ai_config`
2. Log request details with timing
3. Make API call using `generateText` from AI SDK
4. Log response details and timing
5. Handle errors with user-friendly messages

### Content Handling
- **General Educational Focus**: AI prompts explicitly instruct to treat all input as educational content (exercises, problems, concepts) rather than code
- **Subject-Agnostic**: Works for math, science, literature, history, and any subject area
- **Plain Language**: Explanations avoid technical jargon unless content is explicitly programming-related
- **Clean Output**: Post-processing removes markdown symbols (###, **, *, [], `) to ensure clean, readable text

### Quiz System
- Generates exactly 3 multiple-choice questions
- Structured JSON response with questions, options, correct answers, and explanations
- Interactive quiz taking with radio buttons
- Results display with correct/incorrect indicators and explanations

### File Upload Support
- Accepts `.txt`, `.md`, `.doc`, `.docx` files
- Uses FileReader API to extract text content
- Displays uploaded file name with confirmation

## Build and Deployment

The project uses Vite build system:
- **Development server**: `http://127.0.0.1:5173`
- **Build output**: `dist/` directory
- **Optimized production build**: Automatic code splitting and optimization
- **Build verification**: Must pass `npm run build` without errors

## Error Handling Standards

- **AI Errors**: All AI-related errors include "API Error -" prefix in console logs
- **User Feedback**: Alert messages for failed AI requests
- **Loading States**: Spinner animation during AI processing
- **Validation**: Input validation before AI requests

## Performance Considerations

- **Concurrent Generation**: "Generate All" button processes all three AI features in parallel
- **Response Caching**: Results stored in component state to avoid duplicate API calls
- **Optimistic UI**: Immediate UI updates with loading indicators
- **Error Recovery**: Graceful handling of API failures without breaking UI

## Future Enhancements

The current MVP provides core functionality. Potential next steps include:
- User authentication and progress tracking
- PDF export for notes
- Image OCR support for textbook screenshots
- Study session history
- Collaborative study features
