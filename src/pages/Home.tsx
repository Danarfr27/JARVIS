import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, Command, Sparkles } from "lucide-react";
import { RobotHead } from "@/components/RobotHead";
import { SystemMonitor } from "@/components/SystemMonitor";
import { TranscriptPanel, type Message } from "@/components/TranscriptPanel";
import { useSpeech } from "@/hooks/useSpeech";
import { useParticles } from "@/hooks/useParticles";
import { trpc } from "@/providers/trpc";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const processedRef = useRef<string>("");
  const chatMutation = trpc.gemini.chat.useMutation();

  const {
    isListening,
    transcript,
    interimTranscript,
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isSupported,
  } = useSpeech();

  useParticles(canvasRef);

  // Hide intro after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Combine final + interim transcript
  useEffect(() => {
    const full = transcript + (interimTranscript ? " " + interimTranscript : "");
    setCurrentTranscript(full);
  }, [transcript, interimTranscript]);

  // Process completed speech
  useEffect(() => {
    if (!isListening && transcript && transcript !== processedRef.current && transcript.trim()) {
      processedRef.current = transcript;
      handleUserMessage(transcript);
    }
  }, [isListening, transcript]);

  const handleUserMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setIsProcessing(true);

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString("id-ID"),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Prepare messages for Gemini
        const chatHistory = [...messages, userMessage].map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const response = await chatMutation.mutateAsync({
          messages: chatHistory,
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: response.text,
          timestamp: new Date().toLocaleTimeString("id-ID"),
        };

        setMessages((prev) => [...prev, botMessage]);

        // Speak the response
        if (!isMuted) {
          speak(response.text);
        }
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: "Maaf, terjadi kesalahan sistem. Silakan coba lagi.",
          timestamp: new Date().toLocaleTimeString("id-ID"),
        };
        setMessages((prev) => [...prev, errorMessage]);
        if (!isMuted) {
          speak("Maaf, terjadi kesalahan sistem. Silakan coba lagi.");
        }
      } finally {
        setIsProcessing(false);
        setCurrentTranscript("");
      }
    },
    [messages, isProcessing, isMuted, speak, chatMutation]
  );

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      // Stop any ongoing speech before listening
      stopSpeaking();
      startListening();
    }
  }, [isListening, stopListening, startListening, stopSpeaking]);

  const toggleMute = useCallback(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsMuted((prev) => !prev);
  }, [isSpeaking, stopSpeaking]);

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center border-glow rounded-lg p-8 bg-[rgba(10,5,30,0.9)]">
          <Command className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-cyan-400 mb-2">
            Browser Tidak Didukung
          </h1>
          <p className="text-sm text-purple-300">
            Browser Anda tidak mendukung Web Speech API.
            <br />
            Silakan gunakan Chrome atau Edge terbaru.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-[#e0e0ff] relative overflow-hidden scanline-overlay">
      {/* Particle background */}
      <canvas
        ref={canvasRef}
        className="particles-container"
      />

      {/* Cyberpunk grid overlay */}
      <div className="fixed inset-0 cyberpunk-grid pointer-events-none z-[1]" />

      {/* Hexagon pattern */}
      <div className="fixed inset-0 hexagon-bg pointer-events-none z-[1] opacity-50" />

      {/* System Monitor */}
      <SystemMonitor />

      {/* Transcript Panel */}
      <TranscriptPanel messages={messages} isTyping={isProcessing} />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Intro Animation */}
        <AnimatePresence>
          {showIntro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-[100] bg-[#030014] flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <Sparkles className="w-16 h-16 text-cyan-400 mb-4 mx-auto" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold tracking-[0.5em] text-cyan-400 text-glow-cyan uppercase"
              >
                JARVIS AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-xs text-purple-400 mt-2 tracking-[0.3em]"
              >
                Voice Assistant System
              </motion.p>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="w-48 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
        >
          <h1 className="text-lg font-bold tracking-[0.4em] text-cyan-400 text-glow-cyan uppercase">
            JARVIS AI
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-1 h-1 rounded-full bg-cyan-400 status-pulse" />
            <span className="text-[9px] text-purple-400 tracking-[0.2em] uppercase">
              System Online
            </span>
          </div>
        </motion.div>

        {/* Robot Head - Center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col items-center"
        >
          <RobotHead isListening={isListening} isSpeaking={isSpeaking} />
        </motion.div>

        {/* Current Transcript Display */}
        <AnimatePresence>
          {(currentTranscript || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 max-w-md text-center"
            >
              <div className="border-glow rounded-lg bg-[rgba(10,5,30,0.8)] backdrop-blur-sm px-6 py-3">
                <p className="text-sm text-cyan-300 min-h-[1.5em]">
                  {isProcessing && !currentTranscript
                    ? "Memproses..."
                    : currentTranscript}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="absolute bottom-12 flex items-center gap-6"
        >
          {/* Mute Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMute}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
              isMuted
                ? "border-red-500/50 bg-[rgba(239,68,68,0.1)] text-red-400"
                : "border-[rgba(0,212,255,0.3)] bg-[rgba(0,212,255,0.08)] text-cyan-400 hover:border-cyan-400/60"
            }`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </motion.button>

          {/* Main Mic Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_30px_rgba(0,212,255,0.5),0_0_60px_rgba(0,212,255,0.3)]"
                : isProcessing
                ? "bg-gradient-to-r from-purple-600 to-purple-800 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                : "bg-gradient-to-r from-purple-500 to-cyan-500 shadow-[0_0_20px_rgba(168,85,247,0.3),0_0_40px_rgba(0,212,255,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5),0_0_60px_rgba(0,212,255,0.3)]"
            }`}
          >
            {/* Ripple effect when listening */}
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full border-2 border-cyan-400"
                />
                <motion.div
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="absolute inset-0 rounded-full border-2 border-cyan-300"
                />
              </>
            )}

            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </motion.button>

          {/* Status Indicator */}
          <div className="w-12 h-12 flex items-center justify-center">
            <div
              className={`w-3 h-3 rounded-full ${
                isListening
                  ? "bg-cyan-400 shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                  : isSpeaking
                  ? "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                  : isProcessing
                  ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                  : "bg-[rgba(0,212,255,0.2)]"
              }`}
            />
          </div>
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-4 text-[10px] text-[rgba(0,212,255,0.3)] tracking-wider"
        >
          Klik tombol mikrofon untuk mulai berbicara
        </motion.p>
      </div>
    </div>
  );
}
