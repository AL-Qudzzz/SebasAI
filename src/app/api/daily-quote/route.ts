// src/app/api/daily-quote/route.ts
import { NextResponse } from 'next/server';

const quotes = [
  { id: 1, text: "Satu-satunya cara untuk melakukan pekerjaan hebat adalah dengan mencintai apa yang Anda lakukan.", author: "Steve Jobs" },
  { id: 2, text: "Berusahalah bukan untuk menjadi sukses, melainkan untuk menjadi bernilai.", author: "Albert Einstein" },
  { id: 3, text: "Pikiran adalah segalanya. Apa yang Anda pikirkan, itulah Anda.", author: "Buddha" },
  { id: 4, text: "Waktu Anda terbatas, jadi jangan sia-siakan dengan menjalani hidup orang lain.", author: "Steve Jobs" },
  { id: 5, text: "Cara terbaik untuk memprediksi masa depan adalah dengan menciptakannya.", author: "Peter Drucker" },
  { id: 6, text: "Jangan takut akan kesempurnaan, Anda tidak akan pernah mencapainya.", author: "Salvador Dalí" },
  { id: 7, text: "Hidup adalah apa yang terjadi ketika Anda sibuk membuat rencana lain.", author: "John Lennon" }
];

export async function GET(request: Request) {
  try {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    if (!quote) {
      // This case should ideally not happen if quotes array is not empty
      return NextResponse.json({ error: "No quotes available" }, { status: 404 });
    }
    return NextResponse.json({ quote });
  } catch (error) {
    console.error("Error fetching daily quote:", error);
    return NextResponse.json({ error: "Gagal mengambil kutipan harian" }, { status: 500 });
  }
}
