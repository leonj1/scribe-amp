import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Dropdown, Menu, Typography, Spin } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import RecordingsList from '../components/RecordingsList';
import RecordingInterface from '../components/RecordingInterface';
import { recordingsAPI } from '../services/api';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/';
      return;
    }

    if (isAuthenticated) {
      loadRecordings();
    }
  }, [isAuthenticated, authLoading]);

  const loadRecordings = async () => {
    try {
      setLoading(true);
      const response = await recordingsAPI.getRecordings();
      setRecordings(response.data);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRecording = (newRecording) => {
    setRecordings([newRecording, ...recordings]);
    setSelectedRecording(newRecording);
  };

  const handleRecordingUpdate = (updatedRecording) => {
    setRecordings(recordings.map(r => 
      r.id === updatedRecording.id ? updatedRecording : r
    ));
    if (selectedRecording?.id === updatedRecording.id) {
      setSelectedRecording(updatedRecording);
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  if (authLoading || loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="dashboard-container">
      <Header className="dashboard-header">
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          Audio Transcription Service
        </Title>
        <Dropdown overlay={userMenu} placement="bottomRight">
          <Avatar 
            size="large" 
            icon={<UserOutlined />} 
            style={{ cursor: 'pointer' }}
          />
        </Dropdown>
      </Header>
      
      <Layout className="dashboard-main">
        <Sider width={300} theme="light" className="dashboard-sidebar">
          <RecordingsList 
            recordings={recordings}
            selectedRecording={selectedRecording}
            onSelectRecording={setSelectedRecording}
            onRefresh={loadRecordings}
          />
        </Sider>
        
        <Content className="dashboard-center">
          <RecordingInterface 
            selectedRecording={selectedRecording}
            onNewRecording={handleNewRecording}
            onRecordingUpdate={handleRecordingUpdate}
          />
        </Content>
        
        <Sider width={250} theme="light" className="dashboard-right">
          <div style={{ padding: '20px' }}>
            <Title level={5}>Recording Metadata</Title>
            {selectedRecording ? (
              <div>
                <p><strong>Status:</strong> {selectedRecording.status}</p>
                <p><strong>Created:</strong> {new Date(selectedRecording.created_at).toLocaleString()}</p>
                {selectedRecording.transcription_text && (
                  <div>
                    <p><strong>Transcription:</strong></p>
                    <div style={{ 
                      maxHeight: '200px', 
                      overflow: 'auto', 
                      background: '#f5f5f5', 
                      padding: '10px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {selectedRecording.transcription_text}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p>Select a recording to view details</p>
            )}
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
