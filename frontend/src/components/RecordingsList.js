import React from 'react';
import { List, Card, Button, Tag, Typography } from 'antd';
import { AudioOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;

const RecordingsList = ({ recordings, selectedRecording, onSelectRecording, onRefresh }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'processing';
      case 'paused': return 'warning';
      case 'ended': return 'success';
      default: return 'default';
    }
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3>Recordings</h3>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={onRefresh}
          type="text"
        />
      </div>
      
      <List
        dataSource={recordings}
        renderItem={(recording) => (
          <List.Item
            style={{ padding: 0, marginBottom: '8px' }}
          >
            <Card 
              size="small"
              className={`recording-list-item ${selectedRecording?.id === recording.id ? 'selected' : ''}`}
              onClick={() => onSelectRecording(recording)}
              style={{
                width: '100%',
                cursor: 'pointer',
                border: selectedRecording?.id === recording.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AudioOutlined />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>
                      {new Date(recording.created_at).toLocaleDateString()}
                    </Text>
                    <Tag color={getStatusColor(recording.status)}>
                      {recording.status}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(recording.created_at).toLocaleTimeString()}
                  </Text>
                  {recording.transcription_text && (
                    <div style={{ marginTop: '4px' }}>
                      <Text 
                        type="secondary" 
                        style={{ 
                          fontSize: '11px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {recording.transcription_text}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecordingsList;
