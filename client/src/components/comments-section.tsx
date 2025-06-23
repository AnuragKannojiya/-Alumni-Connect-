import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from 'date-fns';

interface CommentsSectionProps {
  postId: number;
  isOpen: boolean;
  onToggle: () => void;
}

export default function CommentsSection({ postId, isOpen, onToggle }: CommentsSectionProps) {
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");

  const { data: comments, isLoading } = useQuery<Array<{
    id: number;
    content: string;
    createdAt: Date | null;
    author: {
      id: string;
      firstName: string;
      lastName: string;
      profileImageUrl: string;
      role: string;
    };
  }>>({
    queryKey: [`/api/posts/${postId}/comments`],
    enabled: isOpen,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${postId}/comments`] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
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
        description: "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="flex items-center space-x-2 mb-4">
        <MessageCircle className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Comments ({comments?.length || 0})
        </span>
      </div>

      {/* Add Comment */}
      <div className="flex space-x-3 mb-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Write a comment..."
          className="flex-1 min-h-[60px] resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || addCommentMutation.isPending}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : comments?.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments?.map((comment: any) => (
            <Card key={comment.id} className="bg-gray-50">
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={comment.author.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                    alt={`${comment.author.firstName} ${comment.author.lastName}`}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <Badge className={`text-xs ${
                        comment.author.role === 'alumni' 
                          ? 'bg-alumni/10 text-alumni' 
                          : 'bg-student/10 text-student'
                      }`}>
                        {comment.author.role === 'alumni' ? 'Alumni' : 'Student'}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}