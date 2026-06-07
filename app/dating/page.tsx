"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// Menggunakan package @google/genai yang aman
import { GoogleGenAI } from '@google/genai';

interface BotCharacter {
  id: string;
  name: string;
  imgUrl: string;
  greeting: string;
  personality: string;
}

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
}

export default function DatingPage() {
  const router = useRouter();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- STATE ---
  const [hasChatHistory, setHasChatHistory] = useState(false); 
  const [myBots, setMyBots] = useState<BotCharacter[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotCharacter | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const locations = [
    { id: 'library', name: 'Library 📚', bg: 'bg-amber-100 text-amber-800' },
    { id: 'beach', name: 'Beach 🏖️', bg: 'bg-blue-100 text-blue-800' },
    { id: 'cafe', name: 'Cafe ☕', bg: 'bg-amber-700/10 text-amber-900' }
  ];

  // Otomatis scroll ke bagian chat paling bawah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // 1. SINKRONISASI DAFTAR BOT DARI MENUFIND/CHAT
  useEffect(() => {
    const savedList = localStorage.getItem('active_chat_list');
    if (savedList) {
      const parsedList = JSON.parse(savedList) as BotCharacter[];
      if (parsedList.length > 0) {
        setMyBots(parsedList);
        setHasChatHistory(true);
        return;
      }
    }
    setHasChatHistory(false);
  }, []);

  // 2. FUNGSI MEMULAI KENCAN & AMBIL RIWAYAT LAMA (ANTI-HAPUS OTOMATIS)
  const handleStartDating = async (locName: string) => {
    if (!selectedBot) return;
    setSelectedLocation(locName);

    const storageKey = `dating_log_${selectedBot.id}_${locName.split(' ')[0].toLowerCase()}`;
    const savedDatingLog = localStorage.getItem(storageKey);

    // JIKA ADA RIWAYAT LAMA: Langsung tampilkan ke layar tanpa timpa/reset data
    if (savedDatingLog) {
      setChatLog(JSON.parse(savedDatingLog));
      return;
    }

    // JIKA TIDAK ADA RIWAYAT LAMA: Jalankan Gemini untuk merakit kalimat pembuka baru
    setIsLoading(true);
    const simplifiedLoc = locName.split(' ')[0].toLowerCase();
    setChatLog([{ sender: 'bot', text: `*Sedang mempersiapkan suasana kencan romantis bersama ${selectedBot.name} di ${simplifiedLoc}...*` }]);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Gemini tidak ditemukan.");

      // AMAN LIVE: Menggunakan pengaman browser biar gcloud ga nolak
      const ai = new GoogleGenAI({ 
        apiKey: apiKey, 
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `Buatkan satu paragraf pendek teks aksi roleplay pembuka yang imersif di mana kamu (${selectedBot.name}) sudah menungguku untuk berkencan di tempat bernama: ${simplifiedLoc}. Mulailah menyapaku.` }] }
        ],
        config: {
          systemInstruction: `Kamu adalah karakter bernama ${selectedBot.name}. Sifat dasarmu adalah: ${selectedBot.personality}.
          Saat ini kamu sedang melakukan kencan berdua saja dengan user di lokasi: ${simplifiedLoc}.
          Wajib gunakan tanda bintang (*) untuk menuliskan aksi tindakan/situasi lingkungan sekitar, dan tanda kutip ganda ("...") untuk dialog ucapan langsung kamu. Jangan bertele-tele, tulis respon pembuka yang padat dan langsung selesai!`,
          temperature: 0.8,
          maxOutputTokens: 500,
        }
      });

      const responseText = response?.text || `*${selectedBot.name} melambaikan tangannya kepadamu saat kamu tiba di ${simplifiedLoc}.* "Hey, akhirnya kamu sampai juga!"`;
      const initialLog: ChatMessage[] = [{ sender: 'bot', text: responseText }];
      
      setChatLog(initialLog);
      localStorage.setItem(storageKey, JSON.stringify(initialLog));

    } catch (error) {
      console.error("Gemini Dating Error:", error);
      const fallbackLog: ChatMessage[] = [{ sender: 'bot', text: `*${selectedBot.name} tersenyum manis menyambut kedatanganmu di ${simplifiedLoc}.* "Senang sekali akhirnya bisa meluangkan waktu berdua bersamamu di sini."` }];
      setChatLog(fallbackLog);
      localStorage.setItem(storageKey, JSON.stringify(fallbackLog));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. FUNGSI MERESPON CHAT ROLEPLAY USER DENGAN PERINTAH KETAT ANTI-KEPOTONG
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !selectedBot || !selectedLocation || isLoading) return;

    const userMsg: ChatMessage = { sender: 'user', text: userInput.trim() };
    const updatedLog = [...chatLog, userMsg];
    setChatLog(updatedLog);
    setUserInput("");
    setIsLoading(true);

    const storageKey = `dating_log_${selectedBot.id}_${selectedLocation.split(' ')[0].toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedLog));

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key Gemini tidak ditemukan.");

      // AMAN LIVE: Menggunakan pengaman browser biar gcloud ga nolak
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
      });
      
      const contentsHistory = updatedLog
        .filter(msg => msg.text && msg.text.trim() !== "")
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contentsHistory,
        config: {
          systemInstruction: `Kamu adalah pasangan kencan roleplay bernama ${selectedBot.name} dengan kepribadian: ${selectedBot.personality}.
          Kamu dan user saat ini sedang menghabiskan waktu kencan intim bersama di lokasi: ${selectedLocation}.
          
          ATURAN KHUSUS ROLEPLAY DATING (WAJIB DIPATUHI SECARA MUTLAK):
          1. Ini adalah interaksi tatap muka langsung di dunia nyata. Gunakan tanda bintang (*) untuk menulis narasi tindakan fisik, kontak mata, ekspresi wajah, atau bahasa tubuhmu secara detail.
          2. Gunakan tanda kutip ganda ("...") untuk dialog ucapan langsung dari mulut karaktermu.
          3. JANGAN MENULIS NARASI YANG TERLALU PANJANG DAN BERTELE-TELE. Batasi total responmu maksimal hanya 2 paragraf pendek saja!
          4. PENTING SEKALI: Pastikan seluruh jalan cerita, kalimat, dan dialog ucapanmu selesai sepenuhnya sampai tuntas sebelum batas teks berakhir.
          5. JANGAN PERNAH memotong kata di akhir kalimat atau membiarkan kalimat menggantung tanpa kejelasan. Akhiri balasanmu dengan tanda titik (.) atau tanda kutip (") penutup yang rapi!`,
          temperature: 0.8,
          maxOutputTokens: 1000, 
        }
      });

      const responseText = response?.text || `*${selectedBot.name} mengangguk pelan sembari tersenyum menatapmu.* "Iya, aku mendengarmu."`;
      const finalLog = [...updatedLog, { sender: 'bot', text: responseText } as ChatMessage];
      
      setChatLog(finalLog);
      localStorage.setItem(storageKey, JSON.stringify(finalLog));
    } catch (error) {
      console.error("Gemini Dating Chat Error:", error);
      alert("Koneksi kencan terganggu, coba ketik ulang balasanmu ya! 🌸");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. FITUR REQUEST: FUNGSI RESET MANUAL JIKA USER MAU MENGULANG DARI AWAL
  const handleResetDating = () => {
    if (!selectedBot || !selectedLocation) return;
    
    if (confirm(`Apakah kamu yakin ingin menghapus riwayat kencan romantis bersama ${selectedBot.name} di ${selectedLocation} dan mengulangnya dari awal?`)) {
      const storageKey = `dating_log_${selectedBot.id}_${selectedLocation.split(' ')[0].toLowerCase()}`;
      localStorage.removeItem(storageKey);
      handleStartDating(selectedLocation);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Header Navigasi Utama */}
        <div className="flex justify-between items-center mb-6 w-full">
          <button 
            onClick={() => {
              if (selectedLocation) { setSelectedLocation(null); setChatLog([]); }
              else if (selectedBot) setSelectedBot(null);
              else router.push('/home');
            }} 
            className="text-pink-400 hover:text-pink-600 font-bold text-sm transition"
          >
            ⬅️ {selectedLocation ? "Ubah Lokasi" : selectedBot ? "Ubah Karakter" : "Home"}
          </button>
          <h1 className="text-lg font-bold text-gray-700">Dating Session ✨</h1>
          <div className="w-10"></div>
        </div>

        {/* KONDISI 1: USER BARU (TERKUNCI) */}
        {!hasChatHistory && (
          <div className="bg-white rounded-[2.5rem] p-8 border border-pink-50 text-center shadow-sm py-10">
            <p className="text-2xl mb-3">🔒</p>
            <p className="text-sm font-bold text-gray-700 mb-2">Fitur Dating Terkunci</p>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">Kamu belum memiliki kedekatan dengan bot mana pun. Yuk, temukan dan mengobrol dengan karakter favoritmu di menu Find terlebih dahulu! 🌸</p>
            <button 
              onClick={() => router.push('/find')}
              className="bg-pink-500 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-sm hover:bg-pink-600 transition"
            >
              Cari Karakter di Menu Find 🔎
            </button>
          </div>
        )}

        {/* KONDISI 2: TAHAP 1 - PILIH PASANGAN KENCAN */}
        {hasChatHistory && !selectedBot && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-pink-400 uppercase tracking-wider px-2">Pilih Pasangan Kencanmu 🥰</h2>
            {myBots.map((bot) => (
              <div 
                key={bot.id}
                onClick={() => setSelectedBot(bot)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition"
              >
                <img src={bot.imgUrl} alt={bot.name} className="w-12 h-12 rounded-full object-cover border border-pink-100" />
                <p className="text-sm font-bold text-gray-700">{bot.name}</p>
                <span className="ml-auto text-xs text-pink-400 font-bold">Pilih ➔</span>
              </div>
            ))}
          </div>
        )}

        {/* KONDISI 2: TAHAP 2 - PILIH LOKASI KENCAN */}
        {selectedBot && !selectedLocation && (
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-500 px-2">Mau mengajak <span className="text-pink-500 font-bold">{selectedBot.name}</span> berkencan di mana?</h2>
            <div className="grid grid-cols-1 gap-3">
              {locations.map((loc) => (
                <div 
                  key={loc.id}
                  onClick={() => handleStartDating(loc.name)}
                  className={`${loc.bg} p-6 rounded-[2rem] shadow-sm font-bold text-sm cursor-pointer hover:opacity-90 active:scale-95 transition flex items-center justify-between`}
                >
                  <span>{loc.name}</span>
                  <span className="text-xs opacity-70">Mulai Kencan 🌸</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KONDISI 2: TAHAP 3 - ROOM CHAT INTERAKTIF */}
        {selectedLocation && (
          <div className="bg-white rounded-[2.5rem] p-4 border border-pink-50 shadow-sm flex flex-col h-[75vh]">
            {/* Header Ruang Kencan */}
            <div className="flex items-center justify-between border-b border-pink-50 pb-3 mb-3">
              <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">Dating Active</span>
              <span className="text-xs font-semibold text-gray-400 truncate max-w-[45%]">{selectedBot?.name} @ {selectedLocation.split(' ')[0]}</span>
              {/* TOMBOL RESET MANUAL */}
              <button 
                onClick={handleResetDating}
                className="text-[10px] font-bold text-red-400 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition"
                title="Mulai Ulang Sesi Kencan"
              >
                🔄 Reset
              </button>
            </div>
            
            {/* Log Area Bubble Chat Drama */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-none">
              {chatLog.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user' 
                        ? 'bg-pink-500 text-white rounded-tr-none shadow-sm shadow-pink-50' 
                        : 'bg-pink-50/40 text-gray-700 border border-pink-50/60 rounded-tl-none italic font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 text-gray-400 border border-gray-100 rounded-2xl rounded-tl-none p-3 text-xs italic animate-pulse">
                    * {selectedBot?.name} sedang merespon tindakanmu... *
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Kotak Kontrol Input Chat Dating */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-3 border-t border-pink-50 mt-2">
              <input 
                type="text" 
                disabled={isLoading}
                placeholder={isLoading ? "Menunggu tindakan..." : `Lakukan tindakan atau balas ${selectedBot?.name}...`} 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 text-xs p-3.5 border border-pink-100 rounded-xl focus:outline-pink-400 text-gray-700 bg-pink-50/10 disabled:bg-gray-50"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-pink-500 text-white font-bold text-xs px-5 rounded-xl hover:bg-pink-600 transition shadow-sm disabled:bg-pink-300"
              >
                Kirim
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}