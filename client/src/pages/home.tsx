import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Bell, Calendar, MessageSquare } from "lucide-react";
import UserProfileSidebar from "@/components/user-profile-sidebar";
import FilterBar from "@/components/filter-bar";
import PostCard from "@/components/post-card";
import CreatePostModal from "@/components/create-post-modal";
import RealTimeIndicator from "@/components/real-time-indicator";
import FeedRefreshIndicator from "@/components/feed-refresh-indicator";
import QuickPostDemo from "@/components/quick-post-demo";
import EventsSection from "@/components/events-section";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts", filter],
    queryFn: ({ queryKey }) => {
      const [, filterParam] = queryKey;
      const params = new URLSearchParams();
      if (filterParam && filterParam !== 'all') {
        params.append('category', filterParam as string);
      }
      return fetch(`/api/posts?${params.toString()}`, {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
        return res.json();
      });
    },
    enabled: !!(user as any)?.collegeId,
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    refetchOnWindowFocus: true,
  });

  // Update last update time when posts are fetched
  useEffect(() => {
    if (posts) {
      setLastUpdate(new Date());
    }
  }, [posts]);

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    queryClient.invalidateQueries({ queryKey: [`/api/colleges/${(user as any)?.collegeId}/stats`] });
  };

  useEffect(() => {
    if (!isLoading && (!user || !(user as any).isOnboarded)) {
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
  }, [isLoading, user, toast]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Posts are already filtered on the server side
  const filteredPosts = posts || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold text-gray-900">Alumni Connect</h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-1">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {(user as any)?.college?.name || "Your College"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealTimeIndicator 
                isConnected={!postsLoading}
                lastUpdate={lastUpdate}
              />
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <img 
                  className="h-8 w-8 rounded-full object-cover" 
                  src={(user as any)?.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`}
                  alt="Profile" 
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </p>
                  <p className={`text-xs font-medium ${(user as any)?.role === 'alumni' ? 'text-alumni' : 'text-student'}`}>
                    {(user as any)?.role === 'alumni' ? 'Alumni' : 'Student'} • {(user as any)?.department?.split(' ')[0]} {(user as any)?.batch}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <UserProfileSidebar 
              user={user} 
              onCreatePost={() => setIsCreatePostOpen(true)}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <FilterBar 
              currentFilter={filter}
              onFilterChange={setFilter}
            />

            {/* Create Post Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start space-x-3">
                <img 
                  className="h-10 w-10 rounded-full object-cover" 
                  src={(user as any)?.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face`}
                  alt="Profile" 
                />
                <div className="flex-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-500"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    What's on your mind, {(user as any)?.firstName}?
                  </Button>
                </div>
              </div>
            </div>

            <FeedRefreshIndicator 
              onRefresh={handleManualRefresh}
              isRefreshing={postsLoading}
              lastUpdate={lastUpdate}
            />

            <QuickPostDemo />

            {/* Posts */}
            <div className="space-y-6">
              {postsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <p className="text-gray-500">No posts found. Be the first to share something!</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    Create Post
                  </Button>
                </div>
              ) : (
                filteredPosts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        user={user}
      />
    </div>
  );
}
