
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

    if (!userId || !authorEmail || !content || content.trim() === '') {
      return NextResponse.json({ error: "User ID, email penulis, dan konten tidak boleh kosong." }, { status: 400 });
    }

    const newPost: CommunityPost | null = await createCommunityPost(userId, authorEmail, content);

    if (!newPost) {
      return NextResponse.json({ error: "Gagal menyimpan postingan ke database. Periksa aturan keamanan Firestore atau konfigurasi Firebase Anda." }, { status: 500 });
    }
    
    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/community/posts:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Format request JSON tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan internal saat memproses postingan Anda." }, { status: 500 });
  }
}
