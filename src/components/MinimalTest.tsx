import React from 'react';

const MinimalTest = () => {
  return (
    <div style={{ padding: '20px', background: 'red', color: 'white' }}>
      <h1>TEST PAGE - If you see this, React is working</h1>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default MinimalTest;
