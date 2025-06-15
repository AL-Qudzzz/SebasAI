
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import PageTitle from '@/components/common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquareText, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost } from '@/services/firestoreService'; // Import the interface
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function CommunityPage() {
  const router = useRouter();
  const { currentUser, loadingAuthState } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true); // Start true to load initial posts
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const fetchPosts = useCallback(async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('/api/community/posts');
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Gagal memuat postingan.' }));
        throw new Error(errData.error);
      }
      const data: CommunityPost[] = await response.json();
      setPosts(data);
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
      fetchPosts();
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
          authorEmail: currentUser.email || 'Anonim', // Ensure email is passed
          content: newPostContent,
        }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Gagal membuat postingan.' }));
        throw new Error(errData.error);
      }
      const newPost: CommunityPost = await response.json(); // API now returns the new post
      setPosts(prevPosts => [newPost, ...prevPosts]); // Prepend the new post to the local state
      setNewPostContent('');
      toast({ title: "Sukses", description: "Postingan berhasil dibuat!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Gagal membuat postingan.", variant: "destructive" });
    } finally {
      setIsSubmittingPost(false);
    }
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
              {/* Future: Add CardFooter for actions like likes, comments */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
