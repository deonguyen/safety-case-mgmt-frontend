import { Button } from "@/src/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface ViewSpecificationChangeSummaryProps {
  specName: string;
  summary: string;
  onClose?: () => void;
  onHide?: () => void;
}

export default function ViewSpecificationChangeSummary({
  specName,
  summary,
  onHide,
}: ViewSpecificationChangeSummaryProps) {
  return (
    <div>
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base">
            Specification Change Summary
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onHide && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="Hide panel to right"
              onClick={onHide}
            >
              <FontAwesomeIcon
                icon={faChevronRight}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 shrink-0">
        Name: {specName}
      </div>
      <div className="flex-1 overflow-y-auto p-4 whitespace-pre-wrap text-sm break-words bg-muted/20">
        {summary}
      </div>
    </div>
  );
}
