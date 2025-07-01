import React, { useRef, useEffect } from 'react';

const WormholeEffect = () => {
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

    const particles = [];
    const numParticles = 200;

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 2 + 0.5,
        angle: Math.random() * Math.PI * 2,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`, // White/light particles
      });
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle background distortion (optional, can be complex)
      // For simplicity, we'll focus on particle movement

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        // Move particles towards/away from center, with a swirl
        const dx = p.x - centerX;
        const dy = p.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Apply gravitational pull towards center
        const pullStrength = 0.01; // Adjust for intensity
        p.x -= dx * pullStrength;
        p.y -= dy * pullStrength;

        // Apply swirl effect
        const swirlStrength = 0.05; // Adjust for intensity
        const newX = centerX + dx * Math.cos(swirlStrength) - dy * Math.sin(swirlStrength);
        const newY = centerY + dx * Math.sin(swirlStrength) + dy * Math.cos(swirlStrength);
        p.x = newX;
        p.y = newY;

        // Update particle position based on its own speed and angle
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        // If particle goes off screen or too close to center, reinitialize
        if (dist < 10 || p.x < 0 || p.x > canvas.width || p.y < 0 || p.y > canvas.height) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.size = Math.random() * 2 + 0.5;
          p.speed = Math.random() * 2 + 0.5;
          p.angle = Math.random() * Math.PI * 2;
        }

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
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

export default WormholeEffect;
