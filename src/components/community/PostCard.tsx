
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle, Repeat2, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import type { CommunityPost, Reply } from '@/services/firestoreService';
import ReplySection from './ReplySection';

interface PostCardProps {
  post: CommunityPost;
  currentUser: any;
  userInteractions: {
    reposted: Set<string>;
    bookmarked: Set<string>;
  };
  onInteraction: (postId: string, interactionType: 'repost' | 'bookmark') => void;
  onReplyCreated: (postId: string, newReply: Reply) => void;
}

export default function PostCard({ post, currentUser, userInteractions, onInteraction, onReplyCreated }: PostCardProps) {
  const { toast } = useToast();
  const [showReplySection, setShowReplySection] = useState(false);

  const isReposted = userInteractions.reposted.has(post.id);
  const isBookmarked = userInteractions.bookmarked.has(post.id);

  const handleShare = () => {
    const postUrl = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        toast({ title: "Tautan Disalin", description: "Tautan ke postingan telah disalin ke clipboard Anda." });
      })
      .catch(() => {
        toast({ title: "Gagal Menyalin", description: "Tidak dapat menyalin tautan.", variant: "destructive" });
      });
  };
  
  const handleReplyClick = () => {
    setShowReplySection(prev => !prev);
  };
  
  return (
    <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow w-full min-h-[180px]">
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
        <div className="flex space-x-1 sm:space-x-4 text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center space-x-2" onClick={handleReplyClick}>
            <MessageCircle className="w-4 h-4" />
            <span>{post.replyCount || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex items-center space-x-2", { 'text-green-500': isReposted })}
            onClick={() => onInteraction(post.id, 'repost')}
          >
            <Repeat2 className={cn("w-4 h-4", { 'fill-current': isReposted })} />
            <span>{post.repostCount || 0}</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("flex items-center space-x-2", { 'text-yellow-500': isBookmarked })}
            onClick={() => onInteraction(post.id, 'bookmark')}
          >
            <Bookmark className={cn("w-4 h-4", { 'fill-current': isBookmarked })} />
            <span>{post.bookmarkCount || 0}</span>
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="w-4 h-4" />
        </Button>
      </CardFooter>
      {showReplySection && (
        <ReplySection 
          postId={post.id} 
          currentUser={currentUser}
          initialReplies={post.replies || []}
          onReplyCreated={onReplyCreated}
        />
      )}
    </Card>
  );
}
