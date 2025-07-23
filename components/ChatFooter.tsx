'use client';

import { useState } from 'react';
import { SendIcon, MicIcon, MicOffIcon } from 'lucide-react';

interface ChatFooterProps {
  onSendMessage?: (message: string) => void;
  onVoiceToggle?: (isRecording: boolean) => void;
  isRecording?: boolean;
}

export default function ChatFooter({ onSendMessage, onVoiceToggle, isRecording = false }: ChatFooterProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSendMessage) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVoiceToggle = () => {
    const newRecordingState = !isRecording;
    if (onVoiceToggle) {
      onVoiceToggle(newRecordingState);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-sage-100">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end space-x-3">
          {/* Voice Button */}
          <button
            onClick={handleVoiceToggle}
            className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                : 'bg-sage-100 text-sage-600 hover:bg-sage-200'
            }`}
            aria-label={isRecording ? 'Parar gravação' : 'Iniciar gravação'}
          >
            {isRecording ? (
              <MicOffIcon size={20} />
            ) : (
              <MicIcon size={20} />
            )}
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem ou comando..."
              className="w-full px-4 py-3 pr-12 rounded-xl border border-sage-200 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all duration-200 max-h-32"
              rows={1}
              style={{
                minHeight: '48px',
                height: Math.min(Math.max(48, message.split('\n').length * 24), 128) + 'px'
              }}
            />
            
            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                message.trim()
                  ? 'bg-sage-500 text-white hover:bg-sage-600 shadow-md'
                  : 'bg-sage-100 text-sage-400 cursor-not-allowed'
              }`}
              aria-label="Enviar mensagem"
            >
              <SendIcon size={18} />
            </button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-2 text-xs text-sage-500 text-center">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </div>
      </div>
    </div>
  );
}