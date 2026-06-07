export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center w-full">
      <div className="animate-pulse flex flex-col items-center">
        {/* Lingkaran Logo Asuka */}
        <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <span className="text-white text-4xl font-extrabold">A</span>
        </div>
        {/* Teks Berkedip */}
        <h1 className="text-2xl font-extrabold text-pink-600 tracking-widest">ASUKA</h1>
        <p className="text-pink-400 mt-2 font-medium">Memuat data...</p>
      </div>
    </div>
  )
}