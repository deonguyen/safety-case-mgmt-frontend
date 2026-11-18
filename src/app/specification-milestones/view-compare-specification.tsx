"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button"; // Adjust this path if your shadcn components are located elsewhere
import { Label } from "@/src/components/ui/label";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { getSpecificationRevisionsBySpecificationId } from "@/src/services/specification-revision-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ServiceProxy from "@/src/services/service-proxy";

interface ViewCompareSpecificationProps {
  specificationId: number;
  specificationName: string;
  onClose?: () => void;
  onHide?: () => void;
}

export default function ViewCompareSpecification({
  specificationId,
  specificationName,
  onClose,
  onHide,
}: ViewCompareSpecificationProps) {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [version1, setVersion1] = useState<string>("");
  const [version2, setVersion2] = useState<string>("");
  const [changeSummary, setChangeSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [content1, setContent1] = useState<string>("");
  const [content2, setContent2] = useState<string>("");

  useEffect(() => {
    const fetchRevisions = async () => {
      if (specificationId) {
        setIsLoading(true);
        try {
          const response =
            await getSpecificationRevisionsBySpecificationId(specificationId);
          if (response.specificationRevisions) {
            setRevisions(response.specificationRevisions);
            if (response.specificationRevisions.length >= 2) {
              setVersion1(response.specificationRevisions[0].id.toString());
              setVersion2(response.specificationRevisions[1].id.toString());
            } else if (response.specificationRevisions.length === 1) {
              setVersion1(response.specificationRevisions[0].id.toString());
              setVersion2(response.specificationRevisions[0].id.toString());
            }
          }
        } catch (error) {
          console.error("Failed to fetch revisions:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchRevisions();
  }, [specificationId]);

  const rev1 = revisions.find((r) => r.id.toString() === version1);
  const rev2 = revisions.find((r) => r.id.toString() === version2);

  useEffect(() => {
    setContent1(rev1?.content || "");
  }, [rev1]);

  useEffect(() => {
    setContent2(rev2?.content || "");
  }, [rev2]);

  const handleVersion1Change = (val: string) => {
    setVersion1(val);
    setChangeSummary("");
  };

  const handleVersion2Change = (val: string) => {
    setVersion2(val);
    setChangeSummary("");
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    setChangeSummary("");

    const diffResponse = await ServiceProxy.getDiffSummary(content1, content2);
    if (diffResponse.status === 200) {
      setChangeSummary(diffResponse.data.summary);
    } else {
      setChangeSummary(
        "Error: Failed to generate summary (Internal Server Error).",
      );
    }
    setIsGenerating(false);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3
            className="font-semibold text-base truncate max-w-[340px]"
          >
            Compare Versions - {specificationName}
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

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading revisions...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto p-4">
          <div className="flex flex-row items-center gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <Label>Base Version</Label>
              <Select value={version1} onValueChange={handleVersion1Change}>
                <SelectTrigger>
                  <SelectValue placeholder="Select base version" />
                </SelectTrigger>
                <SelectContent>
                  {revisions.map((rev) => (
                    <SelectItem key={rev.id} value={rev.id.toString()}>
                      {rev.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <Label>Compare Version</Label>
              <Select value={version2} onValueChange={handleVersion2Change}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version to compare" />
                </SelectTrigger>
                <SelectContent>
                  {revisions.map((rev) => (
                    <SelectItem key={rev.id} value={rev.id.toString()}>
                      {rev.version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[220px]">
            <div className="border rounded-md p-3 overflow-y-auto max-h-[300px] bg-muted/20 text-xs">
              <h3 className="font-bold mb-4 border-b pb-2">
                Version {rev1?.version || "N/A"}
              </h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {content1 || "*No content available*"}
              </ReactMarkdown>
            </div>
            <div className="border rounded-md p-3 overflow-y-auto max-h-[300px] bg-muted/20 text-xs">
              <h3 className="font-bold mb-4 border-b pb-2">
                Version {rev2?.version || "N/A"}
              </h3>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {content2 || "*No content available*"}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <div className="flex flex-row justify-between items-center">
              <Label className="text-sm font-semibold">Change Summary</Label>
              <Button
                onClick={generateSummary}
                variant="default"
                size="sm"
                disabled={isGenerating || !version1 || !version2}
              >
                {isGenerating ? "Generating..." : "Generate Summary"}
              </Button>
            </div>
            <div className="min-h-[100px] border rounded-md p-4 bg-muted/10 overflow-y-auto text-sm">
              {changeSummary ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {changeSummary}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  Click &quot;Generate Summary&quot; to compute differences
                  between the selected versions.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
