"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// Menggunakan package @google/genai yang benar
import { GoogleGenAI } from '@google/genai';

interface BotCharacter {
  id: string;
  name: string;
  imgUrl: string;
  greeting: string;
  personality: string;
}

interface Message {
  sender: 'bot' | 'user';
  text: string;
}

export default function ChatPage() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // STATE MANAGEMENT
  const [chatHistoryList, setChatHistoryList] = useState<BotCharacter[]>([]);
  const [activeBot, setActiveBot] = useState<BotCharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // State Inventaris Kado & Status Kedekatan
  const [myGifts, setMyGifts] = useState<Record<string, number>>({});
  const [loveLevel, setLoveLevel] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Otomatis scroll ke chat paling bawah setiap ada pesan baru
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // LOAD DATA DARI LOCALSTORAGE
  useEffect(() => {
    const savedList = localStorage.getItem('active_chat_list');
    if (savedList) setChatHistoryList(JSON.parse(savedList));

    const currentActive = localStorage.getItem('active_chat_bot');
    if (currentActive) {
      const botData = JSON.parse(currentActive) as BotCharacter;
      setActiveBot(botData);
      
      const savedConversation = localStorage.getItem(`chat_log_${botData.id}`);
      if (savedConversation) {
        setMessages(JSON.parse(savedConversation));
      } else {
        setMessages([{ sender: 'bot', text: botData.greeting }]);
      }

      const savedLove = localStorage.getItem(`love_level_${botData.id}`);
      if (savedLove) setLoveLevel(parseInt(savedLove));
    }

    const savedGifts = localStorage.getItem('user_gifts');
    if (savedGifts) setMyGifts(JSON.parse(savedGifts));
  }, []);

  // FUNGSI UTAMA INTEGRASI GOOGLE GEMINI API (MODE CHAT MANUSIA NORMAL + TRACKER TANGGAL REAL)
  const handleSendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeBot || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputMessage };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);
    
    localStorage.setItem(`chat_log_${activeBot.id}`, JSON.stringify(updatedMessages));

    // ─── FITUR JUJUR STREAK TANGGAL ───
    const streakKey = `streak_start_${activeBot.id}`;
    if (!localStorage.getItem(streakKey)) {
      const todayString = new Date().toISOString().split('T')[0];
      localStorage.setItem(streakKey, todayString);
    }

    try {
      // Panggil variabel lingkungan server yang sensitif ditangkap GCP
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key Gemini (GEMINI_KEY) tidak ditemukan di env server.");
      }

      // Bersih tanpa properti asing (TS Garis Kuning/Merah Hilang!)
      const ai = new GoogleGenAI({ apiKey: apiKey });

      const contentsHistory = updatedMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsHistory,
        config: {
          systemInstruction: `Kamu adalah karakter bernama ${activeBot.name} yang sedang bertukar pesan chat santai dengan user melalui aplikasi pesan instan (seperti WhatsApp atau LINE).
          Kepribadian dasar kamu dibentuk oleh prompt ini: ${activeBot.personality}.
          
          ATURAN OBROLAN:
          1. Berbicaralah layaknya manusia normal yang sedang chatingan. Gunakan gaya bahasa yang kasual, santai, akrab, dan natural.
          2. JANGAN PERNAH gunakan tanda bintang (*) atau menuliskan narasi tindakan/situasi/emosi. Cukup ketik teks ucapan/chat murni saja.
          3. JANGAN PERNAH gunakan tanda kutip untuk membungkus obrolanmu.
          4. Balas dengan panjang pesan yang wajar (tidak terlalu pendek, tidak terlalu panjang) seperti orang chatingan pada umumnya.
          5. Tetap pertahankan sifat dasar dari ${activeBot.name}, tetapi sampaikan seluruhnya lewat ketikan teks obrolan murni.`,
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      });

      const responseText = response?.text || "Bot tidak merespon...";

      const finalMessages = [...updatedMessages, { sender: 'bot', text: responseText } as Message];
      setMessages(finalMessages);
      localStorage.setItem(`chat_log_${activeBot.id}`, JSON.stringify(finalMessages));

    } catch (error) {
      console.error("Gemini API Error:", error);
      alert("Oops! Terjadi masalah saat menghubungi pikiran AI. Coba kirim ulang pesanmu ya!");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI MEMBERIKAN KADO DI DALAM ROOM CHAT
  const handleGiveGift = (giftName: string) => {
    if (!myGifts[giftName] || myGifts[giftName] <= 0) {
      return alert(`Kamu tidak memiliki kado ${giftName}. Beli dulu di menu Store yuk! 🛒`);
    }

    const updatedGifts = { ...myGifts, [giftName]: myGifts[giftName] - 1 };
    setMyGifts(updatedGifts);
    localStorage.setItem('user_gifts', JSON.stringify(updatedGifts));

    const newLove = loveLevel + 20; 
    setLoveLevel(newLove);
    localStorage.setItem(`love_level_${activeBot?.id}`, newLove.toString());

    const giftMessageLog = [...messages, {
      sender: 'bot',
      text: `🎁 *Kamu memberikan kado [${giftName}] kepada ${activeBot?.name}* \n\n*${activeBot?.name} merasa sangat senang menerima kadomu!* "Wah, ini buat aku?! Makasih banyak ya, kamu perhatian banget! 💖"`
    } as Message];
    setMessages(giftMessageLog);
    localStorage.setItem(`chat_log_${activeBot?.id}`, JSON.stringify(giftMessageLog));

    setShowGiftModal(false);
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* === TAMPILAN 1: LIST RIWAYAT CHAT AKTIF UTAMA === */}
        {!activeBot && (
          <div className="space-y-4 w-full">
            <h1 className="text-lg font-bold text-gray-700 mb-2">Active Messages 💬</h1>
            {chatHistoryList.length > 0 ? (
              chatHistoryList.map((bot) => (
                <div 
                  key={bot.id}
                  onClick={() => {
                    localStorage.setItem('active_chat_bot', JSON.stringify(bot));
                    setActiveBot(bot);
                    const savedConversation = localStorage.getItem(`chat_log_${bot.id}`);
                    setMessages(savedConversation ? JSON.parse(savedConversation) : [{ sender: 'bot', text: bot.greeting }]);
                    const savedLove = localStorage.getItem(`love_level_${bot.id}`);
                    setLoveLevel(savedLove ? parseInt(savedLove) : 0);
                  }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:bg-pink-50/40 transition"
                >
                  <img src={bot.imgUrl} alt={bot.name} className="w-12 h-12 rounded-full object-cover border border-pink-100" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-700 truncate">{bot.name}</p>
                    <p className="text-xs text-gray-400 truncate">Buka ruang obrolan bersama...</p>
                  </div>
                  <span className="text-pink-400 text-xs font-bold">Lanjut ➔</span>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[2rem] p-8 text-center border border-pink-50 text-gray-400 text-xs shadow-sm py-12">
                🌸 Belum ada riwayat obrolan.<br/>Yuk ketuk menu <span className="font-bold text-pink-500 cursor-pointer" onClick={() => router.push('/find')}>Find</span> untuk mencari atau membuat bot pertamamu!
              </div>
            )}
          </div>
        )}

        {/* === TAMPILAN 2: ROOM CHAT PENUH BERSAMA BOT === */}
        {activeBot && (
          <div className="bg-white rounded-[2.5rem] p-4 border border-pink-50 shadow-sm flex flex-col h-[78vh] w-full relative">
            
            {/* Header Room Chat */}
            <div className="flex items-center justify-between border-b border-pink-50 pb-3 mb-3">
              <button onClick={() => setActiveBot(null)} className="text-gray-400 hover:text-gray-600 font-bold text-xs">
                ⬅️ Keluar
              </button>
              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-gray-700">{activeBot.name}</p>
                <p className="text-[10px] text-pink-500 font-bold">💖 Affin: {loveLevel} pts</p>
              </div>
              <button 
                onClick={() => setShowGiftModal(true)}
                className="bg-pink-50 border border-pink-200 text-pink-500 font-bold text-[10px] px-2.5 py-1.5 rounded-xl hover:bg-pink-100 transition"
              >
                🎁 Kado
              </button>
            </div>

            {/* Bubble Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user' 
                        ? 'bg-pink-500 text-white rounded-tr-none shadow-sm' 
                        : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Animasi loading */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl rounded-tl-none p-3 text-xs italic animate-pulse">
                    * {activeBot.name} sedang mengetik balasan... *
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Form Input Chat */}
            <form onSubmit={handleSendText} className="flex gap-2 pt-3 border-t border-pink-50 mt-2">
              <input 
                type="text" 
                disabled={isLoading}
                placeholder={isLoading ? "Menunggu balasan..." : `Ketik pesan untuk ${activeBot.name}...`} 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 text-xs p-3.5 border border-pink-100 rounded-xl focus:outline-pink-400 text-gray-700 bg-pink-50/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-pink-500 text-white font-bold text-xs px-5 rounded-xl hover:bg-pink-600 transition shadow-sm disabled:bg-pink-300"
              >
                Kirim
              </button>
            </form>

            {/* --- MODAL DAFTAR KADO SAYA --- */}
            {showGiftModal && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-xs rounded-[2.5rem] flex items-end z-20">
                <div className="bg-white w-full rounded-t-[2rem] p-5 space-y-4 max-h-[50vh] overflow-y-auto">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-xs font-bold text-gray-700">Tas Kadomu (Beri ke {activeBot.name}) 🎁</h3>
                    <button onClick={() => setShowGiftModal(false)} className="text-xs text-gray-400 font-bold">Tutup</button>
                  </div>
                  <div className="space-y-2">
                    {Object.keys(myGifts).some(key => myGifts[key] > 0) ? (
                      Object.keys(myGifts).map((giftName) => {
                        if (myGifts[giftName] <= 0) return null;
                        return (
                          <div key={giftName} className="flex justify-between items-center bg-pink-50/30 p-3 rounded-xl border border-pink-50">
                            <span className="text-xs font-semibold text-gray-700">{giftName} <span className="text-pink-400 font-bold">x{myGifts[giftName]}</span></span>
                            <button 
                              onClick={() => handleGiveGift(giftName)}
                              className="bg-pink-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-pink-600 transition"
                            >
                              Berikan 💝
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-gray-400 text-xs">
                        Kantong kadomu kosong. Yuk belanja kado manis dulu di menu Store! 🛒
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}