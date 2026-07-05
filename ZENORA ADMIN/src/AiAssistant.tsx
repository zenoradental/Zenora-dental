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
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('Listening...');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (final) {
          const result = final.toLowerCase();
          setTranscript(result);
          handleCommand(result);
        } else if (interim) {
          setTranscript(interim + '...');
        }
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
      
      // Prevent garbage collection bug in Chrome
      (window as any).utterances = (window as any).utterances || [];
      (window as any).utterances.push(utterance);
      
      utterance.onend = () => {
        // Cleanup after speaking
        const index = (window as any).utterances.indexOf(utterance);
        if (index > -1) {
          (window as any).utterances.splice(index, 1);
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCommand = async (text: string) => {
    let response = '';

    if (text.includes('priority') || text.includes('urgent')) {
      onCommand('filter_priority');
      response = "Certainly. Filtering patient database for high-priority leads immediately.";
    } else if (text.includes('search for') || text.includes('find')) {
      const searchTerms = text.replace('search for', '').replace('find', '').trim();
      onCommand('search', searchTerms);
      response = `Initializing search parameters for ${searchTerms}.`;
    } else if (text.includes('dashboard') || text.includes('home')) {
      onCommand('navigate', 'dashboard');
      response = "Redirecting to main dashboard.";
    } else if (text.includes('command center') || text.includes('live')) {
      onCommand('navigate', 'command-center');
      response = "Accessing Live Command Center.";
    } else if (text.includes('hello') || text.includes('hi')) {
      response = "Zenora Systems online. Good day, Doctor. How may I assist with your clinic operations?";
    } else if (text.includes('how many patients') || text.includes('patients today')) {
      response = "Your itinerary indicates multiple scheduled consultations today. Shall I load the Command Center for a comprehensive review?";
    } else if (text.includes('your name') || text.includes('who are you')) {
      response = "I am Zenora AI, a clinical management system engineered to optimize your workflow and patient care.";
    } else {
      // Try to be smart and answer general or medical questions!
      try {
        let query = text.replace(/what is|who is|tell me about|explain|do you know/gi, '').trim();
        query = query.replace(/^(a|an|the)\s+/i, '').trim();
        
        if (query.length > 2) {
          // 1. Search Wikipedia for the best matching article title
          const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.query?.search?.length > 0) {
              const exactTitle = searchData.query.search[0].title;
              
              // 2. Fetch the summary for that exact title
              const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(exactTitle)}`);
              if (res.ok) {
                const data = await res.json();
                if (data.extract) {
                  // Get the first sentence for a concise AI response
                  response = data.extract.split('. ')[0] + ".";
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Wikipedia API failed", e);
      }
      
      if (!response) {
        response = "I could not find clinical records or reference data matching your query, Doctor. Please specify a valid directive.";
      }
    }

    if (response) {
      speak(response);
    }
  };

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1); // Slide up to A6
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio beep failed", e);
    }
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        playBeep();
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Microphone error", e);
      }
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
