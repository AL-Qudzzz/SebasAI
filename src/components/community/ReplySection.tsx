
'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { Reply } from '@/services/firestoreService';

interface ReplySectionProps {
  postId: string;
  currentUser: any;
  initialReplies: Reply[];
  onReplyCreated: (postId: string, newReply: Reply) => void;
}

export default function ReplySection({ postId, currentUser, initialReplies, onReplyCreated }: ReplySectionProps) {
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [isLoadingReplies, setIsLoadingReplies] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch if initialReplies is empty, otherwise we already have them
    if (initialReplies.length === 0) {
      const fetchReplies = async () => {
        try {
          const response = await fetch(`/api/community/posts/${postId}/replies`);
          if (!response.ok) throw new Error("Gagal memuat balasan.");
          const data: Reply[] = await response.json();
          setReplies(data);
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingReplies(false);
        }
      };
      fetchReplies();
    } else {
        setIsLoadingReplies(false);
    }
  }, [postId, toast, initialReplies.length]);

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const response = await fetch(`/api/community/posts/${postId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          authorEmail: currentUser.email,
          content: replyContent,
        }),
      });
      if (!response.ok) throw new Error("Gagal mengirim balasan.");
      const newReply: Reply = await response.json();
      setReplies(prev => [...prev, newReply]);
      onReplyCreated(postId, newReply); // Notify parent to update count
      setReplyContent('');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="border-t px-4 sm:px-6 py-4 space-y-4 bg-muted/30">
      <h4 className="text-sm font-semibold text-foreground">Balasan</h4>
      
      {/* List Replies */}
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoadingReplies ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : replies.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada balasan. Jadilah yang pertama!</p>
        ) : (
          replies.map(reply => (
            <div key={reply.id} className="flex items-start space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://placehold.co/32x32.png?text=${reply.authorEmail?.[0]?.toUpperCase() ?? 'A'}`} alt={reply.authorEmail} data-ai-hint="avatar user" />
                <AvatarFallback>{reply.authorEmail?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 bg-background p-2 rounded-md">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold">{reply.authorEmail}</p>
                    <p className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleTimeString()}</p>
                </div>
                <p className="text-sm text-foreground/90">{reply.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Form */}
      <form onSubmit={handleCreateReply} className="flex items-start space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://placehold.co/32x32.png?text=${currentUser.email?.[0]?.toUpperCase() ?? 'A'}`} alt={currentUser.email} data-ai-hint="avatar user"/>
          <AvatarFallback>{currentUser.email?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <Textarea
                placeholder="Tulis balasan Anda..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={1}
                className="min-h-[40px] text-sm"
                required
            />
            <Button size="sm" type="submit" disabled={isSubmittingReply || !replyContent.trim()} className="mt-2">
                {isSubmittingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="ml-2">Balas</span>
            </Button>
        </div>
      </form>
    </div>
  );
}
