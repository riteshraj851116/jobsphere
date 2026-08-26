import React from 'react';
import AuthVisual from '../three/AuthVisual';

const AuthBackground = () => {
  return (
    <div
      className="auth-background"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: 0.85,
        overflow: 'hidden'
      }}
    >
      <AuthVisual />
    </div>
  );
};

export default AuthBackground;
