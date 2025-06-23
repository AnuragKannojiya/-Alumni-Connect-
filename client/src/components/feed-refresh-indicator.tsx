import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedRefreshIndicatorProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdate: Date;
}

export default function FeedRefreshIndicator({ onRefresh, isRefreshing, lastUpdate }: FeedRefreshIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);
      
      if (seconds < 60) {
        setTimeAgo("Just now");
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  return (
    <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1 text-sm text-blue-600">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Live feed • Updated {timeAgo}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="ml-1">Refresh</span>
      </Button>
    </div>
  );
}