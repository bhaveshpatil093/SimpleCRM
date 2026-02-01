
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useCRMStore } from '../lib/store';
import { useTranslation } from '../lib/i18n';
import { cn } from '../lib/utils';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  className?: string;
  placeholder?: string;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscription, className, placeholder }) => {
  const { language } = useCRMStore();
  const { t } = useTranslation(language);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  const startTimer = () => {
    setTimer(0);
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsRecording(true);
      startTimer();
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("");
      
      if (event.results[0].isFinal) {
        onTranscription(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error", event.error);
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    stopTimer();
  };

  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={cn(
          "p-2.5 rounded-full transition-all duration-300 flex items-center justify-center shadow-sm border",
          isRecording 
            ? "bg-red-500 text-white border-red-400 animate-pulse scale-110" 
            : "bg-slate-50 text-slate-400 border-slate-200 hover:text-primary hover:bg-white"
        )}
        title={isRecording ? t('stop') : t('recording')}
      >
        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
      </button>
      
      {isRecording && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-full animate-in slide-in-from-left-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
            {t('recording')} ({formatTime(timer)})
          </span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
