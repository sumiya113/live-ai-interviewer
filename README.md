# OnTheFly - AI-Powered Live Interview Practice Application

[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase-12.14.0-FFCA28?logo=firebase)](https://firebase.google.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-Live_API-4285F4?logo=google)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview

**InterviewForge** is an AI-powered live interview coaching platform designed to help candidates practice and improve their interview skills in real-time. Built with modern web technologies, it leverages the Google Gemini Live API for intelligent, conversational interview simulations and Firebase for real-time data persistence.

The platform provides a comprehensive suite of tools including multi-role interview practice, performance analytics, AI coaching assistance, and session history management—all within a polished, responsive interface.

## Features

- **🎙️ Live Interview Sessions** – Practice real-time interviews with AI interviewers across multiple job roles
- **🎯 Role-Based Configuration** – Support for Software Engineer, Product Manager, UX Designer, and Data Scientist roles
- **📊 Performance Analytics** – Track competency scores and improvements across multiple interview dimensions
- **💬 AI Coach Chat** – Get real-time guidance and tips during or after interview practice sessions
- **📋 Session History** – View detailed transcripts and feedback from past interview sessions
- **🎮 AI Playground** – Experiment with free-form AI interactions and test prompts
- **💳 SaaS Pricing Plans** – Tiered subscription models for different user needs
- **⚡ Real-Time Feedback** – Comprehensive post-interview analysis with strengths and improvement areas
- **🎨 Modern UI/UX** – Dark-themed, responsive design built with Tailwind CSS and Motion animations
- **📱 Mobile-First Responsive** – Optimized for desktop and mobile devices
- **🚀 Optimized Performance** – Vite-powered fast builds and instant HMR during development

## Tech Stack

### Frontend
- **React** 19.1.1 – Modern UI component library with hooks
- **TypeScript** ~5.8.2 – Type-safe JavaScript development
- **Vite** 6.2.0 – Lightning-fast build tool and dev server
- **Tailwind CSS** – Utility-first CSS framework for responsive design
- **Lucide React** 1.17.0 – Beautiful, consistent icon library
- **Motion** 12.40.0 – Smooth animations and transitions

### Backend & Services
- **Firebase** 12.14.0 – Authentication, Firestore database, and real-time capabilities
- **Google Gemini API** (@google/genai 1.21.0) – AI-powered interview generation and feedback
- **Recharts** 3.2.1 – Data visualization for analytics dashboard

### Development
- **@vitejs/plugin-react** 5.0.0 – Fast React plugin for Vite
- **@types/node** 22.14.0 – TypeScript Node.js type definitions

## Project Structure

```
live-ai-interviewer/
├── components/           # React UI components
│   ├── SetupScreen.tsx
│   ├── InterviewScreen.tsx
│   ├── FeedbackScreen.tsx
│   ├── HistoricalSessions.tsx
│   ├── AnalyticsDashboard.tsx
│   ├── CoachChat.tsx
│   ├── SaaSPricing.tsx
│   ├── LandingPage.tsx
│   ├── PlaygroundSession.tsx
│   ├── SettingsPanel.tsx
│   ├── Avatar.tsx
│   └── icons.tsx
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication management
│   ├── useInterview.ts  # Interview session logic
│   └── usePlayground.ts # AI playground interactions
├── services/            # External service integrations
│   ├── firebase.ts      # Firebase configuration and utilities
│   └── geminiService.ts # Google Gemini API client
├── types.ts             # TypeScript type definitions
├── constants.ts         # Application constants and enums
├── App.tsx              # Main application component
├── index.tsx            # React entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── package.json         # Project dependencies
└── firestore.rules      # Firestore security rules
```

## Getting Started

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- A **Google Gemini API key** from [Google AI Studio](https://ai.google.dev)
- A **Firebase project** (optional, for real-time features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sumiya113/live-ai-interviewer.git
   cd live-ai-interviewer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your Gemini API key
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

### Build for Production

To create an optimized production build:

```bash
npm run build
```

The output will be in the `dist/` directory, ready for deployment.

### Preview Production Build

To test the production build locally:

```bash
npm run preview
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot module replacement |
| `npm run build` | Create optimized production build |
| `npm run preview` | Preview production build locally |

## Deployment

This project is optimized for deployment on modern hosting platforms:

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Netlify
```bash
netlify deploy --prod --dir=dist
```

### Docker Deployment
The project can be containerized for deployment on any container platform:
```bash
docker build -t live-ai-interviewer .
docker run -p 3000:3000 live-ai-interviewer
```

## Architecture

### Application Flow

1. **Authentication** – Users log in via Firebase Authentication
2. **Interview Setup** – Users configure interview parameters (role, difficulty, or custom JD)
3. **Live Interview** – Real-time conversational interview with AI powered by Google Gemini
4. **Feedback Analysis** – Comprehensive feedback with scores and improvement areas
5. **Session Management** – Access to historical sessions and analytics

### State Management

The application uses React's built-in `useState` and custom hooks for state management, enabling efficient prop drilling and hook composition across components.

### Real-Time Updates

Firebase Firestore provides real-time synchronization for:
- Interview session data
- User profiles
- Session history
- Analytics metrics

## Configuration

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Add a web app to your project
3. Copy your Firebase config from Project Settings
4. Update `services/firebase.ts` with your credentials

### Gemini API Key

Obtain your API key from [Google AI Studio](https://ai.google.dev):
1. Visit the platform
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`

## Security

- **Firestore Rules** – Security rules are configured in `firestore.rules` to protect user data
- **Environment Variables** – Sensitive API keys are stored in `.env.local` and never committed
- **Authentication** – Firebase Authentication handles secure user management

## Performance Optimizations

- **Vite** – Ultra-fast build times and instant HMR
- **Code Splitting** – Lazy-loaded components for faster initial load
- **Image Optimization** – Optimized images and icon libraries
- **CSS Purging** – Tailwind CSS purges unused styles in production
- **Tree Shaking** – Unused code is removed during the build process

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Video recording and playback
- [ ] Advanced competency metrics
- [ ] Interview template library
- [ ] Team and enterprise features
- [ ] Mobile native apps
- [ ] Multi-language support
- [ ] Export reports as PDF

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or feature requests, please [open an issue](https://github.com/sumiya113/live-ai-interviewer/issues) on GitHub.

## Acknowledgments

- **Google Gemini API** – AI-powered interview generation
- **Firebase** – Real-time database and authentication
- **React** – Component library
- **Tailwind CSS** – Utility-first styling
- **Vite** – Next-generation build tool

---

Built with ❤️ by [Sumiya Maya](https://github.com/sumiya113)
