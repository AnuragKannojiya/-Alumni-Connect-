import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Calendar, Users, BookOpen, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProfileEditModal from "./profile-edit-modal";

interface UserProfileSidebarProps {
  user: any;
  onCreatePost: () => void;
}

export default function UserProfileSidebar({ user, onCreatePost }: UserProfileSidebarProps) {
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const { data: collegeStats } = useQuery<{
    studentsCount: number;
    alumniCount: number;
    totalPosts: number;
  }>({
    queryKey: [`/api/colleges/${user.collegeId}/stats`],
    enabled: !!user.collegeId,
    refetchInterval: 15000, // Refresh every 15 seconds
    refetchOnWindowFocus: true,
  });

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <img 
              className="h-20 w-20 rounded-full object-cover mx-auto mb-3" 
              src={user.profileImageUrl || `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face`}
              alt="Profile" 
            />
            <h3 className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <div className="flex items-center justify-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === 'alumni' 
                  ? 'bg-alumni/10 text-alumni' 
                  : 'bg-student/10 text-student'
              }`}>
                {user.role === 'alumni' ? '🎓 Alumni' : '🎓 Student'}
              </span>
              <span className="text-xs text-gray-500">{user.batch}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{user.department}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Posts</span>
              <span className="font-medium">{collegeStats?.totalPosts || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections</span>
              <span className="font-medium">{((collegeStats?.studentsCount || 0) + (collegeStats?.alumniCount || 0)) || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={onCreatePost}
            >
              <Plus className="h-4 w-4 mr-3 text-primary" />
              Create Post
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Search className="h-4 w-4 mr-3 text-primary" />
              Find Alumni
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-3 text-primary" />
              Events
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={() => setIsProfileEditOpen(true)}
            >
              <Settings className="h-4 w-4 mr-3 text-primary" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Community Stats</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-student rounded-full"></div>
                <span className="text-sm text-gray-600">Students</span>
              </div>
              <span className="text-sm font-medium">{collegeStats?.studentsCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-alumni rounded-full"></div>
                <span className="text-sm text-gray-600">Alumni</span>
              </div>
              <span className="text-sm font-medium">{collegeStats?.alumniCount || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <ProfileEditModal 
        isOpen={isProfileEditOpen}
        onClose={() => setIsProfileEditOpen(false)}
        user={user}
      />
    </div>
  );
}
