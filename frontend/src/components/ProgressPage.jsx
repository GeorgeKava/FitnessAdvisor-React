import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const ProgressPage = ({ user }) => {
  const [progressData, setProgressData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [weeklyPlans, setWeeklyPlans] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month'); // 'week', 'month', 'year'
  const [metrics, setMetrics] = useState({
    workoutsCompleted: 0,
    restDaysObserved: 0,
    consistencyScore: 0,
    progressRate: 0,
  });

  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && user.email) {
      loadProgressData();
    } else {
      setIsLoading(false);
    }
  }, [user, selectedTimeframe]);
  
  const loadProgressData = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load recommendations history
      const userSpecificHistoryKey = `fitnessRecommendationHistory_${user.email}`;
      const recommendationsData = localStorage.getItem(userSpecificHistoryKey);
      let parsedRecommendations = [];
      
      if (recommendationsData) {
        parsedRecommendations = JSON.parse(recommendationsData);
        setRecommendations(parsedRecommendations);
      }
      
      // Load weekly plans (might be stored differently in your application)
      const userSpecificWeeklyKey = `weeklyFitnessPlan_${user.email}`;
      const weeklyPlanData = localStorage.getItem(userSpecificWeeklyKey);
      let parsedWeeklyPlan = null;
      
      if (weeklyPlanData) {
        parsedWeeklyPlan = JSON.parse(weeklyPlanData);
        setWeeklyPlans([parsedWeeklyPlan]); // Add to array, in a real app you might have multiple historical plans
      }
      
      // Load completed exercises/activities (assuming you store these)
      const activityLogData = extractActivityData(parsedRecommendations, parsedWeeklyPlan);
      setActivityLog(activityLogData);
      
      // Calculate metrics
      calculateMetrics(parsedRecommendations, parsedWeeklyPlan, activityLogData);
      
      // Generate progress data for charts
      generateProgressCharts(parsedRecommendations, parsedWeeklyPlan, activityLogData);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setError('Failed to load progress data');
      setIsLoading(false);
    }
  };
  
  const extractActivityData = (recommendations, weeklyPlan) => {
    const activities = [];
    
    // Extract completed exercises from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`completedExercises_${user.email}`)) {
        try {
          const dateStr = key.split('_')[2];
          const completedExercises = JSON.parse(localStorage.getItem(key));
          
          if (Array.isArray(completedExercises)) {
            activities.push({
              date: new Date(dateStr),
              completed: completedExercises.length,
              type: 'workout'
            });
          }
        } catch (e) {
          console.error('Error parsing completed exercises:', e);
        }
      }
    }
    
    // Generate sample data if we don't have enough real data
    if (activities.length < 5) {
      // Generate some sample activity data for demonstration
      const today = new Date();
      const pastDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
      
      for (let i = 0; i < pastDays; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Skip if we already have an entry for this date
        if (activities.some(activity => 
          activity.date.toDateString() === date.toDateString()
        )) {
          continue;
        }
        
        // Only add activity for some days to simulate realistic pattern
        if (Math.random() > 0.3) {
          activities.push({
            date,
            completed: Math.floor(Math.random() * 5) + 1, // 1-5 exercises
            type: Math.random() > 0.7 ? 'rest' : 'workout'
          });
        }
      }
    }
    
    return activities.sort((a, b) => a.date - b.date);
  };
  
  const calculateMetrics = (recommendations, weeklyPlan, activityLog) => {
    // Calculate various metrics based on available data
    
    // Workouts completed in selected timeframe
    const today = new Date();
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 365;
    const startDate = new Date();
    startDate.setDate(today.getDate() - timeframeDays);
    
    const recentActivities = activityLog.filter(activity => activity.date >= startDate);
    const workoutsCompleted = recentActivities.filter(a => a.type === 'workout').length;
    const restDaysObserved = recentActivities.filter(a => a.type === 'rest').length;
    
    // Calculate consistency score (0-100%)
    const daysWithActivity = recentActivities.length;
    const consistencyScore = Math.min(100, Math.round((daysWithActivity / timeframeDays) * 100));
    
    // Calculate progress rate based on recommendations and workouts
    // This is simplified - in a real app, you'd have more complex logic
    const progressRate = recommendations.length > 0 ? 
      Math.min(100, Math.round((workoutsCompleted / (timeframeDays * 0.7)) * 100)) : 0;
    
    setMetrics({
      workoutsCompleted,
      restDaysObserved,
      consistencyScore,
      progressRate
    });
  };
  
  const generateProgressCharts = (recommendations, weeklyPlan, activityLog) => {
    // Generate data for various charts
    
    // Activity frequency data (for past X days)
    const labels = [];
    const activityData = [];
    const today = new Date();
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    
    // Create labels for days in selected timeframe
    for (let i = timeframeDays - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      
      // Find activity for this day
      const dayActivity = activityLog.find(a => 
        a.date.toDateString() === date.toDateString()
      );
      
      activityData.push(dayActivity ? dayActivity.completed : 0);
    }
    
    // Distribution of exercise types (based on weekly plan)
    let exerciseTypes = { 
      'Strength': 0, 
      'Cardio': 0, 
      'Flexibility': 0, 
      'Recovery': 0 
    };
    
    // Try to extract exercise types from weekly plan
    if (weeklyPlan && weeklyPlan.dailyPlans) {
      Object.values(weeklyPlan.dailyPlans).forEach(day => {
        if (day.isRestDay) {
          exerciseTypes['Recovery']++;
        } else if (day.exercises) {
          day.exercises.forEach(exercise => {
            // Categorize exercises based on name/description
            const exerciseStr = typeof exercise === 'string' ? exercise.toLowerCase() : exercise.name?.toLowerCase() || '';
            
            if (exerciseStr.includes('push') || exerciseStr.includes('pull') || 
                exerciseStr.includes('lift') || exerciseStr.includes('press') || 
                exerciseStr.includes('squat') || exerciseStr.includes('curl') ||
                exerciseStr.includes('strength')) {
              exerciseTypes['Strength']++;
            } else if (exerciseStr.includes('run') || exerciseStr.includes('jog') || 
                      exerciseStr.includes('cardio') || exerciseStr.includes('walk') || 
                      exerciseStr.includes('bike') || exerciseStr.includes('treadmill')) {
              exerciseTypes['Cardio']++;
            } else if (exerciseStr.includes('stretch') || exerciseStr.includes('yoga') || 
                      exerciseStr.includes('flex') || exerciseStr.includes('mobility')) {
              exerciseTypes['Flexibility']++;
            }
          });
        }
      });
    } else {
      // Generate sample data if no weekly plan available
      exerciseTypes = { 
        'Strength': 12, 
        'Cardio': 8, 
        'Flexibility': 5, 
        'Recovery': 7 
      };
    }
    
    // Combine all chart data
    setProgressData({
      activityChart: {
        labels,
        datasets: [
          {
            label: 'Daily Activities',
            data: activityData,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
          }
        ]
      },
      exerciseTypeChart: {
        labels: Object.keys(exerciseTypes),
        datasets: [
          {
            label: 'Exercise Types',
            data: Object.values(exerciseTypes),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',  // red
              'rgba(54, 162, 235, 0.7)',  // blue
              'rgba(255, 206, 86, 0.7)',  // yellow
              'rgba(75, 192, 192, 0.7)',  // green
            ],
            borderWidth: 1
          }
        ]
      },
      consistencyChart: {
        labels: ['Workouts Completed', 'Rest Days', 'Missed Days'],
        datasets: [
          {
            label: 'Consistency',
            data: [
              metrics.workoutsCompleted, 
              metrics.restDaysObserved, 
              timeframeDays - (metrics.workoutsCompleted + metrics.restDaysObserved)
            ],
            backgroundColor: [
              'rgba(75, 192, 192, 0.7)',  // green
              'rgba(153, 102, 255, 0.7)', // purple
              'rgba(201, 203, 207, 0.7)', // grey
            ],
            borderWidth: 1
          }
        ]
      }
    });
  };

  if (!user) {
    return (
      <div className="container">
        <div className="alert alert-warning">
          <h4>Please log in to view your progress</h4>
          <p>You need to be logged in to access your fitness progress tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>
                <i className="fas fa-chart-line me-3 text-success"></i>
                Your Fitness Progress
              </h2>
              <p className="text-muted">Track your fitness journey based on recommendations and completed activities</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => navigate('/')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Dashboard
              </button>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn ${selectedTimeframe === 'week' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTimeframe('week')}
                >
                  Week
                </button>
                <button 
                  type="button" 
                  className={`btn ${selectedTimeframe === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTimeframe('month')}
                >
                  Month
                </button>
                <button 
                  type="button" 
                  className={`btn ${selectedTimeframe === 'year' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedTimeframe('year')}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading Your Progress Data...</h5>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Progress Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card border-primary h-100">
                <div className="card-body text-center">
                  <i className="fas fa-dumbbell fa-3x text-primary mb-3"></i>
                  <h5 className="card-title">Workouts Completed</h5>
                  <h3 className="display-4">{metrics.workoutsCompleted}</h3>
                  <p className="card-text text-muted">
                    in the past {selectedTimeframe === 'week' ? '7' : selectedTimeframe === 'month' ? '30' : '365'} days
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-info h-100">
                <div className="card-body text-center">
                  <i className="fas fa-bed fa-3x text-info mb-3"></i>
                  <h5 className="card-title">Rest Days Observed</h5>
                  <h3 className="display-4">{metrics.restDaysObserved}</h3>
                  <p className="card-text text-muted">
                    important for recovery
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-success h-100">
                <div className="card-body text-center">
                  <i className="fas fa-calendar-check fa-3x text-success mb-3"></i>
                  <h5 className="card-title">Consistency Score</h5>
                  <h3 className="display-4">{metrics.consistencyScore}%</h3>
                  <p className="card-text text-muted">
                    based on activity frequency
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-warning h-100">
                <div className="card-body text-center">
                  <i className="fas fa-tachometer-alt fa-3x text-warning mb-3"></i>
                  <h5 className="card-title">Progress Rate</h5>
                  <h3 className="display-4">{metrics.progressRate}%</h3>
                  <p className="card-text text-muted">
                    towards your fitness goals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {progressData && (
            <div className="row">
              {/* Activity Frequency Chart */}
              <div className="col-md-8 mb-4">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-bar me-2 text-primary"></i>
                      Activity Frequency
                    </h5>
                  </div>
                  <div className="card-body">
                    <Bar 
                      data={progressData.activityChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'top' },
                          title: {
                            display: true,
                            text: `Daily Activities (Past ${selectedTimeframe === 'week' ? '7' : selectedTimeframe === 'month' ? '30' : '90'} Days)`
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Activities Completed'
                            }
                          }
                        }
                      }}
                      height={300}
                    />
                  </div>
                </div>
              </div>

              {/* Exercise Distribution Chart */}
              <div className="col-md-4 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="fas fa-chart-pie me-2 text-success"></i>
                      Exercise Distribution
                    </h5>
                  </div>
                  <div className="card-body">
                    <Pie 
                      data={progressData.exerciseTypeChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                          title: {
                            display: true,
                            text: 'Types of Exercises'
                          }
                        }
                      }}
                      height={250}
                    />
                  </div>
                </div>
              </div>

              {/* Consistency Chart */}
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="fas fa-check-circle me-2 text-info"></i>
                      Workout Consistency
                    </h5>
                  </div>
                  <div className="card-body">
                    <Pie
                      data={progressData.consistencyChart}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                          title: {
                            display: true,
                            text: 'Activity Consistency'
                          }
                        }
                      }}
                      height={250}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Activity Log */}
              <div className="col-md-6 mb-4">
                <div className="card">
                  <div className="card-header bg-light">
                    <h5 className="mb-0">
                      <i className="fas fa-list-alt me-2 text-warning"></i>
                      Recent Activity Log
                    </h5>
                  </div>
                  <div className="card-body" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                    {activityLog.length > 0 ? (
                      <div className="list-group">
                        {activityLog
                          .sort((a, b) => b.date - a.date) // Sort by most recent
                          .slice(0, 10) // Get only 10 most recent
                          .map((activity, index) => (
                            <div 
                              key={index} 
                              className={`list-group-item list-group-item-action ${
                                activity.type === 'rest' ? 'list-group-item-info' : ''
                              }`}
                            >
                              <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">
                                  <i className={`fas ${activity.type === 'rest' ? 'fa-bed text-info' : 'fa-running text-success'} me-2`}></i>
                                  {activity.type === 'rest' ? 'Rest Day' : `${activity.completed} Activities`}
                                </h6>
                                <small>{activity.date.toLocaleDateString()}</small>
                              </div>
                              <small className="text-muted">
                                {activity.type === 'rest' 
                                  ? 'Rest day for recovery' 
                                  : `Completed ${activity.completed} exercises/activities`}
                              </small>
                            </div>
                          ))
                        }
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                        <p>No activity data available yet.</p>
                        <p className="text-muted">Complete workouts to start tracking your progress</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations and Goals */}
          <div className="row">
            <div className="col-12">
              <div className="card border-primary">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-bullseye me-2"></i>
                    Progress Insights
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="text-primary mb-3">Recent Achievements</h6>
                      <ul className="list-group">
                        <li className="list-group-item">
                          <i className="fas fa-trophy text-warning me-2"></i>
                          {metrics.consistencyScore >= 70 
                            ? 'Maintained excellent workout consistency!' 
                            : 'Working toward better consistency'}
                        </li>
                        <li className="list-group-item">
                          <i className="fas fa-fire text-danger me-2"></i>
                          {metrics.workoutsCompleted >= 10 
                            ? `Completed ${metrics.workoutsCompleted} workouts this period` 
                            : 'Building workout frequency'}
                        </li>
                        <li className="list-group-item">
                          <i className="fas fa-heart text-success me-2"></i>
                          {metrics.restDaysObserved >= 3 
                            ? 'Balanced activity with proper recovery days' 
                            : 'Remember to schedule recovery days'}
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <h6 className="text-success mb-3">Next Steps</h6>
                      <div className="alert alert-success">
                        <h5 className="alert-heading">
                          <i className="fas fa-lightbulb me-2"></i>
                          Personalized Recommendations
                        </h5>
                        <ul className="mb-0">
                          {metrics.consistencyScore < 50 && (
                            <li>Improve consistency by scheduling workouts in advance</li>
                          )}
                          {metrics.workoutsCompleted < 8 && (
                            <li>Aim to increase workout frequency gradually</li>
                          )}
                          {metrics.restDaysObserved < 2 && (
                            <li>Schedule regular rest days to prevent burnout</li>
                          )}
                          {(metrics.consistencyScore >= 50 && metrics.workoutsCompleted >= 8) && (
                            <li>Your consistency is good! Consider increasing workout intensity</li>
                          )}
                          <li>Review your weekly plan for more personalized guidance</li>
                          <li>Get a new AI recommendation to update your fitness path</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!isLoading && !error && recommendations.length === 0 && weeklyPlans.length === 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-info">
              <div className="card-body text-center py-5">
                <i className="fas fa-chart-area fa-3x text-info mb-3"></i>
                <h4>No Progress Data Yet</h4>
                <p className="text-muted mb-4">
                  To start tracking your progress, get AI recommendations and create a weekly plan
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/fitness-advisor')}
                  >
                    <i className="fas fa-dumbbell me-2"></i>
                    Get Fitness Recommendation
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => navigate('/weekly-plan')}
                  >
                    <i className="fas fa-calendar-plus me-2"></i>
                    Create Weekly Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;
