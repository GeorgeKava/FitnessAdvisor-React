import React, { useState, useEffect } from 'react';

function ProfilePage({ user, onUpdateUser }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: '',
    weight: '',
    height: '',
    healthConditions: '',
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
    // Load profile data from localStorage and map fields properly
    const loadProfileData = () => {
      const savedProfile = localStorage.getItem('userProfile');
      console.log('ProfilePage: Loading profile data...');
      console.log('ProfilePage: savedProfile exists:', !!savedProfile);
      
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          console.log('ProfilePage: Profile data loaded:', profile);
          
          // Map profile data to form fields with proper field name mapping
          const mappedData = {
            name: profile.name || '',
            age: profile.age || '',
            sex: profile.sex || profile.gender || '', // Map both sex and gender fields
            weight: profile.weight || '',
            height: profile.height || '',
            healthConditions: Array.isArray(profile.healthConditions) 
              ? profile.healthConditions.join(', ') 
              : (profile.healthConditions || profile.medicalConditions || ''),
            fitnessAgent: profile.fitnessAgent || profile.agentType || 'personal_trainer'
          };
          
          console.log('ProfilePage: Mapped data:', mappedData);
          setFormData(mappedData);
        } catch (error) {
          console.error('ProfilePage: Error loading profile data:', error);
        }
      }
      
      // Also check for user-specific profile data
      if (user?.email) {
        const userSpecificProfile = localStorage.getItem(`userProfile_${user.email}`);
        if (userSpecificProfile) {
          try {
            const profile = JSON.parse(userSpecificProfile);
            console.log('ProfilePage: User-specific profile loaded:', profile);
            
            const mappedData = {
              name: profile.name || '',
              age: profile.age || '',
              sex: profile.sex || profile.gender || '',
              weight: profile.weight || '',
              height: profile.height || '',
              healthConditions: Array.isArray(profile.healthConditions) 
                ? profile.healthConditions.join(', ') 
                : (profile.healthConditions || profile.medicalConditions || ''),
              fitnessAgent: profile.fitnessAgent || profile.agentType || 'personal_trainer'
            };
            
            setFormData(mappedData);
          } catch (error) {
            console.error('ProfilePage: Error loading user-specific profile:', error);
          }
        }
      }
    };
    
    loadProfileData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage(''); // Clear message when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.age || !formData.sex || !formData.weight) {
        setMessage('Please fill in all required fields');
        setIsSaving(false);
        return;
      }

      // Validate age, weight, and height are numbers (height is optional)
      if (isNaN(formData.age) || isNaN(formData.weight) || (formData.height && isNaN(formData.height))) {
        setMessage('Age, weight, and height must be valid numbers');
        setIsSaving(false);
        return;
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save to localStorage (in a real app, this would be an API call)
      const profileDataToSave = {
        ...formData,
        gender: formData.sex, // Ensure both sex and gender fields are stored
        sex: formData.sex
      };
      
      localStorage.setItem('userProfile', JSON.stringify(profileDataToSave));
      console.log('ProfilePage: Profile saved:', profileDataToSave);
      
      // Update registered user data if user is registered
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id) {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
          registeredUsers[userIndex] = {
            ...registeredUsers[userIndex],
            name: formData.name,
            age: formData.age,
            sex: formData.sex,
            gender: formData.sex, // Store both for consistency
            weight: formData.weight,
            fitnessAgent: formData.fitnessAgent
          };
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        }
      }
      
      // Also store user-specific profile if user email is available
      if (user?.email) {
        localStorage.setItem(`userProfile_${user.email}`, JSON.stringify(profileDataToSave));
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
      setFormData(JSON.parse(savedProfile));
    }
    setIsEditing(false);
    setMessage('');
  };



  // Load profile from user_data index on component mount
  useEffect(() => {
    const loadProfileFromAzure = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`http://localhost:5000/api/get-user-profile/${user.email}`);
          if (response.ok) {
            const azureProfile = await response.json();
            // Update formData with Azure profile data if available
            setFormData(prevData => ({
              ...prevData,
              ...azureProfile
            }));

          }
        } catch (error) {
          console.log('Could not load profile from Azure, using localStorage');
        }
      }
    };

    loadProfileFromAzure();
  }, [user]);

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
                    value={formData.name}
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
                      value={formData.age}
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
                      value={formData.sex}
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
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Weight in pounds"
                    min="50"
                    max="1000"
                    step="0.1"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="height" className="form-label">
                    <i className="fas fa-ruler-vertical text-primary me-1"></i>
                    Height (inches)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="height"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Height in inches (e.g., 70)"
                    min="36"
                    max="96"
                    step="0.5"
                  />
                  <div className="form-text">
                    Optional - helps provide more accurate recommendations
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
                    disabled={!isEditing}
                    placeholder="e.g., Lower back pain, knee injury, pregnant, beginner to exercise, prefer low-impact workouts, avoid jumping exercises, etc."
                    rows="3"
                  />
                  <div className="form-text">
                    <i className="fas fa-info-circle me-1"></i>
                    Share any health conditions, injuries, physical limitations, or exercise preferences to get safer and more personalized recommendations.
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="fitnessAgent" className="form-label">
                    Fitness Agent <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="fitnessAgent"
                    name="fitnessAgent"
                    value={formData.fitnessAgent}
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

              {formData.name && !isEditing && (
                <div className="mt-4 p-3 bg-light rounded">
                  <h5>Profile Summary</h5>
                  <p className="mb-1"><strong>Name:</strong> {formData.name}</p>
                  <p className="mb-1"><strong>Age:</strong> {formData.age} years</p>
                  <p className="mb-1"><strong>Sex:</strong> {formData.sex}</p>
                  <p className="mb-1"><strong>Weight:</strong> {formData.weight} lbs</p>
                  {formData.height && <p className="mb-1"><strong>Height:</strong> {formData.height} inches</p>}
                  <p className="mb-0"><strong>Fitness Agent:</strong> {fitnessAgents.find(agent => agent.value === formData.fitnessAgent)?.label}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default ProfilePage;
