import React, { useState, useRef } from 'react';
import { Button, Typography, Space, message } from 'antd';
import { AudioOutlined, PauseOutlined, StopOutlined } from '@ant-design/icons';
import { recordingsAPI } from '../services/api';

const { Title, Text } = Typography;

const RecordingInterface = ({ selectedRecording, onNewRecording, onRecordingUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunkIndexRef = useRef(0);

  const startRecording = async () => {
    try {
      // Create new recording session
      const response = await recordingsAPI.createRecording();
      const newRecording = response.data;
      setCurrentRecording(newRecording);
      onNewRecording(newRecording);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      streamRef.current = stream;

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      chunkIndexRef.current = 0;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await uploadChunk(newRecording.id, chunkIndexRef.current, event.data);
          chunkIndexRef.current++;
        }
      };

      // Record in chunks every 10 seconds
      mediaRecorder.start(10000);
      setIsRecording(true);
      setIsPaused(false);

      message.success('Recording started');
    } catch (error) {
      console.error('Failed to start recording:', error);
      message.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const uploadChunk = async (recordingId, chunkIndex, audioBlob) => {
    try {
      await recordingsAPI.uploadChunk(recordingId, chunkIndex, audioBlob);
    } catch (error) {
      console.error('Failed to upload chunk:', error);
      message.error('Failed to upload audio chunk');
    }
  };

  const pauseRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      try {
        await recordingsAPI.pauseRecording(currentRecording.id);
        message.info('Recording paused');
      } catch (error) {
        console.error('Failed to pause recording:', error);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      message.info('Recording resumed');
    }
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && currentRecording) {
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      try {
        const response = await recordingsAPI.finishRecording(currentRecording.id);
        message.success('Recording finished');
        
        // Get updated recording data
        const updatedRecording = await recordingsAPI.getRecording(currentRecording.id);
        onRecordingUpdate(updatedRecording.data);
        
      } catch (error) {
        console.error('Failed to finish recording:', error);
        message.error('Failed to process recording');
      }

      setIsRecording(false);
      setIsPaused(false);
      setCurrentRecording(null);
      chunkIndexRef.current = 0;
    }
  };

  const WaveformAnimation = () => (
    <div className="waveform-animation">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="waveform-bar" />
      ))}
    </div>
  );

  if (selectedRecording && !isRecording) {
    return (
      <div className="recording-container">
        <Title level={3}>Recording Details</Title>
        <div style={{ 
          background: '#f9f9f9', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <Text><strong>Status:</strong> {selectedRecording.status}</Text><br />
          <Text><strong>Created:</strong> {new Date(selectedRecording.created_at).toLocaleString()}</Text><br />
          {selectedRecording.transcription_text && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>Transcription:</Text>
              <div style={{ 
                marginTop: '8px',
                padding: '12px',
                background: 'white',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {selectedRecording.transcription_text}
              </div>
            </div>
          )}
        </div>
        
        <Button
          type="primary"
          icon={<AudioOutlined />}
          size="large"
          onClick={startRecording}
          style={{ borderRadius: '50px', padding: '0 24px' }}
        >
          Start New Recording
        </Button>
      </div>
    );
  }

  return (
    <div className="recording-container">
      {!isRecording ? (
        <>
          <Title level={3}>Ready to Record</Title>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '40px auto',
            cursor: 'pointer'
          }}>
            <AudioOutlined style={{ fontSize: '48px', color: '#999' }} />
          </div>
          <Button
            type="primary"
            icon={<AudioOutlined />}
            size="large"
            onClick={startRecording}
            style={{ borderRadius: '50px', padding: '0 24px' }}
          >
            Start Recording
          </Button>
        </>
      ) : (
        <>
          <Title level={3}>
            {isPaused ? 'Recording Paused' : 'Recording...'}
          </Title>
          
          {!isPaused && <WaveformAnimation />}
          
          <Space size="large" style={{ marginTop: '20px' }}>
            {!isPaused ? (
              <Button
                icon={<PauseOutlined />}
                size="large"
                onClick={pauseRecording}
                style={{ borderRadius: '50px' }}
              >
                Pause
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<AudioOutlined />}
                size="large"
                onClick={resumeRecording}
                style={{ borderRadius: '50px' }}
              >
                Resume
              </Button>
            )}
            
            <Button
              danger
              icon={<StopOutlined />}
              size="large"
              onClick={stopRecording}
              style={{ borderRadius: '50px' }}
            >
              End Recording
            </Button>
          </Space>
        </>
      )}
    </div>
  );
};

export default RecordingInterface;
