"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
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
import { deleteVideo } from "../shared/functions";
import { authClient } from "../lib/auth-client";
import { link } from "../shared/links";

interface DeleteDialogProps {
  videoId: string;
  videoTitle: string;
}

export function DeleteDialog({ videoId, videoTitle }: DeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { data: session } = authClient.useSession();

  if (!session?.user) {
    return null;
  }

  const handleDelete = async () => {
    setError(null);

    const deleteVideoData = async () => {
      try {
        const result = await deleteVideo({ id: videoId });

        if (result.success) {
          setOpen(false);
          // Redirect to home page after successful deletion
          window.location.href = link("/");
        } else {
          setError(result.error?.message || "Failed to delete video");
        }
      } catch (err) {
        setError("An unexpected error occurred");
      }
    };

    startTransition(() => void deleteVideoData());
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isPending) {
      setOpen(false);
      setError(null);
    } else if (newOpen) {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:block">Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Delete Video
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{videoTitle}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete Video"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
