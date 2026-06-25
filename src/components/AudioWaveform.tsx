import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  isActive: boolean;
  isRobotSpeaking?: boolean;
}

export function AudioWaveform({ isActive, isRobotSpeaking = false }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (!isActive) {
      // Draw idle flat line
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = "rgba(0, 212, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
      return;
    }

    timeRef.current += 0.05;
    const t = timeRef.current;

    // Draw multiple wave layers
    const colors = isRobotSpeaking
      ? ["rgba(168, 85, 247, 0.8)", "rgba(0, 212, 255, 0.6)", "rgba(168, 85, 247, 0.4)"]
      : ["rgba(0, 212, 255, 0.8)", "rgba(0, 212, 255, 0.5)", "rgba(124, 58, 237, 0.4)"];

    colors.forEach((color, layerIndex) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2 - layerIndex * 0.3;

      const frequency = 0.02 + layerIndex * 0.005;
      const amplitude = isRobotSpeaking ? 40 - layerIndex * 8 : 25 - layerIndex * 5;
      const speed = 2 + layerIndex;

      for (let x = 0; x < width; x += 2) {
        const y =
          centerY +
          Math.sin(x * frequency + t * speed) * amplitude * Math.sin(x / width * Math.PI) +
          Math.sin(x * frequency * 2 + t * speed * 1.5) * (amplitude * 0.3) * Math.sin(x / width * Math.PI);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    // Draw vertical bars
    const barCount = 60;
    const barWidth = width / barCount;
    
    for (let i = 0; i < barCount; i++) {
      const x = i * barWidth;
      const normalizedX = i / barCount;
      
      const barHeight =
        Math.abs(Math.sin(normalizedX * Math.PI * 4 + t * 3)) *
        (isRobotSpeaking ? 50 : 30) *
        Math.sin(normalizedX * Math.PI);

      const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
      
      if (isRobotSpeaking) {
        gradient.addColorStop(0, "rgba(168, 85, 247, 0.9)");
        gradient.addColorStop(0.5, "rgba(0, 212, 255, 0.6)");
        gradient.addColorStop(1, "rgba(168, 85, 247, 0.9)");
      } else {
        gradient.addColorStop(0, "rgba(0, 212, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.5)");
        gradient.addColorStop(1, "rgba(0, 212, 255, 0.8)");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(x + barWidth * 0.2, centerY - barHeight / 2, barWidth * 0.6, barHeight);
    }

    animFrameRef.current = requestAnimationFrame(draw);
  }, [isActive, isRobotSpeaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    if (isActive) {
      draw();
    } else {
      draw(); // Draw idle state
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [isActive, draw]);

  return (
    <motion.div
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: "crisp-edges" }}
      />
    </motion.div>
  );
}
