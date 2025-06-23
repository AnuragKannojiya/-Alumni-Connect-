import { useState } from "react";
import { Plus, Calendar, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EventCard from "./event-card";
import CreateEventModal from "./create-event-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface EventsSectionProps {
  user: any;
}

export default function EventsSection({ user }: EventsSectionProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleCreateEvent = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setIsCreateModalOpen(true);
  };

  const filterEvents = (events: any[], filter: string) => {
    if (filter === "all") return events;
    return events.filter((event: any) => event.category === filter);
  };

  const getUpcomingEvents = (events: any[]) => {
    const now = new Date();
    return events.filter((event: any) => new Date(event.startDate) > now);
  };

  const getPastEvents = (events: any[]) => {
    const now = new Date();
    return events.filter((event: any) => new Date(event.startDate) <= now);
  };

  const filteredEvents = filterEvents(events, categoryFilter);
  const upcomingEvents = getUpcomingEvents(filteredEvents);
  const pastEvents = getPastEvents(filteredEvents);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Events
          </h2>
        </div>
        <Button onClick={handleCreateEvent} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {upcomingEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUserId={user.id}
                  onEdit={() => handleEditEvent(event)}
                />
              ))}
            </div>
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No upcoming events
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  There are no upcoming events in your college community.
                </p>
                <Button onClick={handleCreateEvent} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create the first event
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length > 0 ? (
            <div className="grid gap-4">
              {pastEvents.map((event: any) => (
                <EventCard
                  key={event.id}
                  event={event}
                  currentUserId={user.id}
                  onEdit={() => handleEditEvent(event)}
                />
              ))}
            </div>
          ) : (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No past events
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Past events will appear here once they've concluded.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingEvent(null);
        }}
        user={user}
      />
    </div>
  );
}