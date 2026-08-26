import React from 'react';

const WebGLFallback = ({ title = 'Career Ecosystem' }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '200px',
        background: 'radial-gradient(circle at 50% 50%, rgba(247, 247, 245, 1) 0%, rgba(255, 255, 255, 1) 100%)',
        borderRadius: '12px',
        border: '1px solid #EAEAEA',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.15,
          backgroundImage: 'radial-gradient(#18181B 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div
        style={{
          padding: '6px 14px',
          borderRadius: '20px',
          background: '#FFFFFF',
          border: '1px solid #E4E4E7',
          color: '#71717A',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.05em',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          zIndex: 2
        }}
      >
        {title}
      </div>
    </div>
  );
};

export default WebGLFallback;
