"use client";

import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { PaginationControl } from "@/src/app/controls/pagination-control";
import { Input } from "@/src/components/ui/input";
import {
  getProjectSpecificationMilestoneBaselines,
  updateProjectSpecificationMilestoneBaselineVerion,
} from "@/src/services/project-specification-milestone-baseline-service";
import {
  MilestoneData,
  ProjectSpecificationMilestoneBaselineQueryModel,
} from "@/src/types/project-specification-milestone-baseline-query-model";
import { ProjectMilestoneModel } from "@/src/types/project-milestone-model";
import { getProjectMilestones } from "@/src/services/project-milestone-service";
import {
  faDiagramProject,
  faEye,
  faCheck,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faXmark,
  faChevronRight,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ViewSpecificationContent from "./view-specification-content";
import ViewSpecificationDiagram from "./view-specification-diagram";
import ViewSpecificationTestCases from "./view-specification-test-cases";
import ViewCompareSpecification from "./view-compare-specification";
import { ComponentModel } from "@/src/types/component-model";
import { getComponents } from "@/src/services/component-service";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { getDistinctVersion } from "@/src/services/specification-revision-service";
import { FunctionModel } from "@/src/types/function-model";
import { CategoryModel } from "@/src/types/category-model";
import { getCategories } from "@/src/services/category-service";
import { getFunctions } from "@/src/services/function-service";
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
        className="text-primary hover:underline cursor-pointer font-semibold ml-1 inline-flex items-center text-xs"
        onClick={() => setIsExpanded((prev) => !prev)}
        title={isExpanded ? "Show less" : "Show more"}
      >
        {isExpanded ? " (less)" : "... more"}
      </button>
    </span>
  );
}

export default function SpecificationMilestoneClientPage() {
  const { userSetting, projectId } = useUserSettingContext();
  const [page, setPage] = useState(1);
  const pageSize = userSetting?.page_size || 25;
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [components, setComponents] = useState<ComponentModel[]>([]);
  const [functions, setFunctions] = useState<FunctionModel[]>([]);
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [specificationTypes, setSpecificationTypes] = useState<string[]>([]);
  const [filterSpecSource, setFilterSpecSource] = useState<string>("");
  const [specSources] = useState<string[]>([
    "Local",
    "GoogleDrive",
    "Github",
    "Jama",
  ]);
  const [filterComponent, setFilterComponent] = useState<string>("");
  const [filterFunction, setFilterFunction] = useState<string>("");
  const [filterCategory1, setFilterCategory1] = useState<string>("");
  const [filterSpecificationName, setFilterSpecificationName] =
    useState<string>("");
  const [filterSpecificationType, setFilterSpecificationType] =
    useState<string>("");
  const [filterVersion, setFilterVersion] = useState<string>("");

  const [activePanel, setActivePanel] = useState<
    "content" | "diagram" | "test-cases" | "compare" | "reject-comment" | null
  >(null);
  const [isPanelHidden, setIsPanelHidden] = useState(false);
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [baselineToDelete, setBaselineToDelete] =
    useState<ProjectSpecificationMilestoneBaselineQueryModel | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [selectedSpecId, setSelectedSpecId] = useState<number>(0);
  const [selectedRevisionId, setSelectedRevisionId] = useState<number>(0);
  const [interfaceContent, setInterfaceContent] = useState<string>("");
  const [
    projectSpecificationMilestoneBaselines,
    setProjectSpecificationMilestoneBaselines,
  ] = useState<ProjectSpecificationMilestoneBaselineQueryModel[]>([]);
  const [projectMilestones, setProjectMilestones] = useState<
    ProjectMilestoneModel[]
  >([]);
  const [versions, setVersions] = useState<string[]>([]);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<
    Record<string, MilestoneData>
  >({});
  const [rejectingBaseline, setRejectingBaseline] =
    useState<ProjectSpecificationMilestoneBaselineQueryModel | null>(null);
  const [rejectComment, setRejectComment] = useState<string>("");
  const [rowStatuses, setRowStatuses] = useState<
    Record<number, { status: "accepted" | "rejected"; comment?: string }>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const categoryResponse = await getCategories();
        setCategories(categoryResponse.categories || []);

        const componentResponse = await getComponents();
        setComponents(componentResponse.components || []);

        const functionResponse = await getFunctions();
        setFunctions(functionResponse.functions || []);

        const versionResponse = await getDistinctVersion();
        setVersions(versionResponse.versions || []);

        const specificationTypes = await getDistinctSpecificationType(
          Number(projectId),
        );
        setSpecificationTypes(specificationTypes.results ?? []);

        const response = await getProjectMilestones(Number(projectId));
        setProjectMilestones(response.projectMilestones || []);
      } catch (error) {
        console.error("Failed to fetch project milestones:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  useEffect(() => {
    const fetchProjectSpecificationMilestoneBaselines = async () => {
      setIsLoading(true);
      try {
        const response = await getProjectSpecificationMilestoneBaselines(
          Number(projectId),
          page,
          pageSize,
          filterCategory1,
          filterComponent,
          filterFunction,
          filterSpecificationName,
          filterSpecificationType,
          filterVersion,
          filterSpecSource,
        );
        if ("results" in response) {
          setProjectSpecificationMilestoneBaselines(response.results || []);
          setTotalPages(
            response.count ? Math.ceil(response.count / pageSize) : 0,
          );
        }
      } catch (error) {
        console.error(
          "Failed to fetch project specification milestone baselines:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectSpecificationMilestoneBaselines();
  }, [
    projectId,
    page,
    pageSize,
    filterSpecSource,
    filterCategory1,
    filterComponent,
    filterFunction,
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

  const handleEdit = (
    baseline: ProjectSpecificationMilestoneBaselineQueryModel,
  ) => {
    setEditingRowId(baseline.project_specification_id);
    const initialData: Record<string, MilestoneData> = {};
    projectMilestones.forEach((m) => {
      const mData = (baseline.milestones as Record<string, MilestoneData>)?.[
        m.name
      ];
      if (mData?.version) {
        initialData[m.name] = mData;
      }
    });
    setEditFormData(initialData);
  };

  const handleSave = async (
    baseline: ProjectSpecificationMilestoneBaselineQueryModel,
  ) => {
    try {
      setIsLoading(true);

      const updatePromises = Object.entries(editFormData).map(
        async ([milestoneName, milestoneData]) => {
          const milestone = projectMilestones.find(
            (m) => m.name === milestoneName,
          );
          if (!milestone) return;

          updateProjectSpecificationMilestoneBaselineVerion(
            baseline.project_id,
            baseline.project_specification_id,
            milestone.id,
            milestoneData.version,
          );
        },
      );

      await Promise.all(updatePromises);

      // Update baseline locally to immediately reflect the new versions on the table
      const updatedBaselines = projectSpecificationMilestoneBaselines.map(
        (b) => {
          if (
            b.project_specification_id === baseline.project_specification_id
          ) {
            const updatedMilestones = {
              ...((b.milestones || {}) as Record<string, MilestoneData>),
            };
            Object.entries(editFormData).forEach(([mName, mData]) => {
              if (updatedMilestones[mName]) {
                updatedMilestones[mName].version = mData.version;
              } else {
                updatedMilestones[mName] = mData;
              }
            });
            return { ...b, milestones: updatedMilestones };
          }
          return b;
        },
      );

      setProjectSpecificationMilestoneBaselines(updatedBaselines);
    } catch (error) {
      console.error("Failed to save milestone baseline:", error);
      // Optional: Add toast notification for failure here
    } finally {
      setIsLoading(false);
      setEditingRowId(null);
    }
  };

  const handleCancel = () => {
    setEditingRowId(null);
    setEditFormData({});
  };

  const handleDelete = (
    baseline: ProjectSpecificationMilestoneBaselineQueryModel,
  ) => {
    setBaselineToDelete(baseline);
    setIsDeleteDialogOpen(true);
  };

  const handleAccept = (
    baseline: ProjectSpecificationMilestoneBaselineQueryModel,
  ) => {
    setRowStatuses((prev) => ({
      ...prev,
      [baseline.project_specification_id]: { status: "accepted" },
    }));
    if (
      rejectingBaseline?.project_specification_id ===
      baseline.project_specification_id
    ) {
      setActivePanel(null);
      setRejectingBaseline(null);
    }
  };

  const handleReject = (
    baseline: ProjectSpecificationMilestoneBaselineQueryModel,
  ) => {
    setRejectingBaseline(baseline);
    setRejectComment(
      rowStatuses[baseline.project_specification_id]?.comment || "",
    );
    setActivePanel("reject-comment");
    setIsPanelHidden(false);
  };

  const handleSubmitRejection = () => {
    if (!rejectingBaseline) return;
    setRowStatuses((prev) => ({
      ...prev,
      [rejectingBaseline.project_specification_id]: {
        status: "rejected",
        comment: rejectComment,
      },
    }));
    setActivePanel(null);
    setRejectingBaseline(null);
  };

  const isSplitActive = Boolean(activePanel) && !isPanelHidden;

  return (
    <div id="specification-milestones-page" className="p-4">
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
                  <TableHead>Category</TableHead>
                  <TableHead>Lastest Version</TableHead>
                  {projectMilestones.map((m) => (
                    <TableHead key={m.id}>{m.name}</TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
                <TableRow className="h-11 [&>th]:h-11 bg-background">
                  <TableHead></TableHead>
                  <TableHead>
                    <Select
                      value={filterSpecSource || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterSpecSource(val === "all" ? "" : val);
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
                      <SelectTrigger
                        id="filter-component-select"
                        className="h-8 text-xs min-w-[120px]"
                      >
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {components.map((c) => (
                          <SelectItem key={c.name} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead></TableHead>
                  <TableHead>
                    <div className="relative">
                      <Input
                        id="filter-specification-name-input"
                        placeholder="Filter..."
                        defaultValue={filterSpecificationName}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setPage(1);
                            setFilterSpecificationName(e.currentTarget.value);
                          }
                        }}
                        className="h-8 text-xs min-w-[120px] pr-7"
                      />
                      {filterSpecificationName && (
                        <button
                          id="clear-specification-name-filter-btn"
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
                  <TableHead>
                    <Select
                      value={filterCategory1 || "all"}
                      onValueChange={(val) => {
                        setPage(1);
                        setFilterCategory1(val === "all" ? "" : val);
                      }}
                    >
                      <SelectTrigger
                        id="filter-category-select"
                        className="h-8 text-xs min-w-[120px]"
                      >
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categories.map((t) => (
                          <SelectItem key={t.name} value={t.name}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableHead>
                  <TableHead></TableHead>
                  {projectMilestones.map((m) => (
                    <TableHead key={m.id}></TableHead>
                  ))}
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9 + projectMilestones.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : projectSpecificationMilestoneBaselines.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9 + projectMilestones.length}
                      className="h-24 text-center"
                    >
                      No milestone baselines found.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectSpecificationMilestoneBaselines.map(
                    (baseline, index) => (
                      <TableRow
                        key={baseline.project_specification_id || index}
                        id={`baseline-row-${baseline.project_specification_id}`}
                        className="even:bg-blue-50/60 hover:bg-blue-100/60 dark:even:bg-slate-800/40 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <TableCell>
                          {baseline.project_specification_id}
                        </TableCell>
                        <TableCell>
                          {(baseline as any).source_url ||
                          (baseline as any).specification_source_url ||
                          (baseline as any).url ? (
                            <a
                              href={
                                (baseline as any).source_url ||
                                (baseline as any).specification_source_url ||
                                (baseline as any).url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline inline-flex items-center gap-1"
                              title="Open source specification"
                            >
                              {(baseline as any).specification_source}
                              <FontAwesomeIcon
                                icon={faArrowUpRightFromSquare}
                                className="h-2.5 w-2.5"
                              />
                            </a>
                          ) : (
                            (baseline as any).specification_source || "-"
                          )}
                        </TableCell>
                        <TableCell>{baseline.component_name}</TableCell>
                        <TableCell>
                          <ExpandableParentText text={baseline.parent_name} />
                        </TableCell>
                        <TableCell>
                          <a
                            href="#"
                            id={`compare-spec-link-${baseline.project_specification_id}`}
                            className="cursor-pointer hover:text-primary hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedItem(baseline.specification_name);
                              setSelectedSpecId(baseline.specification_id);
                              setActivePanel("compare");
                              setIsPanelHidden(false);
                            }}
                          >
                            {baseline.specification_name}
                          </a>
                        </TableCell>
                        <TableCell>{baseline.specification_type}</TableCell>
                        <TableCell>{baseline.category1}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {baseline.specification_version}
                            {(baseline.specification_type === "Specification" ||
                              baseline.specification_type ===
                                "Sub Specification") && (
                              <FontAwesomeIcon
                                id={`view-spec-content-icon-${baseline.project_specification_id}`}
                                icon={faEye}
                                style={{ width: "20px" }}
                                className="cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setSelectedItem(
                                    `Viewing ${baseline.specification_name} v${baseline.specification_version}`,
                                  );
                                  setSelectedContent(
                                    baseline.specification_type ===
                                      "Specification"
                                      ? baseline.specification_raw_content || ""
                                      : baseline.specification_content,
                                  );
                                  setActivePanel("content");
                                  setIsPanelHidden(false);
                                }}
                              />
                            )}

                            {baseline.specification_type ===
                              "Specification" && (
                              <FontAwesomeIcon
                                id={`view-spec-diagram-icon-${baseline.project_specification_id}`}
                                icon={faDiagramProject}
                                style={{ width: "20px" }}
                                className="cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setSelectedItem(
                                    `Project details for ${baseline.specification_name}`,
                                  );
                                  setInterfaceContent(
                                    baseline.specification_interface,
                                  );
                                  setSelectedSpecId(baseline.specification_id);
                                  setActivePanel("diagram");
                                  setIsPanelHidden(false);
                                }}
                              />
                            )}

                            {(baseline.specification_type === "Specification" ||
                              baseline.specification_type ===
                                "Sub Specification") && (
                              <FontAwesomeIcon
                                id={`check-spec-status-icon-${baseline.project_specification_id}`}
                                icon={faCheck}
                                style={{ width: "20px" }}
                                className="cursor-pointer hover:text-primary"
                                onClick={() => {
                                  setSelectedItem(
                                    `Check status for ${baseline.specification_name}`,
                                  );
                                  setSelectedContent(
                                    baseline.specification_type ===
                                      "Specification"
                                      ? baseline.specification_raw_content || ""
                                      : baseline.specification_content,
                                  );
                                  setSelectedSpecId(baseline.specification_id);
                                  setSelectedRevisionId(
                                    baseline.latest_specification_revision_id,
                                  );
                                  setActivePanel("test-cases");
                                  setIsPanelHidden(false);
                                }}
                              />
                            )}
                          </div>
                        </TableCell>
                        {projectMilestones.map((m) => {
                          if (
                            typeof baseline.milestones === "object" &&
                            baseline.milestones !== null
                          ) {
                            const milestoneData = (
                              baseline.milestones as Record<
                                string,
                                MilestoneData
                              >
                            )[m.name];
                            return (
                              <TableCell key={m.id}>
                                <div className="flex gap-1">
                                  {editingRowId ===
                                  baseline.project_specification_id ? (
                                    <Select
                                      value={
                                        editFormData[m.name]?.version ||
                                        "unassigned"
                                      }
                                      onValueChange={(val) =>
                                        setEditFormData({
                                          ...editFormData,
                                          [m.name]: {
                                            ...(editFormData[m.name] || {}),
                                            version:
                                              val === "unassigned" ? "" : val,
                                          },
                                        })
                                      }
                                    >
                                      <SelectTrigger
                                        id={`edit-milestone-version-${baseline.project_specification_id}-${m.id}`}
                                        className="w-[120px] h-8 text-xs"
                                      >
                                        <SelectValue placeholder="-" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="unassigned">
                                          -
                                        </SelectItem>
                                        {versions.map((v) => (
                                          <SelectItem key={v} value={v}>
                                            {v}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    milestoneData?.version || "-"
                                  )}
                                  {editingRowId !==
                                    baseline.project_specification_id && (
                                    <div className="flex flex-row items-center">
                                      {(baseline.specification_type ===
                                        "Specification" ||
                                        baseline.specification_type ===
                                          "Sub Specification") && (
                                        <FontAwesomeIcon
                                          id={`view-milestone-content-icon-${baseline.project_specification_id}-${m.id}`}
                                          icon={faEye}
                                          style={{ width: "20px" }}
                                          className="cursor-pointer hover:text-primary"
                                          onClick={() => {
                                            setSelectedItem(
                                              `Viewing ${m.name} - ${baseline.specification_name}`,
                                            );
                                            setSelectedContent(
                                              milestoneData?.specification_revision_content ||
                                                "",
                                            );
                                            setActivePanel("content");
                                            setIsPanelHidden(false);
                                          }}
                                        />
                                      )}

                                      {baseline.specification_type ===
                                        "Specification" && (
                                        <FontAwesomeIcon
                                          id={`view-milestone-diagram-icon-${baseline.project_specification_id}-${m.id}`}
                                          icon={faDiagramProject}
                                          style={{ width: "20px" }}
                                          className="cursor-pointer hover:text-primary"
                                          onClick={() => {
                                            setSelectedItem(
                                              `Diagram for ${m.name}`,
                                            );
                                            setInterfaceContent(
                                              milestoneData?.specification_revision_interface ||
                                                "",
                                            );
                                            setSelectedSpecId(
                                              baseline.specification_id,
                                            );
                                            setActivePanel("diagram");
                                            setIsPanelHidden(false);
                                          }}
                                        />
                                      )}

                                      {(baseline.specification_type ===
                                        "Specification" ||
                                        baseline.specification_type ===
                                          "Sub Specification") && (
                                        <FontAwesomeIcon
                                          id={`check-milestone-status-icon-${baseline.project_specification_id}-${m.id}`}
                                          icon={faCheck}
                                          style={{ width: "20px" }}
                                          className="cursor-pointer hover:text-primary"
                                          onClick={() => {
                                            setSelectedItem(
                                              `Check status for ${baseline.specification_name} (${m.name})`,
                                            );
                                            setSelectedContent(
                                              milestoneData?.specification_revision_content ||
                                                "",
                                            );
                                            setSelectedSpecId(
                                              baseline.specification_id,
                                            );
                                            setSelectedRevisionId(
                                              milestoneData?.specification_revision_id,
                                            );
                                            setActivePanel("test-cases");
                                            setIsPanelHidden(false);
                                          }}
                                        />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            );
                          } else {
                            return <TableCell key={m.id}>-</TableCell>;
                          }
                        })}
                        <TableCell>
                          <div className="flex flex-row items-center gap-2">
                            <FontAwesomeIcon
                              onClick={() => handleAccept(baseline)}
                              icon={faCheck}
                              className="h-3.5 w-3.5"
                            />
                            <FontAwesomeIcon
                              onClick={() => handleReject(baseline)}
                              icon={faTimes}
                              className="h-3.5 w-3.5"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )
                )}
              </TableBody>
            </Table>
          </div>

          <div
            id="specification-milestones-pagination-wrapper"
            className="shrink-0"
          >
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
            {activePanel === "content" && (
              <ViewSpecificationContent
                title={selectedItem || ""}
                content={selectedContent}
                onClose={() => setActivePanel(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activePanel === "diagram" && (
              <ViewSpecificationDiagram
                title={selectedItem || ""}
                content={interfaceContent}
                projectId={Number(projectId)}
                specificationId={selectedSpecId}
                onClose={() => setActivePanel(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activePanel === "test-cases" && (
              <ViewSpecificationTestCases
                title={selectedItem || ""}
                projectId={Number(projectId)}
                specificationId={selectedSpecId}
                specificationRevisionId={selectedRevisionId}
                specificationContent={selectedContent}
                onClose={() => setActivePanel(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activePanel === "compare" && (
              <ViewCompareSpecification
                specificationId={selectedSpecId}
                specificationName={selectedItem || ""}
                onClose={() => setActivePanel(null)}
                onHide={() => setIsPanelHidden(true)}
              />
            )}

            {activePanel === "reject-comment" && rejectingBaseline && (
              <div className="flex flex-col flex-1 h-full min-h-0">
                <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
                  <div>
                    <h3
                      className="font-semibold text-base truncate max-w-[340px]"
                      title={`Reject Specification - ${rejectingBaseline.specification_name}`}
                    >
                      Reject Specification -{" "}
                      {rejectingBaseline.specification_name}
                    </h3>
                  </div>
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
                <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold">
                      Reason for Rejection / Comment
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Please enter the comment or justification for rejecting{" "}
                      <span className="font-medium text-foreground">
                        {rejectingBaseline.specification_name}
                      </span>
                      .
                    </p>
                  </div>
                  <textarea
                    value={rejectComment}
                    onChange={(e) => setRejectComment(e.target.value)}
                    placeholder="Enter rejection comment..."
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background p-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActivePanel(null);
                        setRejectingBaseline(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSubmitRejection}
                      disabled={!rejectComment.trim()}
                    >
                      Submit Rejection
                    </Button>
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
