'use client';

import React, { useState } from 'react';
import { Message } from '@/types/schema';
import { CANNED_TEMPLATES } from '@/lib/constants/templates';
import { X, Send, Sparkles, MessageSquare, Ship, User, ShieldAlert } from 'lucide-react';

interface ReplyModalProps {
  message: Message | null;
  onClose: () => void;
  onSendReply: (messageId: string, replyText: string) => Promise<void>;
}

export function ReplyModal({ message, onClose, onSendReply }: ReplyModalProps) {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!message) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    await onSendReply(message.id, replyText.trim());
    setIsSending(false);
    setReplyText('');
    onClose();
  };

  const handleSelectTemplate = (text: string) => {
    setReplyText(text);
  };

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 fill-orange-500/20" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Reply to {message.senderName} ({message.senderRole})
              </h3>
              <p className="text-[11px] text-slate-400">
                Incident #{message.id} • {message.locationName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-stone-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Original Incident Snippet */}
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-xs">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Distress Report
            </div>
            <p className="text-slate-800 italic">&ldquo;{message.message}&rdquo;</p>
          </div>

          {/* Existing Thread Replies if any */}
          {message.replies && message.replies.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Conversation History
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {message.replies.map((rep) => (
                  <div key={rep.id} className="bg-orange-50/70 border border-orange-100 rounded-lg p-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-orange-800 font-semibold mb-0.5">
                      <span>{rep.senderName}</span>
                      <span>{new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-700">{rep.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Canned Quick Templates */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Quick Emergency Dispatch Templates</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {CANNED_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.text)}
                  className="w-full text-left p-2 rounded-lg border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-xs text-slate-700 cursor-pointer"
                >
                  <div className="font-semibold text-slate-900 text-[11px] flex items-center justify-between">
                    <span>{tpl.label}</span>
                    <span className="text-[9px] bg-stone-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Textarea */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Instruction / Response
              </label>
              <textarea
                rows={3}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type emergency instructions, ETA, or guidance to send over the mesh channel..."
                className="w-full text-xs rounded-xl border border-stone-200 p-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!replyText.trim() || isSending}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Transmitting...' : 'Send Dispatch'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
