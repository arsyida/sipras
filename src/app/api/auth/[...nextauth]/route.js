// /src/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/database/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
        name: "Credentials",
        credentials: {
            username: { label: "Username", type: "text" },
            password: { label: "Password", type: "password"}
        },
        async authorize(credentials) {
            await connectToDatabase();

            const user = await User.findOne({ username: credentials.username });

            if (!user) {
                throw new Error("User not found");
            }

            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordCorrect) {
                throw new Error("Username atau password salah");
            }
            
            // Perbaikan: Konversi ObjectId ke string. Ini praktik terbaik.
            return {
                id: user._id.toString(), 
                name: user.name,
                email: user.email,
                role: user.role
            };
        }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge:  24 * 60 * 60, // 1 hari
    },
    callbacks: {
        async jwt({ token, user }) {
            // 'user' hanya ada saat pertama kali login
            if (user) {
                // Perbaikan: Gunakan user.id, bukan user._id
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Pastikan session.user ada sebelum menambahkan properti
            if(token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };