import React, { useEffect, useRef } from 'react';

const BubbleEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const bubbles = [];
    const numBubbles = 50;

    class Bubble {
      constructor(x, y, radius, speed) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = speed;
        this.opacity = Math.random() * 0.5 + 0.5; // Random opacity between 0.5 and 1
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }

      update() {
        this.y -= this.speed;
        if (this.y < -this.radius) {
          this.y = canvas.height + this.radius;
          this.x = Math.random() * canvas.width;
        }
        this.draw();
      }
    }

    const init = () => {
      bubbles.length = 0; // Clear existing bubbles
      for (let i = 0; i < numBubbles; i++) {
        const radius = Math.random() * 15 + 5; // Bubbles between 5 and 20px
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speed = Math.random() * 1 + 0.5; // Speed between 0.5 and 1.5
        bubbles.push(new Bubble(x, y, radius, speed));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < bubbles.length; i++) {
        bubbles[i].update();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init(); // Re-initialize bubbles on resize
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default BubbleEffect;