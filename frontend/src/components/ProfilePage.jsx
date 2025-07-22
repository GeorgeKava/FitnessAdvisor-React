import React, { useState, useEffect } from 'react';

const ProfilePage = ({ user }) => {
  const [profileData, setProfileData] = useState({
    name: '',
    age: '',
    sex: '',
    weight: '',
    fitnessAgent: 'personal_trainer'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fitnessAgents = [
    { value: 'personal_trainer', label: 'Personal Trainer - General fitness guidance' },
    { value: 'strength_coach', label: 'Strength Coach - Focus on strength training' },
    { value: 'cardio_specialist', label: 'Cardio Specialist - Endurance and heart health' },
    { value: 'nutrition_expert', label: 'Nutrition Expert - Diet and meal planning' },
    { value: 'weight_loss_coach', label: 'Weight Loss Coach - Fat loss strategies' },
    { value: 'muscle_building_coach', label: 'Muscle Building Coach - Hypertrophy focus' }
  ];

  useEffect(() => {
    // Load profile data from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setMessage(''); // Clear message when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate required fields
      if (!profileData.name || !profileData.age || !profileData.sex || !profileData.weight) {
        setMessage('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      // Validate age and weight are numbers
      if (isNaN(profileData.age) || isNaN(profileData.weight)) {
        setMessage('Age and weight must be valid numbers');
        setIsSaving(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem('userProfile', JSON.stringify(profileData));
      
      // Update registered user data if user is registered
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = {
            ...registeredUsers[userIndex],
            name: profileData.name,
            age: profileData.age,
            sex: profileData.sex,
            weight: profileData.weight,
            fitnessAgent: profileData.fitnessAgent
          };
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
      }
      
      setMessage('Profile saved successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage('');
  };

  const handleCancel = () => {
    // Reload from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfileData(JSON.parse(savedProfile));
    }
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-user me-2"></i>
                User Profile
              </h3>
            </div>
            <div className="card-body p-4">
              {message && (
                <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`} role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="age" className="form-label">
                      Age <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="age"
                      name="age"
                      value={profileData.age}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Age in years"
                      min="13"
                      max="120"
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="sex" className="form-label">
                      Sex <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="sex"
                      name="sex"
                      value={profileData.sex}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    >
                      <option value="">Select sex</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="weight" className="form-label">
                    Weight (lbs) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="weight"
                    name="weight"
                    value={profileData.weight}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Weight in pounds"
                    min="50"
                    max="1000"
                    step="0.1"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="fitnessAgent" className="form-label">
                    Fitness Agent <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="fitnessAgent"
                    name="fitnessAgent"
                    value={profileData.fitnessAgent}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  >
                    {fitnessAgents.map(agent => (
                      <option key={agent.value} value={agent.value}>
                        {agent.label}
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Choose the type of fitness guidance you prefer
                  </div>
                </div>

                <div className="d-flex gap-2">
                  {!isEditing ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleEdit}
                    >
                      <i className="fas fa-edit me-2"></i>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </form>

              {profileData.name && !isEditing && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h5>Profile Summary</h5>
                  <p className="mb-1"><strong>Name:</strong> {profileData.name}</p>
                  <p className="mb-1"><strong>Age:</strong> {profileData.age} years</p>
                  <p className="mb-1"><strong>Sex:</strong> {profileData.sex}</p>
                  <p className="mb-1"><strong>Weight:</strong> {profileData.weight} lbs</p>
                  <p className="mb-0"><strong>Fitness Agent:</strong> {fitnessAgents.find(agent => agent.value === profileData.fitnessAgent)?.label}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
