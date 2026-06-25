import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, User, Bot } from "lucide-react";
import { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
}

interface TranscriptPanelProps {
  messages: Message[];
  isTyping: boolean;
}

export function TranscriptPanel({ messages, isTyping }: TranscriptPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 top-4 z-50 border-glow rounded-lg bg-[rgba(10,5,30,0.9)] backdrop-blur-md p-3 hover:bg-[rgba(10,5,30,1)] transition-all group"
      >
        <MessageSquare className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
            {messages.length}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3, type: "spring", damping: 25 }}
            className="fixed right-4 top-16 z-50 border-glow rounded-lg bg-[rgba(10,5,30,0.95)] backdrop-blur-md w-[350px] max-h-[60vh] flex flex-col corner-accent"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-[rgba(0,212,255,0.1)]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold tracking-[0.2em] text-purple-400 uppercase">
                  Conversation Log
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[rgba(0,212,255,0.5)] hover:text-cyan-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 cyberpunk-scrollbar min-h-[200px]">
              {messages.length === 0 && !isTyping && (
                <div className="text-center text-[rgba(0,212,255,0.3)] text-xs py-8">
                  Belum ada percakapan.
                  <br />
                  Klik tombol mikrofon untuk mulai.
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row" : "flex-row"}`}
                  >
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-[rgba(0,212,255,0.2)]"
                          : "bg-[rgba(168,85,247,0.2)]"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-3 h-3 text-cyan-400" />
                      ) : (
                        <Bot className="w-3 h-3 text-purple-400" />
                      )}
                    </div>
                    <div
                      className={`flex-1 rounded-lg p-2.5 text-[11px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.15)]"
                          : "bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.15)]"
                      }`}
                    >
                      <p
                        className={`${
                          msg.role === "user" ? "text-cyan-300" : "text-purple-200"
                        }`}
                      >
                        {msg.text}
                      </p>
                      <span className="text-[9px] text-[rgba(0,212,255,0.3)] mt-1 block">
                        {msg.timestamp}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[rgba(168,85,247,0.2)] flex items-center justify-center">
                    <Bot className="w-3 h-3 text-purple-400" />
                  </div>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-[rgba(0,212,255,0.1)] text-center">
              <span className="text-[9px] text-[rgba(0,212,255,0.3)]">
                {messages.length} messages
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
