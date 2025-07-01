import React from 'react';
import { motion } from 'framer-motion';

const PusheenEffect = () => {
  const numPusheens = 5; // Number of ":3" instances to render

  return (
    <>
      {Array.from({ length: numPusheens }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: Math.random() * 0.5 + 0.2, // Random scale between 0.2 and 0.7
          }}
          animate={{
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight, Math.random() * window.innerHeight], // Random float
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth, Math.random() * window.innerWidth], // Random float
            opacity: [0, Math.random() * 0.8 + 0.2, 0], // Fade in and out
            scale: [Math.random() * 0.5 + 0.2, Math.random() * 1.0 + 0.5, Math.random() * 0.5 + 0.2], // Varying scale, larger
          }}
          transition={{
            duration: Math.random() * 10 + 5, // Random duration between 5 and 15 seconds
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          style={{
            position: 'fixed',
            zIndex: -1,
            pointerEvents: 'none', // Ensure it doesn't interfere with clicks
            fontSize: '100px', // Much larger font size
            fontWeight: 'bold',
            color: '#FFC0CB', // Pusheen pink
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          :3
        </motion.div>
      ))}
    </>
  );
};

export default PusheenEffect;
