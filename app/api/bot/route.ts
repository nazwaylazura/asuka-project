import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    // Tangkap data dari frontend
    const body = await req.json();
    const { contentsHistory, systemInstruction } = body;

    // Ambil kunci rahasia langsung dari server
    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key tidak ditemukan di server.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Panggil Gemini dari server yang aman
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    // Kirim balasannya balik ke web
    return NextResponse.json({ reply: response?.text || "Bot tidak merespon..." });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'Gagal memanggil AI' }, { status: 500 });
  }
}