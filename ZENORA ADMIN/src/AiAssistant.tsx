import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles } from 'lucide-react';

interface AiAssistantProps {
  onCommand: (command: string, args?: string) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
      };

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript.toLowerCase();
        setTranscript(result);
        handleCommand(result);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setTranscript('Try again...');
        setTimeout(() => setTranscript(''), 2000);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setTranscript(''), 3000);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.rate = 1;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Female'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = (text: string) => {
    let response = '';

    if (text.includes('priority') || text.includes('urgent')) {
      onCommand('filter_priority');
      response = "Filtering for priority leads, Doctor.";
    } else if (text.includes('search for') || text.includes('find')) {
      const searchTerms = text.replace('search for', '').replace('find', '').trim();
      onCommand('search', searchTerms);
      response = `Searching for ${searchTerms}, Doctor.`;
    } else if (text.includes('dashboard') || text.includes('home')) {
      onCommand('navigate', 'dashboard');
      response = "Navigating to Dashboard.";
    } else if (text.includes('command center') || text.includes('live')) {
      onCommand('navigate', 'command-center');
      response = "Opening Live Command Center.";
    } else {
      response = "I heard you, but I don't recognize that command.";
    }

    if (response) {
      speak(response);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      speak("How can I help you?");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-sm font-medium shadow-lg border border-white/10"
          >
            {transcript}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListen}
        className={`relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-colors ${
          isListening 
            ? 'bg-blue-600' 
            : 'bg-zinc-900 dark:bg-white'
        }`}
      >
        {/* Pulsing ring effect */}
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-blue-500"
          />
        )}
        
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full blur-md opacity-50 ${isListening ? 'bg-blue-500' : 'bg-transparent'}`} />

        <div className="relative z-10 text-white dark:text-black">
          {isListening ? <Sparkles className="h-6 w-6 animate-pulse text-white" /> : <Mic className="h-6 w-6 dark:text-black" />}
        </div>
      </motion.button>
    </div>
  );
};

export default AiAssistant;
