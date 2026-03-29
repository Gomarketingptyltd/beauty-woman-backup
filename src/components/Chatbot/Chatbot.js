import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAnswer, getFallback, checkEasterEgg } from './chatbot-kb';
import './Chatbot.css';

const BOT_DELAY = 600;

const BotMsg = ({ text, cta, link, scroll }) => {
  const navigate = useNavigate();

  const handleScroll = () => {
    const el = document.getElementById(scroll);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="cb-msg cb-msg--bot">
      <div className="cb-msg__bubble">
        <p>{text}</p>
        {cta && (
          <a href={cta.url} target="_blank" rel="noreferrer" className="cb-msg__cta">
            {cta.label}
          </a>
        )}
        {link && (
          <button className="cb-msg__cta" onClick={() => navigate(link.url)}>
            {link.label}
          </button>
        )}
        {scroll && (
          <button className="cb-msg__cta" onClick={handleScroll}>
            {text.includes('Rates') || text.includes('价目') ? '→ View Rates' : '→ 查看价格'}
          </button>
        )}
      </div>
    </div>
  );
};

const UserMsg = ({ text }) => (
  <div className="cb-msg cb-msg--user">
    <div className="cb-msg__bubble">{text}</div>
  </div>
);

const TypingIndicator = () => (
  <div className="cb-msg cb-msg--bot">
    <div className="cb-msg__bubble cb-msg__typing">
      <span /><span /><span />
    </div>
  </div>
);

export default function Chatbot() {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'zh' ? 'zh' : 'en';
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [pendingState, setPendingState] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const greet = useCallback(() => {
    const g = lang === 'zh'
      ? '您好，老板！我是 Ocean Noir 的智能助手 🖤 有什么想了解的，直接问我吧～'
      : 'Hello! I\'m Ocean Noir\'s virtual assistant 🖤 Ask me anything — I\'m at your service.';
    setMsgs([{ type: 'bot', text: g, id: Date.now() }]);
  }, [lang]);

  useEffect(() => {
    if (open && !started) {
      setStarted(true);
      greet();
    }
  }, [open, started, greet]);

  useEffect(() => {
    if (open && started) {
      setMsgs([]);
      setStarted(false);
      setTimeout(() => { setStarted(true); greet(); }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const pushAnswer = useCallback((result, newPending) => {
    if (newPending !== undefined) setPendingState(newPending);
    if (!result) {
      const fb = getFallback(lang);
      setMsgs(m => [...m, { type: 'bot', text: fb.a, cta: fb.cta, id: Date.now() }]);
    } else {
      setMsgs(m => [...m, {
        type: 'bot',
        text: result.a,
        cta: result.cta,
        link: result.link,
        scroll: result.scroll,
        id: Date.now(),
      }]);
    }
    setTyping(false);
  }, [lang]);

  const ask = useCallback((text) => {
    setMsgs(m => [...m, { type: 'user', text, id: Date.now() }]);
    setTyping(true);
    setTimeout(() => {
      // Easter eggs take priority
      const { result: eggResult, newPending } = checkEasterEgg(text, lang, pendingState);
      if (eggResult) {
        pushAnswer(eggResult, newPending);
        return;
      }
      // Normal FAQ
      const faqResult = getAnswer(text, lang);
      pushAnswer(faqResult, pendingState);
    }, BOT_DELAY);
  }, [lang, pendingState, pushAnswer]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    ask(trimmed);
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        className="cb-toggle"
        onClick={() => setOpen(v => !v)}
        aria-label="Chat"
        whileTap={{ scale: 0.92 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              ✕
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              💬
            </motion.span>
          )}
        </AnimatePresence>
        {!open && <span className="cb-toggle__dot" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="cb-window"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="cb-header">
              <div className="cb-header__info">
                <span className="cb-header__name">OCEAN NOIR</span>
                <span className="cb-header__status">
                  <span className="cb-header__dot" />
                  {lang === 'zh' ? '智能助手' : 'Virtual Assistant'}
                </span>
              </div>
              <button className="cb-header__close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="cb-messages">
              {msgs.map(msg =>
                msg.type === 'user'
                  ? <UserMsg key={msg.id} text={msg.text} />
                  : <BotMsg key={msg.id} text={msg.text} cta={msg.cta} link={msg.link} scroll={msg.scroll} />
              )}
              {typing && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="cb-input-row">
              <input
                ref={inputRef}
                className="cb-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={lang === 'zh' ? '输入您的问题…' : 'Type your question…'}
              />
              <button className="cb-send" onClick={handleSend} disabled={!input.trim()}>
                ›
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
