
// src/app/api/community/posts/interactions/route.ts
import { NextResponse } from 'next/server';
import { interactWithPost, getUserPostInteractions, type InteractionType } from '@/services/firestoreService';

// GET user interactions for a list of posts
export async function POST(request: Request) {
  try {
    const { userId, postIds } = await request.json() as { userId: string, postIds: string[] };

    if (!userId || !postIds || !Array.isArray(postIds)) {
      return NextResponse.json({ error: "User ID dan daftar post ID diperlukan." }, { status: 400 });
    }

    const interactions = await getUserPostInteractions(userId, postIds);
    return NextResponse.json(interactions);

  } catch (error) {
    console.error("Error in GET /api/community/posts/interactions:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal saat memproses permintaan Anda." }, { status: 500 });
  }
}


// PUT (update) an interaction (repost, bookmark)
export async function PUT(request: Request) {
  try {
    const { userId, postId, interactionType } = await request.json() as { userId: string, postId: string, interactionType: InteractionType };

    if (!userId || !postId || !['repost', 'bookmark'].includes(interactionType)) {
      return NextResponse.json({ error: "User ID, Post ID, dan tipe interaksi (repost/bookmark) diperlukan." }, { status: 400 });
    }

    const result = await interactWithPost(userId, postId, interactionType);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`Error in PUT /api/community/posts/interactions (${(request as any).interactionType}):`, error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui interaksi." }, { status: 500 });
  }
}
