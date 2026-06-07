"use client";
import { usePathname, useRouter } from 'next/navigation';

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbarPaths = ['/', '/login'];
  
  if (hideNavbarPaths.includes(pathname)) {
    return null;
  }

  // ─── SAKLAR NUKLIR: MATIKAN SEMUA KAMERA DI BROWSER SECARA PAKSA ───
  const forceKillAllCameras = (targetHref: string) => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          // Tangkap track global browser lalu matikan satu-persatu
          mediaStream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {});
    }

    // Eksekusi pembersihan manual via window navigator stream jika ada yang tersisa
    if ((window as any).localStream) {
      (window as any).localStream.getTracks().forEach((track: any) => track.stop());
    }

    // Pindahkan halaman dengan aman
    router.push(targetHref);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-pink-100 flex justify-around items-center z-50">
      {[
        { name: 'Home', href: '/home', icon: '🏠' },
        { name: 'Chat', href: '/chat', icon: '✉️' },
        { name: 'Us', href: '/us', icon: '👩‍❤️‍👨' },
        { name: 'Find', href: '/find', icon: '🔍' },
      ].map((item) => (
        <button 
          key={item.name} 
          onClick={() => forceKillAllCameras(item.href)}
          className="flex flex-col items-center gap-1 transition-all hover:scale-110 hover:-translate-y-1 bg-transparent border-none outline-none cursor-pointer"
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-[10px] font-bold text-pink-400">{item.name}</span>
        </button>
      ))}
    </nav>
  );
}