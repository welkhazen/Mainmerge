import { useEffect, useRef, useState, memo } from 'react';
import { MATRIX_CHAR_ARRAY, MATRIX_FONT_SIZE } from '@/lib/matrixConstants';

const MatrixBackground = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const speedRef = useRef(15);
  const targetSpeedRef = useRef(50);
  const startTimeRef = useRef(performance.now());
  const lastDrawTimeRef = useRef(0);
  const currentOpacityRef = useRef(-1);

  const slowdownDuration = 5000;
  const fadeStartTime = 4000;
  const fadeDuration = 5000;

  const isDarkRef = useRef(
    document.documentElement.classList.contains('dark') ||
    !document.documentElement.classList.contains('light')
  );
  const themeColorRef = useRef({ h: 45, s: 90, l: 55 });

  useEffect(() => {
    const handleThemeChange = () => {
      startTimeRef.current = performance.now();
      speedRef.current = 15;
      setAnimationKey(k => k + 1);
    };

    window.addEventListener('themechange', handleThemeChange);
    return () => window.removeEventListener('themechange', handleThemeChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    startTimeRef.current = performance.now();
    lastDrawTimeRef.current = 0;
    speedRef.current = 15;
    currentOpacityRef.current = -1;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.font = `${MATRIX_FONT_SIZE}px monospace`;
    };

    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.addEventListener('resize', resizeCanvas);

    const columns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
    const drops: number[] = Array(columns).fill(1);
    for (let i = 0; i < drops.length; i++) {
      drops[i] = Math.floor(Math.random() * (canvas.height / MATRIX_FONT_SIZE));
    }

    const matrixColor = (() => {
      const { h, s, l } = themeColorRef.current;
      if (isDarkRef.current) {
        return `hsl(${h}, ${Math.min(s, 70)}%, ${Math.min(l + 15, 80)}%)`;
      } else {
        return `hsl(${h}, ${Math.min(s, 60)}%, ${Math.max(l - 15, 35)}%)`;
      }
    })();

    const fadeColor = isDarkRef.current ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)';

    const calculateOpacity = () => {
      const elapsed = performance.now() - startTimeRef.current;

      if (elapsed < fadeStartTime) {
        return isDarkRef.current ? 0.3 : 0.2;
      } else if (elapsed < fadeStartTime + fadeDuration) {
        const fadeProgress = (elapsed - fadeStartTime) / fadeDuration;
        const easeOut = 1 - Math.pow(fadeProgress, 2);
        const baseOpacity = isDarkRef.current ? 0.3 : 0.2;
        return baseOpacity * easeOut;
      } else {
        return 0;
      }
    };

    const updateCanvasOpacity = () => {
      const newOpacity = calculateOpacity();
      if (Math.abs(newOpacity - currentOpacityRef.current) > 0.005 || newOpacity === 0) {
        canvas.style.opacity = String(newOpacity);
        currentOpacityRef.current = newOpacity;
      }
      return newOpacity > 0;
    };

    const getCurrentInterval = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const progress = Math.min(elapsed / slowdownDuration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      return speedRef.current + (targetSpeedRef.current - speedRef.current) * easeOut;
    };

    const draw = () => {
      ctx.fillStyle = fadeColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = matrixColor;

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHAR_ARRAY[Math.floor(Math.random() * MATRIX_CHAR_ARRAY.length)];
        ctx.fillText(char, i * MATRIX_FONT_SIZE, drops[i] * MATRIX_FONT_SIZE);

        if (drops[i] * MATRIX_FONT_SIZE > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    let rafId: number;
    let isRunning = true;

    const loop = (now: number) => {
      if (!isRunning) return;

      const shouldContinue = updateCanvasOpacity();
      if (!shouldContinue) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const interval = getCurrentInterval();
      if (now - lastDrawTimeRef.current >= interval) {
        draw();
        lastDrawTimeRef.current = now;
      }

      rafId = window.requestAnimationFrame(loop);
    };

    rafId = window.requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [animationKey]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none z-[1]"
      style={{ background: 'transparent', opacity: 0 }}
    />
  );
});

MatrixBackground.displayName = 'MatrixBackground';

export default MatrixBackground;
