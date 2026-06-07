import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { contentsHistory, systemInstruction } = body;

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key tidak ditemukan di server.' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contentsHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8, // Suhu dating agak dibikin liar dikit (0.8) sesuai kodingan lo
        maxOutputTokens: 1000,
      }
    });

    return NextResponse.json({ reply: response?.text || "*Karaktermu hanya terdiam tersipu malu...*" });

  } catch (error) {
    console.error("Gemini Dating API Error:", error);
    return NextResponse.json({ error: 'Gagal memanggil AI Dating' }, { status: 500 });
  }
}