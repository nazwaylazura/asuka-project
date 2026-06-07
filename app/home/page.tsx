"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BotCharacter {
  id: string;
  name: string;
  imgUrl: string;
  greeting: string;
  personality: string;
}

export default function HomePage() {
  const router = useRouter();
  const { data: session } = useSession(); // Ambil session Google
  
  const [tokens, setTokens] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_tokens');
      return saved ? parseInt(saved) : 11;
    }
    return 11;
  });

  // State awal kosong, diisi dinamis oleh data Google / LocalStorage
  const [userData, setUserData] = useState({ name: "", profileImg: "" });
  const [streakData, setStreakData] = useState({ days: 0, botName: "", botImage: "" });

  // ─── 1. AUTO-RESTORE BACKUP DATA AKUN (VERSI AMAN ANTI-LOOPING) ───
  useEffect(() => {
    if (session?.user?.email) {
      const backupRaw = localStorage.getItem(`user_backup_${session.user.email}`);
      if (backupRaw) {
        const backup = JSON.parse(backupRaw);
        
        // Kembalikan token, kado, dan progres navigasi utama jika ada
        if (backup.currentProgress) {
          Object.keys(backup.currentProgress).forEach(key => {
            if (backup.currentProgress[key]) localStorage.setItem(key, backup.currentProgress[key]);
          });
        }
        
        // Kembalikan seluruh log chat, dating, skor afinitas, dan tanggal jadian
        if (backup.dynamicLogs) {
          Object.keys(backup.dynamicLogs).forEach(key => {
            if (backup.dynamicLogs[key]) localStorage.setItem(key, backup.dynamicLogs[key]);
          });
        }

        // KUNCI PERBAIKAN SAKTI: Hapus bungkusan backup DULUAN sebelum reload
        // Ini biar Next.js tahu proses restorasi sudah selesai dan tidak memicu refresh abadi!
        localStorage.removeItem(`user_backup_${session.user.email}`);
        
        // Segarkan halaman sekejap untuk memuat ulang data murni yang baru di-restore
        window.location.reload();
      }
    }
  }, [session]);

  // ─── 2. RECALL USER DATA DINAMIS ASLI AKUN GOOGLE ───
  useEffect(() => {
    if (!session) return;

    // Baca apakah ada nama/foto kustom yang diedit untuk akun email ini
    const userEmail = session.user?.email;
    const savedName = localStorage.getItem(`user_name_${userEmail}`);
    const savedImg = localStorage.getItem(`user_img_${userEmail}`);

    setUserData({
      // JIKA ada edit nama kustom pakai itu, JIKA TIDAK gunakan nama asli akun Google
      name: savedName || session.user?.name || "User",
      profileImg: savedImg || session.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });

    const savedTokens = localStorage.getItem('user_tokens');
    if (savedTokens) setTokens(parseInt(savedTokens));

    // RECALL STREAK KALENDER RIIL
    const savedList = localStorage.getItem('active_chat_list');
    if (savedList) {
      const parsedBots = JSON.parse(savedList) as BotCharacter[];
      let maxMessages = 0;
      let topBot: BotCharacter | null = null;

      parsedBots.forEach((bot) => {
        const chatLogRaw = localStorage.getItem(`chat_log_${bot.id}`);
        if (chatLogRaw) {
          const chatLog = JSON.parse(chatLogRaw);
          if (chatLog.length > maxMessages) {
            maxMessages = chatLog.length;
            topBot = bot;
          }
        }
      });

      if (topBot) {
        const streakKey = `streak_start_${(topBot as BotCharacter).id}`;
        let startDateRaw = localStorage.getItem(streakKey);

        if (!startDateRaw) {
          startDateRaw = new Date().toISOString().split('T')[0];
          localStorage.setItem(streakKey, startDateRaw);
        }

        const startDate = new Date(startDateRaw);
        const today = new Date(new Date().toISOString().split('T')[0]); 
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const realStreakDays = diffDays + 1;

        setStreakData({
          days: realStreakDays,
          botName: (topBot as BotCharacter).name,
          botImage: (topBot as BotCharacter).imgUrl
        });
      }
    }
  }, [session]);

  const logoUrl = "https://i.pinimg.com/736x/fc/3c/33/fc3c33be7d3ca7efa410b5d3cbca7655.jpg"; 
  const menuItems = [
    { id: 'store', name: 'Store', imgUrl: 'https://i.pinimg.com/736x/84/cb/7d/84cb7dc29563b9f051facb1585a7287a.jpg' },
    { id: 'dating', name: 'Dating', imgUrl: 'https://i.pinimg.com/736x/08/02/6b/08026b45070e3575a8571fe97ad26536.jpg' },
    { id: 'diary', name: 'Diary', imgUrl: 'https://i.pinimg.com/736x/d8/72/f8/d872f862614bf06a40dd8fb34ae7ed61.jpg' },
    { id: 'booth', name: 'Booth', imgUrl: 'https://i.pinimg.com/736x/d1/aa/ea/d1aaea1dca418f6bd433a11f4f534a33.jpg' },
  ];

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md md:max-w-4xl">
        
        {/* TOP HEADER */}
        <div className="flex justify-between items-center mb-8 w-full">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-white p-1 cursor-pointer" onClick={() => router.push('/')}>
            <img src={logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center border border-pink-100">
              <span className="text-xs font-bold text-pink-600">🎟️ {tokens} Tickets</span>
            </div>
            
            <button 
              onClick={() => router.push('/profile')}
              className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-pink-100 flex items-center gap-2 hover:bg-pink-50 transition active:scale-95"
            >
              <img src={userData.profileImg} alt="user" className="w-6 h-6 rounded-full object-cover bg-gray-200" />
              <span className="text-xs font-semibold text-gray-700">{userData.name || "Loading..."}</span>
            </button>
          </div>
        </div>

        {/* STREAK BANNER */}
        {streakData.days > 0 ? (
          <div className="relative bg-[#d9c5cb] rounded-3xl p-6 mb-8 overflow-hidden shadow-sm flex items-center h-40 w-full">
            <div className="z-10">
              <p className="text-white text-xs font-medium opacity-90 uppercase tracking-wider">You've been contacts for</p>
              <p className="text-white text-6xl font-bold tracking-tight my-1">{streakData.days}</p>
              <p className="text-white text-sm font-medium opacity-90">days with <span className="font-bold border-b border-white/40 pb-0.5">{streakData.botName}</span></p>
            </div>
            <div className="absolute right-[-10px] bottom-[-20px] w-40 h-40 opacity-90">
              <img src={streakData.botImage} alt={streakData.botName} className="w-full h-full object-cover rounded-full border-4 border-[#fff5f8]" />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-pink-50 text-center w-full py-10">
            <p className="text-pink-500 font-bold text-sm mb-2">Belum ada hubungan kedekatan aktif 🌸</p>
            <p className="text-gray-400 text-xs leading-relaxed max-w-[85%] mx-auto">Yuk, mulai mengobrol manis dengan karakter pilihanmu di menu <span className="font-bold text-pink-400 cursor-pointer underline" onClick={() => router.push('/find')}>Find</span> untuk membangun hari kencan pertamamu!</p>
          </div>
        )}

        {/* MENU GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => router.push(`/${item.id}`)}
              className="bg-white rounded-[2.5rem] p-4 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 border border-pink-50"
            >
              <div className="w-full aspect-square bg-pink-50 rounded-[2rem] mb-3 flex items-center justify-center overflow-hidden">
                <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-semibold text-gray-500 tracking-wide">{item.name}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}