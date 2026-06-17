'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Follower {
  id: string;
  zaloUserId: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  fullName?: string;
  department?: string;
  userType?: string;
}

interface Message {
  id: string;
  zaloUserId: string;
  direction: 'inbound' | 'outbound';
  type: string;
  content?: string;
  receivedAt: string;
}

export default function ZaloChatPortal() {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [selectedUser, setSelectedUser] = useState<Follower | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Tải danh sách người quan tâm
  useEffect(() => {
    fetch('/api/collections/zalo-followers?limit=100&sort=-followedAt', { credentials: 'include' })
      .then(r => r.json())
      .then(data => setFollowers(data.docs || []))
      .catch(() => {});
  }, []);

  // Tải lịch sử tin nhắn khi chọn người dùng
  const loadMessages = useCallback(async (userId: string) => {
    setLoadingMsg(true);
    try {
      const res = await fetch(
        `/api/collections/zalo-message-logs?where[zaloUserId][equals]=${userId}&limit=50&sort=receivedAt`,
        { credentials: 'include' }
      );
      const data = await res.json();
      setMessages(data.docs || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsg(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser.zaloUserId);
  }, [selectedUser, loadMessages]);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedUser || !newMsg.trim() || sending) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/zalo/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ zaloUserId: selectedUser.zaloUserId, message: newMsg.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewMsg('');
        setSendResult({ type: 'success', text: 'Đã gửi!' });
        // Tải lại tin nhắn
        await loadMessages(selectedUser.zaloUserId);
        setTimeout(() => setSendResult(null), 2000);
      } else {
        setSendResult({ type: 'error', text: data.error || 'Gửi thất bại.' });
      }
    } catch {
      setSendResult({ type: 'error', text: 'Không kết nối được máy chủ.' });
    } finally {
      setSending(false);
    }
  };

  const filtered = followers.filter(f => {
    const q = searchQ.toLowerCase();
    return (
      !q ||
      f.displayName?.toLowerCase().includes(q) ||
      f.fullName?.toLowerCase().includes(q) ||
      f.phone?.includes(q) ||
      f.zaloUserId.includes(q)
    );
  });

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <span className="text-3xl">💬</span> Chat CSKH Zalo
      </h2>

      <div className="grid grid-cols-[300px_1fr] gap-4 md:p-6 h-[calc(100vh-180px)] min-h-[500px]">
        {/* ── Danh sách người dùng ── */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Không tìm thấy người dùng nào.
              </div>
            ) : (
              filtered.map(f => {
                const active = selectedUser?.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedUser(f)}
                    className={`
                      flex items-center gap-3 p-3 cursor-pointer transition-all border-l-4
                      ${active ? 'bg-blue-50/50 border-blue-500' : 'border-transparent hover:bg-slate-50'}
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold text-sm overflow-hidden
                      ${f.avatarUrl ? '' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}
                    `}>
                      {f.avatarUrl 
                        ? <img src={f.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : (f.displayName?.[0] || '?').toUpperCase()
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm truncate ${active ? 'text-blue-900' : 'text-slate-700'}`}>
                        {f.displayName || f.fullName || f.zaloUserId}
                      </div>
                      <div className="text-[0.7rem] text-slate-500 truncate mt-0.5">
                        Zalo ID: {f.zaloUserId}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Khung Chat ── */}
        <div className="bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm relative">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <div className="text-6xl mb-4 opacity-50">👋</div>
              <div className="font-semibold text-lg text-slate-600 mb-2">Chọn người dùng để bắt đầu chat</div>
              <div className="text-sm">Danh sách bên trái gồm tất cả người quan tâm OA</div>
            </div>
          ) : (
            <>
              {/* Header Khung Chat (Glassmorphism) */}
              <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-4 bg-white/90 backdrop-blur-md sticky top-0 z-10">
                <div className={`
                  w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-semibold overflow-hidden shadow-sm
                  ${selectedUser.avatarUrl ? '' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}
                `}>
                  {selectedUser.avatarUrl 
                    ? <img src={selectedUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (selectedUser.displayName?.[0] || '?').toUpperCase()
                  }
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {selectedUser.displayName || selectedUser.fullName || selectedUser.zaloUserId}
                  </div>
                  <div className="text-[0.75rem] text-slate-500 flex items-center gap-1">
                    <span>ID: {selectedUser.zaloUserId}</span>
                    {selectedUser.phone && <span>· 📞 {selectedUser.phone}</span>}
                  </div>
                </div>
                <button
                  onClick={() => loadMessages(selectedUser.zaloUserId)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  🔄 Tải lại
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-slate-50/30">
                {loadingMsg ? (
                  <div className="text-center text-slate-400 p-4 md:p-6 flex flex-col items-center">
                    <span className="animate-spin text-2xl mb-2">⏳</span>
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 p-4 md:p-6 text-sm bg-slate-50 rounded-xl border border-slate-100 mx-auto mt-10 max-w-sm">
                    Chưa có lịch sử tin nhắn với người dùng này.
                  </div>
                ) : (
                  messages.map(msg => {
                    const isOut = msg.direction === 'outbound';
                    return (
                      <div key={msg.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'} group`}>
                        <div className={`
                          max-w-[75%] px-4 py-2.5 shadow-sm relative
                          ${isOut 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm' 
                            : 'bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm'
                          }
                        `}>
                          <div className="text-[0.9rem] leading-relaxed whitespace-pre-wrap">{msg.content || `[${msg.type}]`}</div>
                          <div className={`
                            text-[0.65rem] mt-1.5 font-medium
                            ${isOut ? 'text-blue-100 text-right' : 'text-slate-400 text-left'}
                          `}>
                            {isOut && <span className="mr-1">✓✓</span>}
                            {formatTime(msg.receivedAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={msgEndRef} />
              </div>

              {/* Input gửi tin */}
              <div className="p-4 border-t border-slate-100 bg-white">
                {sendResult && (
                  <div className={`
                    mb-3 px-3 py-2 rounded-lg text-[0.8rem] font-semibold flex items-center gap-2
                    ${sendResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}
                  `}>
                    {sendResult.type === 'success' ? '✅' : '❌'} {sendResult.text}
                  </div>
                )}
                <div className="flex gap-3 items-end">
                  <textarea
                    value={newMsg}
                    onChange={e => setNewMsg(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
                    rows={1}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMsg.trim()}
                    className={`
                      px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2
                      ${sending || !newMsg.trim() 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                      }
                    `}
                  >
                    {sending ? '⏳ Gửi...' : '📨 Gửi'}
                  </button>
                </div>
                <p className="mt-2 text-[0.7rem] text-slate-400 font-medium">
                  ⚠️ OA chỉ được phép gửi tin nhắn phản hồi cho người đã tương tác trong vòng 48h.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
