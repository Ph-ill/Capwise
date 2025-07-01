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

      // Simulate horizontal tearing/shifting - more frequent and pronounced
      const sliceHeight = 10; // Smaller slices for more tearing
      for (let y = 0; y < canvas.height; y += sliceHeight) {
        const slice = ctx.getImageData(0, y, canvas.width, Math.min(sliceHeight, canvas.height - y));
        const offsetX = (Math.random() - 0.5) * 80; // Larger random horizontal shift
        ctx.putImageData(slice, offsetX, y);
      }

      // Simulate color channel separation (chromatic aberration) - more noticeable
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const offset = 10; // Increased pixel offset for color channels

      for (let i = 0; i < data.length; i += 4) {
        // Red channel shifted
        if (i + offset * 4 < data.length) {
          data[i] = data[i + offset * 4];
        }
        // Blue channel shifted in opposite direction
        if (i - offset * 4 >= 0) {
          data[i + 2] = data[i - offset * 4 + 2];
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Add more pronounced static/noise - increased opacity and quantity
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; // Increased white static opacity
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const width = Math.random() * 4 + 2;
        const height = Math.random() * 4 + 2;
        ctx.fillRect(x, y, width, height);
      }

      // Draw horizontal lines for scanline effect - more visible
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'; // Increased black scanline opacity
      for (let i = 0; i < canvas.height; i += 1) { // Denser scanlines
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
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