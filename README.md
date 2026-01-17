# Memory Keeper

## What This Project Does

Memory Keeper is a mobile application designed to help users maintain a daily reflection and journaling practice. The app provides a clean, intuitive interface for capturing personal thoughts, memories, and reflections on a regular basis. Users can create accounts, securely log in, and build their personal memory collection over time.

Key features include:
- User registration and authentication
- Secure login system
- Daily reflection prompts and journaling interface
- Personal memory storage and organization
- Cross-platform mobile experience (iOS/Android)

## Why Someone Should Care

In our fast-paced world, taking time for daily reflection is crucial for mental health and personal growth. Memory Keeper makes it easy to:
- Build a consistent reflection habit
- Preserve important personal memories and insights
- Track personal growth over time
- Maintain mental clarity through regular journaling
- Access memories securely from anywhere

Whether you're a mindfulness practitioner, therapist, or simply someone who wants to document life's important moments, Memory Keeper provides a digital space to nurture self-awareness and preserve meaningful experiences.

## How to Install and Run Your Project

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g @expo/cli`)
- Go (for backend API)
- PostgreSQL database

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd cmd/api
   ```

2. Install Go dependencies:
   ```bash
   go mod tidy
   ```

3. Set up PostgreSQL database and run migrations

4. Start the backend server:
   ```bash
   go run main.go
   ```

### Mobile App Setup
1. Clone the repository:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the mobile directory:
   ```
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   expo start
   ```

5. Run on device/emulator:
   - For iOS: `expo start --ios`
   - For Android: `expo start --android`
   - Or scan QR code with Expo Go app

### Usage
1. Register a new account or log in
2. Start your daily reflection journey
3. Add memories and reflections
4. View your personal memory collection

### Development
- Backend API runs on `http://localhost:3000`
- Mobile app uses Expo development server
- Database migrations use Goose