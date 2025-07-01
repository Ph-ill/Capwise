import React, { useRef, useEffect } from 'react';

const GridEffect = () => {
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

    const gridSize = 40; // Size of each grid cell
    const lines = [];
    const numLines = 50;

    // Initialize lines
    for (let i = 0; i < numLines; i++) {
      lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50, // Random length
        speed: Math.random() * 2 + 1, // Random speed
        direction: Math.random() < 0.5 ? 'horizontal' : 'vertical',
        color: Math.random() < 0.5 ? '#00FFFF' : '#FF4500', // Tron colors
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)'; // Light blue grid
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and animate lines
      for (let i = 0; i < numLines; i++) {
        const line = lines[i];
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (line.direction === 'horizontal') {
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x + line.length, line.y);
          line.x += line.speed;
          if (line.x > canvas.width) {
            line.x = -line.length;
          }
        } else {
          ctx.moveTo(line.x, line.y);
          ctx.lineTo(line.x, line.y + line.length);
          line.y += line.speed;
          if (line.y > canvas.height) {
            line.y = -line.length;
          }
        }
        ctx.stroke();
      }

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

export default GridEffect;
