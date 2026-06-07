"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State untuk form input manual
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // State untuk menentukan apakah user mau LOGIN atau DAFTAR BARU
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Jika NextAuth mendeteksi user sudah login, langsung terbangkan ke /home
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/home");
    }
  }, [status, router]);

  // Handler Login Otomatis Google OAuth (SUDAH DIPERBAIKI AGAR TIDAK STUCK/REFRESH)
  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      await signIn("google", { 
        callbackUrl: "/home",
        redirect: true 
      });
    } catch (err) {
      setErrorMsg("Gagal menghubungkan ke layanan Google OAuth. ❌");
    }
  };

  // Handler Kirim Form Manual (Login / Daftar Baru)
  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi! 🌸");
      setLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        // --- JALUR DAFTAR AKUN BARU (SIGN IN / REGISTER) ---
        // Menembak API backend buatanmu untuk mendaftarkan akun baru ke Prisma
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Gagal mendaftarkan akun.");
        }

        // Kalau sukses daftar, langsung otomatis loginkan memakai NextAuth Credentials
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          throw new Error("Gagal login otomatis setelah mendaftar.");
        }
        
        router.push("/home");
      } else {
        // --- JALUR LOGIN AKUN LAMA ---
        // Tembak provider credentials NextAuth bawaan
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (loginRes?.error) {
          throw new Error("Email atau Password salah! Periksa kembali ya. ❌");
        }

        router.push("/home");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 border border-pink-50 shadow-sm text-center space-y-6">
        
        {/* Logo / Icon Aplikasi */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-pink-100 rounded-[2rem] flex items-center justify-center text-3xl shadow-xs animate-bounce">
            💖
          </div>
        </div>

        {/* Judul Aplikasi */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-700">Welcome to Asuka ✨</h1>
          <p className="text-xs text-gray-400 max-w-[85%] mx-auto leading-relaxed">
            {isRegisterMode 
              ? "Daftarkan Gmail milikmu untuk mulai membangun hubungan roleplay virtual." 
              : "Temukan pasangan impianmu dan bangun hubungan kencan roleplay virtual yang imersif."}
          </p>
        </div>

        {/* NOTIFIKASI ERROR (JIKA ADA) */}
        {errorMsg && (
          <div className="bg-red-50 text-red-500 text-xs py-2 px-4 rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {/* TOMBOL LOGIN GOOGLE (TETAP ADA DI ATAS & ASLI) */}
        {!isRegisterMode && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={status === "loading" || loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs py-4 rounded-2xl shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:bg-pink-300 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <span className="animate-pulse">Menghubungkan Sesi... 🌸</span>
              ) : (
                <>
                  <span>🌐</span> Masuk dengan Akun Google
                </>
              )}
            </button>
            
            {/* Pembatas Garis OR */}
            <div className="flex items-center my-4 justify-center gap-2">
              <div className="h-[1px] w-full bg-gray-100"></div>
              <span className="text-[10px] text-gray-400 font-bold tracking-wider">ATAU</span>
              <div className="h-[1px] w-full bg-gray-100"></div>
            </div>
          </div>
        )}

        {/* FORM INPUT MANUAL (EMAIL & PASSWORD) */}
        <form onSubmit={handleManualAuth} className="space-y-3 text-left">
          <div>
            <label className="text-[11px] font-bold text-gray-500 ml-1">ALAMAT GMAIL</label>
            <input
              type="email"
              placeholder="contoh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-xs focus:outline-none focus:border-pink-300 transition mt-1 text-gray-700"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 ml-1">PASSWORD</label>
            <input
              type="password"
              placeholder="Masukkan password rahasia"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 px-4 text-xs focus:outline-none focus:border-pink-300 transition mt-1 text-gray-700"
            />
          </div>

          {/* TOMBOL EKSEKUSI MANUALLY */}
          <button
            type="submit"
            disabled={loading || status === "loading"}
            className="w-full bg-white border-2 border-pink-400 text-pink-500 font-bold text-xs py-4 rounded-2xl hover:bg-pink-50/20 transition active:scale-[0.99] flex items-center justify-center gap-2 mt-4 disabled:bg-gray-50 disabled:text-gray-300 disabled:border-gray-200"
          >
            {loading ? (
              <span className="animate-pulse">Memproses Data... 🌸</span>
            ) : (
              <>
                <span>{isRegisterMode ? "📝" : "📧"}</span>{" "}
                {isRegisterMode ? "Sign In (Daftar Akun Baru)" : "Masuk dengan Gmail / Password"}
              </>
            )}
          </button>
        </form>

        {/* TOGGLE PINDAH MODE LOGIN / DAFTAR BARU */}
        <div className="text-xs pt-1">
          <span className="text-gray-400">
            {isRegisterMode ? "Sudah punya akun sebelumnya?" : "Belum pernah mendaftar lewat Gmail?"}{" "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg("");
            }}
            className="text-pink-500 font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            {isRegisterMode ? "Login di Sini" : "Daftar Akun Baru (Sign In)"}
          </button>
        </div>

        <p className="text-[10px] text-gray-400">
          Dengan masuk, kamu menyetujui Aturan Kencan Tugas UAS Project.
        </p>

      </div>
    </div>
  );
}