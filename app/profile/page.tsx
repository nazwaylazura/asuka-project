"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

export default function ProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();

  // State utama data user
  const [userData, setUserData] = useState({ name: "", pronouns: "she/her", profileImg: "" });
  
  // State interaktif untuk mengontrol mode edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPronouns, setEditPronouns] = useState("");
  const [editImg, setEditImg] = useState("");

  // 1. Load data awal dari Session Google atau data kustom LocalStorage milik email ini
  useEffect(() => {
    if (!session) return;

    const userEmail = session.user?.email;
    const savedName = localStorage.getItem(`user_name_${userEmail}`);
    const savedImg = localStorage.getItem(`user_img_${userEmail}`);
    const savedPronouns = localStorage.getItem(`user_pronouns_${userEmail}`);

    const initialData = {
      name: savedName || session.user?.name || "User",
      pronouns: savedPronouns || "she/her",
      profileImg: savedImg || session.user?.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    };

    setUserData(initialData);
    
    // Siapkan nilai awal untuk input form edit
    setEditName(initialData.name);
    setEditPronouns(initialData.pronouns);
    setEditImg(initialData.profileImg);
  }, [session]);

  // 2. Fungsi menyimpan perubahan data ke LocalStorage spesifik per email akun
  const handleSaveProfile = () => {
    if (!session?.user?.email) return;
    if (!editName.trim()) return alert("Nama tidak boleh kosong ya! 🌸");

    const userEmail = session.user.email;

    // Kunci data baru ke dalam localStorage menggunakan identitas unik email
    localStorage.setItem(`user_name_${userEmail}`, editName.trim());
    localStorage.setItem(`user_pronouns_${userEmail}`, editPronouns.trim());
    localStorage.setItem(`user_img_${userEmail}`, editImg.trim());

    // Update state tampilan layar
    setUserData({
      name: editName.trim(),
      pronouns: editPronouns.trim(),
      profileImg: editImg.trim()
    });

    setIsEditing(false); // Matikan mode edit, kembali ke tampilan biasa
    alert("Profil kencanmu berhasil diperbarui! ✨");
  };

  // 3. Fungsi backup data progres dan logout aman
  const handleLogout = async () => {
    if (!confirm("Apakah kamu yakin ingin keluar dari akun ini?")) return;
    const userKeyIdentifier = session?.user?.email || "guest";

    try {
      const currentProgress = {
        active_chat_list: localStorage.getItem('active_chat_list'),
        active_chat_bot: localStorage.getItem('active_chat_bot'),
        user_tokens: localStorage.getItem('user_tokens'),
        user_gifts: localStorage.getItem('user_gifts'),
      };

      const allKeys = Object.keys(localStorage);
      const dynamicLogs: Record<string, string | null> = {};
      
      allKeys.forEach(key => {
        if (key.startsWith('chat_log_') || key.startsWith('dating_log_') || key.startsWith('love_level_') || key.startsWith('streak_start_')) {
          dynamicLogs[key] = localStorage.getItem(key);
        }
      });

      const backupPackage = { currentProgress, dynamicLogs };
      localStorage.setItem(`user_backup_${userKeyIdentifier}`, JSON.stringify(backupPackage));

      const keysToRemove = ['active_chat_list', 'active_chat_bot', 'user_tokens', 'user_gifts', ...Object.keys(dynamicLogs)];
      keysToRemove.forEach(key => localStorage.removeItem(key));

    } catch (e) {
      console.error(e);
    }

    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Card Main Container */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-pink-50 shadow-xs relative mt-10 space-y-6">
          
          {/* Tombol Kembali (Hanya muncul jika sedang tidak dalam mode mengedit) */}
          {!isEditing && (
            <button onClick={() => router.push('/home')} className="absolute left-6 top-6 text-pink-400 hover:text-pink-600 font-bold text-xs flex items-center gap-1 transition">
              ⬅️ Kembali
            </button>
          )}

          <h1 className="text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
            {isEditing ? "Edit Mode 📝" : "Profile Info"}
          </h1>

          {/* Avatar Lingkaran */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-100 p-0.5 shadow-xs">
              <img src={isEditing ? editImg : userData.profileImg} alt="Profile" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>

          {/* === KONDISI A: JIKA SEDANG DALAM MODE EDIT (FORM INPUT NYALA) === */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">Nama Baru</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 bg-white border border-pink-200 focus:outline-pink-400 rounded-xl text-xs text-gray-700 font-medium mt-1"
                  placeholder="Ketik nama kencanmu..."
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">Pronouns</label>
                <input 
                  type="text" 
                  value={editPronouns}
                  onChange={(e) => setEditPronouns(e.target.value)}
                  className="w-full p-3 bg-white border border-pink-200 focus:outline-pink-400 rounded-xl text-xs text-gray-700 font-medium mt-1"
                  placeholder="e.g. she/her, he/him"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">URL Foto Profil (Link Gambar)</label>
                <input 
                  type="text" 
                  value={editImg}
                  onChange={(e) => setEditImg(e.target.value)}
                  className="w-full p-3 bg-white border border-pink-200 focus:outline-pink-400 rounded-xl text-xs text-gray-700 font-medium mt-1"
                  placeholder="Tempel link foto baru di sini..."
                />
              </div>

              {/* Tombol Kontrol Simpan & Batal */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => { setIsEditing(false); setEditName(userData.name); setEditPronouns(userData.pronouns); setEditImg(userData.profileImg); }}
                  className="flex-1 bg-gray-100 text-gray-500 font-bold text-xs py-3.5 rounded-xl hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-[2] bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition"
                >
                  💾 Simpan Perubahan
                </button>
              </div>
            </div>
          ) : (
            
            // === KONDISI B: TAMPILAN READ-ONLY BIASA ===
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">Nama</label>
                  <div className="w-full p-3.5 bg-pink-50/20 border border-pink-50 rounded-xl text-xs text-gray-600 font-medium mt-1">
                    {userData.name || "Loading..."}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider px-1">Pronouns</label>
                  <div className="w-full p-3.5 bg-pink-50/20 border border-pink-50 rounded-xl text-xs text-gray-600 font-medium mt-1">
                    {userData.pronouns}
                  </div>
                </div>
              </div>

              {/* Tombol Kontrol Menu Utama */}
              <div className="space-y-2 pt-2">
                <button 
                  onClick={() => setIsEditing(true)} // Aktifkan form edit saat diklik
                  className="w-full bg-white border border-pink-200 text-pink-500 font-bold text-xs py-3.5 rounded-xl hover:bg-pink-50/30 transition active:scale-[0.99]"
                >
                  Edit Informasi Profil
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-xs py-3.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1 animate-fade-in"
                >
                  🚪 Keluar / Logout Akun
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}