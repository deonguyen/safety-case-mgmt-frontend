import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ViewSpecificationContentProps {
  title: string;
  content: string;
  onClose?: () => void;
  onHide?: () => void;
}

export default function ViewSpecificationContent({
  title,
  content,
  onClose,
  onHide,
}: ViewSpecificationContentProps) {
  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base truncate max-w-[340px]">
            {title}
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
              <FontAwesomeIcon icon={faChevronRight} className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-xl font-bold mt-5 mb-3" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-lg font-bold mt-4 mb-2" {...props} />
              ),
              table: ({ node, ...props }) => (
                <Table className="mt-4 mb-4 border" {...props} />
              ),
              thead: ({ node, ...props }) => <TableHeader {...props} />,
              tbody: ({ node, ...props }) => <TableBody {...props} />,
              tr: ({ node, ...props }) => <TableRow {...props} />,
              th: ({ node, ...props }) => <TableHead {...props} />,
              td: ({ node, ...props }) => <TableCell {...props} />,
              img: function ({ ...props }) {
                return <></>;
              },
            }}
          >
            {(content || "No content available.")
              .replace(/<!--[\s\S]*?-->/g, "")
              .replace(/^---[\s\S]*?^---/gm, "")}
          </ReactMarkdown>
        </div>
    </div>
  );
}