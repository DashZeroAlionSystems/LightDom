/**
 * Voice Settings Dashboard
 * 
 * Configuration UI for the Voice Streaming Service
 * Allows users to configure wake words, TTS voices, and privacy settings
 */

import React, { useState, useEffect } from 'react';
import { Card, Typography, Switch, Select, Slider, Button, Tag, Space, Divider, message, Spin } from 'antd';
import {
  SoundOutlined,
  AudioOutlined,
  SettingOutlined,
  LockOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface VoiceConfig {
  wakeWord: string;
  wakeWordEnabled: boolean;
  language: string;
  ttsEnabled: boolean;
  ttsVoiceId: string;
  ttsSpeed: number;
  ttsPitch: number;
  ttsVolume: number;
  privacyMode: string;
  silenceTimeout: number;
}

interface TTSVoice {
  voiceId: string;
  name: string;
  displayName: string;
  language: string;
  gender?: string;
  quality: string;
  isDefault: boolean;
}

const defaultConfig: VoiceConfig = {
  wakeWord: 'hello deepseek',
  wakeWordEnabled: true,
  language: 'en-US',
  ttsEnabled: true,
  ttsVoiceId: 'deepseek-natural',
  ttsSpeed: 1.0,
  ttsPitch: 1.0,
  ttsVolume: 1.0,
  privacyMode: 'wake_word_only',
  silenceTimeout: 3,
};

const wakeWordOptions = [
  { value: 'hello deepseek', label: 'Hello DeepSeek' },
  { value: 'hey deepseek', label: 'Hey DeepSeek' },
  { value: 'hi deepseek', label: 'Hi DeepSeek' },
  { value: 'deepseek', label: 'DeepSeek' },
];

const languageOptions = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
];

const privacyModeOptions = [
  { value: 'wake_word_only', label: 'Wake Word Only', description: 'Only listens after detecting wake word' },
  { value: 'push_to_talk', label: 'Push to Talk', description: 'Requires button press to record' },
  { value: 'always_listening', label: 'Always Listening', description: 'Continuous listening (requires consent)' },
  { value: 'disabled', label: 'Disabled', description: 'Voice features completely disabled' },
];

export const VoiceSettingsDashboard: React.FC = () => {
  const [config, setConfig] = useState<VoiceConfig>(defaultConfig);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const tts = useTextToSpeech({
    rate: config.ttsSpeed,
    pitch: config.ttsPitch,
    volume: config.ttsVolume,
  });

  // Load configuration and voices
  useEffect(() => {
    loadConfig();
    loadVoices();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/voice/config');
      const data = await response.json();
      if (data.success && data.config) {
        setConfig({
          wakeWord: data.config.wakeWord || defaultConfig.wakeWord,
          wakeWordEnabled: data.config.wakeWordEnabled ?? defaultConfig.wakeWordEnabled,
          language: data.config.language || defaultConfig.language,
          ttsEnabled: data.config.ttsEnabled ?? defaultConfig.ttsEnabled,
          ttsVoiceId: data.config.ttsVoiceId || defaultConfig.ttsVoiceId,
          ttsSpeed: data.config.ttsSpeed || defaultConfig.ttsSpeed,
          ttsPitch: data.config.ttsPitch || defaultConfig.ttsPitch,
          ttsVolume: data.config.ttsVolume || defaultConfig.ttsVolume,
          privacyMode: data.config.privacyMode || defaultConfig.privacyMode,
          silenceTimeout: data.config.autoStopOnSilenceSeconds || defaultConfig.silenceTimeout,
        });
      }
    } catch (error) {
      console.error('Failed to load voice config:', error);
      message.warning('Using default voice configuration');
    } finally {
      setLoading(false);
    }
  };

  const loadVoices = async () => {
    try {
      const response = await fetch('/api/voice/voices');
      const data = await response.json();
      if (data.success && data.voices) {
        setVoices(data.voices);
      }
    } catch (error) {
      console.error('Failed to load TTS voices:', error);
      // Use browser voices as fallback
      if (tts.voices.length > 0) {
        setVoices(tts.voices.map(v => ({
          voiceId: v.voiceId,
          name: v.name,
          displayName: v.name,
          language: v.lang,
          isDefault: v.isDefault,
          quality: 'standard',
        })));
      }
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/voice/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wakeWord: config.wakeWord,
          wakeWordEnabled: config.wakeWordEnabled,
          language: config.language,
          ttsEnabled: config.ttsEnabled,
          ttsVoiceId: config.ttsVoiceId,
          ttsSpeed: config.ttsSpeed,
          ttsPitch: config.ttsPitch,
          ttsVolume: config.ttsVolume,
          privacyMode: config.privacyMode,
          autoStopOnSilenceSeconds: config.silenceTimeout,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        message.success('Voice settings saved successfully');
      } else {
        message.error('Failed to save voice settings');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      message.error('Failed to save voice settings');
    } finally {
      setSaving(false);
    }
  };

  const testVoice = () => {
    const testText = `Hello! This is ${config.ttsVoiceId || 'the default voice'}. You can say "${config.wakeWord}" to start speaking to DeepSeek.`;
    tts.speak(testText);
  };

  const updateConfig = (key: keyof VoiceConfig, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading voice settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title level={3} className="!mb-0">
            <SoundOutlined className="mr-2" />
            Voice Settings
          </Title>
          <Text type="secondary">Configure voice input and output for DeepSeek interactions</Text>
        </div>
        <Button 
          type="primary" 
          onClick={saveConfig} 
          loading={saving}
          icon={<CheckCircleOutlined />}
        >
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wake Word Settings */}
        <Card 
          title={
            <Space>
              <AudioOutlined />
              <span>Wake Word Detection</span>
            </Space>
          }
          extra={
            <Switch
              checked={config.wakeWordEnabled}
              onChange={(checked) => updateConfig('wakeWordEnabled', checked)}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          }
        >
          <div className="space-y-4">
            <div>
              <Text strong>Wake Word Phrase</Text>
              <Select
                value={config.wakeWord}
                onChange={(value) => updateConfig('wakeWord', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!config.wakeWordEnabled}
              >
                {wakeWordOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
              <Text type="secondary" className="text-xs mt-1">
                Say this phrase to activate voice input
              </Text>
            </div>

            <div>
              <Text strong>Language</Text>
              <Select
                value={config.language}
                onChange={(value) => updateConfig('language', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                {languageOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Silence Timeout (seconds)</Text>
              <Slider
                value={config.silenceTimeout}
                onChange={(value) => updateConfig('silenceTimeout', value)}
                min={1}
                max={10}
                marks={{ 1: '1s', 5: '5s', 10: '10s' }}
              />
              <Text type="secondary" className="text-xs">
                Stop recording after this many seconds of silence
              </Text>
            </div>
          </div>
        </Card>

        {/* Text-to-Speech Settings */}
        <Card 
          title={
            <Space>
              <SoundOutlined />
              <span>Text-to-Speech</span>
            </Space>
          }
          extra={
            <Switch
              checked={config.ttsEnabled}
              onChange={(checked) => updateConfig('ttsEnabled', checked)}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          }
        >
          <div className="space-y-4">
            <div>
              <Text strong>Voice</Text>
              <Select
                value={config.ttsVoiceId}
                onChange={(value) => updateConfig('ttsVoiceId', value)}
                style={{ width: '100%', marginTop: 8 }}
                disabled={!config.ttsEnabled}
              >
                {voices.map(voice => (
                  <Option key={voice.voiceId} value={voice.voiceId}>
                    {voice.displayName || voice.name}
                    {voice.isDefault && <Tag color="blue" className="ml-2">Default</Tag>}
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Speed: {config.ttsSpeed.toFixed(1)}x</Text>
              <Slider
                value={config.ttsSpeed}
                onChange={(value) => updateConfig('ttsSpeed', value)}
                min={0.5}
                max={2}
                step={0.1}
                disabled={!config.ttsEnabled}
                marks={{ 0.5: 'Slow', 1: 'Normal', 2: 'Fast' }}
              />
            </div>

            <div>
              <Text strong>Pitch: {config.ttsPitch.toFixed(1)}</Text>
              <Slider
                value={config.ttsPitch}
                onChange={(value) => updateConfig('ttsPitch', value)}
                min={0.5}
                max={1.5}
                step={0.1}
                disabled={!config.ttsEnabled}
                marks={{ 0.5: 'Low', 1: 'Normal', 1.5: 'High' }}
              />
            </div>

            <div>
              <Text strong>Volume: {Math.round(config.ttsVolume * 100)}%</Text>
              <Slider
                value={config.ttsVolume}
                onChange={(value) => updateConfig('ttsVolume', value)}
                min={0}
                max={1}
                step={0.1}
                disabled={!config.ttsEnabled}
              />
            </div>

            <Button 
              onClick={testVoice} 
              disabled={!config.ttsEnabled || tts.isSpeaking}
              icon={tts.isSpeaking ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            >
              {tts.isSpeaking ? 'Speaking...' : 'Test Voice'}
            </Button>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card 
          title={
            <Space>
              <LockOutlined />
              <span>Privacy & Security</span>
            </Space>
          }
        >
          <div className="space-y-4">
            <div>
              <Text strong>Privacy Mode</Text>
              <Select
                value={config.privacyMode}
                onChange={(value) => updateConfig('privacyMode', value)}
                style={{ width: '100%', marginTop: 8 }}
              >
                {privacyModeOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    <div>
                      <span>{opt.label}</span>
                      <br />
                      <Text type="secondary" className="text-xs">{opt.description}</Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            <Divider />

            <div>
              <Title level={5}>Privacy Information</Title>
              <Paragraph type="secondary" className="text-sm">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Voice data is processed locally when possible</li>
                  <li>Recordings are automatically deleted after processing</li>
                  <li>No background listening in &quot;Wake Word Only&quot; mode</li>
                  <li>All voice commands are explicitly user-initiated</li>
                </ul>
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* Voice Commands Info */}
        <Card 
          title={
            <Space>
              <SettingOutlined />
              <span>Voice Commands</span>
            </Space>
          }
        >
          <div className="space-y-4">
            <Text strong>Available Commands:</Text>
            
            <div className="space-y-2 mt-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Text strong className="text-blue-700">&quot;Hello DeepSeek&quot;</Text>
                <br />
                <Text type="secondary">Activate voice input</Text>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <Text strong className="text-green-700">&quot;DeepSeek, read the report&quot;</Text>
                <br />
                <Text type="secondary">Read current report aloud</Text>
              </div>
              
              <div className="p-3 bg-orange-50 rounded-lg">
                <Text strong className="text-orange-700">&quot;Stop listening&quot;</Text>
                <br />
                <Text type="secondary">Cancel voice recording</Text>
              </div>
            </div>

            <Divider />

            <Text type="secondary" className="text-sm">
              More voice commands can be configured in the Voice Commands section of the admin panel.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceSettingsDashboard;
