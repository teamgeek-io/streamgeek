"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { ShareOption } from "./share-option";

interface ShareDialogProps {
  videoId: string;
  videoTitle: string;
  playlistUrl: string;
  baseUrl: string;
}

export function ShareDialog({
  videoId,
  videoTitle,
  playlistUrl,
  baseUrl,
}: ShareDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const videoUrl = `${baseUrl}/video/${videoId}`;
  const embedUrl = `${baseUrl}/embed/${videoId}`;
  const embedSnippet = `<iframe width="560" height="315" src="${embedUrl}" title="${videoTitle}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share video</DialogTitle>
          <DialogDescription>
            Share this video with others using the options below.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <ShareOption
            title="Copy URL"
            description="Share the direct link to this video"
            value={videoUrl}
            field="url"
            onCopy={copyToClipboard}
            copiedField={copiedField}
          />

          <ShareOption
            title="Copy HLS Playlist"
            description="Direct link to the HLS playlist"
            value={playlistUrl}
            field="playlist"
            externalUrl={playlistUrl}
            onCopy={copyToClipboard}
            copiedField={copiedField}
          />

          <ShareOption
            title="Copy Embed Code"
            description="HTML code to embed this video on your website"
            value={embedSnippet}
            field="embed"
            onCopy={copyToClipboard}
            copiedField={copiedField}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
