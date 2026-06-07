import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials" // <-- 1. Tambahkan impor ini di atas
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../../src/lib/prisma"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    // 1. Jalur Login Google OAuth asli milikmu (tidak diubah sama sekali)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),

    // 2. JALUR LOGIN MANUAL GMAIL + PASSWORD (Tambahan Baru)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validasi: Pastikan user mengisi email dan password di form
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password wajib diisi! 🌸");
        }

        // Cari akun di database Prisma berdasarkan email yang diinput user
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Jika email tidak ditemukan di database
        if (!user) {
          throw new Error("Akun belum terdaftar! Silakan Sign In dulu. ❌");
        }

        // Cocokkan password yang diketik dengan password yang ada di database kalian
        // (Catatan: Ini mencocokkan string biasa sesuai API register kita tadi)
        const isPasswordCorrect = credentials.password === user.password;

        if (!isPasswordCorrect) {
          throw new Error("Password salah! Silakan periksa kembali. ❌");
        }

        // Jika semua benar, kirim data user agar NextAuth membuatkan sesi login aktif
        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || "User Asuka",
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  // Tambahan opsi rahasia agar NextAuth tahu halaman login kustom kalian
  pages: {
    signIn: "/login", 
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }