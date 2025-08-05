
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PageTitle from '@/components/common/PageTitle';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, MessageSquareText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost, Reply } from '@/services/firestoreService';
import PostCard from '@/components/community/PostCard';

interface UserInteractions {
  reposted: Set<string>;
  bookmarked: Set<string>;
}

// --- DUMMY DATA FOR DEBUGGING ---
const dummyPosts: CommunityPost[] = [
  {
    id: 'dummy1',
    userId: 'user123',
    authorEmail: 'susan.testing@example.com',
    content: 'Ini adalah postingan dummy untuk pengujian. Tampilannya bagus, dan semua tombol interaksi (balas, repost, bookmark) seharusnya berfungsi di sisi UI.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    replyCount: 2,
    repostCount: 5,
    bookmarkCount: 10,
    replies: [
        { id: 'reply1', userId: 'user456', authorEmail: 'john.doe@example.com', content: 'Komentar pertama! Terlihat bagus.', createdAt: new Date().toISOString() },
        { id: 'reply2', userId: 'user789', authorEmail: 'jane.doe@example.com', content: 'Setuju, tata letaknya berfungsi dengan baik.', createdAt: new Date().toISOString() }
    ]
  },
  {
    id: 'dummy2',
    userId: 'user456',
    authorEmail: 'brian.dev@example.com',
    content: 'Postingan kedua untuk mengisi ruang dan memeriksa fungsionalitas scroll. Sejauh ini, semuanya tampak hebat. Fitur balasan juga dapat diuji di sini.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    replyCount: 0,
    repostCount: 1,
    bookmarkCount: 3,
    replies: []
  },
];
// --- END DUMMY DATA ---


// --- Sub-components for better organization ---

function CreatePostForm({
  currentUser,
  onPostCreated
}: {
  currentUser: any;
  onPostCreated: (newPost: CommunityPost) => void;
}) {
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const { toast } = useToast();

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    // Temporarily disable posting to focus on displaying data
    toast({ title: "Fitur Dinonaktifkan Sementara", description: "Pembuatan postingan dinonaktifkan untuk debugging. Data yang ditampilkan adalah data dummy." });
    return;
    /*
    if (!currentUser) {
      toast({ title: "Otentikasi Gagal", description: "Anda harus login untuk membuat postingan.", variant: "destructive" });
      return;
    }
    if (!newPostContent.trim()) {
      toast({ title: "Validasi Gagal", description: "Konten postingan tidak boleh kosong.", variant: "destructive" });
      return;
    }
    setIsSubmittingPost(true);
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          authorEmail: currentUser.email || 'Anonim',
          content: newPostContent,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Gagal membuat postingan. Periksa log server untuk detail.' }));
        throw new Error(errData.error);
      }
      const newPost: CommunityPost = await response.json();
      onPostCreated(newPost);
      setNewPostContent('');
      toast({ title: "Sukses", description: "Postingan berhasil dibuat!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal membuat postingan.", variant: "destructive" });
    } finally {
      setIsSubmittingPost(false);
    }
    */
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-primary">Buat Postingan Baru</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePost} className="space-y-4">
          <Textarea
            placeholder={`Bagikan pemikiranmu, ${currentUser.email?.split('@')[0] || 'Pengguna'}...`}
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            rows={3}
            required
            className="min-h-[80px]"
          />
          <Button type="submit" disabled={isSubmittingPost || !newPostContent.trim()} className="w-full sm:w-auto">
            {isSubmittingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Kirim Postingan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function CommunityFeed({
    posts,
    currentUser,
    userInteractions,
    onInteraction,
    onReplyCreated,
}: {
    posts: CommunityPost[];
    currentUser: any;
    userInteractions: UserInteractions;
    onInteraction: (postId: string, interactionType: 'repost' | 'bookmark') => void;
    onReplyCreated: (postId: string, newReply: Reply) => void;
}) {
    if (posts.length === 0) {
        return (
            <Card className="w-full">
                <CardContent className="pt-6 text-center">
                    <MessageSquareText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">Belum ada postingan di komunitas.</p>
                    <p className="text-sm text-muted-foreground">Jadilah yang pertama untuk berbagi!</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <div className="space-y-4 w-full">
            <h2 className="text-2xl font-headline text-primary">Postingan Komunitas</h2>
            {posts.map((post) => (
                <PostCard
                    key={post.id}
                    post={post}
                    currentUser={currentUser}
                    userInteractions={userInteractions}
                    onInteraction={onInteraction}
                    onReplyCreated={onReplyCreated}
                />
            ))}
        </div>
    );
}


// --- Main Page Component ---

export default function CommunityPage() {
  const router = useRouter();
  const { currentUser, loadingAuthState } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({ reposted: new Set(), bookmarked: new Set() });

  const fetchPosts = useCallback(async (userId?: string | null) => {
    setIsLoadingPosts(true);
    // Use dummy data instead of fetching from API
    setTimeout(() => {
        setPosts(dummyPosts);
        setUserInteractions({
            reposted: new Set(['dummy2']), // Let's say user has reposted the second dummy post
            bookmarked: new Set(['dummy1']), // and bookmarked the first one
        });
        setIsLoadingPosts(false);
    }, 500); // Simulate network delay
  }, []);

  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/auth');
    } else if (currentUser) {
      fetchPosts(currentUser.uid);
    }
  }, [currentUser, loadingAuthState, router, fetchPosts]);
  
  const handleInteraction = async (postId: string, interactionType: 'repost' | 'bookmark') => {
    if (!currentUser) return;

    // Optimistic UI Update for dummy data
    setUserInteractions(prev => {
        const newSet = new Set(prev[interactionType === 'repost' ? 'reposted' : 'bookmarked']);
        if (newSet.has(postId)) {
            newSet.delete(postId);
        } else {
            newSet.add(postId);
        }
        return { ...prev, [interactionType === 'repost' ? 'reposted' : 'bookmarked']: newSet };
    });

    setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
            const currentCount = p[`${interactionType}Count`] || 0;
            const hasInteracted = userInteractions[interactionType === 'repost' ? 'reposted' : 'bookmarked'].has(postId);
            return {
                ...p,
                [`${interactionType}Count`]: hasInteracted ? currentCount - 1 : currentCount + 1,
            };
        }
        return p;
    }));

    toast({ title: "Interaksi Dummy", description: `Anda ${userInteractions[interactionType === 'repost' ? 'reposted' : 'bookmarked'].has(postId) ? 'menghapus' : 'menambahkan'} ${interactionType} pada postingan dummy.` });
  };

  const handlePostCreated = (newPost: CommunityPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleReplyCreated = (postId: string, newReply: Reply) => {
    setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
            return {
                ...post,
                replyCount: post.replyCount + 1,
                replies: [...(post.replies || []), newReply],
            };
        }
        return post;
    }));
    toast({ title: "Balasan Dummy", description: "Balasan Anda ditambahkan ke postingan dummy." });
  };
  
  if (loadingAuthState) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memuat halaman komunitas...</p>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-muted-foreground">Mengarahkan ke halaman login...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 flex flex-col items-center w-full">
      <div className="w-full">
        <PageTitle
          title="Komunitas Sebas"
          description="Terhubung, berbagi, dan dapatkan dukungan dari pengguna lain."
        />
      </div>

      <CreatePostForm currentUser={currentUser} onPostCreated={handlePostCreated} />

      {isLoadingPosts ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Memuat postingan...</p>
        </div>
      ) : (
        <CommunityFeed
          posts={posts}
          currentUser={currentUser}
          userInteractions={userInteractions}
          onInteraction={handleInteraction}
          onReplyCreated={handleReplyCreated}
        />
      )}
    </div>
  );
}
