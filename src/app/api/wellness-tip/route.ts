
// src/app/api/wellness-tip/route.ts
import { NextResponse } from 'next/server';

const wellnessTips = [
  "Minumlah segelas air putih saat bangun tidur.",
  "Luangkan waktu 5 menit untuk meditasi atau pernapasan dalam.",
  "Regangkan tubuh Anda setiap satu jam jika Anda banyak duduk.",
  "Tuliskan tiga hal yang Anda syukuri hari ini.",
  "Berjalan kaki singkat di luar ruangan jika memungkinkan.",
  "Pastikan Anda mendapatkan tidur yang cukup malam ini (7-9 jam).",
  "Makanlah setidaknya satu porsi buah atau sayuran segar.",
  "Hubungi teman atau anggota keluarga untuk sekadar menyapa.",
  "Batasi waktu layar Anda, terutama sebelum tidur.",
  "Lakukan satu aktivitas yang Anda nikmati hanya untuk diri sendiri.",
  "Rencanakan sesuatu yang Anda nantikan di akhir pekan.",
  "Belajar mengatakan 'tidak' pada permintaan yang membebani Anda.",
  "Rapikan area kerja atau tempat tinggal Anda untuk pikiran yang lebih jernih.",
  "Dengarkan musik yang menenangkan atau membangkitkan semangat.",
  "Cobalah resep baru yang sehat dan mudah dibuat."
];

export async function GET(request: Request) {
  try {
    const randomIndex = Math.floor(Math.random() * wellnessTips.length);
    const tip = wellnessTips[randomIndex];
    if (!tip) {
      return NextResponse.json({ error: "Tidak ada tips tersedia saat ini." }, { status: 404 });
    }
    return NextResponse.json({ tip });
  } catch (error) {
    console.error("Error fetching wellness tip:", error);
    return NextResponse.json({ error: "Gagal mengambil tips kesejahteraan." }, { status: 500 });
  }
}
