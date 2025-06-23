import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPostSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Image, Tag } from "lucide-react";
import { z } from "zod";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const createPostFormSchema = insertPostSchema.omit({
  authorId: true,
  collegeId: true,
});

type CreatePostFormData = z.infer<typeof createPostFormSchema>;

export default function CreatePostModal({ isOpen, onClose, user }: CreatePostModalProps) {
  const { toast } = useToast();

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostFormSchema),
    defaultValues: {
      content: "",
      category: "general",
      imageUrl: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      form.reset();
      onClose();
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
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreatePostFormData) => {
    createPostMutation.mutate(data);
  };

  const categories = [
    { value: "general", label: "💬 General", emoji: "💬" },
    { value: "jobs", label: "💼 Jobs", emoji: "💼" },
    { value: "advice", label: "💡 Advice", emoji: "💡" },
    { value: "memories", label: "❤️ Memories", emoji: "❤️" },
    { value: "events", label: "📅 Events", emoji: "📅" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        
        <div className="flex items-start space-x-3 mb-4">
          <img 
            className="h-10 w-10 rounded-full object-cover" 
            src={user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
            alt="Profile" 
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <Badge className={`${
                user.role === 'alumni' 
                  ? 'bg-alumni/10 text-alumni' 
                  : 'bg-student/10 text-student'
              }`}>
                {user.role === 'alumni' ? 'Alumni' : 'Student'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {user.department} • {user.batch}
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      {...field}
                      placeholder="What's on your mind?"
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Future: Image upload functionality */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
              <Image className="h-8 w-8 mx-auto mb-2" />
              <p>Image upload coming soon</p>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button type="button" variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Photo
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  <Tag className="h-4 w-4 mr-2" />
                  Tag
                </Button>
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPostMutation.isPending || !form.watch("content")?.trim()}
                >
                  {createPostMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
