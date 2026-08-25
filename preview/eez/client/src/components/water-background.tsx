import { motion } from "framer-motion";

export function WaterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 via-blue-500/30 to-cyan-600/40 dark:from-sky-900/40 dark:via-blue-900/50 dark:to-cyan-900/60" />
      
      <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
        <defs>
          <filter id="water-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
          </filter>
          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#0284c7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        style={{
          background: "radial-gradient(ellipse at center, rgba(14, 165, 233, 0.15) 0%, transparent 50%)",
        }}
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, 30, 60, 30, 0],
          scale: [1, 1.1, 1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)",
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: "radial-gradient(ellipse at 70% 80%, rgba(56, 189, 248, 0.2) 0%, transparent 40%)",
        }}
        animate={{
          opacity: [0.4, 0.2, 0.4],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(14, 165, 233, 0.1) 0%, transparent 100%)",
        }}
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 4 + Math.random() * 8,
            height: 4 + Math.random() * 8,
            left: `${20 + i * 15}%`,
            bottom: -20,
          }}
          animate={{
            y: [0, -window.innerHeight - 50],
            x: [0, (Math.random() - 0.5) * 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: i * 2,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
