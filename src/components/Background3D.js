import React, { useEffect, useRef } from 'react';
import './Background3D.css';

const Background3D = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle field initialization
    const particleCount = Math.min(Math.floor(width / 18), 75);
    const particles = [];

    const colors = [
      'rgba(99, 102, 241, ',   // Indigo
      'rgba(6, 182, 212, ',    // Cyan
      'rgba(139, 92, 246, ',   // Violet
      'rgba(16, 185, 129, '    // Emerald
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1000 + 100, // Depth
        baseR: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2
      });
    }

    const render = () => {
      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Render subtle perspective grid background
      const gridSpacing = 60;
      const offsetX = (mouse.x - width / 2) * 0.02;
      const offsetY = (mouse.y - height / 2) * 0.02;

      ctx.save();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
      ctx.lineWidth = 1;

      for (let x = (offsetX % gridSpacing); x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = (offsetY % gridSpacing); y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Render glowing light orbs
      const orb1X = mouse.x * 0.3 + width * 0.35;
      const orb1Y = mouse.y * 0.3 + height * 0.35;
      const gradient1 = ctx.createRadialGradient(orb1X, orb1Y, 0, orb1X, orb1Y, 450);
      gradient1.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
      gradient1.addColorStop(0.5, 'rgba(6, 182, 212, 0.04)');
      gradient1.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, width, height);

      const orb2X = width - (mouse.x * 0.2 + width * 0.2);
      const orb2Y = height - (mouse.y * 0.2 + height * 0.2);
      const gradient2 = ctx.createRadialGradient(orb2X, orb2Y, 0, orb2X, orb2Y, 500);
      gradient2.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      gradient2.addColorStop(0.6, 'rgba(16, 185, 129, 0.03)');
      gradient2.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, width, height);

      // Render 3D particles & connecting lines
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update positions with 3D mouse parallax
        p.x += p.vx + (mouse.x - width / 2) * 0.00008 * (p.z / 1000);
        p.y += p.vy + (mouse.y - height / 2) * 0.00008 * (p.z / 1000);

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle
        const scale = 1000 / p.z;
        const radius = p.baseR * scale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${p.alpha})`;
        ctx.shadowBlur = radius > 1.5 ? 12 : 0;
        ctx.shadowColor = `${p.colorPrefix}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw distance connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const lineAlpha = (1 - dist / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="background-3d-canvas" />;
};

export default Background3D;
