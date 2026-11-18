"use client";

import { ProjectSpecificationModel } from "@/src/types/project-specification-model";
import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { getProjectSpecifications } from "@/src/services/project-specification-service";
import { Input } from "@/src/components/ui/input";
import { PaginationControl } from "@/src/app/controls/pagination-control";
import { Button } from "@/src/components/ui/button";
import SpecificationSetupAddProjectSpecification from "./specification-setup-add-project-specification";
import SpecificationSetupImportProjectSpecification from "./specification-setup-import-project-specification";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faSave,
  faXmark,
  faHistory,
  faChevronRight,
  faChevronLeft,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import ServiceProxy from "@/src/services/service-proxy";
import { CategoryModel } from "@/src/types/category-model";
import SpecificationSetupMilestoneBaseline from "./specification-setup-milestone-baseline";
import { getComponents } from "@/src/services/component-service";
import ViewSpecificationChangeLog from "./view-specification-change-log";
import { getFunctions } from "@/src/services/function-service";
import { getCategories } from "@/src/services/category-service";
import { ComponentModel } from "@/src/types/component-model";
import { FunctionModel } from "@/src/types/function-model";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ViewSpecificationContent from "./view-specification-content";
import ViewSpecificationChangeSummary from "./view-specification-change-summary";
import { getDistinctSpecificationType } from "@/src/services/specification-service";

function ExpandableParentText({ text }: { text?: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return <span>-</span>;
  if (text.length <= 50) return <span>{text}</span>;

  return (
    <span className="break-words">
      {isExpanded ? text : text.slice(0, 50)}
      <button
        type="button"
        className="text-primary hover:underline cursor-pointer font-bold ml-0.5 inline-flex items-center"
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isExpanded ? "Show less" : "Show more"}
      >
        {isExpanded ? " (less)" : "... more"}
      </button>
    </span>
  );
}

export default function SpecificationSetupClientPage() {
  const { userSetting, projectId } = useUserSettingContext();
  const [page, setPage] = useState(1);
  const pageSize = userSetting?.page_size || 25;
  const [totalPages, setTotalPages] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const [components, setComponents] = useState<ComponentModel[]>([]);
  const [functions, setFunctions] = useState<FunctionModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [projectSpecifications, setProjectSpecifications] = useState<
    ProjectSpecificationModel[]
  >([]);
  const [specificationTypes, setSpecificationTypes] = useState<string[]>([]);

  const [activeActionPanel, setActiveActionPanel] = useState<
    "import" | "add" | "milestone-baseline" | null
  >(null);
  const [filterSpecSource, setFilterSpecSource] = useState<string>("");
  const [filterComponent, setFilterComponent] = useState<string>("");
  const [filterFunction, setFilterFunction] = useState<string>("");
  const [filterCategory1, setFilterCategory1] = useState<string>("");
  const [filterSpecificationParent, setFilterSpecificationParent] =
    useState<string>("");
  const [filterSpecificationName, setFilterSpecificationName] =
    useState<string>("");
  const [filterSpecificationType, setFilterSpecificationType] =
    useState<string>("");
  const [filterVersion, setFilterVersion] = useState<string>("");
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>("");
  const [selectedChangeSummary, setSelectedChangeSummary] = useState<{
    specName: string;
    summary: string;
  } | null>(null);
  const [selectedDependency, setSelectedDependency] = useState<{
    title: string;
    content: string;
    sourceUrl?: string;
  } | null>(null);
  const [selectedChangeLog, setSelectedChangeLog] = useState<{
    specId: number;
    specName: string;
  } | null>(null);
  const [isPanelHidden, setIsPanelHidden] = useState(false);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [specSources] = useState<string[]>([
    "Local",
    "GoogleDrive",
    "Github",
    "Jama",
  ]);
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const componentResponse = await getComponents(projectId);
        setComponents(componentResponse.components || []);
        const functionResponse = await getFunctions(projectId);
        setFunctions(functionResponse.functions || []);
        const categoryResponse = await getCategories(projectId);
        setCategories(categoryResponse.categories || []);
        const specificationTypes = await getDistinctSpecificationType(projectId);
        setSpecificationTypes(specificationTypes.results ?? []);

        const response = await getProjectSpecifications(
          projectId,
          page,
          pageSize,
          filterSpecSource,
          filterCategory1,
          filterComponent,
          filterFunction,
          filterSpecificationParent,
          filterSpecificationName,
          filterSpecificationType,
          filterVersion,
        );

        setProjectSpecifications(response.projectSpecifications || []);
        setTotalPages(
          response.count ? Math.ceil(response.count / pageSize) : 0,
        );
      } catch (error) {
        console.error("Failed to fetch project specifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (projectId) {
      fetchData();
    }
  }, [
    projectId,
    page,
    pageSize,
    filterSpecSource,
    filterCategory1,
    filterComponent,
    filterFunction,
    filterSpecificationParent,
    filterSpecificationName,
    filterSpecificationType,
    filterVersion,
  ]);

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

  const closeActionPanel = () => {
    setActiveActionPanel(null);
    setIsPanelHidden(false);
    if (window.location.search.includes("action=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  useEffect(() => {
    const handleUrlAction = (actionName?: string) => {
      const action =
        actionName || new URLSearchParams(window.location.search).get("action");
      if (action) {
        setSelectedDependency(null);
        setSelectedChangeLog(null);
        setSelectedChangeSummary(null);
        setIsPanelHidden(false);
      }
      if (action === "import") {
        setActiveActionPanel("import");
      } else if (action === "add") {
        setActiveActionPanel("add");
      } else if (action === "milestone-baseline" || action === "baseline") {
        setActiveActionPanel("milestone-baseline");
      }
    };

    handleUrlAction();
    const handleCustomAction = (e: Event) =>
      handleUrlAction((e as CustomEvent<string>).detail);
    window.addEventListener("spec-action", handleCustomAction);
    window.addEventListener("popstate", () => handleUrlAction());
    return () => {
      window.removeEventListener("spec-action", handleCustomAction);
      window.removeEventListener("popstate", () => handleUrlAction());
    };
  }, []);

  const handleCategoryChange = async (
    spec: ProjectSpecificationModel,
    newCategory: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("id", String(spec.id));
      formData.append("project", String(spec.project_id));
      formData.append("component", String(spec.component_id));
      //formData.append("function", String(spec.function_id));
      formData.append("specification", String(spec.specification_id));
      //formData.append("specificationOrder", String(spec.specification_order));
      formData.append("specificationType", String(spec.specification_type));
      //formData.append("version", String(spec.specification_version));
      formData.append("category1", newCategory);
      // if (spec.category2) {
      //   formData.append("category2", spec.category2);
      // }

      const response = await ServiceProxy.updateProjectSpecification(formData);

      if (response?.error) {
        alert(response.error);
        return false;
      } else {
        setProjectSpecifications((prev) =>
          prev.map((p) =>
            p.id === spec.id ? { ...p, category1: newCategory } : p,
          ),
        );
        return true;
      }
    } catch (error) {
      console.error("Failed to update specification category:", error);
      alert("An unexpected error occurred while saving.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (spec: ProjectSpecificationModel) => {
    setEditingRowId(spec.id);
    setEditingCategory(spec.category1 || "");
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditingCategory("");
  };

  const handleSave = async (spec: ProjectSpecificationModel) => {
    const success = await handleCategoryChange(spec, editingCategory);
    if (success) {
      setEditingRowId(null);
      setEditingCategory("");
    }
  };

  const hasActivePanel = Boolean(
    selectedDependency ||
    selectedChangeLog ||
    selectedChangeSummary ||
    activeActionPanel,
  );
  const isSplitActive = hasActivePanel && !isPanelHidden;

  return (
    <div id="specification-setup-page" className="p-4">
      <div
        ref={containerRef}
        className={`flex items-stretch h-[calc(100vh-220px)] ${
          isDragging ? "select-none cursor-col-resize" : ""
        }`}
      >
        <div
          style={
            isSplitActive
              ? { width: `calc(${splitPercent}% - 6px)` }
              : undefined
          }
          className={`flex flex-col gap-2 min-h-0 h-full ${
            isDragging ? "" : "transition-[width] duration-150"
          } ${isSplitActive ? "min-w-0" : "w-full"}`}
        >
          <div className="rounded-lg border overflow-auto flex-1 min-h-0">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background shadow-xs">
                <TableRow className="h-11 [&>th]:h-11 [&>th]:font-bold bg-muted uppercase text-xs">
                  <TableHead>ID</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Specification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dependencies</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Change Summary</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>
                    <Select
                      value={filterSpecSource || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterSpecSource(val === "all" ? "" : val);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {specSources.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead>
                    <Select
                      value={filterComponent || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterComponent(val === "all" ? "" : val);
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs min-w-[120px] px-2 py-0.5 tracking-tight">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="py-1 text-xs">
                          All
                        </SelectItem>
                        {components.map((c) => (
                          <SelectItem
                            key={c.id || c.name}
                            value={c.name}
                            className="py-1 text-xs"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead><div className="relative">
                      <Input
                        placeholder="Filter parent..."
                        defaultValue={filterSpecificationParent}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setPage(1);
                            setFilterSpecificationParent(e.currentTarget.value);
                          }
                        }}
                        className="h-7 text-xs min-w-[140px] px-2 py-0.5 pr-7 tracking-tight"
                      />
                      {filterSpecificationParent && (
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            setFilterSpecificationParent("");
                            setPage(1);
                            const input = e.currentTarget
                              .previousElementSibling as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                        >
                          <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                        </button>
                      )}
                    </div></TableHead>
                  <TableHead>
                    <div className="relative">
                      <Input
                        placeholder="Filter specification..."
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
                      value={filterSpecificationType || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterSpecificationType(val === "all" ? "" : val);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {specificationTypes.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead></TableHead>
                  <TableHead>
                    <Select
                      value={filterCategory1 || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterCategory1(val === "all" ? "" : val);
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs min-w-[120px] px-2 py-0.5 tracking-tight">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="py-1 text-xs">
                          All
                        </SelectItem>
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id || c.name}
                            value={c.name}
                            className="py-1 text-xs"
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : projectSpecifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="h-24 text-center">
                      No specifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectSpecifications.map((spec, index) => (
                    <TableRow
                      key={spec.id || index}
                      id={`spec-row-${spec.id}`}
                      className="even:bg-blue-50/60 hover:bg-blue-100/60 dark:even:bg-slate-800/40 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <TableCell>{spec.id}</TableCell>
                      <TableCell>
                        {(spec as any).source_url ||
                        (spec as any).specification_source_url ||
                        (spec as any).url ? (
                          <a
                            href={
                              (spec as any).source_url ||
                              (spec as any).specification_source_url ||
                              (spec as any).url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                            title="Open source specification"
                          >
                            {spec.specification_source}
                            <FontAwesomeIcon
                              icon={faArrowUpRightFromSquare}
                              className="h-2.5 w-2.5"
                            />
                          </a>
                        ) : (
                          spec.specification_source
                        )}
                      </TableCell>
                      <TableCell>{spec.component_name}</TableCell>
                      <TableCell>
                        <ExpandableParentText text={spec.parent_name} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="cursor-pointer hover:underline hover:text-primary"
                            onClick={async () => {
                              try {
                                const specId =
                                  (spec as any).specification_id ?? spec.id;
                                const response =
                                  await ServiceProxy.getSpecificationById(
                                    specId,
                                  );
                                const specData = response?.specification;
                                const content = specData?.raw_content || specData?.content || "";
                                setSelectedChangeLog(null);
                                setSelectedChangeSummary(null);
                                closeActionPanel();
                                setIsPanelHidden(false);
                                setSelectedDependency({
                                  title: spec.specification_name,
                                  content,
                                  sourceUrl:
                                    specData?.path || specData?.path || "",
                                });
                              } catch (error) {
                                console.error(
                                  "Failed to fetch specification content:",
                                  error,
                                );
                              }
                            }}
                            title="Click to view specification content"
                          >
                            {spec.specification_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{spec.specification_type}</TableCell>
                      <TableCell>
                        {spec.specification_dependencies?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {spec.specification_dependencies
                              .split(",")
                              .map((dep, depIndex) => (
                                <span
                                  key={depIndex}
                                  className="cursor-pointer hover:underline hover:text-primary text-sm"
                                  onClick={async () => {
                                    try {
                                      const response =
                                        await ServiceProxy.getSpecificationByCode(
                                          dep.trim(),
                                        );
                                      const specData =
                                        response?.specifications?.[0];
                                      const content = specData?.raw_content || specData?.content || "";
                                      setSelectedChangeLog(null);
                                      setSelectedChangeSummary(null);
                                      closeActionPanel();
                                      setIsPanelHidden(false);
                                      setSelectedDependency({
                                        title: dep,
                                        content,
                                        sourceUrl:
                                          specData?.path ||
                                          specData?.path ||
                                          "",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Failed to fetch specification content:",
                                        error,
                                      );
                                    }
                                  }}
                                  title="Click to view specification content"
                                >
                                  {dep}
                                </span>
                              ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            None
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingRowId === spec.id ? (
                          <Select
                            value={editingCategory || undefined}
                            onValueChange={setEditingCategory}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[120px]">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((c) => (
                                <SelectItem key={c.id || c.name} value={c.name}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>{spec.category1 || "-"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {" "}
                          {spec.specification_version}
                          <FontAwesomeIcon
                            id={`view-change-log-icon-${spec.id}`}
                            icon={faHistory}
                            className="cursor-pointer text-muted-foreground hover:text-primary"
                            title="View Change Log"
                            onClick={() => {
                              setSelectedDependency(null);
                              setSelectedChangeSummary(null);
                              closeActionPanel();
                              setIsPanelHidden(false);
                              setSelectedChangeLog({
                                specId:
                                  (spec as any).specification_id ?? spec.id,
                                specName: spec.specification_name,
                              });
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          id={`view-change-summary-${spec.id}`}
                          className="cursor-pointer text-sm hover:text-primary transition-colors max-w-[200px] truncate"
                          onClick={() => {
                            setSelectedDependency(null);
                            setSelectedChangeLog(null);
                            closeActionPanel();
                            setIsPanelHidden(false);
                            setSelectedChangeSummary({
                              specName: spec.specification_name,
                              summary:
                                spec.specification_revision_change_summary ||
                                "",
                            });
                          }}
                          title="Click to view full summary"
                        >
                          {spec.specification_revision_change_summary || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingRowId === spec.id ? (
                          <div className="flex flex-row items-center gap-2">
                            <FontAwesomeIcon
                              id={`save-spec-btn-${spec.id}`}
                              icon={faSave}
                              style={{ width: "16px" }}
                              className="cursor-pointer text-emerald-600 hover:text-emerald-700"
                              title="Save"
                              onClick={() => handleSave(spec)}
                            />
                            <FontAwesomeIcon
                              id={`cancel-edit-spec-btn-${spec.id}`}
                              icon={faXmark}
                              style={{ width: "16px" }}
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                              title="Cancel"
                              onClick={handleCancel}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-row items-center gap-2">
                            <FontAwesomeIcon
                              id={`edit-spec-btn-${spec.id}`}
                              icon={faEdit}
                              style={{ width: "16px" }}
                              className="cursor-pointer text-muted-foreground hover:text-primary"
                              title="Edit"
                              onClick={() => handleEdit(spec)}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div id="specification-setup-pagination-wrapper" className="shrink-0">
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
                isDragging
                  ? "bg-primary"
                  : "bg-border group-hover:bg-primary/70"
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
            {selectedDependency && (
              <ViewSpecificationContent
                title={selectedDependency.title}
                content={selectedDependency.content}
                sourceUrl={selectedDependency.sourceUrl}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {selectedChangeLog && (
              <ViewSpecificationChangeLog
                specificationId={selectedChangeLog.specId}
                specificationName={selectedChangeLog.specName}
                onClose={() => setSelectedChangeLog(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {selectedChangeSummary && (
              <ViewSpecificationChangeSummary
                specName={selectedChangeSummary.specName}
                summary={selectedChangeSummary.summary}
                onClose={() => setSelectedChangeSummary(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activeActionPanel === "import" && (
              <SpecificationSetupImportProjectSpecification
                onSuccess={closeActionPanel}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activeActionPanel === "add" && (
              <SpecificationSetupAddProjectSpecification
                onSuccess={closeActionPanel}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activeActionPanel === "milestone-baseline" && (
              <SpecificationSetupMilestoneBaseline
                onClose={closeActionPanel}
                onHide={() => setIsPanelHidden(true)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
