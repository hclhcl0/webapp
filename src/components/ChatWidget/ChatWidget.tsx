"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./ChatWidget.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "cdc_chat_history";
const MAX_STORED_MESSAGES = 20;

const SUGGESTED_QUESTIONS = [
  "💉 Bảng giá vắc xin dịch vụ tại CDC Đà Nẵng?",
  "📅 Lịch tiêm chủng và khám của CDC Đà Nẵng?",
  "👶 Các gói vắc xin combo cho trẻ em?",
  "🏥 Quy trình tiêm chủng tại CDC Đà Nẵng?",
  "🦟 Cách phòng ngừa bệnh sốt xuất huyết?",
];

/**
 * Render một dòng văn bản hỗ trợ:
 * - **in đậm**
 * - [Text](url)
 * - Đường dẫn nội bộ (/goi-vac-xin, /bai-viet/..., /suc-khoe, /dich-vu) hoặc https://...
 * - Số điện thoại / Hotline (1900..., 0236..., 09...) bấm gọi trực tiếp
 */
function renderInlineTokens(text: string): React.ReactNode[] {
  // Tách trước theo **in đậm**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  const nodes: React.ReactNode[] = [];

  boldParts.forEach((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const inner = part.slice(2, -2);
      nodes.push(
        <strong key={`b-${idx}`} className={styles.boldText}>
          {renderLinksAndPhones(inner, `b-${idx}`)}
        </strong>
      );
    } else {
      nodes.push(...renderLinksAndPhones(part, `t-${idx}`));
    }
  });

  return nodes;
}

function renderLinksAndPhones(text: string, keyPrefix: string): React.ReactNode[] {
  // Regex nhận diện:
  // 1. Markdown link: [label](url)
  // 2. URL đầy đủ: https?://[^\s),]+
  // 3. Đường dẫn nội bộ: /(?:goi-vac-xin|bai-viet|suc-khoe|dich-vu|documents|mua-sam|contact)(?:/[^\s),.]*)?
  // 4. Số điện thoại / Hotline: \b(?:1900[\s.]?\d{4,6}|0236[\s.]?\d{3}[\s.]?\d{3,4}|0[35789]\d{8})\b
  const tokenRegex = /(\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s),]+|\/(?:goi-vac-xin|bai-viet|suc-khoe|dich-vu|documents|mua-sam|contact)(?:\/[^\s),.]*)?|\b(?:1900[\s.]?\d{4,6}|0236[\s.]?\d{3}[\s.]?\d{3,4}|0[35789]\d{8})\b)/g;

  const parts = text.split(tokenRegex);
  return parts.map((segment, i) => {
    if (!segment) return null;
    const key = `${keyPrefix}-${i}`;

    // 1. Markdown link [label](url)
    const mdMatch = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (mdMatch) {
      const [, label, url] = mdMatch;
      const isInternal = url.startsWith("/");
      return isInternal ? (
        <Link key={key} href={url} className={styles.chatLink}>
          {label}
        </Link>
      ) : (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" className={styles.chatLink}>
          {label}
        </a>
      );
    }

    // 2. Đường dẫn nội bộ (/goi-vac-xin...)
    if (segment.startsWith("/")) {
      const labelMap: Record<string, string> = {
        "/goi-vac-xin": "👉 Xem bảng giá & gói vắc xin (/goi-vac-xin)",
        "/dich-vu": "👉 Xem dịch vụ y tế (/dich-vu)",
        "/suc-khoe": "👉 Chuyên mục sức khỏe (/suc-khoe)",
      };
      return (
        <Link key={key} href={segment} className={styles.chatLink}>
          {labelMap[segment] || segment}
        </Link>
      );
    }

    // 3. URL https://...
    if (/^https?:\/\//.test(segment)) {
      return (
        <a key={key} href={segment} target="_blank" rel="noopener noreferrer" className={styles.chatLink}>
          {segment}
        </a>
      );
    }

    // 4. Số điện thoại / Hotline
    if (/^(?:1900|0236|0[35789])/.test(segment)) {
      const cleanTel = segment.replace(/[\s.]/g, "");
      return (
        <a key={key} href={`tel:${cleanTel}`} className={styles.phoneLink} title={`Gọi ${segment}`}>
          📞 {segment}
        </a>
      );
    }

    return <React.Fragment key={key}>{segment}</React.Fragment>;
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [hotline, setHotline] = useState("1900988975");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialized = useRef(false);

  // Load chat configuration and history on mount
  useEffect(() => {
    async function loadConfigAndHistory() {
      try {
        const res = await fetch("/api/chat/public");
        const data = await res.json();
        if (data.success) {
          setIsEnabled(data.enabled);
          setWelcomeMessage(data.welcomeMessage);
          if (data.hotline) setHotline(data.hotline);

          if (!data.enabled) return;

          // Load history from sessionStorage
          const stored = sessionStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as Message[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              isInitialized.current = true;
              return;
            }
          }

          // First time greeting
          setMessages([
            {
              role: "assistant",
              content: data.welcomeMessage,
              timestamp: Date.now(),
            },
          ]);
          isInitialized.current = true;
        } else {
          setIsEnabled(false);
        }
      } catch (err) {
        console.error("Error loading AI Chat config:", err);
        setIsEnabled(false);
      }
    }
    loadConfigAndHistory();
  }, []);

  // Save to sessionStorage when messages change
  useEffect(() => {
    if (!isInitialized.current || !isEnabled) return;
    if (messages.length === 0) return;
    try {
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {}
  }, [messages, isEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading, showSuggestions]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setHasNewMessage(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const cleanQuestion = text.replace(/^[💉📅👶🏥🦟]\s*/, "").trim();
      if (!cleanQuestion || isLoading) return;

      const userMsg: Message = {
        role: "user",
        content: cleanQuestion,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setShowSuggestions(false);
      setIsLoading(true);

      // Build history for API (exclude greeting, last 10 messages)
      const history = messages
        .filter((m) => m.content !== welcomeMessage)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat/public", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: cleanQuestion, history }),
        });

        const data = await res.json();

        const botMsg: Message = {
          role: "assistant",
          content: data.success
            ? data.answer
            : data.error || "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);

        if (!isOpen) setHasNewMessage(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Xin lỗi, không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, isOpen, welcomeMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearHistory = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setShowSuggestions(false);
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleCopy = (text: string, idx: number) => {
    const plain = text.replace(/\*\*(.*?)\*\*/g, "$1");
    navigator.clipboard?.writeText(plain);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isEnabled === null || !isEnabled) {
    return null;
  }

  const isOnlyGreeting = messages.length === 1 && messages[0].role === "assistant";

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarWrap}>
                  <span className={styles.avatarIcon}>🤖</span>
                  <span className={styles.onlineDot} />
                </div>
                <div>
                  <div className={styles.headerTitle}>Trợ lý AI CDC Đà Nẵng</div>
                  <div className={styles.headerSub}>Hỗ trợ tra cứu y tế & tiêm chủng 24/7</div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.iconBtn}
                  onClick={handleClearHistory}
                  title="Làm mới cuộc trò chuyện"
                  aria-label="Xóa lịch sử"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={handleToggle}
                  title="Đóng"
                  aria-label="Đóng chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Quick Action Bar */}
            <div className={styles.quickBar}>
              <Link href="/goi-vac-xin" className={styles.quickActionChip}>
                💉 Bảng giá Vắc xin
              </Link>
              <a href={`tel:${hotline.replace(/[\s.]/g, "")}`} className={styles.quickActionChip}>
                📞 Gọi {hotline}
              </a>
              {!isOnlyGreeting && (
                <button
                  type="button"
                  className={styles.quickActionChip}
                  onClick={() => setShowSuggestions((prev) => !prev)}
                >
                  💡 Câu hỏi gợi ý
                </button>
              )}
            </div>

            {/* Messages */}
            <div className={styles.messages} role="log" aria-live="polite">
              {messages.map((msg, i) => {
                const lines = msg.content.split("\n");
                return (
                  <motion.div
                    key={i}
                    className={`${styles.messageBubble} ${
                      msg.role === "user" ? styles.userBubble : styles.botBubble
                    }`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {msg.role === "assistant" && (
                      <div className={styles.botIcon}>🤖</div>
                    )}
                    <div className={styles.bubbleContent}>
                      <div className={styles.bubbleText}>
                        {lines.map((line, j) => {
                          const trimmedLine = line.trim();
                          const isBullet = /^[•+]\s+/.test(trimmedLine) || /^\d+\.\s+/.test(trimmedLine);
                          return (
                            <div
                              key={j}
                              className={
                                trimmedLine === ""
                                  ? styles.emptyLine
                                  : isBullet
                                  ? styles.listLine
                                  : styles.normalLine
                              }
                            >
                              {msg.role === "assistant" ? renderInlineTokens(line) : line}
                            </div>
                          );
                        })}
                      </div>
                      <div className={styles.bubbleMeta}>
                        <span className={styles.bubbleTime}>{formatTime(msg.timestamp)}</span>
                        {msg.role === "assistant" && i > 0 && (
                          <button
                            type="button"
                            className={styles.copyBtn}
                            onClick={() => handleCopy(msg.content, i)}
                            title="Sao chép câu trả lời"
                          >
                            {copiedIndex === i ? "✓ Đã chép" : "Sao chép"}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  className={`${styles.messageBubble} ${styles.botBubble}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.botIcon}>🤖</div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.typingIndicator}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {(isOnlyGreeting || showSuggestions) && (
              <div className={styles.suggestions}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className={styles.suggestionBtn}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className={styles.inputArea}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi y tế, vắc xin... (Enter để gửi)"
                rows={1}
                maxLength={1000}
                disabled={isLoading}
                aria-label="Nhập câu hỏi cho trợ lý AI"
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                aria-label="Gửi câu hỏi"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        className={styles.fab}
        onClick={handleToggle}
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI CDC Đà Nẵng"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? {} : { y: [0, -4, 0] }}
        transition={
          isOpen
            ? {}
            : { y: { repeat: Infinity, repeatDelay: 3, duration: 0.6, ease: "easeInOut" } }
        }
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className={styles.fabIcon}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className={styles.fabIcon}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        <span className={styles.fabLabel}>Hỏi đáp AI</span>

        {/* New message indicator */}
        {hasNewMessage && !isOpen && (
          <motion.span
            className={styles.notifDot}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </motion.button>
    </>
  );
}
