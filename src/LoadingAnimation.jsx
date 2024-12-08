import React from 'react';

const LoadingAnimation = () => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* Container for all animated elements */}
      <div style={{
        position: 'relative',
        width: '400px',
        height: '400px'
      }}>
        {/* Outer circle - Cyan balls */}
        {[...Array(6)].map((_, index) => (
          <div key={`outer-${index}`} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '300px',
            height: '300px',
            transform: `translate(-50%, -50%) rotate(${index * 60}deg)`,
            animation: 'orbitOuter 8s linear infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '135px',
              width: '30px',
              height: '30px',
              backgroundColor: '#00fff2',
              borderRadius: '50%',
              boxShadow: '0 0 20px #00fff2',
              filter: 'brightness(1.5)',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
          </div>
        ))}

        {/* Middle circle - Pink balls moving in opposite direction */}
        {[...Array(4)].map((_, index) => (
          <div key={`middle-${index}`} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '200px',
            height: '200px',
            transform: `translate(-50%, -50%) rotate(${index * 90}deg)`,
            animation: 'orbitMiddle 6s linear infinite reverse'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '85px',
              width: '30px',
              height: '30px',
              backgroundColor: '#ff00ff',
              borderRadius: '50%',
              boxShadow: '0 0 20px #ff00ff',
              filter: 'brightness(1.5)',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
        ))}

        {/* Inner circle - Yellow balls */}
        {[...Array(3)].map((_, index) => (
          <div key={`inner-${index}`} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100px',
            height: '100px',
            transform: `translate(-50%, -50%) rotate(${index * 120}deg)`,
            animation: 'orbitInner 4s linear infinite'
          }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '35px',
              width: '30px',
              height: '30px',
              backgroundColor: '#ffff00',
              borderRadius: '50%',
              boxShadow: '0 0 20px #ffff00',
              filter: 'brightness(1.5)',
              animation: 'pulse 1.8s ease-in-out infinite'
            }} />
          </div>
        ))}

        {/* Loading text - Keeping the existing style */}
        <div style={{
          position: 'absolute',
          width: '100%',
          textAlign: 'center',
          top: '420px',
          color: '#00fff2',
          fontSize: '24px',
          fontFamily: 'monospace',
          letterSpacing: '8px',
          textShadow: `
            0 0 5px #00fff2,
            0 0 10px #00fff2,
            0 0 20px #00fff2,
            0 0 40px #00fff2
          `,
          animation: 'textPulse 1.5s ease-in-out infinite'
        }}>
          LOADING
        </div>
      </div>

      <style>
        {`
          @keyframes orbitOuter {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes orbitMiddle {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }

          @keyframes orbitInner {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          
          @keyframes pulse {
            0% { 
              opacity: 0.5;
              transform: scale(0.8);
            }
            50% { 
              opacity: 1;
              transform: scale(1.2);
            }
            100% { 
              opacity: 0.5;
              transform: scale(0.8);
            }
          }
          
          @keyframes textPulse {
            0% { 
              opacity: 0.5;
              transform: scale(0.98) translateY(0);
            }
            50% { 
              opacity: 1;
              transform: scale(1.02) translateY(-5px);
            }
            100% { 
              opacity: 0.5;
              transform: scale(0.98) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingAnimation;
