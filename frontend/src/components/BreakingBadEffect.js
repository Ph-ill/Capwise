import React, { useRef, useEffect, useState } from 'react';

const BreakingBadEffect = () => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const particles = [];
    const numParticles = 100;

    // Initialize particles (representing crystal meth)
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1, // Size between 1 and 4
        speedX: (Math.random() - 0.5) * 2, // -1 to 1
        speedY: (Math.random() - 0.5) * 2,
        color: `rgba(0, 191, 255, ${Math.random() * 0.5 + 0.5})`, // Blue, semi-transparent (Deep Sky Blue)
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numParticles; i++) {
        const p = particles[i];

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap particles around the screen
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default BreakingBadEffect;
