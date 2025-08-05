
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
    try {
        const response = await fetch('/api/community/posts');
        if (!response.ok) {
            const errData = await response.json().catch(() => ({error: 'Gagal mengambil postingan'}));
            throw new Error(errData.error);
        }
        const fetchedPosts: CommunityPost[] = await response.json();
        setPosts(fetchedPosts);

        if (userId && fetchedPosts.length > 0) {
            const postIds = fetchedPosts.map(p => p.id);
            const interactionsResponse = await fetch('/api/community/posts/interactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, postIds }),
            });
            if (interactionsResponse.ok) {
                const interactions: { reposted: string[], bookmarked: string[] } = await interactionsResponse.json();
                setUserInteractions({
                    reposted: new Set(interactions.reposted),
                    bookmarked: new Set(interactions.bookmarked),
                });
            }
        }
    } catch (error: any) {
        toast({ title: "Gagal Mengambil Postingan", description: error.message, variant: "destructive" });
    } finally {
        setIsLoadingPosts(false);
    }
  }, [toast]);


  useEffect(() => {
    if (!loadingAuthState && !currentUser) {
      router.push('/auth');
    } else if (currentUser) {
      fetchPosts(currentUser.uid);
    }
  }, [currentUser, loadingAuthState, router, fetchPosts]);
  
  const handleInteraction = async (postId: string, interactionType: 'repost' | 'bookmark') => {
    if (!currentUser) return;

    const originalInteractions = { ...userInteractions };
    const originalPosts = [...posts];

    // Optimistic UI Update
    const hasInteracted = userInteractions[interactionType].has(postId);
    
    setUserInteractions(prev => {
        const newSet = new Set(prev[interactionType]);
        if (hasInteracted) {
            newSet.delete(postId);
        } else {
            newSet.add(postId);
        }
        return { ...prev, [interactionType]: newSet };
    });

     setPosts(prevPosts => prevPosts.map(p => {
        if (p.id === postId) {
            const currentCount = p[`${interactionType}Count`] || 0;
            return {
                ...p,
                [`${interactionType}Count`]: hasInteracted ? currentCount - 1 : currentCount + 1,
            };
        }
        return p;
    }));

    try {
        const response = await fetch('/api/community/posts/interactions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.uid, postId, interactionType }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({error: "Gagal melakukan interaksi."}));
            throw new Error(errData.error);
        }
    } catch (error: any) {
        toast({ title: "Gagal Berinteraksi", description: error.message, variant: "destructive" });
        // Revert UI on error without full refetch
        setUserInteractions(originalInteractions);
        setPosts(originalPosts);
    }
  };

  const handlePostCreated = (newPost: CommunityPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleReplyCreated = (postId: string, newReply: Reply) => {
    setPosts(prevPosts => prevPosts.map(post => {
        if (post.id === postId) {
            // Since replies are fetched within the component, we just need to update the count
            return {
                ...post,
                replyCount: post.replyCount + 1,
            };
        }
        return post;
    }));
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
          title="Komunitas SebasAI"
          description="Terhubung, berbagi, dan dapatkan dukungan dari pengguna lain."
        />
      </div>

      <div className="w-full max-w-4xl">
        <CreatePostForm currentUser={currentUser} onPostCreated={handlePostCreated} />
      </div>

      {isLoadingPosts ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Memuat postingan...</p>
        </div>
      ) : (
         <div className="w-full max-w-4xl">
            <CommunityFeed
              posts={posts}
              currentUser={currentUser}
              userInteractions={userInteractions}
              onInteraction={handleInteraction}
              onReplyCreated={handleReplyCreated}
            />
        </div>
      )}
    </div>
  );
}
