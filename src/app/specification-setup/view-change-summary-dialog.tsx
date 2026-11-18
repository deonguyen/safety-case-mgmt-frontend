"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

interface ViewChangeSummaryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  summary: string;
}

export default function ViewChangeSummaryDialog({
  isOpen,
  onOpenChange,
  summary,
}: ViewChangeSummaryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col  min-w-[80vw] min-h-[80vh] max-w-[80vw] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Change Summary</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm break-words p-4 border rounded-md bg-muted/20">
          {summary}
        </div>
      </DialogContent>
    </Dialog>
  );
}
