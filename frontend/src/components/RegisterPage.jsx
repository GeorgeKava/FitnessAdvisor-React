import React, { useState } from 'react';

const RegisterPage = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sex: '',
    age: '',
    weight: '',
    healthConditions: '',
    fitnessAgent: 'personal_trainer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fitnessAgents = [
    { value: 'personal_trainer', label: 'Personal Trainer - General fitness guidance' },
    { value: 'strength_coach', label: 'Strength Coach - Focus on strength training' },
    { value: 'cardio_specialist', label: 'Cardio Specialist - Endurance and heart health' },
    { value: 'nutrition_expert', label: 'Nutrition Expert - Diet and meal planning' },
    { value: 'weight_loss_coach', label: 'Weight Loss Coach - Fat loss strategies' },
    { value: 'muscle_building_coach', label: 'Muscle Building Coach - Hypertrophy focus' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    // Required fields validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (!formData.sex) {
      setError('Sex is required');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Optional field validation (if provided)
    if (formData.age && (isNaN(formData.age) || formData.age < 13 || formData.age > 120)) {
      setError('Age must be a valid number between 13 and 120');
      return false;
    }

    if (formData.weight && (isNaN(formData.weight) || formData.weight < 50 || formData.weight > 1000)) {
      setError('Weight must be a valid number between 50 and 1000 lbs');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.find(user => user.email === formData.email);
      
      if (userExists) {
        setError('An account with this email already exists');
        setIsLoading(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create user data
      const userData = {
        id: Date.now(), // Simple ID generation
        name: formData.name,
        email: formData.email,
        password: formData.password, // In real app, this would be hashed
        sex: formData.sex,
        age: formData.age || '',
        weight: formData.weight || '',
        fitnessAgent: formData.fitnessAgent,
        createdAt: new Date().toISOString()
      };

      // Save to registered users
      existingUsers.push(userData);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      // Create user profile
      const userProfile = {
        name: userData.name,
        age: userData.age,
        sex: userData.sex,
        weight: userData.weight,
        fitnessAgent: userData.fitnessAgent
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

      // Create login session
      const sessionData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        isAuthenticated: true
      };
      localStorage.setItem('user', JSON.stringify(sessionData));

      // Call onRegister callback
      onRegister(sessionData);

    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-success text-white">
              <h3 className="mb-0">
                <i className="fas fa-user-plus me-2"></i>
                Create Account
              </h3>
            </div>
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Required Fields Section */}
                <div className="mb-4">
                  <h5 className="text-primary mb-3">
                    <i className="fas fa-asterisk me-2"></i>
                    Required Information
                  </h5>
                  
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password (min 6 chars)"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="sex" className="form-label">
                      Sex <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="sex"
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Optional Fields Section */}
                <div className="mb-4">
                  <h5 className="text-secondary mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Optional Information (can be added later)
                  </h5>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="age" className="form-label">Age</label>
                      <input
                        type="number"
                        className="form-control"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age in years"
                        min="13"
                        max="120"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="weight" className="form-label">Weight (lbs)</label>
                      <input
                        type="number"
                        className="form-control"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Weight in pounds"
                        min="50"
                        max="1000"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="fitnessAgent" className="form-label">
                      Preferred Fitness Coach
                    </label>
                    <select
                      className="form-select"
                      id="fitnessAgent"
                      name="fitnessAgent"
                      value={formData.fitnessAgent}
                      onChange={handleChange}
                    >
                      {fitnessAgents.map(agent => (
                        <option key={agent.value} value={agent.value}>
                          {agent.label}
                        </option>
                      ))}
                    </select>
                    <div className="form-text">
                      Choose the type of fitness guidance you prefer (can be changed later)
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="healthConditions" className="form-label">
                      <i className="fas fa-heart text-danger me-1"></i>
                      Health Conditions & Exercise Preferences
                    </label>
                    <textarea
                      className="form-control"
                      id="healthConditions"
                      name="healthConditions"
                      value={formData.healthConditions}
                      onChange={handleChange}
                      placeholder="e.g., Lower back pain, knee injury, pregnant, beginner to exercise, prefer low-impact workouts, avoid jumping exercises, etc."
                      rows="3"
                    />
                    <div className="form-text">
                      <i className="fas fa-info-circle me-1"></i>
                      Share any health conditions, injuries, physical limitations, or exercise preferences to get safer and more personalized recommendations.
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus me-2"></i>
                      Create Account
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Already have an account? <a href="/login" className="text-decoration-none">Login here</a>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
