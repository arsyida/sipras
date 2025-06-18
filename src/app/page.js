import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h1>SIPRAS</h1>
      <p>Platform digital terpusat untuk pengelolaan, pemantauan, dan pelaporan data sarana dan prasarana secara efisien, akurat, dan transparan</p>
      <Image
        src="/images/nextjs-logo.png" // Ganti dengan path gambar Anda
        alt="Next.js Logo"
        width={500}
        height={300}
      />
      </div>
  );
}
