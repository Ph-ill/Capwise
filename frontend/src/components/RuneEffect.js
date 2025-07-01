import React, { useRef, useEffect } from 'react';

const RuneEffect = () => {
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

    const runes = [];
    const numRunes = 50;
    const runeCharacters = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'; // Elder Futhark runes

    // Initialize runes
    for (let i = 0; i < numRunes; i++) {
      runes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 20,
        opacity: 0,
        fadeSpeed: Math.random() * 0.01 + 0.005, // Slower fade
        isFadingIn: true,
        character: runeCharacters[Math.floor(Math.random() * runeCharacters.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < numRunes; i++) {
        const rune = runes[i];

        ctx.fillStyle = `rgba(173, 216, 230, ${rune.opacity})`; // Light blue/ethereal color
        ctx.font = `${rune.size}px Arial`; // Fallback font for runes
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rune.character, rune.x, rune.y);

        if (rune.isFadingIn) {
          rune.opacity += rune.fadeSpeed;
          if (rune.opacity >= 1) {
            rune.opacity = 1;
            rune.isFadingIn = false;
            // After fading in, wait a bit then start fading out
            setTimeout(() => { rune.isFadingIn = false; }, Math.random() * 2000 + 1000); // Stay visible for 1-3 seconds
          }
        } else {
          rune.opacity -= rune.fadeSpeed;
          if (rune.opacity <= 0) {
            // Reset rune position and start fading in again
            rune.x = Math.random() * canvas.width;
            rune.y = Math.random() * canvas.height;
            rune.size = Math.random() * 30 + 20;
            rune.isFadingIn = true;
            rune.character = runeCharacters[Math.floor(Math.random() * runeCharacters.length)];
          }
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

export default RuneEffect;
