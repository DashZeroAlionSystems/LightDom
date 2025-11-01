/**
 * Minimal triage stub for DesignSystem components.
 * This file intentionally provides lightweight, permissive implementations
 * of the most commonly imported components so the rest of the app can type-check
 * while we perform focused triage/hardening.
 */

import React from 'react';

export const EnhancedButton: React.FC<any> = ({ children, ...props }) => (
  <button {...(props as any)}>{children}</button>
);

export const EnhancedCard: React.FC<any> = ({ children, ...props }) => (
  <div {...(props as any)}>{children}</div>
);

export const EnhancedStatistic: React.FC<any> = ({ title, value, ...props }) => (
  <div {...(props as any)}>
    <div>{title}</div>
    <div>{value}</div>
  </div>
);

export const EnhancedProgress: React.FC<any> = ({ percent = 0, ...props }) => (
  <div {...(props as any)}>
    <div style={{ background: '#eee', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ width: `${percent}%`, height: 8, background: '#1890ff' }} />
    </div>
    <div style={{ marginTop: 8 }}>{percent}%</div>
  </div>
);

export const EnhancedAvatar: React.FC<any> = ({ src, text, ...props }) => (
  <div {...(props as any)}>
    {src ? <img src={src} alt={text || 'avatar'} style={{ width: 40, height: 40, borderRadius: '50%' }} /> : <div>{text || 'U'}</div>}
  </div>
);

export const EnhancedInput: React.FC<any> = ({ value, onChange, ...props }) => (
  <input value={value} onChange={(e) => onChange?.(e.target.value)} {...(props as any)} />
);

export const EnhancedTag: React.FC<any> = ({ children, ...props }) => (
  <span {...(props as any)}>{children}</span>
);

export default {
  EnhancedButton,
  EnhancedCard,
  EnhancedStatistic,
  EnhancedProgress,
  EnhancedAvatar,
  EnhancedInput,
  EnhancedTag,
};
