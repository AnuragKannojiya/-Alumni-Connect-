import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Briefcase, Lightbulb, Calendar, MapPin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from 'date-fns';
import CommentsSection from "./comments-section";
import PostActionsMenu from "./post-actions-menu";
import EditPostModal from "./edit-post-modal";

interface PostCardProps {
  post: any;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLikedByUser || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1);
    },
    onError: (error) => {
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
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'jobs':
        return <Briefcase className="h-3 w-3 mr-1" />;
      case 'advice':
        return <Lightbulb className="h-3 w-3 mr-1" />;
      case 'events':
        return <Calendar className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'jobs':
        return 'bg-emerald-100 text-emerald-700';
      case 'advice':
        return 'bg-blue-100 text-blue-700';
      case 'memories':
        return 'bg-purple-100 text-purple-700';
      case 'events':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-3">
          <img 
            className="h-12 w-12 rounded-full object-cover" 
            src={post.author.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`}
            alt={`${post.author.firstName} ${post.author.lastName}`}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold text-gray-900">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                <Badge className={`${
                  post.author.role === 'alumni' 
                    ? 'bg-alumni/10 text-alumni' 
                    : 'bg-student/10 text-student'
                }`}>
                  {post.author.role === 'alumni' ? '🎓 Alumni' : '🎓 Student'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {post.author.department?.split(' ')[0]} {post.author.batch}
                </span>
              </div>
              <PostActionsMenu 
                post={post}
                currentUserId={(user as any)?.id}
                onEdit={() => setIsEditModalOpen(true)}
              />
            </div>
            <p className="text-sm text-gray-500 mb-3">
              {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : 'Just now'}
            </p>
            
            {post.category && post.category !== 'general' && (
              <div className="mb-3">
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryIcon(post.category)}
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </Badge>
              </div>
            )}
            
            <div className="prose max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            {post.imageUrl && (
              <div className="mt-4">
                <img 
                  className="w-full h-64 object-cover rounded-lg" 
                  src={post.imageUrl}
                  alt="Post image"
                />
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {likesCount}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-500 hover:text-blue-600"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.commentsCount || 0}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <CommentsSection 
          postId={post.id}
          isOpen={showComments}
          onToggle={() => setShowComments(!showComments)}
        />
      </CardContent>
      
      <EditPostModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
      />
    </Card>
  );
}
