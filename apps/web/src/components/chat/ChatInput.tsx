'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Image, Globe, Send, Mic, Square } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  isLoading?: boolean;
  onAttachFile?: () => void;
  onAttachImage?: () => void;
  onWebSearch?: () => void;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  isLoading = false,
  onAttachFile,
  onAttachImage,
  onWebSearch,
  placeholder = "Imagine Something...✦˚ (Press Enter to send, Shift+Enter for new line)"
}: ChatInputProps): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || disabled || isLoading) return;
    onSend();
  };

  return (
    <StyledWrapper>
      <div className="container_ai_chat_input">
        <div className="container-chat-options">
          <div className="chat">
            <div className="chat-bot">
              <div className="avatar-section">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/ai-avatar.png" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              </div>
              <textarea
                ref={textareaRef}
                id="ai_chat_input"
                name="chat_input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={onKeyPress}
                disabled={disabled}
                className="chat-textarea"
              />
            </div>
            <div className="options">
              <div className="btns-add">
                {onAttachFile && (
                  <button
                    type="button"
                    onClick={onAttachFile}
                    disabled={disabled}
                    title="Attach File"
                  >
                    <Paperclip size={20} />
                  </button>
                )}
                {onAttachImage && (
                  <button
                    type="button"
                    onClick={onAttachImage}
                    disabled={disabled}
                    title="Attach Image"
                  >
                    <Image size={20} />
                  </button>
                )}
                {onWebSearch && (
                  <button
                    type="button"
                    onClick={onWebSearch}
                    disabled={disabled}
                    title="Web Search"
                  >
                    <Globe size={20} />
                  </button>
                )}
              </div>
              <button
                type="button"
                className="btn-submit"
                onClick={handleSend}
                disabled={disabled || !value.trim()}
                title={isLoading ? "Stop Generation" : "Send Message"}
              >
                <div className="icon">
                  {isLoading ? (
                    <Square size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="tags">
          <span onClick={() => onChange("Create an image of ")}>Create An Image</span>
          <span onClick={() => onChange("Analyze this data: ")}>Analyse Data</span>
          <span onClick={() => onChange("Help me with ")}>More</span>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container_ai_chat_input {
    display: flex;
    flex-direction: column;
    max-width: 100%;
    width: 100%;
    margin: 0 auto;
  }

  .container_ai_chat_input .container-chat-options {
    position: relative;
    display: flex;
    background: linear-gradient(
      to bottom right,
      #7e7e7e,
      #363636,
      #363636,
      #363636,
      #363636
    );
    border-radius: 16px;
    padding: 1.5px;
    overflow: hidden;

    &::after {
      position: absolute;
      content: "";
      top: -10px;
      left: -10px;
      background: radial-gradient(
        ellipse at center,
        #ffffff,
        rgba(255, 255, 255, 0.3),
        rgba(255, 255, 255, 0.1),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0),
        rgba(0, 0, 0, 0)
      );
      width: 30px;
      height: 30px;
      filter: blur(1px);
    }
  }

  .container_ai_chat_input .container-chat-options .chat {
    display: flex;
    flex-direction: column;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    width: 100%;
    overflow: hidden;
  }

  .container_ai_chat_input .container-chat-options .chat .chat-bot {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
  }

  .avatar-section {
    flex-shrink: 0;
    padding-top: 4px;
  }

  .chat-textarea {
    background-color: transparent;
    border-radius: 16px;
    border: none;
    width: 100%;
    min-height: 50px;
    max-height: 120px;
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    font-size: 14px;
    font-weight: 400;
    padding: 8px 0;
    resize: none;
    outline: none;
    line-height: 1.5;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
      cursor: pointer;
    }

    &::placeholder {
      color: #ffffff;
      opacity: 0.8;
      transition: all 0.3s ease;
    }
    
    &:focus::placeholder {
      opacity: 0.6;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .container_ai_chat_input .chat .options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px 12px;
  }

  .container_ai_chat_input .chat .options .btns-add {
    display: flex;
    gap: 8px;

    & button {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.4);
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 8px;
      border-radius: 8px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        color: rgba(255, 255, 255, 0.8);
        background-color: rgba(255, 255, 255, 0.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
        transform: none;
      }
    }
  }

  .container_ai_chat_input .chat .options .btn-submit {
    display: flex;
    padding: 2px;
    background-image: linear-gradient(to top, #292929, #555555, #292929);
    border-radius: 12px;
    box-shadow: 
      inset 0 4px 2px rgba(0, 0, 0, 0.3), 
      inset 0 -4px 2px rgba(255, 255, 255, 0.2);
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      transform: scale(1.05);
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    & .icon {
      width: 32px;
      height: 32px;
      padding: 8px;
      background: linear-gradient(to bottom, #333333, #222222);
      border-radius: 10px;
      color: #8e8b8b;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    &:hover:not(:disabled) .icon {
      color: #f3f3f3;
    }

    &:focus:not(:disabled) .icon {
      color: #ffffff;
    }
  }

  .container_ai_chat_input .tags {
    padding: 14px 0;
    display: flex;
    color: #ffffff;
    font-size: 11px;
    gap: 6px;
    flex-wrap: wrap;

    & span {
      padding: 6px 12px;
      background-color: #1b1b1b;
      border: 1.5px solid #363636;
      border-radius: 12px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background-color: #2a2a2a;
        border-color: #4a4a4a;
        transform: translateY(-1px);
      }

      &:active {
        transform: scale(0.98);
      }
    }
  }

  /* Dark theme adjustments */
  @media (prefers-color-scheme: dark) {
    .container_ai_chat_input .tags span {
      background-color: #2a2a2a;
      border-color: #4a4a4a;
      
      &:hover {
        background-color: #3a3a3a;
        border-color: #5a5a5a;
      }
    }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .container_ai_chat_input {
      max-width: 100%;
    }

    .container_ai_chat_input .tags {
      font-size: 10px;
      gap: 4px;
      
      & span {
        padding: 4px 8px;
      }
    }

    .container_ai_chat_input .chat .options .btns-add {
      gap: 4px;
      
      & button {
        padding: 6px;
      }
    }
  }
`; 