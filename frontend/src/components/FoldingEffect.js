import React, { useRef, useEffect } from 'react';

const FoldingEffect = () => {
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

    const folds = [];
    const numFolds = 10;

    // Initialize folds
    for (let i = 0; i < numFolds; i++) {
      folds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: Math.random() * 200 + 100,
        height: Math.random() * 200 + 100,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        color: `rgba(100, 100, 100, ${Math.random() * 0.3 + 0.1})`, // Greyish, semi-transparent
        direction: Math.random() < 0.5 ? 1 : -1, // 1 for folding in, -1 for unfolding
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numFolds; i++) {
        const fold = folds[i];

        ctx.save();
        ctx.translate(fold.x + fold.width / 2, fold.y + fold.height / 2);
        ctx.rotate(fold.angle);

        // Draw the folding plane
        ctx.fillStyle = fold.color;
        ctx.fillRect(-fold.width / 2, -fold.height / 2, fold.width, fold.height);

        ctx.restore();

        // Animate folding/unfolding
        fold.angle += fold.speed * fold.direction;

        // Reverse direction if fully folded/unfolded
        if (fold.angle > Math.PI * 2 || fold.angle < 0) {
          fold.direction *= -1;
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

export default FoldingEffect;
