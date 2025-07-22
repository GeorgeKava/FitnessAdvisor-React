# FitnessAdvisor React Application

## Overview
The **FitnessAdvisor** is a comprehensive web application that provides personalized fitness recommendations based on user-provided images and profile data. Users can register accounts, manage their fitness profiles, and receive AI-powered recommendations through multiple specialized fitness agents. The application features a complete authentication system, profile management, and utilizes both fast and enhanced AI analysis modes. The backend integrates OpenAI's GPT-4o vision model with Model Context Protocol (MCP) for structured fitness data and recommendations.

---

## Features

### 🔐 Authentication & User Management
- **User Registration**: Complete signup with required (Name, Email, Password, Sex) and optional fields (Age, Weight, Fitness Agent)
- **User Login**: Secure authentication with session management
- **Profile Management**: Editable user profiles with fitness preferences and personal data
- **Auto-Save Functionality**: Profile data automatically saves when updated in the main application
- **Persistent Sessions**: Login state maintained across browser sessions

### 🏋️ Fitness Agent System
- **Personal Trainer**: General fitness guidance and balanced recommendations
- **Strength Coach**: Focus on strength training and muscle building
- **Cardio Specialist**: Endurance training and cardiovascular health
- **Nutrition Expert**: Diet planning and nutritional guidance
- **Weight Loss Coach**: Fat loss strategies and metabolic optimization
- **Muscle Building Coach**: Hypertrophy-focused training programs

### 📱 Frontend Features
- **React-Based UI**: Modern, responsive interface with Bootstrap 5 styling
- **Image Upload**: Upload existing photos from device storage
- **Live Camera Capture**: Real-time photo capture using device camera
- **Dual Analysis Modes**: 
  - **Fast Mode**: Quick analysis (15-30 seconds) for immediate feedback
  - **Enhanced Mode**: Detailed analysis (45-90 seconds) with MCP integration
- **Mobile-Friendly**: Optimized for mobile devices and tablets
- **Progress Indicators**: Real-time loading states with detailed progress messages
- **Profile Integration**: Auto-fill forms with saved profile data

### 🧠 Backend Capabilities
- **Flask API**: Python-based backend with comprehensive endpoints
- **AI-Powered Analysis**: 
  - Azure OpenAI GPT-4o vision integration
  - Context-aware recommendations based on user profiles
  - Agent-specific coaching styles and advice
- **MCP Integration**: Model Context Protocol for structured fitness data
  - Workout plan generation
  - Nutrition calculations
  - Exercise recommendations database
- **Dual Processing Modes**:
  - Fast analysis for quick recommendations
  - Enhanced analysis with comprehensive MCP data integration

---

## Technology Stack
- **Frontend**: React.js, Bootstrap 5, Font Awesome
- **Backend**: Flask (Python), Model Context Protocol (MCP)
- **AI**: Azure OpenAI Service (GPT-4o Vision)
- **Authentication**: Local storage-based session management
- **Styling**: Bootstrap 5 with responsive design
- **Icons**: Font Awesome for UI enhancement

---

## Project Structure
```
FitnessAdvisor-React/
├── frontend/
│   ├── public/
│   │   └── index.html          # Bootstrap & Font Awesome integration
│   ├── src/
│   │   ├── components/
│   │   │   ├── FitnessAdvisorPage.jsx    # Main recommendation interface
│   │   │   ├── LoginPage.jsx             # User authentication
│   │   │   ├── RegisterPage.jsx          # User registration
│   │   │   ├── ProfilePage.jsx           # Profile management
│   │   │   ├── NavBar.jsx               # Navigation with auth state
│   │   │   └── Footer.jsx               # Application footer
│   │   ├── App.jsx              # Main app with routing & auth logic
│   │   └── index.jsx           # Application entry point
│   └── package.json            # Frontend dependencies
├── backend/
│   ├── app.py                  # Main Flask application
│   ├── ai.py                   # Enhanced AI recommendations with MCP
│   ├── ai_fast.py             # Fast AI recommendations
│   ├── mcp_server.py          # MCP server for fitness data
│   ├── mcp_client.py          # MCP client integration
│   ├── requirements.txt        # Python dependencies
│   └── captured_images/        # Stored captured images
└── README.md                   # This file
```

---

## Installation

### Prerequisites
- **Node.js** (v14 or higher): For running the React frontend
- **Python 3.8+**: For running the Flask backend
- **pip**: Python package manager
- **Azure OpenAI Credentials**: Required for AI-powered recommendations
  - Azure OpenAI endpoint
  - API key
  - Model deployment name (GPT-4o Vision)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd FitnessAdvisor-React
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the `backend` directory with your Azure OpenAI credentials:
   ```env
   AZURE_OPENAI_API_ENDPOINT="your_endpoint"
   AZURE_OPENAI_API_KEY="your_api_key"
   AZURE_OPENAI_API_VERSION="2024-02-15-preview"
   AZURE_OPENAI_MODEL="your_gpt4o_deployment_name"
   ```

4. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the Backend Server**:
   ```bash
   cd ../backend
   python app.py
   ```
   Backend runs on `http://localhost:5000`

6. **Start the Frontend Development Server**:
   ```bash
   cd ../frontend
   npm start
   ```
   Frontend runs on `http://localhost:3000`

7. **Access the Application**:
   Open your browser and navigate to `http://localhost:3000`

---

## Usage

### Getting Started
1. **Create an Account**:
   - Navigate to `/register` to create a new account
   - Fill in required fields: Name, Email, Password, Sex
   - Optionally add: Age, Weight, Preferred Fitness Agent
   - Account automatically logs you in after registration

2. **Login** (if you have an existing account):
   - Navigate to `/login`
   - Enter your email and password
   - Your profile data will be automatically loaded

### Using the Fitness Advisor

#### Profile Management
- **Access Profile**: Click your email in the top navigation → Profile
- **Edit Information**: Click "Edit Profile" to modify your details
- **Auto-Save**: Any changes made in the main app automatically save to your profile

#### Getting Recommendations
1. **Choose Analysis Mode**:
   - **Quick Analysis**: Fast recommendations (15-30 seconds)
   - **Enhanced Analysis**: Detailed recommendations with MCP integration (45-90 seconds)

2. **Select Your Fitness Agent**: Choose from 6 specialized coaches:
   - Personal Trainer (General fitness)
   - Strength Coach (Strength training focus)
   - Cardio Specialist (Endurance training)
   - Nutrition Expert (Diet planning)
   - Weight Loss Coach (Fat loss strategies)
   - Muscle Building Coach (Hypertrophy focus)

3. **Provide Your Information**:
   - Personal details auto-fill from your profile
   - Update any information as needed (auto-saves to profile)

4. **Submit Images**:
   - **Upload Option**: Select existing photos from your device
   - **Camera Option**: Click "Use Camera" to capture live photos
   - Support for multiple images (front, side, back views)

5. **Receive Personalized Recommendations**:
   - AI analyzes your images and profile data
   - Get tailored advice based on your selected fitness agent
   - Recommendations include exercise plans, nutrition guidance, and coaching tips

### Navigation
- **Home**: Main fitness advisor interface
- **Profile**: Manage your personal information and fitness preferences
- **Logout**: Securely end your session (top navigation dropdown)

---

## API Endpoints

### Authentication & Profile
- **POST** `/api/fitness_recommendation`: Main endpoint for image analysis and recommendations
  - Accepts: Form data with images, gender, age, weight, agent_type, fast_mode
  - Returns: Personalized fitness recommendations

### File Storage
- **Captured Images**: Automatically stored in `backend/captured_images/`
- **Profile Data**: Stored in browser localStorage (production would use proper database)

---

## Key Features Explained

### MCP (Model Context Protocol) Integration
The enhanced analysis mode utilizes MCP for:
- **Structured Fitness Data**: Access to comprehensive exercise databases
- **Workout Plan Generation**: Customized routines based on goals and fitness level
- **Nutrition Calculations**: BMR/TDEE calculations with meal recommendations
- **Exercise Recommendations**: Targeted exercises for specific muscle groups

### Dual Analysis Modes
- **Fast Mode**: Direct GPT-4o vision analysis with optimized prompts
- **Enhanced Mode**: Combines vision analysis with MCP structured data for comprehensive recommendations

### Auto-Save Profile System
- Real-time saving of user inputs to profile
- Bidirectional sync between main app and profile page
- Automatic loading of profile data on login
- Visual feedback for save operations

---

## Development Notes

### Frontend Architecture
- React functional components with hooks
- React Router for navigation and route protection
- Bootstrap 5 for responsive design
- Local storage for session and profile management

### Backend Architecture
- Flask with CORS for API endpoints
- Modular AI processing (ai.py for enhanced, ai_fast.py for quick)
- MCP server/client architecture for structured data
- Image processing and storage management

### Performance Optimizations
- Concurrent processing for faster recommendations
- Image compression for reduced upload times
- Timeout handling for long-running requests
- Progressive loading indicators with detailed feedback