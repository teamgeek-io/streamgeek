"use client";

import { useState, useTransition } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { updateVideo } from "../shared/functions";

interface EditDialogProps {
  videoId: string;
  videoTitle: string;
  videoDescription?: string;
}

export function EditDialog({
  videoId,
  videoTitle,
  videoDescription = "",
}: EditDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(videoTitle);
  const [description, setDescription] = useState(videoDescription);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const updateVideoData = async () => {
      try {
        const result = await updateVideo({
          id: videoId,
          title: title.trim(),
          description: description.trim(),
        });

        if (result.success) {
          setOpen(false);
          // Optionally refresh the page or update the UI
          window.location.reload();
        } else {
          setError(result.error?.message || "Failed to update video");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    };

    startTransition(() => void updateVideoData());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      setOpen(false);
      // Reset form when closing
      setTitle(videoTitle);
      setDescription(videoDescription);
      setError(null);
    } else if (newOpen) {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="h-4 w-4" />
          <span className="hidden sm:block">Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit video</DialogTitle>
            <DialogDescription>
              Update the title and description of your video.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter video description (optional)"
                disabled={isPending}
                rows={3}
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
