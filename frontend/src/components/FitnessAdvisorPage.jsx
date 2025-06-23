import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function FitnessAdvisorPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVideo, setShowVideo] = useState(false);
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

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

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setShowVideo(false); // Hide video if files are selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gender || !age || !weight) {
      setError('Please fill in all personal details.');
      return;
    }
    setLoading(true);
    setError('');
    setRecommendation('');
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('gender', gender);
    formData.append('age', age);
    formData.append('weight', weight);

    try {
      const response = await axios.post('/api/fitness_recommendation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setRecommendation(response.data.recommendation);
    } catch (err) {
      setError('Failed to get recommendation.');
    } finally {
      setLoading(false);
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
    setError('');
    setRecommendation('');

    // Add a small delay to ensure the frame is current
    setTimeout(() => {
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setError('Failed to capture image from video. Blob is null.');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('images', blob, 'captured_image.jpg');
        formData.append('gender', gender);
        formData.append('age', age);
        formData.append('weight', weight);

        try {
          const response = await axios.post('/api/fitness_recommendation', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          setRecommendation(response.data.recommendation);
        } catch (err) {
          setError('Failed to get recommendation from captured image.');
        } finally {
          setLoading(false);
          setShowVideo(false); // Hide video after capture
        }
      }, 'image/jpeg');
    }, 100); // 100ms delay
  };

  return (
    <div className="container">
      <h2 className="mb-4">Fitness Advisor</h2>

      {/* User Details Form */}
      <div className="row mb-3">
        <div className="col-md-4">
          <label htmlFor="gender" className="form-label">Gender</label>
          <select id="gender" className="form-select" value={gender} onChange={(e) => setGender(e.target.value)} required>
            <option value="" disabled>Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="age" className="form-label">Age</label>
          <input type="number" id="age" className="form-control" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 25" required />
        </div>
        <div className="col-md-4">
          <label htmlFor="weight" className="form-label">Weight (lbs)</label>
          <input type="number" id="weight" className="form-control" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 150" required />
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
            {loading ? 'Analyzing...' : 'Capture & Get Recommendation'}
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
            {loading ? 'Analyzing...' : 'Get Recommendation from Files'}
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
