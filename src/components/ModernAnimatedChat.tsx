/**
 * Modern Animated Chat Component
 * 
 * A beautiful, animated chat interface inspired by modern chat applications
 * with smooth transitions, typing indicators, and excellent UX.
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Code,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  Zap,
  MessageSquare,
} from 'lucide-react';
import anime from 'animejs';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  tools?: string[];
  status?: 'sending' | 'sent' | 'error';
}

interface ModernAnimatedChatProps {
  onSendMessage?: (message: string) => Promise<void>;
  messages?: Message[];
  isTyping?: boolean;
  placeholder?: string;
  className?: string;
}

export const ModernAnimatedChat: React.FC<ModernAnimatedChatProps> = ({
  onSendMessage,
  messages: externalMessages,
  isTyping: externalIsTyping,
  placeholder = 'Ask me anything...',
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>(externalMessages || []);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  // Sync external messages
  useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  // Sync external typing state
  useEffect(() => {
    if (externalIsTyping !== undefined) {
      setIsTyping(externalIsTyping);
    }
  }, [externalIsTyping]);

  // Scroll to bottom with smooth animation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, isAtBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // Handle send message
  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
    setIsSending(true);

    // Animate send button
    anime({
      targets: '.send-button',
      scale: [1, 0.9, 1],
      duration: 300,
      easing: 'easeOutElastic(1, .5)',
    });

    try {
      if (onSendMessage) {
        await onSendMessage(inputValue);
      }

      // Update message status
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message content
  const copyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);

    // Animate copy button
    anime({
      targets: `[data-copy-id="${messageId}"]`,
      scale: [1, 1.2, 1],
      duration: 300,
      easing: 'easeOutElastic(1, .5)',
    });
  };

  // Scroll to bottom button
  const ScrollToBottomButton = () => {
    if (isAtBottom) return null;

    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={scrollToBottom}
        className="absolute bottom-24 right-6 z-10 p-3 rounded-full bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] text-white shadow-lg hover:shadow-xl transition-shadow"
      >
        <ChevronDown className="w-5 h-5" />
      </motion.button>
    );
  };

  return (
    <div className={cn(
      'flex flex-col h-full bg-gradient-to-br from-[#0A0E27] to-[#151A31]',
      className
    )}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2E3349] bg-[#151A31]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-semibold text-white">DeepSeek AI</h2>
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <span className="text-xs text-[#B9BBBE]">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-[#2E3349] transition-colors"
          >
            <Sparkles className="w-5 h-5 text-[#5865F2]" />
          </motion.button>
        </div>
      </header>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement;
          const isBottom =
            target.scrollHeight - target.scrollTop - target.clientHeight < 100;
          setIsAtBottom(isBottom);
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={copyMessage}
              isCopied={copiedId === message.id}
              index={index}
            />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#1E2438]">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
        <ScrollToBottomButton />
      </div>

      {/* Input Container */}
      <div className="px-6 py-4 border-t border-[#2E3349] bg-[#151A31]/80 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <motion.textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isSending}
              rows={1}
              className={cn(
                'w-full px-4 py-3 pr-12 rounded-2xl bg-[#1E2438] border-2 border-[#2E3349]',
                'text-white placeholder-[#72767D] resize-none',
                'focus:outline-none focus:border-[#5865F2] transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              whileFocus={{ 
                boxShadow: '0 0 0 4px rgba(88, 101, 242, 0.1)',
              }}
            />
            
            {/* Character count */}
            {inputValue.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute bottom-3 right-3 text-xs text-[#72767D]"
              >
                {inputValue.length}
              </motion.div>
            )}
          </div>

          <motion.button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className={cn(
              'send-button p-3 rounded-2xl flex items-center justify-center transition-all',
              'bg-gradient-to-br from-[#5865F2] to-[#7C5CFF]',
              'hover:shadow-lg hover:shadow-[#5865F2]/50',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none'
            )}
            whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
            whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <QuickAction icon={Code} label="Code" />
          <QuickAction icon={Zap} label="Workflow" />
          <QuickAction icon={MessageSquare} label="Prompt" />
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: Message;
  onCopy: (content: string, id: string) => void;
  isCopied: boolean;
  index: number;
}> = ({ message, onCopy, isCopied, index }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
        delay: index * 0.05,
      }}
      className={cn(
        'flex items-start gap-3',
        isUser && 'flex-row-reverse',
        isSystem && 'justify-center'
      )}
    >
      {!isSystem && (
        <motion.div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isUser
              ? 'bg-[#2E3349]'
              : 'bg-gradient-to-br from-[#5865F2] to-[#7C5CFF]'
          )}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </motion.div>
      )}

      <div
        className={cn(
          'group relative max-w-[70%]',
          isUser && 'items-end',
          isSystem && 'max-w-full'
        )}
      >
        <motion.div
          className={cn(
            'px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-gradient-to-br from-[#5865F2] to-[#7C5CFF] text-white'
              : isSystem
              ? 'bg-[#2E3349]/50 text-[#B9BBBE] text-center'
              : 'bg-[#1E2438] text-white'
          )}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>

          {message.tools && message.tools.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.tools.map((tool, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="px-2 py-1 rounded-lg bg-white/10 text-xs"
                >
                  <Code className="w-3 h-3 inline mr-1" />
                  {tool}
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {!isSystem && (
          <div
            className={cn(
              'flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
              isUser ? 'justify-end' : 'justify-start'
            )}
          >
            <span className="text-xs text-[#72767D]">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            
            <motion.button
              onClick={() => onCopy(message.content, message.id)}
              className="p-1 rounded hover:bg-[#2E3349] transition-colors"
              data-copy-id={message.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCopied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 text-[#72767D]" />
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Typing Dots Component
const TypingDots = () => {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#5865F2]"
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Quick Action Component
const QuickAction: React.FC<{ icon: any; label: string }> = ({ icon: Icon, label }) => {
  return (
    <motion.button
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E2438] hover:bg-[#252B45] transition-colors text-sm text-[#B9BBBE]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </motion.button>
  );
};

export default ModernAnimatedChat;
