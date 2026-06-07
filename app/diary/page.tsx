"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DiaryEntry {
  id: number;
  date: string;
  title: string;
  content: string;
}

export default function DiaryPage() {
  const router = useRouter();

  // State list catatan (Dimulai dari array kosong agar benar-benar seperti user baru)
  const [diaries, setDiaries] = useState<DiaryEntry[]>([]);

  // State Form Input
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Ambil data diary lama dari localStorage saat halaman dibuka
  useEffect(() => {
    const savedDiaries = localStorage.getItem('user_diaries');
    if (savedDiaries) {
      setDiaries(JSON.parse(savedDiaries));
    }
  }, []);

  // Fungsi menambah & menyimpan diary ke localStorage
  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return alert("Judul dan isi hati tidak boleh kosong ya! 📝");

    const newEntry: DiaryEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      title,
      content
    };

    const updatedDiaries = [newEntry, ...diaries];
    setDiaries(updatedDiaries);
    
    // Simpan permanen ke memory browser
    localStorage.setItem('user_diaries', JSON.stringify(updatedDiaries));

    setTitle("");
    setContent("");
    setIsAdding(false);
    alert("Cerita berhasil dikunci di dalam Diary! 🔒✨");
  };

  return (
    <div className="min-h-screen bg-[#fff5f8] px-6 py-8 pb-28 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* Header Navigasi */}
        <div className="flex justify-between items-center mb-6 w-full">
          <button 
            onClick={() => router.push('/home')}
            className="text-pink-400 hover:text-pink-600 font-bold text-sm transition"
          >
            ⬅️ Home
          </button>
          <h1 className="text-lg font-bold text-gray-700">Dear Diary 📖</h1>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-pink-200 text-xs font-bold text-pink-500 hover:bg-pink-50 transition"
          >
            {isAdding ? "Batal" : "+ Tulis"}
          </button>
        </div>

        {/* FORM INPUT DIARY BARU */}
        {isAdding && (
          <form onSubmit={handleAddDiary} className="bg-white rounded-[2rem] p-5 shadow-sm border border-pink-50 mb-6 space-y-3 transition-all">
            <input 
              type="text" 
              placeholder="Judul cerita hari ini..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl text-sm border border-pink-100 bg-pink-50/10 text-gray-700 focus:outline-pink-300 font-semibold"
            />
            <textarea 
              placeholder="Tuliskan semua isi hatimu di sini..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-3 rounded-xl text-sm border border-pink-100 bg-pink-50/10 text-gray-700 focus:outline-pink-300"
            />
            <button 
              type="submit"
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-pink-600 transition shadow-sm shadow-pink-100"
            >
              Simpan Cerita Ke Diary 💾
            </button>
          </form>
        )}

        {/* DAFTAR LIST DIARY */}
        <div className="space-y-4">
          {diaries.length > 0 ? (
            diaries.map((diary) => (
              <div key={diary.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-pink-50 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-gray-700">{diary.title}</h3>
                  <span className="text-[10px] bg-pink-50 text-pink-500 font-semibold px-2 py-1 rounded-full">{diary.date}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{diary.content}</p>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[2rem] p-8 text-center border border-pink-50 text-gray-400 text-xs shadow-sm">
              🌸 Belum ada lembaran cerita tertulis.<br/>Yuk ketuk tombol "+ Tulis" untuk mencurahkan isi hatimu!
            </div>
          )}
        </div>

      </div>
    </div>
  );
}