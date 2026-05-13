'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, MoreVertical, CheckCheck, Check, Info, Star, TrendingUp, Users } from 'lucide-react';
import PlatformBadge from '@/src/components/ui/PlatformBadge';
import StatusBadge from '@/src/components/ui/StatusBadge';

interface Conversation {
  id: string; with: string; withRole: 'creator'; avatar: string;
  campaign: string; campaignId: string; platform: string;
  lastMessage: string; lastMessageTime: string; unread: number;
  status: 'active' | 'completed' | 'pending'; online: boolean;
  followers: number; engagementRate: number;
}

interface Message {
  id: string; sender: 'me' | 'them'; content: string; time: string;
  status: 'sent' | 'delivered' | 'read'; type: 'text' | 'file' | 'image';
  fileName?: string; fileSize?: string;
}

const conversations: Conversation[] = [
  { id: 'bconv-001', with: 'Sofia Martinez', withRole: 'creator', avatar: 'SM', campaign: 'Summer Glow Skincare Launch', campaignId: 'camp-b001', platform: 'Instagram', lastMessage: 'I filmed a draft reel yesterday. Let me know what you think!', lastMessageTime: '10:42 AM', unread: 2, status: 'active', online: true, followers: 48200, engagementRate: 5.2 },
  { id: 'bconv-002', with: 'Jordan Osei', withRole: 'creator', avatar: 'JO', campaign: 'FitPro App — 30-Day Challenge', campaignId: 'camp-b002', platform: 'YouTube', lastMessage: 'The video is performing really well! 48K views in 48 hours.', lastMessageTime: 'Yesterday', unread: 0, status: 'active', online: false, followers: 74200, engagementRate: 6.3 },
  { id: 'bconv-003', with: 'Priya Nair', withRole: 'creator', avatar: 'PN', campaign: 'Summer Glow Skincare Launch', campaignId: 'camp-b001', platform: 'Instagram', lastMessage: 'Can you send over the product brief again? I want to double-check.', lastMessageTime: 'Yesterday', unread: 1, status: 'active', online: true, followers: 92100, engagementRate: 4.1 },
  { id: 'bconv-004', with: 'Kavya Reddy', withRole: 'creator', avatar: 'KR', campaign: 'NomadPay Travel Creator Push', campaignId: 'camp-b005', platform: 'Instagram', lastMessage: 'Please review and sign the updated content agreement.', lastMessageTime: 'Apr 12', unread: 0, status: 'pending', online: false, followers: 55000, engagementRate: 4.8 },
  { id: 'bconv-005', with: 'Aisha Okonkwo', withRole: 'creator', avatar: 'AO', campaign: 'Summer Glow Skincare Launch', campaignId: 'camp-b001', platform: 'Instagram', lastMessage: 'Payment has been confirmed. Thank you for the collaboration!', lastMessageTime: 'Apr 11', unread: 0, status: 'completed', online: false, followers: 31500, engagementRate: 6.8 },
  { id: 'bconv-006', with: 'Marcus Webb', withRole: 'creator', avatar: 'MW', campaign: 'FitPro App — 30-Day Challenge', campaignId: 'camp-b002', platform: 'YouTube', lastMessage: 'I can have the first video ready by April 25th. Is that okay?', lastMessageTime: 'Apr 10', unread: 0, status: 'active', online: false, followers: 18500, engagementRate: 5.9 },
];

const messagesByConv: Record<string, Message[]> = {
  'bconv-001': [
    { id: 'bm-001-1', sender: 'me', content: 'Hi Sofia! We reviewed your application and love your content style. We\'d like to invite you to our Summer Glow campaign!', time: '9:15 AM', status: 'read', type: 'text' },
    { id: 'bm-001-2', sender: 'them', content: 'Thank you so much! I\'m really excited about this collaboration. I\'ve been a fan of your brand for a while.', time: '9:28 AM', status: 'read', type: 'text' },
    { id: 'bm-001-3', sender: 'me', content: 'Perfect! Here\'s the campaign brief and the product we\'ll be sending over.', time: '9:35 AM', status: 'read', type: 'file', fileName: 'Summer_Glow_Brief_2026.pdf', fileSize: '2.4 MB' },
    { id: 'bm-001-4', sender: 'them', content: 'Got it! Quick question — can I incorporate my usual morning routine format, or do you need a specific structure?', time: '10:02 AM', status: 'read', type: 'text' },
    { id: 'bm-001-5', sender: 'me', content: 'Your morning routine format is perfect — that\'s exactly why we picked you! Just make sure to show the product within the first 10 seconds.', time: '10:18 AM', status: 'read', type: 'text' },
    { id: 'bm-001-6', sender: 'them', content: 'I filmed a draft reel yesterday. Let me know what you think!', time: '10:42 AM', status: 'delivered', type: 'text' },
  ],
};

export default function BrandMessagesContent() {
  const [activeConvId, setActiveConvId] = useState<string>('bconv-001');
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
      id: `bm-${activeConvId}-${activeMessages.length + 1}`,
      sender: 'me', content: message.trim(), time: 'Just now', status: 'sent', type: 'text',
    };
    setMessages(prev => ({ ...prev, [activeConvId]: [...(prev[activeConvId] ?? []), newMsg] }));
    setMessage('');
  };

  return (
    <div className="pb-8">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Communicate with your creators across all campaigns</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" style={{ height: '72vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-72 border-r border-slate-100 flex flex-col flex-shrink-0">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search creators..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredConvs.map(conv => (
                <button key={conv.id} onClick={() => setActiveConvId(conv.id)} className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-colors hover:bg-slate-50 ${activeConvId === conv.id ? 'bg-violet-50 border-l-2 border-l-violet-500' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                        <span className="text-violet-700 text-xs font-bold">{conv.avatar}</span>
                      </div>
                      {conv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-slate-800 truncate">{conv.with}</p>
                        <span className="text-xs text-slate-400 flex-shrink-0 ml-1">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mb-1">{conv.lastMessage}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-violet-600 truncate">{conv.campaign}</span>
                        {conv.unread > 0 && <span className="bg-violet-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold flex-shrink-0 ml-1">{conv.unread}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          {activeConv ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center">
                      <span className="text-violet-700 text-xs font-bold">{activeConv.avatar}</span>
                    </div>
                    {activeConv.online && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{activeConv.with}</p>
                      <StatusBadge status={activeConv.status} />
                    </div>
                    <p className="text-xs text-slate-400">{activeConv.campaign}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={activeConv.platform} />
                  <button onClick={() => setShowInfo(!showInfo)} className={`p-1.5 rounded-lg transition-colors ${showInfo ? 'bg-violet-50 text-violet-600' : 'hover:bg-slate-100 text-slate-500'}`}><Info size={16} /></button>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"><MoreVertical size={16} /></button>
                </div>
              </div>

              <div className="flex flex-1 min-h-0">
                {/* Messages */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {activeMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'them' && (
                          <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center mr-2 flex-shrink-0 self-end">
                            <span className="text-violet-700 text-xs font-bold">{activeConv.avatar}</span>
                          </div>
                        )}
                        <div className={`max-w-xs lg:max-w-sm ${msg.sender === 'me' ? 'items-end' : 'items-start'} flex flex-col`}>
                          {msg.type === 'file' ? (
                            <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.sender === 'me' ? 'bg-white/20' : 'bg-white'}`}>
                                <Paperclip size={14} className={msg.sender === 'me' ? 'text-white' : 'text-slate-600'} />
                              </div>
                              <div>
                                <p className="text-xs font-medium">{msg.fileName}</p>
                                <p className={`text-xs ${msg.sender === 'me' ? 'text-violet-200' : 'text-slate-400'}`}>{msg.fileSize}</p>
                              </div>
                            </div>
                          ) : (
                            <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.sender === 'me' ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                              {msg.content}
                            </div>
                          )}
                          <div className={`flex items-center gap-1 mt-1 ${msg.sender === 'me' ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs text-slate-400">{msg.time}</span>
                            {msg.sender === 'me' && (msg.status === 'read' ? <CheckCheck size={12} className="text-violet-500" /> : <Check size={12} className="text-slate-400" />)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="px-4 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors flex-shrink-0"><Paperclip size={16} /></button>
                      <input
                        type="text"
                        placeholder={`Message ${activeConv.with}...`}
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
                      />
                      <button onClick={sendMessage} disabled={!message.trim()} className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white rounded-xl transition-colors flex-shrink-0"><Send size={15} /></button>
                    </div>
                  </div>
                </div>

                {/* Creator info panel */}
                {showInfo && (
                  <div className="w-64 border-l border-slate-100 p-4 overflow-y-auto flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Creator Profile</p>
                    <div className="flex flex-col items-center mb-4">
                      <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mb-2">
                        <span className="text-violet-700 text-lg font-bold">{activeConv.avatar}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{activeConv.with}</p>
                      <PlatformBadge platform={activeConv.platform} />
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1"><Users size={12} className="text-slate-400" /><p className="text-xs text-slate-500">Followers</p></div>
                        <p className="text-sm font-bold text-slate-800">{(activeConv.followers / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1"><TrendingUp size={12} className="text-slate-400" /><p className="text-xs text-slate-500">Engagement Rate</p></div>
                        <p className="text-sm font-bold text-emerald-700">{activeConv.engagementRate}%</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1"><Star size={12} className="text-slate-400" /><p className="text-xs text-slate-500">Campaign</p></div>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">{activeConv.campaign}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3"><Search size={22} className="text-slate-400" /></div>
                <p className="text-slate-600 font-medium">Select a conversation</p>
                <p className="text-slate-400 text-sm mt-1">Choose a creator to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
