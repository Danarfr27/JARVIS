import { motion, AnimatePresence } from "framer-motion";
import { AudioWaveform } from "./AudioWaveform";

interface RobotHeadProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export function RobotHead({ isListening, isSpeaking }: RobotHeadProps) {
  const isActive = isListening || isSpeaking;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(0,212,255,0.1)]"
        animate={
          isActive
            ? {
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
                borderColor: [
                  "rgba(0, 212, 255, 0.1)",
                  "rgba(0, 212, 255, 0.3)",
                  "rgba(0, 212, 255, 0.1)",
                ],
              }
            : {
                scale: 1,
                opacity: 0.2,
                rotate: 360,
              }
        }
        transition={
          isActive
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 20, repeat: Infinity, ease: "linear" }
        }
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full border border-[rgba(168,85,247,0.08)]"
        animate={
          isActive
            ? {
                scale: [1.1, 1, 1.1],
                opacity: [0.2, 0.4, 0.2],
              }
            : {
                scale: 1.1,
                opacity: 0.1,
                rotate: -360,
              }
        }
        transition={
          isActive
            ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 25, repeat: Infinity, ease: "linear" }
        }
      />

      {/* Orbital dots */}
      {isActive && (
        <>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`orbit-${i}`}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? "#00d4ff" : "#a855f7",
                boxShadow: `0 0 10px ${i % 2 === 0 ? "#00d4ff" : "#a855f7"}`,
              }}
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.5,
              }}
            >
              <div
                className="absolute"
                style={{
                  width: 180 + i * 30,
                  height: 180 + i * 30,
                  top: -(90 + i * 15),
                  left: -(90 + i * 15),
                }}
              />
            </motion.div>
          ))}
        </>
      )}

      {/* Ripple effects when speaking */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`ripple-${i}`}
                initial={{ scale: 0.8, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
                className="absolute w-[200px] h-[200px] rounded-full border-2 border-purple-400"
                style={{
                  boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Robot head image */}
      <motion.div
        className={`relative z-10 ${isActive ? "robot-float" : ""}`}
        animate={
          isSpeaking
            ? {
                filter: [
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))",
                  "drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))",
                  "drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))",
                ],
              }
            : isListening
            ? {
                filter: [
                  "drop-shadow(0 0 15px rgba(0, 212, 255, 0.4))",
                  "drop-shadow(0 0 30px rgba(0, 212, 255, 0.7))",
                  "drop-shadow(0 0 15px rgba(0, 212, 255, 0.4))",
                ],
              }
            : {
                filter: "drop-shadow(0 0 10px rgba(0, 212, 255, 0.2))",
              }
        }
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.img
          src="/robot-head.png"
          alt="AI Assistant"
          className="w-[200px] h-[200px] object-contain"
          animate={
            isSpeaking
              ? { scale: [1, 1.02, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Hologram overlay lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full">
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Status text below robot */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.p
          className={`text-xs font-bold tracking-[0.3em] uppercase ${
            isSpeaking
              ? "text-purple-400 text-glow-purple"
              : isListening
              ? "text-cyan-400 text-glow-cyan"
              : "text-[rgba(0,212,255,0.4)]"
          }`}
          animate={
            isActive
              ? { opacity: [0.7, 1, 0.7] }
              : { opacity: 0.5 }
          }
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isSpeaking
            ? "Speaking..."
            : isListening
            ? "Listening..."
            : "Standby"}
        </motion.p>
      </motion.div>

      {/* Audio Waveform below */}
      <div className="mt-4 w-[300px] h-[60px]">
        <AudioWaveform isActive={isActive} isRobotSpeaking={isSpeaking} />
      </div>
    </div>
  );
}


