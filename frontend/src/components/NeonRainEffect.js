import React, { useRef, useEffect } from 'react';

const NeonRainEffect = () => {
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

    const rainStreaks = [];
    const numStreaks = 100;

    // Initialize rain streaks
    for (let i = 0; i < numStreaks; i++) {
      rainStreaks.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 30 + 10,
        speed: Math.random() * 5 + 2,
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    const neonGlows = [];
    const numGlows = 10;
    const neonColors = ['#FF00FF', '#00FFFF', '#FFFF00', '#FF4500']; // Magenta, Cyan, Yellow, OrangeRed

    // Initialize neon glows
    for (let i = 0; i < numGlows; i++) {
      neonGlows.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 50 + 20,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        opacity: Math.random() * 0.2 + 0.1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw neon glows
      for (let i = 0; i < numGlows; i++) {
        const glow = neonGlows[i];
        const gradient = ctx.createRadialGradient(glow.x, glow.y, 0, glow.x, glow.y, glow.radius);
        gradient.addColorStop(0, `${glow.color}${Math.floor(glow.opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${glow.color}00`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        glow.x += glow.speedX;
        glow.y += glow.speedY;

        // Wrap glows around
        if (glow.x < -glow.radius) glow.x = canvas.width + glow.radius;
        if (glow.x > canvas.width + glow.radius) glow.x = -glow.radius;
        if (glow.y < -glow.radius) glow.y = canvas.height + glow.radius;
        if (glow.y > canvas.height + glow.radius) glow.y = -glow.radius;
      }

      // Draw rain streaks
      for (let i = 0; i < numStreaks; i++) {
        const streak = rainStreaks[i];
        ctx.strokeStyle = `rgba(255, 255, 255, ${streak.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.lineTo(streak.x, streak.y + streak.length);
        ctx.stroke();

        streak.y += streak.speed;
        if (streak.y > canvas.height) {
          streak.y = -streak.length;
          streak.x = Math.random() * canvas.width;
        }
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

export default NeonRainEffect;
