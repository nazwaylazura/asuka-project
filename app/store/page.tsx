"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StorePage() {
  const router = useRouter();

  const [tokens, setTokens] = useState(11);
  const [hasClaimedToday, setHasClaimedToday] = useState(false);

  const giftItems = [
    { id: 'gift_flower', name: 'Bunga Mawar', cost: 3, imgUrl: 'https://i.pinimg.com/736x/a0/18/96/a01896067c7ce6fafab76f36338deadc.jpg' },
    { id: 'gift_chocolate', name: 'Cokelat Manis', cost: 5, imgUrl: 'https://i.pinimg.com/736x/eb/98/e1/eb98e1eb1e5bded83aaffe6a01d7e5f4.jpg' },
    { id: 'gift_teddy', name: 'Boneka Beruang', cost: 8, imgUrl: 'https://i.pinimg.com/736x/5d/52/d5/5d52d5f10af841a4e488c2bb21aa2620.jpg' },
    { id: 'gift_perfume', name: 'Parfum Mewah', cost: 12, imgUrl: 'https://i.pinimg.com/736x/13/15/9d/13159d8bb55bee21ae67764d64c89d65.jpg' },
  ];

  useEffect(() => {
    const savedTokens = localStorage.getItem('user_tokens');
    const savedClaimStatus = localStorage.getItem('claimed_today');

    if (savedTokens) setTokens(parseInt(savedTokens));
    if (savedClaimStatus === 'true') setHasClaimedToday(true);
  }, []);

  const handleClaimToken = () => {
    const newTokens = tokens + 5; 
    setTokens(newTokens);
    setHasClaimedToday(true);
    
    localStorage.setItem('user_tokens', newTokens.toString());
    localStorage.setItem('claimed_today', 'true');
    alert("Yey! +5 Tiket harian berhasil diklaim! 🎟️✨");
  };

  const handleBuyGift = (giftName: string, cost: number) => {
    if (tokens < cost) {
      return alert("Yah, Tiket kamu tidak cukup untuk membeli kado ini! 🎟️😢");
    }

    const newTokens = tokens - cost;
    setTokens(newTokens);
    localStorage.setItem('user_tokens', newTokens.toString());

    const savedGifts = localStorage.getItem('user_gifts') ? JSON.parse(localStorage.getItem('user_gifts')!) : {};
    savedGifts[giftName] = (savedGifts[giftName] || 0) + 1;
    localStorage.setItem('user_gifts', JSON.stringify(savedGifts));

    alert(`Sukses membeli ${giftName}! Kado ini telah disimpan di tokomu 🎁🌸`);
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        <div className="flex justify-between items-center mb-6 w-full">
          <button onClick={() => router.push('/home')} className="text-pink-400 hover:text-pink-600 font-bold text-sm transition">
            ⬅️ Home
          </button>
          <h1 className="text-lg font-bold text-gray-700">Gift Store 🛒</h1>
          <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-pink-100 flex items-center">
            <span className="text-xs font-bold text-pink-600">🎟️ {tokens}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-pink-50 mb-8 text-center">
          <h3 className="text-sm font-bold text-gray-700 mb-1">Hadiah Harian Gratis 🎁</h3>
          <p className="text-xs text-gray-400 mb-4">Jangan lupa ambil tiket gratismu setiap hari untuk mengobrol bersama bot kesayanganmu!</p>
          <button 
            onClick={handleClaimToken}
            disabled={hasClaimedToday}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all ${
              hasClaimedToday 
                ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                : "bg-pink-500 text-white hover:bg-pink-600 active:scale-[0.98]"
            }`}
          >
            {hasClaimedToday ? "Hadiah Sudah Diambil Hari Ini ✓" : "Klaim Tiket Gratis Hari Ini ✨"}
          </button>
        </div>

        <h2 className="text-sm font-bold text-gray-600 mb-4 px-2 uppercase tracking-wider">Beli Kado untuk Bot 🌸</h2>
        <div className="grid grid-cols-2 gap-4">
          {giftItems.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] p-4 shadow-sm border border-pink-50 flex flex-col items-center">
              <div className="w-full aspect-square bg-pink-50 rounded-[1.5rem] mb-3 overflow-hidden">
                <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-gray-700 mb-1">{item.name}</p>
              <button 
                onClick={() => handleBuyGift(item.name, item.cost)}
                className="mt-2 w-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition py-2 rounded-xl text-xs font-bold flex justify-center items-center gap-1"
              >
                <span>🎟️ {item.cost}</span>
                <span className="text-gray-400">|</span>
                <span>Beli</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}