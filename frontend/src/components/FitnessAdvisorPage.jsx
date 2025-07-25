import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function FitnessAdvisorPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [agentType, setAgentType] = useState('general');
  const [fastMode, setFastMode] = useState(true); // Default to fast mode
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        
        // Only auto-fill if the fields are empty
        if (!gender && profile.sex) setGender(profile.sex);
        if (!age && profile.age) setAge(profile.age);
        if (!weight && profile.weight) setWeight(profile.weight);
        
        // Map fitness agent to existing options
        const agentMapping = {
          'personal_trainer': 'general',
          'strength_coach': 'strength',
          'cardio_specialist': 'cardio',
          'nutrition_expert': 'general',
          'weight_loss_coach': 'weight_loss',
          'muscle_building_coach': 'muscle_gain'
        };
        
        if (profile.fitnessAgent) {
          setAgentType(agentMapping[profile.fitnessAgent] || 'general');
        }
        
        // Only show profile loaded message if we actually loaded some data
        if (profile.sex || profile.age || profile.weight || profile.fitnessAgent) {
          setProfileLoaded(true);
        }
      }
    };
    
    loadProfileData();
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    if (showVideo) {
      startVideoStream();
    } else {
      stopVideoStream();
    }
    return () => stopVideoStream(); // Cleanup on unmount
  }, [showVideo]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Error accessing camera. Please ensure permissions are granted.');
      setShowVideo(false);
    }
  };

  const stopVideoStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Function to save profile data when form fields are updated
  const saveProfileData = (updatedData) => {
    try {
      setProfileSaving(true);
      
      const currentProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const updatedProfile = { ...currentProfile, ...updatedData };
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

      // Also update registered user data if user is registered
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = {
            ...registeredUsers[userIndex],
            ...updatedData
          };
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
      }

      // Brief feedback - hide after 1 second
      setTimeout(() => {
        setProfileSaving(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving profile data:', error);
      setProfileSaving(false);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setShowVideo(false); // Hide video if files are selected
  };

  // Handlers for form field changes that also save to profile
  const handleGenderChange = (e) => {
    const value = e.target.value;
    setGender(value);
    if (value) {
      saveProfileData({ sex: value });
    }
  };

  const handleAgeChange = (e) => {
    const value = e.target.value;
    setAge(value);
    if (value && !isNaN(value)) {
      saveProfileData({ age: value });
    }
  };

  const handleWeightChange = (e) => {
    const value = e.target.value;
    setWeight(value);
    if (value && !isNaN(value)) {
      saveProfileData({ weight: value });
    }
  };

  const handleAgentTypeChange = (e) => {
    const value = e.target.value;
    setAgentType(value);
    
    // Map back to detailed fitness agent names for profile
    const reverseAgentMapping = {
      'general': 'personal_trainer',
      'strength': 'strength_coach',
      'cardio': 'cardio_specialist',
      'weight_loss': 'weight_loss_coach',
      'muscle_gain': 'muscle_building_coach'
    };
    
    const fitnessAgent = reverseAgentMapping[value] || 'personal_trainer';
    saveProfileData({ fitnessAgent });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gender || !age || !weight) {
      setError('Please fill in all personal details.');
      return;
    }
    setLoading(true);
    setLoadingMessage('Analyzing images and generating recommendations...');
    setError('');
    setRecommendation('');
    
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('gender', gender);
    formData.append('age', age);
    formData.append('weight', weight);
    formData.append('agent_type', agentType);
    formData.append('fast_mode', fastMode.toString());

    try {
      const response = await axios.post('/api/fitness_recommendation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout
      });
      setRecommendation(response.data.recommendation);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try with a smaller image or check your connection.');
      } else {
        setError('Failed to get recommendation. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleCaptureAndRecommend = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    if (!gender || !age || !weight) {
      setError('Please fill in all personal details before capturing.');
      return;
    }

    const video = videoRef.current;

    // Ensure video is ready and has dimensions
    if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
      setError("Video stream is not ready yet. Please try again in a moment.");
      return;
    }

    setLoading(true);
    setLoadingMessage('Capturing image...');
    setError('');
    setRecommendation('');

    // Add a small delay to ensure the frame is current
    setTimeout(async () => {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture image from video. Blob is null.');
          setLoading(false);
          setLoadingMessage('');
          return;
        }
        
        setLoadingMessage('Processing image and generating fitness recommendations...');
        
        const formData = new FormData();
        formData.append('images', blob, 'captured_image.jpg');
        formData.append('gender', gender);
        formData.append('age', age);
        formData.append('weight', weight);
        formData.append('agent_type', agentType);
        formData.append('fast_mode', fastMode.toString());

        try {
          const response = await axios.post('/api/fitness_recommendation', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // 60 second timeout
          });
          setRecommendation(response.data.recommendation);
        } catch (err) {
          if (err.code === 'ECONNABORTED') {
            setError('Request timed out. Please try again or use a different image.');
          } else {
            setError('Failed to get recommendation from captured image. Please try again.');
          }
        } finally {
          setLoading(false);
          setLoadingMessage('');
          setShowVideo(false); // Hide video after capture
        }
      }, 'image/jpeg', 0.8); // Reduced quality for faster upload
    }, 100); // 100ms delay
  };

  return (
    <div className="container">
      <h2 className="mb-4">Fitness Advisor</h2>

      {/* Profile Status */}
      {profileLoaded && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          <strong>Profile data loaded!</strong> Your personal information has been automatically filled in. You can update it in your <a href="/profile" className="alert-link">Profile page</a> if needed.
          <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}

      {/* Profile Saving Indicator */}
      {profileSaving && (
        <div className="alert alert-info py-2 fade show" role="alert">
          <i className="fas fa-save me-2"></i>
          <small>Saving to profile...</small>
        </div>
      )}

      {/* User Details Form */}
      <div className="row mb-3">
        <div className="col-12 mb-2">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Your information is automatically saved to your profile as you update it.
          </small>
        </div>
        <div className="col-md-3">
          <label htmlFor="agentType" className="form-label">Fitness Coach</label>
          <select id="agentType" className="form-select" value={agentType} onChange={handleAgentTypeChange} required>
            <option value="general">General Fitness</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Building</option>
            <option value="cardio">Cardio Focus</option>
            <option value="strength">Strength Training</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select id="gender" className="form-select" value={gender} onChange={handleGenderChange} required>
            <option value="" disabled>Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="age" className="form-label">Age</label>
          <input type="number" id="age" className="form-control" value={age} onChange={handleAgeChange} placeholder="e.g., 25" required />
        </div>
        <div className="col-md-3">
          <label htmlFor="weight" className="form-label">Weight (lbs)</label>
          <input type="number" id="weight" className="form-control" value={weight} onChange={handleWeightChange} placeholder="e.g., 150" required />
        </div>
      </div>

      {/* Analysis Speed Option */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="form-check form-switch">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="fastMode" 
              checked={fastMode} 
              onChange={(e) => setFastMode(e.target.checked)} 
            />
            <label className="form-check-label" htmlFor="fastMode">
              <strong>Quick Analysis</strong> (Faster response, {fastMode ? '15-30 seconds' : 'detailed analysis, 45-90 seconds'})
            </label>
          </div>
        </div>
      </div>

      {/* Video Feed Section */}
      {showVideo && (
        <div className="mb-3">
          <video ref={videoRef} autoPlay playsInline className="img-fluid border rounded" style={{ maxWidth: '100%', maxHeight: '400px' }}></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <button 
            type="button" 
            className="btn btn-success mt-2 me-2"
            onClick={handleCaptureAndRecommend} 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {loadingMessage || 'Analyzing...'}
              </>
            ) : (
              'Capture & Get Recommendation'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary mt-2"
            onClick={() => setShowVideo(false)} 
            disabled={loading}
          >
            Close Camera
          </button>
        </div>
      )}

      {/* File Upload Section (hide if video is shown) */}
      {!showVideo && (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="images" className="form-label">Upload Images (front, side, back, etc.)</label>
            <input
              type="file"
              id="images"
              className="form-control"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <button type="submit" className="btn btn-primary me-2" disabled={loading || selectedFiles.length === 0}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {loadingMessage || 'Analyzing...'}
              </>
            ) : (
              'Get Recommendation from Files'
            )}
          </button>
          <button 
            type="button" 
            className="btn btn-info"
            onClick={() => { setShowVideo(true); setSelectedFiles([]); /* Clear file selection */ }}
            disabled={loading}
          >
            Use Camera
          </button>
        </form>
      )}

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      
      {loading && (
        <div className="alert alert-info mt-3">
          <div className="d-flex align-items-center">
            <div className="spinner-border spinner-border-sm me-3" role="status" aria-hidden="true"></div>
            <div>
              <strong>{loadingMessage || 'Processing...'}</strong>
              <div className="small mt-1">
                {fastMode ? 'Quick analysis: 15-30 seconds' : 'Detailed analysis: 45-90 seconds with enhanced features'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {recommendation && (
        <div className="alert alert-success mt-4">
          <h5>Personalized Fitness Recommendation:</h5>
          <div style={{ whiteSpace: 'pre-line' }}>{recommendation}</div>
        </div>
      )}
    </div>
  );
}

export default FitnessAdvisorPage;
