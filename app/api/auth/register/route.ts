import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password tidak boleh kosong! 🌸" },
        { status: 400 }
      );
    }

    // 1. Cek apakah email sudah pernah terdaftar di database
    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return NextResponse.json(
        { message: "Email ini sudah terdaftar! Silakan langsung login. 🌸" },
        { status: 400 }
      );
    }

    // 2. Simpan akun baru ke tabel User database Prisma kalian
    const newUser = await prisma.user.create({
      data: {
        email: email,
        // Tips: Untuk aplikasi produksi riil, password wajib di-hash menggunakan library 'bcrypt'
        password: password, 
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil terdaftar!", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error Register API:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server database." },
      { status: 500 }
    );
  }
}