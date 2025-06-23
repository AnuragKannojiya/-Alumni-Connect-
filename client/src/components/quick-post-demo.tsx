import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function QuickPostDemo() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createDemoPostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: "Welcome to Alumni Connect!",
          content: "This is a demo post to showcase the edit and delete functionality. You can now edit or delete your own posts using the menu button in the top-right corner of each post.",
          category: "general",
          location: "Campus"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: "Demo post created! You can now test edit/delete features.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Failed to create demo post.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900">Test Edit & Delete Features</h3>
            <p className="text-sm text-blue-700">Create a demo post to test the new functionality</p>
          </div>
          <Button 
            onClick={() => createDemoPostMutation.mutate()}
            disabled={createDemoPostMutation.isPending}
            size="sm"
          >
            {createDemoPostMutation.isPending ? "Creating..." : "Create Demo Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}