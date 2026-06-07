"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface BotCharacter { id: string; name: string; imgUrl: string; personality: string; }
interface AffinityBot extends BotCharacter { lovePoints: number; statusTitle: string; }
interface SavedPhoto { id: number; image: string; date: string; }

export default function UsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [affinityList, setAffinityList] = useState<AffinityBot[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<SavedPhoto[]>([]);
  const [showGallery, setShowGallery] = useState(false); 
  
  // State baru untuk fitur memperbesar/melihat foto penuh
  const [selectedPreviewImg, setSelectedPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    // 1. LOAD DATA STATUS AFINITAS BOT
    const savedList = localStorage.getItem('active_chat_list');
    if (savedList) {
      const parsedBots = JSON.parse(savedList) as BotCharacter[];
      const compiledData = parsedBots.map(bot => {
        const savedLove = localStorage.getItem(`love_level_${bot.id}`);
        const points = savedLove ? parseInt(savedLove) : 0;
        
        let statusTitle = "Kenalan Baru 🌸";
        if (points >= 20 && points < 60) statusTitle = "Teman Dekat 💬";
        if (points >= 60 && points < 100) statusTitle = "Saling Tertarik 💕";
        if (points >= 100) statusTitle = "Belahan Jiwa 💖";

        return { ...bot, lovePoints: points, statusTitle: statusTitle };
      });
      setAffinityList(compiledData);
    }

    // 2. LOAD DATA GALERI FOTO STRIP KHUSUS MILIK EMAIL INI
    if (session?.user?.email) {
      const savedGallery = localStorage.getItem(`user_gallery_${session.user.email}`);
      if (savedGallery) setGalleryPhotos(JSON.parse(savedGallery));
    }
  }, [session]);

  // ─── FITUR BARU: HAPUS FOTO MEMORI STRIP ───
  const handleDeletePhoto = (photoId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah kepicu fungsi klik zoom foto belakangnya
    
    if (!confirm("Apakah kamu yakin ingin menghapus foto kenangan strip ini? 😢")) return;
    if (!session?.user?.email) return;

    const galleryKey = `user_gallery_${session.user.email}`;
    
    // Filter saring foto, buang yang ID-nya dipilih
    const updatedGallery = galleryPhotos.filter(photo => photo.id !== photoId);
    
    // Simpan kembali list galeri terbaru ke memori akun
    localStorage.setItem(galleryKey, JSON.stringify(updatedGallery));
    setGalleryPhotos(updatedGallery);
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md relative">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 w-full">
          <button onClick={() => router.push('/home')} className="text-pink-400 hover:text-pink-600 font-bold text-sm transition">
            ⬅️ Home
          </button>
          <h1 className="text-lg font-bold text-gray-700">Our Memories (Us) 👥</h1>
          <button 
            onClick={() => setShowGallery(true)}
            className="bg-pink-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl hover:bg-pink-600 shadow-sm transition"
          >
            🖼️ Galeri Foto
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-6 px-1 leading-relaxed">
          Berikut adalah rangkuman tingkat kedekatan hubunganmu bersama masing-masing karakter saat ini.
        </p>

        {/* List Tampilan Progress Afinitas */}
        <div className="space-y-4">
          {affinityList.map((bot) => {
            const percent = Math.min(100, Math.floor((bot.lovePoints / 120) * 100));
            return (
              <div key={bot.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-pink-50 space-y-3">
                <div className="flex items-center gap-4">
                  <img src={bot.imgUrl} alt={bot.name} className="w-12 h-12 rounded-full object-cover border border-pink-100" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-700">{bot.name}</h3>
                    <p className="text-[10px] text-pink-500 font-bold uppercase tracking-wider">{bot.statusTitle}</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-pink-500 bg-pink-50 px-2.5 py-1 rounded-xl">{bot.lovePoints} Pts</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-gray-400 font-bold px-0.5">
                    <span>Affinity Progress</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-pink-400 to-pink-500 rounded-full transition-all" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── MODAL POP-UP UTAMA GALERI MEMORI ─── */}
        {showGallery && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6 z-40 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-5 flex flex-col h-[75vh] shadow-xl">
              <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h3 className="text-xs font-bold text-gray-700">Kenangan Foto Strip Kamu 🖼️</h3>
                <button onClick={() => setShowGallery(false)} className="text-xs font-bold text-pink-500 hover:text-pink-600">Tutup</button>
              </div>

              {/* Area Grid Koleksi Foto Strip */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-4 pr-1 scrollbar-none">
                {galleryPhotos.length > 0 ? (
                  galleryPhotos.map((photo) => (
                    <div 
                      key={photo.id} 
                      onClick={() => setSelectedPreviewImg(photo.image)} // KLIK UNTUK UTK LIAT ZOOM FOTO
                      className="bg-pink-50/30 border border-pink-100 p-2 rounded-2xl flex flex-col items-center gap-1.5 shadow-2xs relative cursor-pointer hover:scale-[1.02] transition duration-200"
                    >
                      {/* BUTTON TOMBOL HAPUS FOTO (🗑️) */}
                      <button 
                        onClick={(e) => handleDeletePhoto(photo.id, e)}
                        className="absolute right-3 top-3 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-red-600 shadow-sm transition active:scale-90"
                        title="Hapus kenangan foto ini"
                      >
                        🗑️
                      </button>

                      <img src={photo.image} alt="Strip" className="w-full h-48 object-cover rounded-xl border border-white" />
                      <span className="text-[9px] text-gray-400 font-bold">{photo.date}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-20 text-gray-400 text-xs leading-relaxed">
                    Belum ada lembaran foto yang tercetak.<br/>Yuk buat keseruan fotomu di menu <span className="font-bold text-pink-500 cursor-pointer underline" onClick={() => router.push('/booth')}>Booth</span>!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL BARU: TAMPILAN ZOOM FOTO STRIP PENUH (VERTIRAL PREVIEW) ─── */}
        {selectedPreviewImg && (
          <div 
            onClick={() => setSelectedPreviewImg(null)} // Klik di mana saja di luar area gambar untuk menutup preview
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in cursor-zoom-out"
          >
            <div className="relative max-w-xs w-full flex flex-col items-center max-h-[90vh] overflow-y-auto rounded-xl scrollbar-none">
              <img 
                src={selectedPreviewImg} 
                alt="Full Photo Strip" 
                className="w-full h-auto object-contain rounded-xl border-4 border-white shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Supaya kalau gambarnya sendiri diklik nggak sengaja ketutup
              />
              <button 
                onClick={() => setSelectedPreviewImg(null)}
                className="mt-4 bg-white text-gray-700 font-bold text-xs px-5 py-2 rounded-full shadow-md hover:bg-gray-100 transition"
              >
                ✖️ Tutup Tampilan Full
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}