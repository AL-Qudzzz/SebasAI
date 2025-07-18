
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PageTitle from '@/components/common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquareText, Send, MessageCircle, Repeat2, Bookmark, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost } from '@/services/firestoreService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


type InteractionType = 'repost' | 'bookmark';
interface UserInteractions {
  reposted: Set<string>;
  bookmarked: Set<string>;
}

export default function CommunityPage() {
  const router = useRouter();
  const { currentUser, loadingAuthState } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [userInteractions, setUserInteractions] = useState<UserInteractions>({ reposted: new Set(), bookmarked: new Set() });

  const fetchPosts = useCallback(async (userId?: string | null) => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('/api/community/posts');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Gagal memuat postingan.' }));
        throw new Error(errData.error);
      }
      const data: CommunityPost[] = await response.json();
      setPosts(data);

      if (userId && data.length > 0) {
        const postIds = data.map(p => p.id);
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
      toast({ title: "Error", description: error.message || "Gagal memuat postingan.", variant: "destructive" });
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) {
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
        const errData = await response.json().catch(() => ({ error: 'Gagal membuat postingan.' }));
        throw new Error(errData.error);
      }
      const newPost: CommunityPost = await response.json();
      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostContent('');
      toast({ title: "Sukses", description: "Postingan berhasil dibuat!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal membuat postingan.", variant: "destructive" });
    } finally {
      setIsSubmittingPost(false);
    }
  };
  
  const handleInteraction = async (postId: string, interactionType: InteractionType) => {
    if (!currentUser) return;

    try {
        const response = await fetch(`/api/community/posts/interactions`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.uid, postId, interactionType }),
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({ error: 'Gagal berinteraksi dengan postingan.' }));
            throw new Error(errData.error);
        }

        const { newCount, userHasInteracted } = await response.json();
        
        // Optimistically update UI
        setPosts(posts.map(p => {
            if (p.id === postId) {
                const updatedPost = { ...p };
                if (interactionType === 'repost') updatedPost.repostCount = newCount;
                if (interactionType === 'bookmark') updatedPost.bookmarkCount = newCount;
                return updatedPost;
            }
            return p;
        }));

        setUserInteractions(prev => {
            const newInteractions = { ...prev };
            const set = newInteractions[interactionType === 'repost' ? 'reposted' : 'bookmarked'];
            if (userHasInteracted) {
                set.add(postId);
            } else {
                set.delete(postId);
            }
            return newInteractions;
        });

    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReply = (postId: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: "Fitur balasan akan segera hadir!" });
  };
  
  const handleShare = (postId: string) => {
    toast({ title: "Fitur Dalam Pengembangan", description: "Fitur berbagi akan segera hadir!" });
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
    <div className="space-y-8">
      <PageTitle
        title="Komunitas Sebas"
        description="Terhubung, berbagi, dan dapatkan dukungan dari pengguna lain."
      />

      <Card className="shadow-lg">
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

      {isLoadingPosts && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Memuat postingan...</p>
        </div>
      )}

      {!isLoadingPosts && posts.length === 0 && (
        <Card>
            <CardContent className="pt-6 text-center">
                <MessageSquareText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Belum ada postingan di komunitas.</p>
                <p className="text-sm text-muted-foreground">Jadilah yang pertama untuk berbagi!</p>
            </CardContent>
        </Card>
      )}

      {!isLoadingPosts && posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-headline text-primary">Postingan Komunitas</h2>
          {posts.map((post) => (
            <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://placehold.co/40x40.png?text=${post.authorEmail?.[0]?.toUpperCase() ?? 'A'}`} alt={post.authorEmail} data-ai-hint="avatar user"/>
                        <AvatarFallback>{post.authorEmail?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-medium">{post.authorEmail}</CardTitle>
                        <CardDescription className="text-xs">
                            {new Date(post.createdAt).toLocaleString()}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground/90">{post.content}</p>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t pt-2">
                 <div className="flex space-x-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2" onClick={() => handleReply(post.id)}>
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.replyCount || 0}</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("flex items-center space-x-2", { 'text-green-500': userInteractions.reposted.has(post.id) })}
                        onClick={() => handleInteraction(post.id, 'repost')}
                    >
                        <Repeat2 className={cn("w-4 h-4", { 'fill-current': userInteractions.reposted.has(post.id) })} />
                        <span>{post.repostCount || 0}</span>
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("flex items-center space-x-2", { 'text-yellow-500': userInteractions.bookmarked.has(post.id) })}
                        onClick={() => handleInteraction(post.id, 'bookmark')}
                    >
                        <Bookmark className={cn("w-4 h-4", { 'fill-current': userInteractions.bookmarked.has(post.id) })} />
                        <span>{post.bookmarkCount || 0}</span>
                    </Button>
                 </div>
                 <Button variant="ghost" size="icon" onClick={() => handleShare(post.id)}>
                    <Share2 className="w-4 h-4" />
                 </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
