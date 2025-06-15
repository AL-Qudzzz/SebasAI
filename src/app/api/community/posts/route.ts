
// src/app/api/community/posts/route.ts
import { NextResponse } from 'next/server';
import { createCommunityPost, getCommunityPosts } from '@/services/firestoreService';

export async function GET(request: Request) {
  try {
    const posts = await getCommunityPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching community posts:", error);
    return NextResponse.json({ error: "Gagal mengambil postingan komunitas." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, authorEmail, content } = await request.json() as { userId: string, authorEmail: string, content: string };

    if (!userId || !authorEmail || !content || content.trim() === '') {
      return NextResponse.json({ error: "User ID, email penulis, dan konten tidak boleh kosong." }, { status: 400 });
    }

    const postId = await createCommunityPost(userId, authorEmail, content);

    if (!postId) {
      return NextResponse.json({ error: "Gagal membuat postingan komunitas." }, { status: 500 });
    }
    // Optionally, return the created post or just a success message
    // For now, let's fetch all posts again to show the new one, or client can refetch
    const posts = await getCommunityPosts();
    return NextResponse.json(posts, { status: 201 });

  } catch (error) {
    console.error("Error creating community post:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat postingan komunitas." }, { status: 500 });
  }
}
