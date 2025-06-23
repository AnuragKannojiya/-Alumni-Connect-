import { useState } from "react";
import { Heart, MessageCircle, Share2, Clock, MapPin, Briefcase, Calendar, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import CommentsSection from "./comments-section";

interface EnhancedPostCardProps {
  post: any;
}

const categoryIcons = {
  jobs: Briefcase,
  advice: GraduationCap,
  memories: Heart,
  events: Calendar,
  general: Users
};

const categoryColors = {
  jobs: "bg-green-100 text-green-700 border-green-200",
  advice: "bg-blue-100 text-blue-700 border-blue-200",
  memories: "bg-pink-100 text-pink-700 border-pink-200",
  events: "bg-purple-100 text-purple-700 border-purple-200",
  general: "bg-gray-100 text-gray-700 border-gray-200"
};

export default function EnhancedPostCard({ post }: EnhancedPostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const CategoryIcon = categoryIcons[post.category as keyof typeof categoryIcons] || Users;

  const likeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsLiked(data.isLiked);
      setLikesCount(data.isLiked ? likesCount + 1 : likesCount - 1);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={post.author?.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`} 
                alt={`${post.author?.firstName} ${post.author?.lastName}`}
              />
              <AvatarFallback>
                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {post.author?.firstName} {post.author?.lastName}
                </h3>
                <Badge variant="secondary" className={`text-xs ${
                  post.author?.role === 'alumni' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {post.author?.role === 'alumni' ? 'Alumni' : 'Student'}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(post.createdAt)}</span>
                {post.author?.department && (
                  <>
                    <span>•</span>
                    <span>{post.author.department}</span>
                  </>
                )}
                {post.author?.batch && (
                  <>
                    <span>•</span>
                    <span>{post.author.batch}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Badge className={`text-xs ${categoryColors[post.category as keyof typeof categoryColors]}`}>
            <CategoryIcon className="h-3 w-3 mr-1" />
            {post.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {post.title && (
            <h2 className="text-lg font-semibold text-gray-900">{post.title}</h2>
          )}
          
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {post.location && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{post.location}</span>
            </div>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className={`flex items-center space-x-1 ${
                isLiked 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-gray-600 hover:text-red-600'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{likesCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">{post.commentsCount || 0}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 text-gray-600 hover:text-green-600"
            >
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>
        </div>

        <CommentsSection 
          postId={post.id}
          isOpen={isCommentsOpen}
          onToggle={() => setIsCommentsOpen(!isCommentsOpen)}
        />
      </CardContent>
    </Card>
  );
}