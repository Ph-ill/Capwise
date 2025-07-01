import React, { useRef, useEffect } from 'react';

const RainbowEffect = () => {
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

    const colors = [
      '#FF0000', // Red
      '#FFA500', // Orange
      '#FFFF00', // Yellow
      '#008000', // Green
      '#0000FF', // Blue
      '#4B0082', // Indigo
      '#EE82EE', // Violet
    ];

    let colorIndex = 0;
    let alpha = 0.1; // Transparency

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw a large, semi-transparent rectangle with the current rainbow color
      ctx.fillStyle = colors[colorIndex];
      ctx.globalAlpha = alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1; // Reset alpha

      // Cycle through colors
      colorIndex = (colorIndex + 1) % colors.length;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default RainbowEffect;
