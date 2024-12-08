import React, {  useEffect, useState } from 'react';

const LoadingAnimation = () => {
  const [positions, setPositions] = useState([]);
  const MAX_DISTANCE = 200; // Maximum distance for showing links

  useEffect(() => {
    let frameId;
    const updatePositions = () => {
      const time = Date.now() / 1000;
      const newPositions = [];

      // Calculate positions for each invisible point
      // Outer orbit - Cyan
      for (let i = 0; i < 3; i++) {
        const angle = time * 0.8 + (i * 2 * Math.PI / 3);
        newPositions.push({
          x: Math.cos(angle) * 150 + 200,
          y: Math.sin(angle) * 150 + 200,
          color: '#00fff2'
        });
      }

      // Middle orbit - Pink (reverse direction)
      for (let i = 0; i < 3; i++) {
        const angle = -time * 1.2 + (i * 2 * Math.PI / 3);
        newPositions.push({
          x: Math.cos(angle) * 100 + 200,
          y: Math.sin(angle) * 100 + 200,
          color: '#ff00ff'
        });
      }

      // Inner orbit - Yellow
      for (let i = 0; i < 3; i++) {
        const angle = time * 1.5 + (i * 2 * Math.PI / 3);
        newPositions.push({
          x: Math.cos(angle) * 50 + 200,
          y: Math.sin(angle) * 50 + 200,
          color: '#ffff00'
        });
      }

      setPositions(newPositions);
      frameId = requestAnimationFrame(updatePositions);
    };

    updatePositions();
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Calculate links between nearby points
  const links = positions.flatMap((point1, i) => 
    positions.slice(i + 1).map((point2, j) => {
      const dx = point2.x - point1.x;
      const dy = point2.y - point1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < MAX_DISTANCE) {
        const opacity = 1 - (distance / MAX_DISTANCE);
        return {
          x1: point1.x,
          y1: point1.y,
          x2: point2.x,
          y2: point2.y,
          opacity: opacity * 0.8, // Slightly reduce max opacity for subtler effect
          gradient: `link-gradient-${i}-${j}`,
          color1: point1.color,
          color2: point2.color
        };
      }
      return null;
    }).filter(Boolean)
  );

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        width: '400px',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* SVG for links */}
        <svg width="400" height="400">
          <defs>
            {links.map(link => (
              <linearGradient
                key={link.gradient}
                id={link.gradient}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={link.color1} stopOpacity={link.opacity} />
                <stop offset="100%" stopColor={link.color2} stopOpacity={link.opacity} />
              </linearGradient>
            ))}
          </defs>
          
          {links.map((link, i) => (
            <line
              key={i}
              x1={link.x1}
              y1={link.y1}
              x2={link.x2}
              y2={link.y2}
              stroke={`url(#${link.gradient})`}
              strokeWidth="3"
              style={{
                filter: 'brightness(1.5) blur(1px)',
              }}
            />
          ))}
        </svg>

        {/* Loading text */}
        <div style={{
          color: '#00fff2',
          fontSize: '40px',
          fontFamily: 'sans-serif',
          letterSpacing: '-2px',
          textShadow: `
            0 0 5px #00fff2,
            0 0 10px #00fff2,
            0 0 20px #00fff2,
            0 0 40px #00fff2
          `,
          animation: 'textPulse 1.5s ease-in-out infinite',
          whiteSpace: 'nowrap',
          marginTop: '20px'
        }}>
          Connecting I7n Dots...
        </div>
      </div>

      <style>
        {`
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
