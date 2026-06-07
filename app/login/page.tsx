"use client";

import Link from 'next/link';
import { signIn } from 'next-auth/react'; // <-- Ini mesin pemanggil Google-nya!

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4">
      
      <div className="bg-white p-8 w-full max-w-sm rounded-3xl shadow-xl border border-pink-100 flex flex-col items-center text-center">
        
        {/* Logo Asuka */}
        <img 
          src="/logo.png" 
          alt="Logo Asuka" 
          className="w-20 h-20 rounded-full object-cover mb-4 shadow-md border-2 border-pink-200"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/150/EC4899/FFFFFF?text=A"
          }}
        />
        
        <h1 className="text-2xl font-extrabold text-pink-600 tracking-wider mb-2">ASUKA</h1>
        <p className="text-gray-500 text-sm mb-6">
          Masuk untuk mulai ngobrol dengan karakter AI favoritmu.
        </p>

        {/* --- FORM LOGIN / SIGN UP MANUAL --- */}
        <form className="w-full flex flex-col gap-3 mb-4">
          <input 
            type="email" 
            placeholder="Email (contoh@gmail.com)" 
            className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
          />
          <button 
            type="button" 
            onClick={() => alert("Fitur Email/Password sedang dibangun!")}
            className="w-full bg-pink-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-pink-600 transition-colors shadow-md mt-2"
          >
            Masuk / Daftar
          </button>
        </form>

        <div className="w-full flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-xs text-gray-400 font-medium">ATAU</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* --- TOMBOL LOGIN GOOGLE YANG SUDAH HIDUP --- */}
        <button 
          onClick={() => signIn('google', { callbackUrl: '/home' })} // <-- Perintah untuk login dan pindah ke /home
          className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-pink-300 transition-all flex items-center justify-center gap-3 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Lanjutkan dengan Google
        </button>

      </div>
    </div>
  );
}