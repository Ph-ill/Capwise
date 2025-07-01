import React, { useRef, useEffect } from 'react';

const GlitchEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial resize

    const glitch = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create a random glitch effect (original, less intense)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const rand = Math.random();
        if (rand < 0.1) {
          data[i] = data[i + 4];     // Red
          data[i + 1] = data[i + 5]; // Green
          data[i + 2] = data[i + 6]; // Blue
        } else if (rand < 0.15) {
          data[i] = Math.random() * 255;
          data[i + 1] = Math.random() * 255;
          data[i + 2] = Math.random() * 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Draw some random lines for a static effect
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, Math.random() * canvas.height);
        ctx.lineTo(canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(glitch);
    };

    glitch();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default GlitchEffect;
