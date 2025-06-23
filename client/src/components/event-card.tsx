import { format } from "date-fns";
import { Calendar, Clock, MapPin, Users, Video, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface EventCardProps {
  event: any;
  currentUserId: string;
  onEdit?: () => void;
}

export default function EventCard({ event, currentUserId, onEdit }: EventCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const attendanceMutation = useMutation({
    mutationFn: async (status: string) => {
      return await apiRequest(`/api/events/${event.id}/attendance`, "POST", { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Success",
        description: "Attendance updated successfully",
      });
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
        description: "Failed to update attendance",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/events/${event.id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
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
        description: "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  const handleAttendanceChange = (status: string) => {
    attendanceMutation.mutate(status);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteEventMutation.mutate();
    }
  };

  const getAttendanceButtonVariant = (status: string) => {
    if (event.userAttendanceStatus === status) {
      return "default";
    }
    return "outline";
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      general: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      academic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      social: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      career: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      sports: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const eventDate = new Date(event.startDate);
  const isOrganizer = event.organizerId === currentUserId;

  return (
    <Card className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getCategoryColor(event.category)}>
                {event.category}
              </Badge>
              {event.isVirtual && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Video className="h-3 w-3" />
                  Virtual
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {event.title}
            </h3>
          </div>
          {isOrganizer && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Event
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="space-y-3">
          {event.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(eventDate, "MMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {format(eventDate, "h:mm a")}
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              {event.location}
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              {event.attendeesCount} attending
            </div>
            {event.maxAttendees && (
              <span className="text-sm text-gray-400">
                / {event.maxAttendees} max
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.organizer.profileImageUrl} />
              <AvatarFallback className="text-xs">
                {event.organizer.firstName?.[0] || event.organizer.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Organized by {event.organizer.firstName || event.organizer.email}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex items-center gap-2 w-full">
          <Button
            variant={getAttendanceButtonVariant("going")}
            size="sm"
            onClick={() => handleAttendanceChange("going")}
            disabled={attendanceMutation.isPending}
            className="flex-1"
          >
            Going
          </Button>
          <Button
            variant={getAttendanceButtonVariant("maybe")}
            size="sm"
            onClick={() => handleAttendanceChange("maybe")}
            disabled={attendanceMutation.isPending}
            className="flex-1"
          >
            Maybe
          </Button>
          <Button
            variant={getAttendanceButtonVariant("not_going")}
            size="sm"
            onClick={() => handleAttendanceChange("not_going")}
            disabled={attendanceMutation.isPending}
            className="flex-1"
          >
            Can't Go
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}