"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { translations } from '@/lib/translations';

export function LoadingAnalysis() {
  const [msgIndex, setMsgIndex] = useState(0);
  const { language } = useAppStore();
  const t = translations[language || 'en'];

  const messages = [
    t.loadingMapping,
    t.loadingComparing,
    t.loadingRoadmap,
    t.loadingFinalizing
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-8">
      <motion.div 
        className="w-16 h-16 rounded-full bg-accentPrimaryLight flex items-center justify-center"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-8 h-8 rounded-full bg-accentPrimary" />
      </motion.div>
      <div className="h-8 overflow-hidden relative w-full text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-textSecondary text-lg font-medium"
          >
            {messages[msgIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
