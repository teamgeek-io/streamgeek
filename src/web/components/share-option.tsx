"use client";

import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";

interface ShareOptionProps {
  title: string;
  description: string;
  value: string;
  field: string;
  showCopy?: boolean;
  showExternal?: boolean;
  externalUrl?: string;
  onCopy?: (text: string, field: string) => void;
  copiedField?: string | null;
}

export function ShareOption({
  title,
  description,
  value,
  field,
  showCopy = true,
  showExternal = false,
  externalUrl = "",
  onCopy,
  copiedField,
}: ShareOptionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {showExternal && externalUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(externalUrl, "_blank")}
              className="h-8 w-8 p-0"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          {showCopy && onCopy && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(value, field)}
              className="h-8 w-8 p-0"
            >
              {copiedField === field ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="rounded-md border bg-muted/50 px-3 py-2 text-xs font-mono text-muted-foreground break-all">
          {value}
        </div>
      </div>
    </div>
  );
}
