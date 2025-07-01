import React, { useRef, useEffect } from 'react';

const VHSEffect = () => {
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

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background color (subtle dark for VHS)
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Prominent Scanlines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)'; // Darker, more visible
      for (let i = 0; i < canvas.height; i += 2) { // Denser scanlines
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Random horizontal tearing/wobble
      const tearHeight = 5; // Height of each tear segment
      const tearIntensity = 10; // Max horizontal shift
      for (let y = 0; y < canvas.height; y += tearHeight) {
        const shift = (Math.random() - 0.5) * tearIntensity;
        ctx.drawImage(canvas, 0, y, canvas.width, tearHeight, shift, y, canvas.width, tearHeight);
      }

      // Color bleeding/chromatic aberration
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const colorOffset = 3; // Pixel offset for color channels

      for (let i = 0; i < data.length; i += 4) {
        // Shift red channel
        if (i + colorOffset * 4 < data.length) {
          data[i] = data[i + colorOffset * 4];
        }
        // Shift blue channel in opposite direction
        if (i - colorOffset * 4 >= 0) {
          data[i + 2] = data[i - colorOffset * 4 + 2];
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // More noticeable static/noise
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; // Increased opacity
      for (let i = 0; i < 150; i++) { // More static particles
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        ctx.fillRect(x, y, size, size);
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

export default VHSEffect;