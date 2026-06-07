"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BotCharacter {
  id: string;
  name: string;
  imgUrl: string;
  greeting: string;
  personality: string;
  isCustom?: boolean;
}

export default function FindPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'explore' | 'create'>('explore');

  // FORM STATE UNTUK CREATE / EDIT BOT
  const [editingBotId, setEditingBotId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customImg, setCustomImg] = useState("");
  const [customGreeting, setCustomGreeting] = useState("");
  const [customPersonality, setCustomPersonality] = useState("");

  // DATA BOT BAWAAN (Public Bots)
  const publicBots: BotCharacter[] = [
    { id: 'gojo', name: 'Gojo Satoru', imgUrl: 'https://i.pinimg.com/736x/87/0f/39/870f3965168488300167aa53fff5ed91.jpg', greeting: 'Yo! Akhirnya kamu dateng juga. Nungguin aku ya?', personality: 'Percaya diri tinggi, santai, usil tapi sangat peduli.' },
    { id: 'cinna', name: 'Cinnamoroll', imgUrl: 'https://i.pinimg.com/736x/f3/e4/d4/f3e4d4021068ca2e041bf653073af6c5.jpg', greeting: '*Cinnamoroll terbang mendekatimu sambil mengibas telinganya imut* "Halo! Mau main bareng aku hari ini?"', personality: 'Sangat menggemaskan, pemalu, lembut, setia kawan.' }
  ];

  const [allBots, setAllBots] = useState<BotCharacter[]>(publicBots);

  // Ambil bot hasil kreasi dari localStorage saat halaman dimuat
  useEffect(() => {
    const savedCustomBots = localStorage.getItem('custom_bots');
    if (savedCustomBots) {
      const parsedCustom = JSON.parse(savedCustomBots);
      setAllBots([...publicBots, ...parsedCustom]);
    }
  }, []);

  // FUNGSI MEMBUAT ATAU MEMPERBARUI (EDIT) BOT
  const handleSaveBot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customGreeting || !customPersonality) {
      return alert("Harap isi Nama, Sapaan Awal, dan Sifat Karakter ya! 🌸");
    }

    const defaultImg = "https://i.pinimg.com/736x/21/df/b3/21dfb34208a38ec9b0718520bf2330a1.jpg";
    const savedCustomBots = localStorage.getItem('custom_bots') ? JSON.parse(localStorage.getItem('custom_bots')!) : [];

    if (editingBotId) {
      // --- LOGIKA UPDATE DATA (EDIT MODE) ---
      const updatedCustomBots = savedCustomBots.map((b: BotCharacter) => {
        if (b.id === editingBotId) {
          return {
            ...b,
            name: customName,
            imgUrl: customImg.trim() !== "" ? customImg : defaultImg,
            greeting: customGreeting,
            personality: customPersonality
          };
        }
        return b;
      });

      localStorage.setItem('custom_bots', JSON.stringify(updatedCustomBots));
      setAllBots([...publicBots, ...updatedCustomBots]);
      alert(`Karakter "${customName}" berhasil diperbarui! ✨`);
    } else {
      // --- LOGIKA MEMBUAT BARU (CREATE MODE) ---
      const newBot: BotCharacter = {
        id: 'custom_' + Date.now(),
        name: customName,
        imgUrl: customImg.trim() !== "" ? customImg : defaultImg,
        greeting: customGreeting,
        personality: customPersonality,
        isCustom: true
      };

      const updatedCustomList = [...savedCustomBots, newBot];
      localStorage.setItem('custom_bots', JSON.stringify(updatedCustomList));
      setAllBots([...publicBots, ...updatedCustomList]);
      alert(`Karakter "${newBot.name}" berhasil diciptakan! ✨`);
    }

    // Reset Form & Kembalikan ke Tab Explore
    setEditingBotId(null);
    setCustomName("");
    setCustomImg("");
    setCustomGreeting("");
    setCustomPersonality("");
    setActiveTab('explore');
  };

  // FUNGSI MEMICU MODE EDIT KETIKA TOMBOL PENSIL DIKLIK
  const triggerEditBot = (e: React.MouseEvent, bot: BotCharacter) => {
    e.stopPropagation(); // Biar ngga memicu fungsi masuk ke chat
    setEditingBotId(bot.id);
    setCustomName(bot.name);
    setCustomImg(bot.imgUrl);
    setCustomGreeting(bot.greeting);
    setCustomPersonality(bot.personality);
    setActiveTab('create'); // Pindahkan ke tab form
  };

  // FUNGSI MENGHAPUS BOT CUSTOM
  const handleDeleteBot = (e: React.MouseEvent, botId: string, botName: string) => {
    e.stopPropagation(); // Biar ngga memicu fungsi masuk ke chat
    if (confirm(`Apakah kamu yakin ingin menghapus karakter "${botName}"?`)) {
      const savedCustomBots = localStorage.getItem('custom_bots') ? JSON.parse(localStorage.getItem('custom_bots')!) : [];
      const updatedCustomBots = savedCustomBots.filter((b: BotCharacter) => b.id !== botId);
      
      localStorage.setItem('custom_bots', JSON.stringify(updatedCustomBots));
      setAllBots([...publicBots, ...updatedCustomBots]);

      // Hapus juga riwayat chat aktif & obrolan bot ini jika ada
      const activeChats = localStorage.getItem('active_chat_list') ? JSON.parse(localStorage.getItem('active_chat_list')!) : [];
      const updatedActiveChats = activeChats.filter((b: any) => b.id !== botId);
      localStorage.setItem('active_chat_list', JSON.stringify(updatedActiveChats));
      localStorage.removeItem(`chat_log_${botId}`);
      localStorage.removeItem(`love_level_${botId}`);
    }
  };

  // FUNGSI MEMILIH BOT UNTUK MASUK KE ROOM CHAT
  const handleSelectBot = (bot: BotCharacter) => {
    localStorage.setItem('active_chat_bot', JSON.stringify(bot));
    
    const activeChats = localStorage.getItem('active_chat_list') ? JSON.parse(localStorage.getItem('active_chat_list')!) : [];
    if (!activeChats.some((b: any) => b.id === bot.id)) {
      activeChats.push(bot);
      localStorage.setItem('active_chat_list', JSON.stringify(activeChats));
    }

    router.push('/chat');
  };

  const filteredBots = allBots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-6 w-full">
          <button onClick={() => router.push('/home')} className="text-pink-400 hover:text-pink-600 font-bold text-sm transition">
            ⬅️ Home
          </button>
          <h1 className="text-lg font-bold text-gray-700">Find & Create Character 🔎</h1>
          <div className="w-8"></div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-pink-50 mb-6">
          <button 
            onClick={() => {
              setActiveTab('explore');
              setEditingBotId(null); // Batalkan mode edit kalau pindah manual
            }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === 'explore' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Explore Characters
          </button>
          <button 
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition ${activeTab === 'create' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {editingBotId ? "✏️ Edit Character" : "+ Create Custom Bot"}
          </button>
        </div>

        {/* --- TAB EXPLORE (SEARCH & LIST BOT) --- */}
        {activeTab === 'explore' && (
          <div className="space-y-5">
            <input 
              type="text"
              placeholder="Cari nama karakter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3.5 rounded-2xl text-xs border border-pink-100 bg-white shadow-sm text-gray-700 focus:outline-pink-400"
            />

            <div className="grid grid-cols-1 gap-3">
              {filteredBots.length > 0 ? (
                filteredBots.map((bot) => (
                  <div 
                    key={bot.id}
                    onClick={() => handleSelectBot(bot)}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-pink-50 flex items-center justify-between cursor-pointer hover:scale-[1.01] transition group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img src={bot.imgUrl} alt={bot.name} className="w-14 h-14 rounded-2xl object-cover border border-pink-50 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-700 truncate">{bot.name}</p>
                          {bot.isCustom && <span className="text-[9px] bg-pink-100 text-pink-600 px-1.5 py-0.5 rounded-full font-bold">Custom</span>}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{bot.personality}</p>
                      </div>
                    </div>

                    {/* Tombol Aksi Tambahan Khusus Bot Buatan Sendiri (Kustom) */}
                    {bot.isCustom ? (
                      <div className="flex items-center gap-1.5 ml-2">
                        <button 
                          onClick={(e) => triggerEditBot(e, bot)}
                          className="p-2 bg-pink-50 hover:bg-pink-100 rounded-xl text-xs text-pink-600 transition"
                          title="Edit Karakter"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={(e) => handleDeleteBot(e, bot.id, bot.name)}
                          className="p-2 bg-gray-50 hover:bg-red-50 rounded-xl text-xs text-red-500 transition"
                          title="Hapus Karakter"
                        >
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <span className="text-pink-400 text-xs font-bold pl-2 opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                    )}

                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs bg-white rounded-3xl p-6 border border-pink-50">
                  Karakter tidak ditemukan. Coba buat sendiri yuk! ✨
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- TAB CREATE / EDIT BOT FORM --- */}
        {activeTab === 'create' && (
          <form onSubmit={handleSaveBot} className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50 space-y-4">
            <h2 className="text-xs font-bold text-gray-500 mb-2 border-b pb-2 text-center">
              {editingBotId ? "⚙️ Perbarui Detail Karakter" : "🌸 Konfigurasi Karakter Baru"}
            </h2>
            
            <div>
              <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Nama Karakter</label>
              <input 
                type="text" 
                placeholder="Misal: Levi Ackerman, Hutao..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-3 border border-pink-100 rounded-xl text-xs focus:outline-pink-400 bg-pink-50/10 text-gray-700 font-semibold"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Link URL Foto Profil Karakter (Opsional)</label>
              <input 
                type="text" 
                placeholder="Paste link address gambar di sini..."
                value={customImg}
                onChange={(e) => setCustomImg(e.target.value)}
                className="w-full p-3 border border-pink-100 rounded-xl text-xs focus:outline-pink-400 bg-pink-50/10 text-gray-700"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Sapaan Awal (Greeting)</label>
              <textarea 
                placeholder="Kalimat pertama saat membuka room chat..."
                value={customGreeting}
                onChange={(e) => setCustomGreeting(e.target.value)}
                rows={2}
                className="w-full p-3 border border-pink-100 rounded-xl text-xs focus:outline-pink-400 bg-pink-50/10 text-gray-700"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block mb-1">Kepribadian / Sifat (Personality Prompt)</label>
              <textarea 
                placeholder="Gambarkan sifatnya. Misal: Dingin, tsundere, bicaranya ketus tapi sebenarnya perhatian..."
                value={customPersonality}
                onChange={(e) => setCustomPersonality(e.target.value)}
                rows={3}
                className="w-full p-3 border border-pink-100 rounded-xl text-xs focus:outline-pink-400 bg-pink-50/10 text-gray-700"
              />
            </div>

            <div className="flex gap-2 pt-2">
              {editingBotId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingBotId(null);
                    setCustomName("");
                    setCustomImg("");
                    setCustomGreeting("");
                    setCustomPersonality("");
                    setActiveTab('explore');
                  }}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold text-xs py-3.5 rounded-2xl hover:bg-gray-200 transition"
                >
                  Batal
                </button>
              )}
              <button 
                type="submit"
                className="flex-[2] bg-pink-500 text-white font-bold text-xs py-3.5 rounded-2xl shadow-md hover:bg-pink-600 transition"
              >
                {editingBotId ? "Simpan Perubahan 💾" : "Ciptakan Bot & Mulai Chat 🚀"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}