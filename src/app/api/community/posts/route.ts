
// src/app/api/community/posts/route.ts
import { NextResponse } from 'next/server';
import { createCommunityPost, getCommunityPosts, type CommunityPost } from '@/services/firestoreService';

export async function GET(request: Request) {
  try {
    const posts = await getCommunityPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching community posts API:", error);
    return NextResponse.json({ error: "Gagal mengambil postingan komunitas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { userId?: string, authorEmail?: string, content?: string };
    const { userId, authorEmail, content } = body;

    // Validasi yang lebih ketat di sisi server
    if (!userId || typeof userId !== 'string' || !authorEmail || typeof authorEmail !== 'string' || !content || typeof content !== 'string' || content.trim() === '') {
      console.error("Invalid data received for new post:", body);
      return NextResponse.json({ error: "Data tidak valid atau tidak lengkap (memerlukan userId, authorEmail, dan content)." }, { status: 400 });
    }

    const newPost: CommunityPost | null = await createCommunityPost(userId, authorEmail, content);

    if (!newPost) {
      // Kesalahan spesifik dicatat di dalam createCommunityPost, ini adalah pesan untuk pengguna.
      return NextResponse.json({ error: "Gagal menyimpan postingan ke database. Silakan periksa log server untuk detail lebih lanjut." }, { status: 500 });
    }
    
    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/community/posts:", error);
    if (error instanceof SyntaxError) {
        // Ini menangkap error dari `request.json()` jika body bukan JSON yang valid
        return NextResponse.json({ error: "Format request JSON tidak valid." }, { status: 400 });
    }
    // Error umum untuk masalah tak terduga lainnya
    return NextResponse.json({ error: "Terjadi kesalahan internal saat memproses postingan Anda." }, { status: 500 });
  }
}
