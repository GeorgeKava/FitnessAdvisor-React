# FitnessAdvisor React Application

## Overview
The **FitnessAdvisor** is a comprehensive web application that provides personalized fitness recommendations and structured weekly workout plans based on user-provided images and profile data. Users can register accounts, manage their fitness profiles, and receive AI-powered recommendations through multiple specialized fitness agents. The application features a complete authentication system, profile management, weekly plan generation, and utilizes both fast and enhanced AI analysis modes. The backend integrates OpenAI's GPT-4o vision model with Model Context Protocol (MCP) for structured fitness data and comprehensive weekly workout planning.

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

### 📅 Weekly Workout Planning System
- **7-Day Structured Plans**: Complete weekly workout schedules with daily exercise distribution
- **Balanced Exercise Distribution**: Intelligent algorithms prevent exercise dumping and ensure even workload across days
- **Agent-Specific Programming**: Weekly plans tailored to each fitness agent's specialization
- **Rest Day Management**: Proper recovery days with gentle activities instead of intense exercises
- **Validation System**: Multi-layer validation ensures realistic and achievable daily exercise counts
- **Fallback Plans**: Comprehensive backup plans for each agent type when AI generation fails
- **Exercise Variety**: 3-4 exercises per training day with specific sets, reps, and duration guidelines

### 📱 Frontend Features
- **React-Based UI**: Modern, responsive interface with Bootstrap 5 styling
- **Image Upload**: Upload existing photos from device storage
- **Live Camera Capture**: Real-time photo capture using device camera
- **Weekly Plan Interface**: Dedicated page for viewing and managing 7-day workout schedules
- **Multiple Analysis Modes**: 
  - **Fast Mode**: Quick analysis (15-30 seconds) for immediate feedback
  - **Enhanced Mode**: Detailed analysis (45-90 seconds) with comprehensive recommendations
  - **Azure AI Search RAG**: Enhanced with fitness database (30-45 seconds) using Retrieval-Augmented Generation
  - **Model Context Protocol (MCP)**: Structured fitness tools (20-35 seconds) for personalized workout plans
  - **🚀 Hybrid RAG + MCP**: Ultimate recommendations (45-60 seconds) combining BOTH technologies for maximum effectiveness
- **Mobile-Friendly**: Optimized for mobile devices and tablets
- **Progress Indicators**: Real-time loading states with detailed progress messages
- **Profile Integration**: Auto-fill forms with saved profile data
- **Daily Exercise Cards**: Visual presentation of daily workouts with exercise details, goals, and notes

### 🧠 Backend Capabilities
- **Flask API**: Python-based backend with comprehensive endpoints
- **AI-Powered Analysis**: 
  - Azure OpenAI GPT-4o vision integration
  - Context-aware recommendations based on user profiles
  - Agent-specific coaching styles and advice
- **Weekly Plan Generation Engine**:
  - Structured weekly workout plan creation with balanced exercise distribution
  - Agent-specific weekly programming (weight loss, muscle gain, cardio, strength, general)
  - Validation systems preventing unbalanced plans and exercise dumping
  - Comprehensive fallback plans for reliable service
  - Timeout handling with MCP integration for enhanced planning
- **Azure AI Search Integration**: Enterprise search with RAG capabilities
  - Comprehensive fitness exercise database (3000+ exercises)
  - User performance tracking and benchmarks
  - Semantic search for contextual recommendations
- **MCP Integration**: Model Context Protocol for structured fitness data
  - Workout plan generation
  - Nutrition calculations
  - Exercise recommendations database
- **Multiple Processing Modes**:
  - Fast analysis for quick recommendations
  - Enhanced analysis with comprehensive recommendations
  - RAG-enhanced recommendations using Azure AI Search
  - MCP-structured recommendations with fitness tools
  - **🚀 Hybrid RAG + MCP**: Ultimate mode combining both technologies for maximum effectiveness
  - **Weekly Plan Mode**: Structured 7-day workout plan generation

### 🗄️ Data & Search Capabilities
- **Azure AI Search Index**: "fitness-index" with comprehensive fitness data
- **Exercise Database**: 2,919 exercises from megaGymDataset with detailed instructions
- **User Performance Data**: 974 gym member tracking records for benchmarking
- **Structured Exercises**: 208 rated exercises with difficulty levels
- **Semantic Search**: Advanced search capabilities for contextual exercise recommendations
- **Agentic RAG**: Intelligent data retrieval for evidence-based fitness recommendations

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
│   │   │   ├── WeeklyPlanPage.jsx        # 7-day workout plan display
│   │   │   ├── LoginPage.jsx             # User authentication
│   │   │   ├── RegisterPage.jsx          # User registration
│   │   │   ├── ProfilePage.jsx           # Profile management
│   │   │   ├── NavBar.jsx               # Navigation with auth state
│   │   │   └── Footer.jsx               # Application footer
│   │   ├── App.jsx              # Main app with routing & auth logic
│   │   └── index.jsx           # Application entry point
│   └── package.json            # Frontend dependencies
├── backend/
│   ├── app.py                  # Main Flask application with weekly plan endpoints
│   ├── ai.py                   # Enhanced AI recommendations with weekly plan generation
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
   Create a `.env` file in the `backend` directory with your Azure credentials:
   ```env
   # Azure OpenAI Configuration
   AZURE_OPENAI_API_ENDPOINT="your_openai_endpoint"
   AZURE_OPENAI_API_KEY="your_openai_api_key"
   AZURE_OPENAI_API_VERSION="2024-02-15-preview"
   AZURE_OPENAI_MODEL="your_gpt4o_deployment_name"
   
   # Azure AI Search Configuration (for RAG mode)
   AZURE_SEARCH_ENDPOINT="https://your-search-service.search.windows.net"
   AZURE_SEARCH_ADMIN_KEY="your_search_admin_key"
   AZURE_SEARCH_INDEX_NAME="fitness-index"
   ```

4. **Set Up Azure AI Search (Optional - for RAG mode)**:
   ```bash
   cd backend
   # Install additional dependencies for Azure AI Search
   pip install azure-search-documents azure-core
   
   # Process and upload fitness datasets to Azure AI Search
   python azure_search_data_processor.py
   ```
   
   Note: Place your fitness datasets (`megaGymDataset.csv`, `gym_members_exercise_tracking.csv`, `data.csv`) in the backend directory before running the processor.

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

#### Weekly Workout Plans
1. **Generate Weekly Plans**: Click "Generate Weekly Plan" for structured 7-day programs
2. **Agent-Specific Programming**: Plans automatically adapt to your selected fitness agent
3. **Balanced Distribution**: Smart algorithms ensure even exercise distribution across the week
4. **Daily Breakdown**: View each day's exercises, goals, and focus areas
5. **Rest Day Management**: Appropriate recovery days with gentle activities
6. **Comprehensive Format**: Each day includes:
   - 3-4 specific exercises with sets/reps
   - Daily goals and focus areas
   - Training notes and tips
   - Rest day activities for recovery

### Navigation
- **Home**: Main fitness advisor interface
- **Weekly Plan**: Generate and view 7-day workout schedules
- **Profile**: Manage your personal information and fitness preferences
- **Logout**: Securely end your session (top navigation dropdown)

---

## API Endpoints

### Authentication & Profile
- **POST** `/api/fitness_recommendation`: Main endpoint for image analysis and recommendations
  - Accepts: Form data with images, gender, age, weight, agent_type, fast_mode
  - Returns: Personalized fitness recommendations

### Weekly Workout Plans
- **POST** `/api/generate-weekly-plan`: Generate structured 7-day workout plans
  - Accepts: JSON with user profile data (gender, age, weight, agent_type, health_conditions)
  - Returns: Complete weekly plan with daily exercises, goals, and schedules

### File Storage
- **Captured Images**: Automatically stored in `backend/captured_images/`
- **Profile Data**: Stored in browser localStorage (production would use proper database)

---

## Key Features Explained

### Weekly Workout Plan Generation
The application includes a sophisticated weekly planning system:
- **Balanced Distribution Algorithm**: Prevents exercise dumping where all exercises end up on one day
- **Agent-Specific Programming**: Each fitness agent (weight loss, muscle gain, etc.) has tailored weekly structures
- **Validation System**: Multi-layer validation ensures:
  - 7 complete days with appropriate content
  - 1-2 rest days with gentle activities
  - 3-4 exercises per training day
  - Maximum 8 exercises per day (prevents overload)
  - 15-35 total exercises per week
- **Comprehensive Fallback Plans**: When AI generation fails, detailed backup plans ensure users always receive quality programming
- **Rest Day Intelligence**: Rest days include gentle activities like yoga and walking instead of intense exercises

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
- Advanced weekly plan generation with validation and fallback systems
- MCP server/client architecture for structured data
- Image processing and storage management
- Robust error handling and timeout management

### Performance Optimizations
- Concurrent processing for faster recommendations
- Image compression for reduced upload times
- Timeout handling for long-running requests
- Progressive loading indicators with detailed feedback
- Intelligent fallback systems for reliable service
- Optimized weekly plan generation with validation layers
- Agent-specific caching for improved response times

---

## Recent Updates & Improvements

### Version 2.0 - Weekly Planning System
- **Complete Weekly Plan Generation**: Structured 7-day workout programs with balanced exercise distribution
- **Advanced Validation**: Multi-layer validation prevents unbalanced plans and exercise dumping
- **Agent-Specific Programming**: Tailored weekly structures for each fitness agent type
- **Comprehensive Fallback Plans**: Detailed backup plans for weight loss, muscle gain, cardio, strength, and general fitness
- **Smart Rest Day Management**: Intelligent rest day programming with appropriate recovery activities
- **Robust Error Handling**: Enhanced error handling and timeout management for reliable service

### Enhanced AI Integration
- **Improved Prompt Engineering**: Better structured prompts for consistent weekly plan formatting
- **MCP Timeout Handling**: Background MCP processing with timeout controls
- **Validation Functions**: Comprehensive plan validation ensuring quality and balance
- **Parsing Improvements**: Robust parsing of AI responses with fallback content generation

### User Experience Improvements
- **Weekly Plan Interface**: Dedicated page for viewing and managing workout schedules
- **Visual Plan Display**: Clean, organized presentation of daily workouts with cards
- **Exercise Detail Cards**: Comprehensive display of exercises, goals, and training notes
- **Mobile-Optimized Planning**: Responsive design for weekly plan viewing on all devices