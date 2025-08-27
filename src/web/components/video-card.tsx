import React from "react";
import { Card, CardContent } from "./ui/card";
import { Play, Clock, Eye } from "lucide-react";
import { cn } from "../lib/utils";
import { link } from "../shared/links";
import type { Video } from "../../db";

interface VideoCardProps {
  video: Video;
  views?: number; // Optional since it's not in the Video model
  className?: string;
}

export function VideoCard({ video, views, className }: VideoCardProps) {
  const formatViews = (viewCount: number) => {
    if (viewCount >= 1000000) {
      return `${(viewCount / 1000000).toFixed(1)}M`;
    } else if (viewCount >= 1000) {
      return `${(viewCount / 1000).toFixed(1)}K`;
    }
    return viewCount.toString();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <a href={link("/video/:id", { id: video.id })} className="block">
      <Card
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] overflow-hidden aspect-video relative",
          className
        )}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
          <div className="bg-black/70 rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.duration && (
          <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="space-y-2">
            {/* Title */}
            <h3 className="font-semibold text-sm line-clamp-2 text-white drop-shadow-sm group-hover:text-blue-200 transition-colors duration-200">
              {video.title}
            </h3>

            {/* Meta Information */}
            <div className="flex items-center gap-4 text-xs text-white drop-shadow-sm">
              {views !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{formatViews(views)} views</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDate(video.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </a>
  );
}
