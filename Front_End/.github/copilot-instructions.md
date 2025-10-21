# Jamaica Pulse App - AI Agent Instructions

This document guides AI agents working in this codebase. It outlines key architectural patterns, workflows, and project-specific conventions.

## Project Overview

Jamaica Pulse App is a React-based sentiment analysis dashboard that visualizes national mood and topic-based sentiment across Jamaica's parishes. The app uses Vite, TypeScript, and TailwindCSS.

## Key Architecture Components

### Frontend Structure
- `src/pages/` - Main route components (Home, Topics, Regions, About)
- `src/components/` - Reusable UI components (PulseIndexCard, RegionalMap, etc.)
- `src/services/` - API and data services

### Data Flow
- Mock data currently in `services/api.ts` - structured to match future FastAPI backend
- Components fetch data through service layer for easy backend integration
- Regional data organized by parish with positive/negative/neutral sentiment values

## Development Workflow

### Setup and Running
```bash
npm install        # Install dependencies
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run typecheck # Run TypeScript checks
npm run lint      # Run ESLint
```

### Component Patterns
- Use functional components with TypeScript types
- Charts implemented using react-chartjs-2
- Styling uses TailwindCSS utilities
- Regional map uses Mapbox for visualization

### State Management
- Local component state for UI elements
- Service layer (`services/api.ts`) for data fetching
- Future integration points with FastAPI backend defined in service layer

## Key Files
- `src/services/api.ts` - Data service layer and API integration points
- `src/components/RegionalMap.tsx` - Parish-level sentiment visualization
- `src/components/PulseIndexCard.tsx` - National sentiment display
- `BuildResources/Frontend Instructions.txt` - Detailed feature requirements

## Project Conventions
- Topic sentiment ranges from 0 to 1 (0 = negative, 1 = positive)
- Parish data includes three sentiment categories: positive, negative, neutral
- Charts use consistent date formats (ISO 8601)
- Sentiment labels mapped to numeric ranges (e.g., "Optimistic" = 60-80)