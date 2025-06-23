import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, Briefcase, Lightbulb, Heart, Calendar } from "lucide-react";

interface FilterBarProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterBar({ currentFilter, onFilterChange }: FilterBarProps) {
  const filters = [
    { id: "all", label: "All Posts", icon: null },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "advice", label: "Advice", icon: Lightbulb },
    { id: "memories", label: "Memories", icon: Heart },
    { id: "events", label: "Events", icon: Calendar },
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter Posts:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const Icon = filter.icon;
              const isActive = currentFilter === filter.id;
              
              return (
                <Button
                  key={filter.id}
                  variant={isActive ? "default" : "secondary"}
                  size="sm"
                  onClick={() => onFilterChange(filter.id)}
                  className={`${
                    isActive 
                      ? "bg-primary text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3 mr-1" />}
                  {filter.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
