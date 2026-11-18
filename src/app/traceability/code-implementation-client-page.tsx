"use client";

import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  getCodeImplementationTraceLogs,
  getCodeImplementationTraces,
} from "@/src/services/traceability-service";
import { CodeImplementationTraceLogModel } from "@/src/types/code-implementation-trace-log-model";
import { CodeImplementationTraceModel } from "@/src/types/code-implementation-trace-model";
import { useEffect, useRef, useState } from "react";
import ServiceProxy from "@/src/services/service-proxy";
import ViewSpecificationContent from "@/src/app/specification-setup/view-specification-content";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { PaginationControl } from "@/src/app/controls/pagination-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function CodeImplementationClientPage() {
  const { userSetting, projectId } = useUserSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = userSetting?.page_size || 25;
  const [totalPages, setTotalPages] = useState(0);
  const [traceTypes, setTraceTypes] = useState<string[]>([
    "Pull request",
    "Code",
  ]);
  const [codeImplementationTraceLogs, setCodeImplementationTraceLogs] =
    useState<CodeImplementationTraceLogModel[]>([]);
  const [filterSpecificationName, setFilterSpecificationName] =
    useState<string>("");
  const [filterTraceType, setFilterTraceType] = useState<string>("");
  const [selectedSpec, setSelectedSpec] = useState<{
    title: string;
    content: string;
    sourceUrl?: string;
  } | null>(null);
  const [selectedPrComment, setSelectedPrComment] = useState<{
    title: string;
    comments: string;
  } | null>(null);
  const [isPanelHidden, setIsPanelHidden] = useState(false);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSplitActive = Boolean(selectedSpec || selectedPrComment) && !isPanelHidden;

  useEffect(() => {
    async function fetchTraceabilityData() {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const logsRes = await getCodeImplementationTraceLogs(
          projectId,
          page,
          pageSize,
          filterSpecificationName,
          filterTraceType,
        );
        setCodeImplementationTraceLogs(logsRes.results || []);
        setTotalPages(logsRes.count ? Math.ceil(logsRes.count / pageSize) : 0);
      } catch (error) {
        console.error("Failed to fetch traceability data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTraceabilityData();
  }, [projectId, page, pageSize, filterSpecificationName, filterTraceType]);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.min(Math.max(newPercent, 20), 80);
      setSplitPercent(clampedPercent);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  const handleSpecificationClick = async (
    log: CodeImplementationTraceLogModel,
  ) => {
    try {
      const specId = (log as any).specification_id;
      let specData: any = null;

      if (specId) {
        const response = await ServiceProxy.getSpecificationById(specId);
        specData = response?.specification;
      } else if (log.specification_name) {
        const response = await ServiceProxy.getSpecificationByCode(
          log.specification_name,
        );
        specData = response?.specifications?.[0];
      }

      let content = "";
      if (specData) {
        if (specData?.source === "Jama") {
          content = specData?.content || "";
        } else {
          content =
            specData?.type === "Specification"
              ? specData?.raw_content || ""
              : specData?.content || "";
        }
      }

      setSelectedPrComment(null);
      setSelectedSpec({
        title: log.specification_name,
        content,
        sourceUrl: specData?.path || "",
      });
      setIsPanelHidden(false);
    } catch (error) {
      console.error("Failed to fetch specification content:", error);
    }
  };

  const handlePrTitleClick = (log: CodeImplementationTraceLogModel) => {
    setSelectedSpec(null);
    setSelectedPrComment({
      title: log.pull_request_title || `PR #${log.id}`,
      comments: log.pull_request_comments || "*No PR comments available.*",
    });
    setIsPanelHidden(false);
  };

  return (
    <div className="gap-4 p-2">
      <h1 className="font-bold text-lg text-muted-foreground">
        Code Implementation
      </h1>
      <div
        ref={containerRef}
        className={`flex items-stretch h-[calc(100vh-180px)] ${isDragging ? "select-none cursor-col-resize" : ""}`}
      >
        <div
          style={isSplitActive ? { width: `calc(${splitPercent}% - 6px)` } : undefined}
          className={`flex flex-col gap-2 min-h-0 h-full ${
            isDragging ? "" : "transition-[width] duration-150"
          } ${isSplitActive ? "min-w-0" : "w-full"}`}
        >
          <div className="rounded-md border overflow-auto flex-1 min-h-0">
            <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-xs">
            <TableRow className="h-11 [&>th]:h-11 [&>th]:font-bold bg-muted uppercase text-xs">
              <TableHead>ID</TableHead>
              <TableHead>Specification</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>PR/Code</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>PR Title</TableHead>
            </TableRow>
            <TableRow className="h-11 [&>th]:h-11 bg-background">
              <TableHead></TableHead>
              <TableHead>
                <div className="relative">
                  <Input
                    placeholder="Filter parent..."
                    defaultValue={filterSpecificationName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setPage(1);
                        setFilterSpecificationName(e.currentTarget.value);
                      }
                    }}
                    className="h-7 text-xs min-w-[140px] px-2 py-0.5 pr-7 tracking-tight"
                  />
                  {filterSpecificationName && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        setFilterSpecificationName("");
                        setPage(1);
                        const input = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                    >
                      <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </TableHead>
              <TableHead>
                <Select
                  value={filterTraceType || "all"}
                  onValueChange={(val) => {
                    setPage(1);
                    setFilterTraceType(val === "all" ? "" : val);
                  }}
                >
                  <SelectTrigger
                    id="filter-source-select"
                    className="h-8 text-xs min-w-[120px]"
                  >
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {traceTypes.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableHead>
              <TableHead>
                {/* <Input
                  placeholder="Filter..."
                  defaultValue={""}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setPage(1);
                      setFilterImplementationCode(e.currentTarget.value);
                    }
                  }}
                  className="h-8 text-xs min-w-[120px]"
                /> */}
              </TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading logs...
                </TableCell>
              </TableRow>
            ) : codeImplementationTraceLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No trace logs found.
                </TableCell>
              </TableRow>
            ) : (
              codeImplementationTraceLogs.map(
                (log: CodeImplementationTraceLogModel) => (
                  <TableRow key={log.id} className="hover:bg-muted">
                    <TableCell>{log.id}</TableCell>
                    <TableCell>
                      <span
                        className="cursor-pointer hover:underline hover:text-primary font-medium"
                        onClick={() => handleSpecificationClick(log)}
                        title="Click to view specification content"
                      >
                        {log.specification_name}
                      </span>
                    </TableCell>
                    <TableCell>{log.trace_type}</TableCell>
                    <TableCell>{log.name}</TableCell>
                    <TableCell>
                      {log.html_url ? (
                        <a
                          href={log.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {log.html_url.split("/").pop() || "View PR"}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs text-xs">
                      {log.pull_request_title ? (
                        <span
                          className="cursor-pointer hover:underline hover:text-primary font-medium"
                          onClick={() => handlePrTitleClick(log)}
                          title="Click to view PR comments"
                        >
                          {log.pull_request_title}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    {/* <TableCell className="max-w-xs text-xs">
                      {log.pull_request_comments ? (
                        <div className="prose prose-xs dark:prose-invert max-w-none max-h-32 overflow-y-auto">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {log.pull_request_comments}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell> */}
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
          </div>
          <div className="shrink-0">
            <PaginationControl
              page={page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        </div>

        {isSplitActive && (
          <div
            role="separator"
            aria-orientation="vertical"
            tabIndex={0}
            onPointerDown={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            className="w-3 shrink-0 flex items-center justify-center cursor-col-resize select-none group touch-none"
            title="Drag to resize panels"
          >
            <div
              className={`w-1 h-10 rounded-full transition-colors ${
                isDragging ? "bg-primary" : "bg-border group-hover:bg-primary/70"
              }`}
            />
          </div>
        )}

        {isSplitActive && (
          <div
            style={{ width: `calc(${100 - splitPercent}% - 6px)` }}
            className={`min-w-0 border rounded-lg bg-card shadow-sm flex flex-col h-full min-h-0 ${
              isDragging ? "" : "transition-[width] duration-150"
            }`}
          >
            {selectedSpec && (
              <ViewSpecificationContent
                title={selectedSpec.title}
                content={selectedSpec.content}
                sourceUrl={selectedSpec.sourceUrl}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {selectedPrComment && (
              <div className="flex flex-col flex-1 h-full min-h-0">
                <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
                  <h3
                    className="font-semibold text-base truncate max-w-[340px]"
                    title={`PR Comments: ${selectedPrComment.title}`}
                  >
                    PR Comments: {selectedPrComment.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="Hide panel to right"
                      onClick={() => setIsPanelHidden(true)}
                    >
                      <FontAwesomeIcon
                        icon={faChevronRight}
                        className="h-3.5 w-3.5 text-muted-foreground"
                      />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedPrComment.comments}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
