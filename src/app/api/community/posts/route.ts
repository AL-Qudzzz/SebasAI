
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
    const { userId, authorEmail, content } = await request.json() as { userId: string, authorEmail: string, content: string };

    if (!userId || !authorEmail || !content || content.trim() === '') {
      return NextResponse.json({ error: "User ID, email penulis, dan konten tidak boleh kosong." }, { status: 400 });
    }

    const newPost: CommunityPost | null = await createCommunityPost(userId, authorEmail, content);

    if (!newPost) {
      // This error message is shown to the user if createCommunityPost returns null
      return NextResponse.json({ error: "Gagal membuat postingan komunitas. Periksa log server untuk detail." }, { status: 500 });
    }
    
    // Return the newly created post object directly
    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    // This catch block handles errors like request.json() failing or other unexpected issues
    console.error("Error in POST /api/community/posts:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Terjadi kesalahan internal saat memproses permintaan Anda." }, { status: 500 });
  }
}
