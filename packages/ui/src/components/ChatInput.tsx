//# packages/ui/src/components/ChatInput.tsx

'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Image, Globe, Mic, MicOff } from 'lucide-react';
import { clsx } from 'clsx';

export interface ChatInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSend?: (message: string) => void;
  onAttachment?: () => void;
  onImageUpload?: () => void;
  onVoiceToggle?: (isRecording: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  showAttachments?: boolean;
  showVoice?: boolean;
  tags?: string[];
  onTagClick?: (tag: string) => void;
  className?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  placeholder = "Imagine Something...✦˚",
  value = "",
  onChange,
  onSend,
  onAttachment,
  onImageUpload,
  onVoiceToggle,
  disabled = false,
  loading = false,
  maxLength = 4000,
  showAttachments = true,
  showVoice = true,
  tags = ["Create An Image", "Analyse Data", "More"],
  onTagClick,
  className
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isRecording, setIsRecording] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    
    setInputValue(newValue);
    onChange?.(newValue);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || disabled || loading) return;
    
    onSend?.(inputValue);
    setInputValue("");
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    const newState = !isRecording;
    setIsRecording(newState);
    onVoiceToggle?.(newState);
  };

  const containerClasses = clsx(
    'flex flex-col max-w-md w-full',
    className
  );

  return (
    <div className={containerClasses}>
      {/* Main Chat Container */}
      <div className="relative">
        {/* Gradient Border Container */}
        <div className="relative p-[1.5px] rounded-2xl overflow-hidden">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-500 rounded-2xl" />
          
          {/* Shine effect */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-radial from-white/60 via-white/20 to-transparent rounded-full blur-sm" />
          
          {/* Inner container */}
          <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl">
            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className={clsx(
                  'w-full bg-transparent border-none outline-none resize-none',
                  'text-white text-sm font-normal p-3',
                  'placeholder:text-gray-300 placeholder:transition-colors placeholder:duration-300',
                  'min-h-[50px] max-h-32',
                  'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent',
                  isFocused && 'placeholder:text-gray-600'
                )}
                style={{
                  fontFamily: 'sans-serif'
                }}
              />
            </div>
            
            {/* Options Bar */}
            <div className="flex justify-between items-end p-3 pt-0">
              {/* Attachment Buttons */}
              {showAttachments && (
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    onClick={onAttachment}
                    disabled={disabled}
                    className="text-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Paperclip className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={onImageUpload}
                    disabled={disabled}
                    className="text-white/10 hover:text-white transition-all duration-300 disabled:opacity-50"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    className="text-white/10 hover:text-white transition-all duration-300"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe className="w-5 h-5" />
                  </motion.button>
                  
                  {showVoice && (
                    <motion.button
                      type="button"
                      onClick={handleVoiceToggle}
                      disabled={disabled}
                      className={clsx(
                        'transition-all duration-300 disabled:opacity-50',
                        isRecording ? 'text-red-400' : 'text-white/10 hover:text-white'
                      )}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </motion.button>
                  )}
                </div>
              )}
              
              {/* Send Button */}
              <motion.button
                type="button"
                onClick={handleSend}
                disabled={disabled || loading || !inputValue.trim()}
                className={clsx(
                  'relative p-2 rounded-lg transition-all duration-150',
                  'bg-gradient-to-t from-gray-700 via-gray-500 to-gray-700',
                  'shadow-inner-light border-none outline-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
                style={{
                  boxShadow: 'inset 0 6px 2px -4px rgba(255, 255, 255, 0.5)'
                }}
                whileHover={!disabled && !loading ? {
                  scale: 1.05
                } : {}}
                whileTap={!disabled && !loading ? {
                  scale: 0.92
                } : {}}
                whileFocus={{
                  boxShadow: '0 0 5px #ffffff'
                }}
              >
                <div className="w-8 h-8 p-1.5 bg-black/10 rounded-lg backdrop-blur-sm">
                  <motion.div
                    animate={loading ? {
                      rotate: 360
                    } : {}}
                    transition={loading ? {
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear"
                    } : {
                      duration: 0.3,
                      rotate: isFocused ? 45 : 0
                    }}
                  >
                    <Send 
                      className={clsx(
                        'w-full h-full transition-all duration-300',
                        inputValue.trim() && !disabled ? 'text-white drop-shadow-sm' : 'text-gray-500',
                        isFocused && 'transform translate-x-[-2px] translate-y-[1px] scale-120'
                      )}
                      style={{
                        filter: inputValue.trim() && !disabled ? 'drop-shadow(0 0 5px #ffffff)' : 'none'
                      }}
                    />
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex gap-1 pt-4">
          {tags.map((tag, index) => (
            <motion.button
              key={index}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className={clsx(
                'px-2 py-1 text-xs text-white',
                'bg-gray-900 border-[1.5px] border-gray-600',
                'rounded-lg cursor-pointer select-none',
                'hover:bg-gray-800 hover:border-gray-500',
                'transition-all duration-200'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      )}
      
      {/* Character Count */}
      {maxLength && (
        <div className="mt-2 text-right">
          <span className={clsx(
            'text-xs',
            inputValue.length > maxLength * 0.9 ? 'text-red-400' : 'text-gray-500'
          )}>
            {inputValue.length}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export { ChatInput };