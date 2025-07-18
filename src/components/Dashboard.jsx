// src/components/Dashboard.jsx
// Simple dashboard component

import React, { useState, useEffect } from 'react';
import interestCaptureService from '../services/interestCaptureService';

export default function Dashboard({ user, onViewChange }) {
  const [interests, setInterests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [recentInterests, statsData] = await Promise.all([
        interestCaptureService.getRecentInterests(10),
        interestCaptureService.getInterestStats()
      ]);
      
      setInterests(recentInterests);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    setLoading(true);
    
    try {
      let newInterests;
      switch (tab) {
        case 'recent':
          newInterests = await interestCaptureService.getRecentInterests(10);
          break;
        case 'popular':
          newInterests = await interestCaptureService.getTopInterests(10);
          break;
        case 'all':
          newInterests = await interestCaptureService.getInterests();
          break;
        default:
          newInterests = await interestCaptureService.getRecentInterests(10);
      }
      setInterests(newInterests);
    } catch (error) {
      console.error('Failed to load interests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading && !stats) {
    return (
      <div className="d-flex flex-column align-center justify-center text-center" style={{ height: '200px' }}>
        <div className="spinner mb-2"></div>
        <p className="text-secondary">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100%' }}>
      {/* Welcome Section */}
      <div className="card mb-4 fade-in">
        <h2 className="mb-2">Welcome back, {user.name}!</h2>
        <p className="text-secondary m-0">Here's your interest capture summary</p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="d-flex mb-4 fade-in" style={{ gap: '12px' }}>
          <div className="card text-center flex-1">
            <h3 className="text-primary mb-1">{stats.total}</h3>
            <p className="text-secondary m-0">Total Interests</p>
          </div>
          <div className="card text-center flex-1">
            <h3 className="text-primary mb-1">{stats.recent}</h3>
            <p className="text-secondary m-0">This Week</p>
          </div>
          <div className="card text-center flex-1">
            <h3 className="text-primary mb-1">{Object.keys(stats.categories).length}</h3>
            <p className="text-secondary m-0">Categories</p>
          </div>
        </div>
      )}

      {/* Categories Overview */}
      {stats && stats.categories && (
        <div className="card mb-4 fade-in">
          <h3 className="mb-3">Top Categories</h3>
          <div className="d-flex flex-column" style={{ gap: '8px' }}>
            {Object.entries(stats.categories)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="d-flex justify-between align-center p-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <span style={{ textTransform: 'capitalize', color: '#333' }}>{category}</span>
                  <span className="text-secondary" style={{
                    backgroundColor: '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Interests List */}
      <div className="card fade-in">
        <div className="d-flex" style={{ borderBottom: '1px solid #e0e0e0' }}>
          <button
            className={`btn btn-ghost flex-1 ${activeTab === 'recent' ? 'text-primary' : 'text-secondary'}`}
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'recent' ? '2px solid #4285f4' : 'none'
            }}
            onClick={() => handleTabChange('recent')}
          >
            Recent
          </button>
          <button
            className={`btn btn-ghost flex-1 ${activeTab === 'popular' ? 'text-primary' : 'text-secondary'}`}
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'popular' ? '2px solid #4285f4' : 'none'
            }}
            onClick={() => handleTabChange('popular')}
          >
            Popular
          </button>
          <button
            className={`btn btn-ghost flex-1 ${activeTab === 'all' ? 'text-primary' : 'text-secondary'}`}
            style={{
              borderRadius: '0',
              borderBottom: activeTab === 'all' ? '2px solid #4285f4' : 'none'
            }}
            onClick={() => handleTabChange('all')}
          >
            All
          </button>
        </div>

        {loading ? (
          <div className="d-flex justify-center p-4">
            <div className="spinner"></div>
          </div>
        ) : interests.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-secondary">No interests captured yet. Start browsing to see your interests!</p>
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {interests.map((interest, index) => (
              <div key={index} className="p-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <div className="d-flex justify-between align-center mb-1">
                  <span className="text-primary" style={{
                    fontWeight: '500',
                    fontSize: '14px',
                    flex: '1',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {interest.title}
                  </span>
                  <span className="text-muted" style={{ fontSize: '12px', marginLeft: '8px' }}>
                    {formatDate(interest.timestamp)}
                  </span>
                </div>
                <div className="d-flex align-center" style={{ gap: '8px' }}>
                  <span className="text-muted" style={{ fontSize: '12px' }}>
                    {interest.domain}
                  </span>
                  <span className="text-muted" style={{
                    fontSize: '12px',
                    backgroundColor: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    textTransform: 'capitalize'
                  }}>
                    {interest.category}
                  </span>
                  {interest.visits > 1 && (
                    <span className="text-primary" style={{ fontSize: '12px' }}>
                      {interest.visits} visits
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
