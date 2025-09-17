/**
 * File Upload Settings Component
 * Allows users to configure their maximum file upload size based on Chrome limits
 */

import React, { useState, useEffect } from 'react';
import { lightDomStorageAPI } from '../api/LightDomStorageApi';
import { ChromeUploadLimits } from '../core/PersistentBlockchainStorage';

export const FileUploadSettings: React.FC = () => {
  const [chromeLimits, setChromeLimits] = useState<ChromeUploadLimits | null>(null);
  const [maxFileSize, setMaxFileSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    loadChromeLimits();
  }, []);

  const loadChromeLimits = () => {
    const limits = lightDomStorageAPI.getChromeLimits();
    setChromeLimits(limits);
    setMaxFileSize(limits.maxFileSize);
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value);
    setMaxFileSize(newSize);
  };

  const handleSave = async () => {
    if (!chromeLimits) return;

    setLoading(true);
    setMessage('');

    try {
      if (maxFileSize > chromeLimits.maxFileSize) {
        setMessage(
          `File size cannot exceed Chrome limit of ${formatBytes(chromeLimits.maxFileSize)}`
        );
        return;
      }

      await lightDomStorageAPI.setMaxFileUploadSize(maxFileSize);
      setMessage('✅ File upload size updated successfully!');
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRecommendedSizes = () => {
    if (!chromeLimits) return [];

    const maxSize = chromeLimits.maxFileSize;
    return [
      { label: 'Small (1MB)', value: 1024 * 1024 },
      { label: 'Medium (10MB)', value: 10 * 1024 * 1024 },
      { label: 'Large (100MB)', value: 100 * 1024 * 1024 },
      { label: 'Very Large (1GB)', value: 1024 * 1024 * 1024 },
      { label: 'Maximum (2GB)', value: maxSize },
    ].filter(size => size.value <= maxSize);
  };

  if (!chromeLimits) {
    return <div>Loading Chrome limits...</div>;
  }

  return (
    <div className='file-upload-settings'>
      <h2>File Upload Settings</h2>

      <div className='chrome-info'>
        <h3>Chrome Browser Limits</h3>
        <div className='limits-grid'>
          <div className='limit-item'>
            <label>Maximum File Size:</label>
            <span>{formatBytes(chromeLimits.maxFileSize)}</span>
          </div>
          <div className='limit-item'>
            <label>Maximum Files:</label>
            <span>{chromeLimits.maxFiles.toLocaleString()}</span>
          </div>
          <div className='limit-item'>
            <label>Total Upload Limit:</label>
            <span>{formatBytes(chromeLimits.maxTotalSize)}</span>
          </div>
          <div className='limit-item'>
            <label>Browser Version:</label>
            <span>Chrome {chromeLimits.browserVersion}</span>
          </div>
        </div>
      </div>

      <div className='size-settings'>
        <h3>Set Your Maximum File Upload Size</h3>

        <div className='size-input'>
          <label htmlFor='maxFileSize'>Maximum File Size (bytes):</label>
          <input
            id='maxFileSize'
            type='number'
            value={maxFileSize}
            onChange={handleSizeChange}
            min='1024'
            max={chromeLimits.maxFileSize}
            step='1024'
          />
          <span className='size-display'>{formatBytes(maxFileSize)}</span>
        </div>

        <div className='recommended-sizes'>
          <h4>Recommended Sizes:</h4>
          <div className='size-buttons'>
            {getRecommendedSizes().map(size => (
              <button
                key={size.value}
                onClick={() => setMaxFileSize(size.value)}
                className={maxFileSize === size.value ? 'active' : ''}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        <div className='supported-formats'>
          <h4>Supported File Types:</h4>
          <div className='format-tags'>
            {chromeLimits.supportedFormats.slice(0, 10).map((format, index) => (
              <span key={index} className='format-tag'>
                {format}
              </span>
            ))}
            {chromeLimits.supportedFormats.length > 10 && (
              <span className='format-tag'>+{chromeLimits.supportedFormats.length - 10} more</span>
            )}
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className='save-button'>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>{message}</div>
        )}
      </div>

      <style>{`
        .file-upload-settings {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        h2, h3, h4 {
          color: #333;
          margin-bottom: 16px;
        }

        .chrome-info {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .limits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .limit-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }

        .limit-item:last-child {
          border-bottom: none;
        }

        .limit-item label {
          font-weight: 500;
          color: #666;
        }

        .limit-item span {
          font-weight: 600;
          color: #333;
        }

        .size-settings {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 20px;
        }

        .size-input {
          margin-bottom: 24px;
        }

        .size-input label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .size-input input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .size-display {
          font-weight: 600;
          color: #007bff;
        }

        .recommended-sizes {
          margin-bottom: 24px;
        }

        .size-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .size-buttons button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .size-buttons button:hover {
          background: #f8f9fa;
        }

        .size-buttons button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .supported-formats {
          margin-bottom: 24px;
        }

        .format-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .format-tag {
          padding: 4px 8px;
          background: #e9ecef;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
        }

        .save-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .save-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .save-button:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .message {
          margin-top: 16px;
          padding: 12px;
          border-radius: 4px;
          font-weight: 500;
        }

        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};
