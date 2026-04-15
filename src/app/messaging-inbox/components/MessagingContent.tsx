'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, Video, CheckCheck, Check, Image, FileText, Info, ExternalLink } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import StatusBadge from '@/src/components/ui/StatusBadge';

interface Conversation {
  id: string;
  with: string;
  withRole: 'brand' | 'creator';
  avatar: string;
  campaign: string;
  campaignId: string;
  platform: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  status: 'active' | 'completed' | 'pending';
  online: boolean;
}

interface Message {
  id: string;
  sender: 'me' | 'them';
  content: string;
  time: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: string;
}

const conversations: Conversation[] = [
  { id: 'conv-001', with: 'Luminary Skincare', withRole: 'brand', avatar: 'LS', campaign: 'Summer Glow Skincare Launch', campaignId: 'camp-001', platform: 'Instagram', lastMessage: 'Great! We loved the draft reel you shared. Just a few minor tweaks...', lastMessageTime: '10:42 AM', unread: 2, status: 'active', online: true },
  { id: 'conv-002', with: 'FitPro Health', withRole: 'brand', avatar: 'FP', campaign: 'FitPro App — 30-Day Challenge', campaignId: 'camp-002', platform: 'YouTube', lastMessage: 'The video is performing really well! 48K views in 48 hours.', lastMessageTime: 'Yesterday', unread: 0, status: 'active', online: false },
  { id: 'conv-003', with: 'TechDrop', withRole: 'brand', avatar: 'TD', campaign: 'TechDrop Wireless Earbuds Review', campaignId: 'camp-003', platform: 'YouTube', lastMessage: 'Can you send over the raw footage as well?', lastMessageTime: 'Yesterday', unread: 1, status: 'active', online: true },
  { id: 'conv-004', with: 'StyleForward', withRole: 'brand', avatar: 'SF', campaign: 'Fall Collection Drop', campaignId: 'camp-006', platform: 'Instagram', lastMessage: 'Please review and sign the updated content agreement.', lastMessageTime: 'Apr 12', unread: 0, status: 'pending', online: false },
  { id: 'conv-005', with: 'NomadPay', withRole: 'brand', avatar: 'NP', campaign: 'Wanderlust Travel Card Launch', campaignId: 'camp-004', platform: 'Instagram', lastMessage: 'Payment has been released to your wallet. Thank you!', lastMessageTime: 'Apr 11', unread: 0, status: 'completed', online: false },
  { id: 'conv-006', with: 'Harvest Kitchen', withRole: 'brand', avatar: 'HK', campaign: 'Home Chef Series', campaignId: 'camp-005', platform: 'TikTok', lastMessage: 'We need the first video by April 25th. Is that doable?', lastMessageTime: 'Apr 10', unread: 0, status: 'active', online: false },
  { id: 'conv-007', with: 'MindClear', withRole: 'brand', avatar: 'MC', campaign: 'MindClear Meditation App', campaignId: 'camp-009', platform: 'Instagram', lastMessage: 'Your content was approved! Escrow will be released today.', lastMessageTime: 'Apr 8', unread: 0, status: 'completed', online: false },
  { id: 'conv-008', with: 'GameVault', withRole: 'brand', avatar: 'GV', campaign: 'GameVault Pro Controller', campaignId: 'camp-008', platform: 'TikTok', lastMessage: 'Can you include the discount code GVPRO20 in the caption?', lastMessageTime: 'Apr 7', unread: 0, status: 'active', online: true },
];

const messagesByConv: Record<string, Message[]> = {
  'conv-001': [
    { id: 'msg-001-1', sender: 'them', content: 'Hi Sofia! Thanks for applying to our Summer Glow campaign. We reviewed your profile and love your aesthetic!', time: '9:15 AM', status: 'read', type: 'text' },
    { id: 'msg-001-2', sender: 'me', content: "Thank you so much! I'm really excited about this collaboration. I've been a fan of Luminary for a while.", time: '9:28 AM', status: 'read', type: 'text' },
    { id: 'msg-001-3', sender: 'them', content: "Perfect! Here's the campaign brief and the product we'll be sending over.", time: '9:35 AM', status: 'read', type: 'file', fileName: 'Summer_Glow_Brief_2026.pdf', fileSize: '2.4 MB' },
    { id: 'msg-001-4', sender: 'me', content: "Got it, I'll review this today. Quick question — can I incorporate my usual morning routine format, or do you need a specific structure?", time: '10:02 AM', status: 'read', type: 'text' },
    { id: 'msg-001-5', sender: 'them', content: "Your morning routine format is perfect — that's exactly why we picked you! Just make sure to show the product within the first 10 seconds.", time: '10:18 AM', status: 'read', type: 'text' },
    { id: 'msg-001-6', sender: 'me', content: 'Understood! I filmed a draft reel yesterday. Let me know what you think.', time: '10:31 AM', status: 'read', type: 'text' },
    { id: 'msg-001-7', sender: 'me', content: '', time: '10:32 AM', status: 'read', type: 'image', fileName: 'draft_reel_preview.mp4', fileSize: '18.2 MB' },
    { id: 'msg-001-8', sender: 'them', content: 'Great! We loved the draft reel you shared. Just a few minor tweaks — can you add more focus on the texture when applying? And maybe a voiceover explaining the benefits?', time: '10:42 AM', status: 'delivered', type: 'text' },
  ],
};

export default function MessagingContent() {
  const [activeConvId, setActiveConvId] = useState<string>('conv-001');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, Message[]>>(messagesByConv);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeConvId);
  const activeMessages = messages[activeConvId] ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, messages]);

  const filteredConvs = conversations.filter(c =>
    c.with.toLowerCase().includes(search.toLowerCase()) ||
    c.campaign.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: Message = {
      id: `msg-${activeConvId}-${Date.now()}`,
      sender: 'me',
      content: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      status: 'sent',
      type: 'text',
    };
    setMessages(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] ?? []), newMsg] }));
    setMessage('');
    // BACKEND: WebSocket emit / POST /api/messages { conversationId: activeConvId, content: message }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const StatusIcon = ({ status }: { status: Message['status'] }) => {
    if (status === 'read') return <CheckCheck size={12} className="text-blue-500" />;
    if (status === 'delivered') return <CheckCheck size={12} className="text-slate-400" />;
    return <Check size={12} className="text-slate-400" />;
  };

  return (
    <div className="h-[calc(100vh-48px)] flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-card">
      {/* Conversation list */}
      <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Messages</h2>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-slate-50">
          {filteredConvs.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConvId(conv.id)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${activeConvId === conv.id ? 'bg-violet-50 border-r-2 border-r-violet-600' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-700 text-xs font-bold">{conv.avatar}</span>
                  </div>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                      {conv.with}
                    </p>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{conv.lastMessageTime}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1">{conv.campaign}</p>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate flex-1 ${conv.unread > 0 ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 bg-violet-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message thread */}
      {activeConv ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Thread header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-700 text-xs font-bold">{activeConv.avatar}</span>
                </div>
                {activeConv.online && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{activeConv.with}</p>
                  <span className={`text-xs ${activeConv.online ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {activeConv.online ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PlatformBadge platform={activeConv.platform} />
                  <span className="text-xs text-slate-400 truncate max-w-xs">{activeConv.campaign}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500" title="Start video call">
                <Video size={16} />
              </button>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-lg transition-colors text-slate-500 ${showInfo ? 'bg-violet-50 text-violet-600' : 'hover:bg-slate-100'}`}
                title="Campaign info"
              >
                <Info size={16} />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500" title="More options">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3 bg-slate-50/30">
            {activeMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mb-3">
                  <span className="text-violet-700 text-sm font-bold">{activeConv.avatar}</span>
                </div>
                <p className="text-slate-600 font-medium text-sm">{activeConv.with}</p>
                <p className="text-slate-400 text-xs mt-1">Start the conversation about {activeConv.campaign}</p>
              </div>
            ) : (
              activeMessages.map((msg, idx) => {
                const isMe = msg.sender === 'me';
                const prevMsg = idx > 0 ? activeMessages[idx - 1] : null;
                const showTime = !prevMsg || prevMsg.sender !== msg.sender;

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {msg.type === 'text' && (
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-violet-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-card'
                        }`}>
                          {msg.content}
                        </div>
                      )}
                      {(msg.type === 'file' || msg.type === 'image') && (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                          isMe ? 'bg-violet-50 border-violet-200' : 'bg-white border-slate-200 shadow-card'
                        }`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isMe ? 'bg-violet-100' : 'bg-slate-100'}`}>
                            {msg.type === 'image' ? <Image size={16} className="text-violet-600" /> : <FileText size={16} className="text-slate-600" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-700">{msg.fileName}</p>
                            <p className="text-xs text-slate-400">{msg.fileSize}</p>
                          </div>
                          <button className="p-1 rounded hover:bg-slate-100 transition-colors ml-2">
                            <ExternalLink size={13} className="text-slate-400" />
                          </button>
                        </div>
                      )}
                      <div className={`flex items-center gap-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                        <span className="text-xs text-slate-400">{msg.time}</span>
                        {isMe && <StatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-3">
              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 flex-shrink-0 mb-0.5" title="Attach file">
                <Paperclip size={16} />
              </button>
              <div className="flex-1 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-500/30 focus-within:border-violet-500 transition-all">
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${activeConv.with}...`}
                  rows={1}
                  className="w-full px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none bg-white scrollbar-thin"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!message.trim()}
                className="p-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 mb-0.5"
                title="Send message"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-slate-50/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-violet-400" />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">Select a conversation</h3>
            <p className="text-slate-400 text-sm">Choose a conversation from the list to start messaging</p>
          </div>
        </div>
      )}

      {/* Campaign info panel */}
      {showInfo && activeConv && (
        <div className="w-72 flex-shrink-0 border-l border-slate-100 bg-white flex flex-col animate-slide-in-right">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Campaign Details</h3>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                <span className="text-violet-700 font-bold">{activeConv.avatar}</span>
              </div>
              <h4 className="text-sm font-semibold text-slate-800 mb-1">{activeConv.campaign}</h4>
              <p className="text-xs text-slate-500">{activeConv.with}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">Platform</span>
                <PlatformBadge platform={activeConv.platform} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadge status={activeConv.status} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">Your Rate</span>
                <span className="text-xs font-semibold text-emerald-700">$1,200</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <span className="text-xs text-slate-500">Deadline</span>
                <span className="text-xs text-slate-700">May 1, 2026</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Deliverables</p>
              <div className="space-y-1.5">
                {['2 Feed Posts', '4 Stories', '1 Reel'].map(d => (
                  <div key={`info-del-${d}`} className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    {d}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 mb-1">Escrow Status</p>
              <p className="text-xs text-amber-600">$1,200 locked — releases upon brand approval</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}