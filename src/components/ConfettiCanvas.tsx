import React, { useEffect, useRef } from "react";

interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  color: string;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "square" | "triangle" | "heart" | "star";
  alpha: number;
  wobble: number;
  wobbleSpeed: number;
}

export const ConfettiCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => resizeCanvas());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const particles: ConfettiParticle[] = [];
    const colors = ["#FF4D8D", "#FFD700", "#E63950", "#9B5DE5", "#38BDF8", "#F472B6"];
    const maxParticles = 60; // Keep it light for top-notch mobile performance

    const createParticle = (isInitial = false): ConfettiParticle => {
      const shapes: ("circle" | "square" | "triangle" | "heart" | "star")[] = [
        "circle", "square", "triangle", "heart", "star"
      ];
      return {
        x: Math.random() * canvas.width,
        y: isInitial ? Math.random() * canvas.height : -20,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: Math.random() * 1.5 + 1,
        speedX: (Math.random() - 0.5) * 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        alpha: Math.random() * 0.4 + 0.6,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.02 + 0.01
      };
    };

    // Pre-populate some particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    const drawHeart = (context: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      context.beginPath();
      context.moveTo(x, y + size / 4);
      context.quadraticCurveTo(x, y, x + size / 2, y);
      context.quadraticCurveTo(x + size, y, x + size, y + size / 3);
      context.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size);
      context.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3);
      context.quadraticCurveTo(x, y, x, y + size / 4);
      context.closePath();
      context.fill();
    };

    const drawStar = (context: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }
      context.lineTo(cx, cy - outerRadius);
      context.closePath();
      context.fill();
    };

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobble) * 0.5;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 20) {
          particles[i] = createParticle(false);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        const s = p.size;
        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "square") {
          ctx.fillRect(-s / 2, -s / 2, s, s);
        } else if (p.shape === "triangle") {
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 2, s / 2);
          ctx.lineTo(-s / 2, s / 2);
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === "heart") {
          drawHeart(ctx, -s / 2, -s / 2, s);
        } else if (p.shape === "star") {
          drawStar(ctx, 0, 0, 5, s / 2, s / 4);
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-80"
    />
  );
};
