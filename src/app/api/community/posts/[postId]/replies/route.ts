
// src/app/api/community/posts/[postId]/replies/route.ts
import { NextResponse } from 'next/server';
import { createReply, getReplies } from '@/services/firestoreService';

interface RouteParams {
    params: { postId: string };
}

// GET replies for a post
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { postId } = params;
        if (!postId) {
            return NextResponse.json({ error: "Post ID diperlukan." }, { status: 400 });
        }
        const replies = await getReplies(postId);
        return NextResponse.json(replies);
    } catch (error) {
        console.error("Error fetching replies:", error);
        return NextResponse.json({ error: "Gagal mengambil balasan." }, { status: 500 });
    }
}


// POST a new reply to a post
export async function POST(request: Request, { params }: RouteParams) {
    try {
        const { postId } = params;
        const { userId, authorEmail, content } = await request.json() as { userId: string, authorEmail: string, content: string };

        if (!postId || !userId || !authorEmail || !content) {
            return NextResponse.json({ error: "Data yang diperlukan tidak lengkap." }, { status: 400 });
        }

        const newReply = await createReply(postId, userId, authorEmail, content);

        if (!newReply) {
            return NextResponse.json({ error: "Gagal menyimpan balasan." }, { status: 500 });
        }

        return NextResponse.json(newReply, { status: 201 });

    } catch (error) {
        console.error("Error creating reply:", error);
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 });
        }
        return NextResponse.json({ error: "Terjadi kesalahan internal." }, { status: 500 });
    }
}
