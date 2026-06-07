"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface FrameTemplate {
  id: string;
  name: string;
  category: 'random' | 'lover';
  fileName: string;
  maxPhotos: number;
}

export default function BoothPage() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State Alur Navigasi
  const [boothStep, setBoothStep] = useState<'select-category' | 'take-photo'>('select-category');
  const [selectedCategory, setSelectedCategory] = useState<'random' | 'lover' | null>(null);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(0);

  // State Foto
  const [capturedSlots, setCapturedSlots] = useState<string[]>([]);
  const [finalStrip, setFinalStrip] = useState<string | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // DATA REPO SESUAI NAMA FILE BROWSER KAMU
  const frameTemplates: FrameTemplate[] = [
    { id: 'r-pink', name: '🌸 Pastel Pink', category: 'random', fileName: 'frame-pink.png', maxPhotos: 3 },
    { id: 'r-yellow', name: '💛 Soft Yellow', category: 'random', fileName: 'frame-yellow.png', maxPhotos: 3 },
    { id: 'r-blue', name: '🩵 Ocean Blue', category: 'random', fileName: 'frame-blue.png', maxPhotos: 3 },
    
    { id: 'l-toji', name: '⚔️ With Toji', category: 'lover', fileName: 'frame-toji.png', maxPhotos: 2 },
    { id: 'l-suguru', name: '🔮 With Suguru', category: 'lover', fileName: 'frame-suguru.png', maxPhotos: 2 },
    { id: 'l-megumi', name: '🐺 With Megumi', category: 'lover', fileName: 'frame-megumi.png', maxPhotos: 2 },
  ];

  const availableFrames = frameTemplates.filter(f => f.category === selectedCategory);
  const currentMaxPhotos = availableFrames[selectedFrameIdx]?.maxPhotos || 3;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    async function startCamera() {
      if (boothStep !== 'take-photo' || finalStrip) return;
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 450, height: 350, facingMode: "user" }, 
          mediaStream: false 
        } as any);
        streamRef.current = mediaStream;
        (window as any).localStream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error(err);
        alert("Gagal mengakses kamera browser! 📸");
        setBoothStep('select-category');
      }
    }
    startCamera();
    return () => stopCamera();
  }, [boothStep, finalStrip]);

  const handleBackToHome = () => {
    stopCamera();
    if ((window as any).localStream) {
      (window as any).localStream.getTracks().forEach((track: any) => track.stop());
    }
    router.push('/home');
  };

  const startPhotoSession = () => {
    setCapturedSlots([]);
    setFinalStrip(null);
    takeSnapshotsLoop([]);
  };

  const takeSnapshotsLoop = (currentPhotos: string[]) => {
    if (currentPhotos.length >= currentMaxPhotos) {
      generatePhotoStrip(currentPhotos);
      return;
    }

    let count = 3; 
    setIsCounting(true);
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setIsCounting(false);
        
        if (videoRef.current) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 450;
          tempCanvas.height = 350;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.translate(450, 0);
            tempCtx.scale(-1, 1);
            tempCtx.drawImage(videoRef.current, 0, 0, 450, 350);
            
            const photoUrl = tempCanvas.toDataURL('image/png');
            const newPhotos = [...currentPhotos, photoUrl];
            setCapturedSlots(newPhotos);
            takeSnapshotsLoop(newPhotos);
          }
        }
      }
    }, 1000);
  };

  // ─── PUSAT MAPPING PIKSEL PER-FRAME SECARA SENSITIF ───
  const generatePhotoStrip = (photos: string[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentFrame = availableFrames[selectedFrameIdx];
    const frameImg = new Image();
    frameImg.src = `/${currentFrame.fileName}`;

    frameImg.onload = () => {
      canvas.width = frameImg.width || 565;
      canvas.height = frameImg.height || 1600;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let loadedPhotos = 0;
      photos.forEach((photoSrc, index) => {
        const userImg = new Image();
        userImg.src = photoSrc;
        userImg.onload = () => {
          loadedPhotos++;

          let targetX = 0;
          let targetY = 0;
          let targetW = 0;
          let targetH = 0;

          // ========================================================
          // MAPPING KOORDINAT MANUAL BERDASARKAN FILE ASLI KAMU
          // ========================================================
          if (selectedCategory === 'random') {
            if (currentFrame.fileName === 'frame-pink.png') {
              targetX = 64;
              targetW = 437;
              targetH = 342; // Melar menutup area putih bocor bawah
              const pinkY = [222, 595, 968]; 
              targetY = pinkY[index];
            } 
            else if (currentFrame.fileName === 'frame-yellow.png') {
              targetX = 72;
              targetW = 420;
              targetH = 330;
              const yellowY = [115, 510, 910]; 
              targetY = yellowY[index];
            } 
            else {
              targetX = 65;
              targetW = 435;
              targetH = 310;
              const blueY = [150, 528, 905];
              targetY = blueY[index];
            }
            ctx.drawImage(userImg, targetX, targetY, targetW, targetH);

          } else {
            // === KATEGORI ANIME LOVER ===
            if (currentFrame.fileName === 'frame-toji.png') {
              targetX = 25;
              targetW = canvas.width - (targetX * 2);
              targetH = (canvas.height / 2) - 100;
              targetY = index === 0 ? 80 : (canvas.height / 2) - 20;
              ctx.drawImage(userImg, targetX, targetY, targetW, targetH);
            } 
            else if (currentFrame.fileName === 'frame-suguru.png') {
              targetX = 68;  // Kunci perataan tengah polaroid abu-abu
              targetW = 415; // Lebar aman pangkas agar tidak muntah keluar batas kanan
              targetH = 310; 
              const suguruY = [160, 515]; 
              targetY = suguruY[index];
              ctx.drawImage(userImg, targetX, targetY, targetW, targetH);
            } 
            else if (currentFrame.fileName === 'frame-megumi.png') {
              targetX = 68;
              targetW = 415;
              targetH = 310;
              const megumiY = [145, 495];
              targetY = megumiY[index];
              ctx.drawImage(userImg, targetX, targetY, targetW, targetH);
            }
          }

          // TIMPA LAYER BINGKAI PNG DI BAGIAN PALING ATAS (OVERLAY)
          if (loadedPhotos === currentMaxPhotos) {
            ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

            const stripDataUrl = canvas.toDataURL('image/png');
            setFinalStrip(stripDataUrl);

            if (session?.user?.email) {
              const galleryKey = `user_gallery_${session.user.email}`;
              const existingGalleryRaw = localStorage.getItem(galleryKey);
              const currentGallery = existingGalleryRaw ? JSON.parse(existingGalleryRaw) : [];
              
              const newMemory = {
                id: Date.now(),
                image: stripDataUrl,
                date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              };
              localStorage.setItem(galleryKey, JSON.stringify([newMemory, ...currentGallery]));
            }
            stopCamera();
          }
        };
      });
    };
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {boothStep === 'select-category' && (
          <div className="space-y-6 animate-fade-in pt-4">
            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-gray-700">Pilih Tipe Frame Kencanmu ✨</h2>
              <p className="text-[11px] text-gray-400 max-w-[80%] mx-auto leading-relaxed">Pilih konsep bingkai fotomu. Beda kategori memiliki jumlah slot jepretan berbeda.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => { setSelectedCategory('random'); setSelectedFrameIdx(0); setBoothStep('take-photo'); }}
                className="bg-white p-6 rounded-[2rem] border-2 border-pink-100 hover:border-pink-400 shadow-2xs text-left transition flex items-center gap-5 group active:scale-[0.99]"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-400 to-pink-300 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition">🎨</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-700">Aesthetic Random Frame</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Bingkai warna pastel estetik. Berisi <span className="text-pink-500 font-bold">3 slot foto</span> strip.</p>
                </div>
              </button>

              <button
                onClick={() => { setSelectedCategory('lover'); setSelectedFrameIdx(0); setBoothStep('take-photo'); }}
                className="bg-white p-6 rounded-[2rem] border-2 border-pink-100 hover:border-pink-400 shadow-2xs text-left transition flex items-center gap-5 group active:scale-[0.99]"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-pink-400 to-red-300 rounded-2xl flex items-center justify-center text-2xl shadow-xs transition">👩‍❤️‍👨</div>
                <div>
                  <h3 className="text-xs font-bold text-gray-700">With Your Anime Lover</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Bingkai kustom karakter anime favoritmu. Berisi <span className="text-pink-500 font-bold">2 slot foto</span> strip.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {boothStep === 'take-photo' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center w-full mb-1">
              <button onClick={() => { stopCamera(); setBoothStep('select-category'); setFinalStrip(null); setCapturedSlots([]); }} className="text-xs font-bold text-gray-400 hover:text-gray-600">
                🔙 Ganti Kategori
              </button>
              <button onClick={handleBackToHome} className="text-xs font-bold text-pink-500 hover:text-pink-600">
                🏠 Keluar ke Home
              </button>
            </div>
            
            {!finalStrip ? (
              <div className="relative w-full aspect-[3/4] bg-black rounded-[2rem] overflow-hidden border-4 border-white shadow-md flex flex-col justify-between">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                
                {isCounting && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                    <p className="text-white text-7xl font-extrabold animate-ping">{countdown}</p>
                  </div>
                )}

                <div className="absolute right-3 top-3 space-y-1.5 z-10 bg-black/40 p-2 rounded-xl backdrop-blur-xs">
                  <p className="text-[8px] text-white font-bold text-center">Slots: {capturedSlots.length}/{currentMaxPhotos}</p>
                  {Array.from({ length: currentMaxPhotos }).map((_, idx) => (
                    <div key={idx} className="w-12 h-9 border border-white/30 rounded bg-gray-900/60 overflow-hidden flex items-center justify-center text-[9px] text-white font-bold">
                      {capturedSlots[idx] ? <img src={capturedSlots[idx]} className="w-full h-full object-cover" /> : idx + 1}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center mb-2 animate-fade-in">
                <img src={finalStrip} alt="Final Strip" className="w-56 rounded-xl shadow-lg border-4 border-white" />
                <p className="text-[10px] text-pink-500 font-bold mt-2 bg-pink-50 px-3 py-1 rounded-full">✨ Tersimpan otomatis ke galeri kenangan halaman US</p>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {!finalStrip && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">Pilih Desain Varian Bingkai:</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {availableFrames.map((frame, index) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrameIdx(index)}
                      className={`text-xs px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition ${
                        selectedFrameIdx === index ? 'bg-pink-500 text-white shadow-xs' : 'bg-white text-gray-500 border border-pink-50 hover:bg-pink-50/40'
                      }`}
                    >
                      {frame.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!finalStrip ? (
              <button 
                disabled={isCounting}
                onClick={startPhotoSession}
                className="w-full bg-pink-500 text-white font-bold text-xs py-4 rounded-xl shadow-md hover:bg-pink-600 transition disabled:bg-gray-300"
              >
                {capturedSlots.length > 0 ? "🔄 Ulang Sesi Foto" : `📸 Mulai Ambil ${currentMaxPhotos} Foto`}
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => { setFinalStrip(null); setCapturedSlots([]); }}
                  className="flex-1 bg-white text-gray-500 border border-pink-100 font-bold text-xs py-3.5 rounded-xl hover:bg-gray-50 transition"
                >
                  🔄 Sesi Baru
                </button>
                <a 
                  href={finalStrip} 
                  download="asuka_booth_strip.png"
                  className="flex-[2] bg-pink-500 text-white font-bold text-xs py-3.5 rounded-xl shadow-md hover:bg-pink-600 transition flex items-center justify-center"
                >
                  💾 Download Kertas Strip (.png)
                </a>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}