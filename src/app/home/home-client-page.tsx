"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ProjectModel } from "@/src/types/project-model";
import { getProjects } from "@/src/services/project-service";
import { saveUserSetting, getUserSetting } from "@/src/services/user-service";
import { UserSettingModel } from "@/src/types/user-setting-model";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useRouter } from "next/navigation";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import {
  getExecutionSummary,
  getSpecificationImplementCount,
} from "@/src/services/traceability-service";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { auth } from "@/auth";

const categoryChartConfig = {
  count: { label: "Count" },
  implemented: {
    label: "Implemented",
    color: "#10b981",
  },
  unimplemented: {
    label: "Unimplemented",
    color: "#94a3b8",
  },
};

const PILLARS_SUMMARY = [
  { id: "P1", name: "1. Safety Governance", standard: "SMS / ISO 26262-2" },
  { id: "P2", name: "2. Architecture", standard: "SysML / Redundancy" },
  { id: "P3", name: "3. Functional Safety", standard: "ISO 26262 / ASIL" },
  { id: "P4", name: "4. SOTIF", standard: "ISO 21448 / Scenarios" },
  { id: "P5", name: "5. Cybersecurity", standard: "ISO/SAE 21434 / TARA" },
  { id: "P6", name: "6. V&V", standard: "MIL / SIL / HIL / Track" },
  { id: "P7", name: "7. Operations & ODD", standard: "UL 4600 / Telemetry" },
];

export type GsnItemType = "goal" | "strategy" | "evidence" | "context";

export interface GsnNode {
  id: string;
  pillarId: string; // "P1" - "P7" | "top"
  type: GsnItemType;
  title: string;
  description: string;
  parentId?: string;
}

const INITIAL_GSN_NODES: GsnNode[] = [
  // Top Level
  {
    id: "G0",
    pillarId: "top",
    type: "goal",
    title: "G0: Overall Safety Goal",
    description: "System is acceptably safe to operate in defined ODD",
  },
  {
    id: "C0",
    pillarId: "top",
    type: "context",
    title: "C0: Context",
    description: "Target ODD & Operational Concept",
    parentId: "G0",
  },
  {
    id: "S0",
    pillarId: "top",
    type: "strategy",
    title: "S0: Strategy",
    description: "Decomposition into 7 Safety Pillars",
    parentId: "G0",
  },
  // Pillar 1: Safety Governance
  {
    id: "G1",
    pillarId: "P1",
    type: "goal",
    title: "G1: Safety Management",
    description: "Safety culture and processes comply with standards",
    parentId: "S0",
  },
  {
    id: "S1",
    pillarId: "P1",
    type: "strategy",
    title: "S1: Process Audit",
    description: "Audit organizational SMS and review gates",
    parentId: "G1",
  },
  {
    id: "G1_1",
    pillarId: "P1",
    type: "goal",
    title: "G1.1: Safety Culture",
    description: "Independent safety audit passed",
    parentId: "S1",
  },
  {
    id: "Sn1",
    pillarId: "P1",
    type: "evidence",
    title: "Sn1: SMS Audit Log",
    description: "Certified Assessment",
    parentId: "G1_1",
  },
  // Pillar 2: System Architecture
  {
    id: "G2",
    pillarId: "P2",
    type: "goal",
    title: "G2: Architecture",
    description: "Architecture satisfies safety and reliability targets",
    parentId: "S0",
  },
  {
    id: "S2",
    pillarId: "P2",
    type: "strategy",
    title: "S2: Decomposition",
    description: "Allocate safety mechanisms to subsystems",
    parentId: "G2",
  },
  {
    id: "G2_1",
    pillarId: "P2",
    type: "goal",
    title: "G2.1: Fault Isolation",
    description: "Redundant and fail-operational paths",
    parentId: "S2",
  },
  {
    id: "Sn2",
    pillarId: "P2",
    type: "evidence",
    title: "Sn2: Arch Specs",
    description: "SysML Models & Allocation Matrix",
    parentId: "G2_1",
  },
  // Pillar 3: Functional Safety
  {
    id: "G3",
    pillarId: "P3",
    type: "goal",
    title: "G3: Functional Safety",
    description: "Absence of unreasonable risk from E/E faults (ISO 26262)",
    parentId: "S0",
  },
  {
    id: "S3",
    pillarId: "P3",
    type: "strategy",
    title: "S3: Safety Lifecycle",
    description: "HARA and safety concept implementation",
    parentId: "G3",
  },
  {
    id: "G3_1",
    pillarId: "P3",
    type: "goal",
    title: "G3.1: ASIL Integrity",
    description: "Safety goals achieved with target metrics",
    parentId: "S3",
  },
  {
    id: "Sn3",
    pillarId: "P3",
    type: "evidence",
    title: "Sn3: Safety Dossier",
    description: "HARA & ASIL Verification",
    parentId: "G3_1",
  },
  // Pillar 4: SOTIF
  {
    id: "G4",
    pillarId: "P4",
    type: "goal",
    title: "G4: SOTIF Assurance",
    description: "Safe performance without operational insufficiencies (ISO 21448)",
    parentId: "S0",
  },
  {
    id: "S4",
    pillarId: "P4",
    type: "strategy",
    title: "S4: Scenario Analysis",
    description: "Trigger condition and edge case mitigation",
    parentId: "G4",
  },
  {
    id: "G4_1",
    pillarId: "P4",
    type: "goal",
    title: "G4.1: Perception Robustness",
    description: "Sensor limits validated across domains",
    parentId: "S4",
  },
  {
    id: "Sn4",
    pillarId: "P4",
    type: "evidence",
    title: "Sn4: SOTIF Records",
    description: "Trigger Analysis & Road Tests",
    parentId: "G4_1",
  },
  // Pillar 5: Cybersecurity
  {
    id: "G5",
    pillarId: "P5",
    type: "goal",
    title: "G5: Cybersecurity",
    description: "Vehicle assets resilient to cyber attacks (ISO/SAE 21434)",
    parentId: "S0",
  },
  {
    id: "S5",
    pillarId: "P5",
    type: "strategy",
    title: "S5: Threat Modeling",
    description: "TARA analysis and defensive cryptography",
    parentId: "G5",
  },
  {
    id: "G5_1",
    pillarId: "P5",
    type: "goal",
    title: "G5.1: Intrusion Defense",
    description: "Secure boot, encrypted bus and gateway filtering",
    parentId: "S5",
  },
  {
    id: "Sn5",
    pillarId: "P5",
    type: "evidence",
    title: "Sn5: TARA Evidence",
    description: "Penetration Testing Reports",
    parentId: "G5_1",
  },
  // Pillar 6: Verification & Validation
  {
    id: "G6",
    pillarId: "P6",
    type: "goal",
    title: "G6: Comprehensive V&V",
    description: "Multi-layer testing provides conclusive proof",
    parentId: "S0",
  },
  {
    id: "S6",
    pillarId: "P6",
    type: "strategy",
    title: "S6: Testing Pyramid",
    description: "Unit, SIL, HIL and closed-track testing",
    parentId: "G6",
  },
  {
    id: "G6_1",
    pillarId: "P6",
    type: "goal",
    title: "G6.1: Test Coverage",
    description: "Traceable requirements verified with passing suites",
    parentId: "S6",
  },
  {
    id: "Sn6",
    pillarId: "P6",
    type: "evidence",
    title: "Sn6: Test Suites",
    description: "CI/CD Logs & Test Reports",
    parentId: "G6_1",
  },
  // Pillar 7: Operations & ODD
  {
    id: "G7",
    pillarId: "P7",
    type: "goal",
    title: "G7: Operational Safety",
    description: "Continuous fleet monitoring and fail-safe fallback",
    parentId: "S0",
  },
  {
    id: "S7",
    pillarId: "P7",
    type: "strategy",
    title: "S7: Field Telemetry",
    description: "Safety Performance Indicators (SPI) tracking",
    parentId: "G7",
  },
  {
    id: "G7_1",
    pillarId: "P7",
    type: "goal",
    title: "G7.1: Safe Fallback",
    description: "Minimum risk maneuver (MRM) guaranteed on fault",
    parentId: "S7",
  },
  {
    id: "Sn7",
    pillarId: "P7",
    type: "evidence",
    title: "Sn7: Field Telemetry",
    description: "Incident Logs & Fleet Telemetry",
    parentId: "G7_1",
  },
];

interface GsnTreeNode extends GsnNode {
  children: GsnTreeNode[];
}

function buildGsnTree(nodes: GsnNode[]): GsnTreeNode[] {
  const nodeMap = new Map<string, GsnTreeNode>();
  nodes.forEach((n) => {
    nodeMap.set(n.id, { ...n, children: [] });
  });

  const roots: GsnTreeNode[] = [];
  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(node.parentId)) {
      nodeMap.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function GsnTreeItem({
  node,
  allExpanded,
}: {
  node: GsnTreeNode;
  allExpanded: boolean | null;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  useEffect(() => {
    if (allExpanded !== null) {
      setIsOpen(allExpanded);
    }

    // const session = await auth();

    // if (!session) {
    //   return <p>Access Denied. Please sign in.</p>;
    // }

    // // Use the accessToken to query your backend API or Microsoft Graph
    // const apiResponse = await fetch("https://api.yourdomain.com/data", {
    //   headers: {
    //     Authorization: `Bearer ${session.accessToken}`,
    //   },
    // });
  }, [allExpanded]);

  const typeBadge = useMemo(() => {
    switch (node.type) {
      case "goal":
        return (
          <span className="bg-sky-100 border border-sky-500 text-sky-800 dark:bg-sky-950 dark:border-sky-700 dark:text-sky-300 text-[10px] font-semibold px-2 py-0.5 rounded">
            Goal
          </span>
        );
      case "strategy":
        return (
          <span className="bg-amber-100 border border-amber-500 text-amber-800 dark:bg-amber-950 dark:border-amber-700 dark:text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded skew-x-[-8deg]">
            Strategy
          </span>
        );
      case "evidence":
        return (
          <span className="bg-emerald-100 border border-emerald-500 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Evidence
          </span>
        );
      case "context":
        return (
          <span className="bg-slate-100 border border-slate-500 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
            Context
          </span>
        );
    }
  }, [node.type]);

  const pillarName = useMemo(() => {
    if (node.pillarId === "top") return "Top Level";
    const found = PILLARS_SUMMARY.find((p) => p.id === node.pillarId);
    return found ? found.name : node.pillarId;
  }, [node.pillarId]);

  return (
    <div className="flex flex-col">
      <div className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground mt-0.5"
            aria-label={isOpen ? "Collapse node" : "Expand node"}
          >
            <FontAwesomeIcon
              icon={isOpen ? faChevronDown : faChevronRight}
              className="w-3.5 h-3.5"
            />
          </button>
        ) : (
          <span className="w-5 h-5 inline-block" />
        )}

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {typeBadge}
          <span className="font-semibold text-xs tracking-tight text-foreground">
            {node.title}
          </span>
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
            {pillarName}
          </span>
          {node.description && (
            <p className="w-full text-xs text-muted-foreground pl-1 mt-0.5">
              {node.description}
            </p>
          )}
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-5 pl-3 border-l-2 border-muted-foreground/20 space-y-1 mt-1">
          {node.children.map((child) => (
            <GsnTreeItem
              key={child.id}
              node={child}
              allExpanded={allExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function sanitizeMermaidText(str: string): string {
  return str.replace(/["\\]/g, "'").replace(/[<>]/g, "");
}

function formatMermaidNode(node: GsnNode): string {
  const title = sanitizeMermaidText(node.title);
  const desc = sanitizeMermaidText(node.description);
  const text = desc ? `<b>${title}</b><br/>${desc}` : `<b>${title}</b>`;

  switch (node.type) {
    case "goal":
      return `${node.id}["${text}"]:::goal`;
    case "strategy":
      return `${node.id}[/"${text}"\\]:::strategy`;
    case "evidence":
      return `${node.id}(("${text}")):::evidence`;
    case "context":
      return `${node.id}(["${text}"]):::context`;
    default:
      return `${node.id}["${text}"]:::goal`;
  }
}

function buildMermaidChart(nodes: GsnNode[]): string {
  let chart = `flowchart TD\n`;
  chart += `  classDef goal fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a;\n`;
  chart += `  classDef strategy fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#78350f;\n`;
  chart += `  classDef evidence fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d;\n`;
  chart += `  classDef context fill:#f1f5f9,stroke:#64748b,stroke-width:1.5px,color:#334155;\n\n`;

  const topNodes = nodes.filter((n) => n.pillarId === "top");
  topNodes.forEach((node) => {
    chart += `  ${formatMermaidNode(node)}\n`;
  });

  PILLARS_SUMMARY.forEach((pillar) => {
    const pillarNodes = nodes.filter((n) => n.pillarId === pillar.id);
    chart += `\n  subgraph ${pillar.id} ["${pillar.name}"]\n    direction TB\n`;
    pillarNodes.forEach((node) => {
      chart += `    ${formatMermaidNode(node)}\n`;
    });
    chart += `  end\n`;
  });

  chart += `\n`;

  nodes.forEach((node) => {
    if (node.parentId) {
      if (node.type === "context") {
        chart += `  ${node.parentId} --- ${node.id}\n`;
      } else {
        chart += `  ${node.parentId} --> ${node.id}\n`;
      }
    }
  });

  return chart;
}

const tableData = [
  {
    specId: "SPEC-001",
    specName: "Login Feature",
    specStatus: "Approved",
    codeStatus: "Completed",
    testStatus: "Pass",
    testCases: 24,
    progress: 100,
  },
  {
    specId: "SPEC-002",
    specName: "Dashboard",
    specStatus: "Review",
    codeStatus: "In Progress",
    testStatus: "Untested",
    testCases: 12,
    progress: 45,
  },
  {
    specId: "SPEC-003",
    specName: "User Profile",
    specStatus: "Draft",
    codeStatus: "Not Started",
    testStatus: "Untested",
    testCases: 0,
    progress: 0,
  },
  {
    specId: "SPEC-004",
    specName: "Settings",
    specStatus: "Approved",
    codeStatus: "Completed",
    testStatus: "Fail",
    testCases: 8,
    progress: 100,
  },
  {
    specId: "SPEC-005",
    specName: "Notifications",
    specStatus: "Review",
    codeStatus: "In Progress",
    testStatus: "Untested",
    testCases: 5,
    progress: 10,
  },
];

const testExecutionData = [
  {
    specName: "Login Feature",
    testCases: "TC-001, TC-002, TC-003",
    total: 3,
    passed: 2,
    failed: 1,
  },
  {
    specName: "Dashboard",
    testCases: "TC-004, TC-005",
    total: 2,
    passed: 2,
    failed: 0,
  },
  {
    specName: "User Profile",
    testCases: "TC-006",
    total: 1,
    passed: 0,
    failed: 1,
  },
  {
    specName: "Settings",
    testCases: "TC-007, TC-008, TC-009, TC-010",
    total: 4,
    passed: 4,
    failed: 0,
  },
];

export default function HomeClientPage() {
  const { projectId } = useUserSettingContext();
  const [implementCountData, setImplementCountData] = useState<any>(null);
  const [testSummaryData, setTestSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettingModel>();
  const [zoom, setZoom] = useState<number>(1);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gsnNodes, setGsnNodes] = useState<GsnNode[]>(INITIAL_GSN_NODES);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<GsnItemType>("goal");
  const [newItemPillar, setNewItemPillar] = useState<string>("P1");
  const [newItemParent, setNewItemParent] = useState<string>("G1");
  const [newItemId, setNewItemId] = useState<string>("");
  const [newItemTitle, setNewItemTitle] = useState<string>("");
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [formError, setFormError] = useState<string>("");
  const [viewMode, setViewMode] = useState<"gsn" | "tree">("gsn");
  const [allExpanded, setAllExpanded] = useState<boolean | null>(null);

  const chartDefinition = useMemo(() => buildMermaidChart(gsnNodes), [gsnNodes]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    });

    let isMounted = true;
    const renderDiagram = async () => {
      if (!chartRef.current) return;
      try {
        chartRef.current.innerHTML = "";
        const id = `mermaid-gsn-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, chartDefinition);
        if (chartRef.current && isMounted) {
          chartRef.current.innerHTML = svg;
        }
      } catch (error) {
        console.error("Mermaid GSN rendering error:", error);
      }
    };

    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [chartDefinition]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prev) => Math.max(0.3, Math.min(prev + (e.deltaY > 0 ? -0.1 : 0.1), 3)));
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  useEffect(() => {
    async function fetchTraceabilityData() {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const [resImplement, resTest] = await Promise.all([
          getSpecificationImplementCount(projectId),
          getExecutionSummary(),
        ]);

        const rawImplement = resImplement?.results;
        if (rawImplement) {
          try {
            setImplementCountData(
              typeof rawImplement === "string"
                ? JSON.parse(rawImplement)
                : rawImplement,
            );
          } catch {
            setImplementCountData(rawImplement);
          }
        }

        const rawTest = resTest?.results;
        if (rawTest) {
          try {
            setTestSummaryData(
              typeof rawTest === "string" ? JSON.parse(rawTest) : rawTest,
            );
          } catch {}
        }
      } catch (error) {
        console.error("Failed to fetch traceability data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTraceabilityData();
  }, [projectId]);

  const categoryCharts = useMemo(() => {
    if (!implementCountData) return [];

    if (
      Array.isArray(implementCountData) &&
      implementCountData.length > 0 &&
      Array.isArray(implementCountData[0])
    ) {
      return implementCountData.map((item: any, index: number) => {
        const id = item[0] ?? index;
        const name = String(item[1] ?? `Category ${index + 1}`);
        const implemented = Number(item[2]) || 0;
        const total = Number(item[3]) || 0;
        const unimplemented = Math.max(0, total - implemented);
        const percentage =
          total > 0 ? Math.round((implemented / total) * 100) : 0;

        return {
          id,
          name,
          implemented,
          total,
          unimplemented,
          percentage,
          data: [
            {
              status: "implemented",
              count: implemented,
              fill: "#10b981",
            },
            {
              status: "unimplemented",
              count: unimplemented,
              fill: "#94a3b8",
            },
          ],
        };
      });
    }

    return [];
  }, [implementCountData]);

  const treeNodes = useMemo(() => buildGsnTree(gsnNodes), [gsnNodes]);

  useEffect(() => {
    getProjects()
      .then((response) => {
        setProjects(response.projects || []);
      })
      .catch((error) => {
        console.error("Failed to fetch projects:", error);
      });

    getUserSetting()
      .then((response) => {
        setUserSettings(response.userSettings);
      })
      .catch((error) => {
        console.error("Failed to fetch user settings:", error);
      });
  }, []);

  const eligibleParents = useMemo(() => {
    if (newItemPillar === "top") {
      return gsnNodes.filter((n) => n.pillarId === "top");
    }
    return gsnNodes.filter((n) => n.pillarId === newItemPillar || n.id === "S0");
  }, [gsnNodes, newItemPillar]);

  useEffect(() => {
    if (eligibleParents.length > 0 && !eligibleParents.some((p) => p.id === newItemParent)) {
      setNewItemParent(eligibleParents[0].id);
    }
  }, [eligibleParents, newItemParent]);

  const handleAddItem = () => {
    const trimmedId = newItemId.trim();
    const trimmedTitle = newItemTitle.trim();
    const trimmedDesc = newItemDescription.trim();

    if (!trimmedId) {
      setFormError("Item ID is required (e.g. G1_2, Sn1_2).");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedId)) {
      setFormError("Item ID can only contain letters, numbers, and underscores.");
      return;
    }
    if (gsnNodes.some((n) => n.id.toLowerCase() === trimmedId.toLowerCase())) {
      setFormError(`An item with ID '${trimmedId}' already exists in the diagram.`);
      return;
    }
    if (!trimmedTitle) {
      setFormError("Title is required.");
      return;
    }

    const newNode: GsnNode = {
      id: trimmedId,
      pillarId: newItemPillar,
      type: newItemType,
      title: trimmedTitle,
      description: trimmedDesc,
      parentId: newItemParent,
    };

    setGsnNodes((prev) => [...prev, newNode]);
    setNewItemId("");
    setNewItemTitle("");
    setNewItemDescription("");
    setFormError("");
    setIsAddFormOpen(false);
  };

  return (
    <div className="p-8 flex flex-col gap-6 w-full h-full">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryCharts.map((item) => (
          <Card key={item.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base truncate" title={item.name}>
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
              <ChartContainer
                config={categoryChartConfig}
                className="min-h-[190px] w-full max-w-[190px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={item.data}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={75}
                    strokeWidth={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {`${item.percentage}%`}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 18}
                                className="fill-muted-foreground text-[10px]"
                              >
                                Implemented
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:flex-initial flex flex-col items-center justify-center p-2.5 bg-muted rounded-lg min-w-24">
                  <span className="text-lg font-bold">{item.total}</span>
                  <span className="text-[10px] text-muted-foreground text-center">
                    Total Specs
                  </span>
                </div>
                <div className="flex-1 sm:flex-initial flex flex-col items-center justify-center p-2.5 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg min-w-24">
                  <span className="text-lg font-bold text-emerald-600">
                    {item.implemented}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium text-center">
                    Implemented
                  </span>
                </div>
                <div className="flex-1 sm:flex-initial flex flex-col items-center justify-center p-2.5 bg-slate-100 dark:bg-slate-800/40 rounded-lg min-w-24">
                  <span className="text-lg font-bold text-slate-600 dark:text-slate-400">
                    {item.unimplemented}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium text-center">
                    Unimplemented
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GSN Safety Case Diagram - 7 Pillars */}
      <Card className="flex flex-col">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3">
          <div>
            <CardTitle className="text-xl">
              Safety Case Assurance — {viewMode === "gsn" ? "GSN Diagram (7 Pillars)" : "Tree View"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Goal Structuring Notation representing the system safety argument decomposed across the 7 safety pillars.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-md border bg-muted p-0.5 mr-1">
              <button
                type="button"
                onClick={() => setViewMode("gsn")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "gsn"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                GSN View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tree")}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  viewMode === "tree"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Tree View
              </button>
            </div>
            {viewMode === "tree" && (
              <>
                <Button size="sm" variant="outline" onClick={() => setAllExpanded(true)}>
                  Expand All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAllExpanded(false)}>
                  Collapse All
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant={isAddFormOpen ? "secondary" : "default"}
              onClick={() => setIsAddFormOpen((prev) => !prev)}
            >
              {isAddFormOpen ? "Close Form" : "+ Add Item"}
            </Button>
            {gsnNodes.length !== INITIAL_GSN_NODES.length && (
              <Button size="sm" variant="ghost" onClick={() => setGsnNodes(INITIAL_GSN_NODES)}>
                Reset Diagram
              </Button>
            )}
            {viewMode === "gsn" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.4))}
                >
                  Zoom Out
                </Button>
                <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
                  Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
                >
                  Zoom In
                </Button>
                <span className="text-xs text-muted-foreground ml-1">
                  {Math.round(zoom * 100)}%
                </span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {/* Add Item Form Drawer/Card */}
          {isAddFormOpen && (
            <div className="p-4 border rounded-lg bg-muted/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Add New GSN Item</h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-medium">Shape Preview:</span>
                  {newItemType === "goal" && (
                    <span className="bg-sky-100 border border-sky-600 text-sky-900 rounded px-2 py-0.5 font-semibold">
                      Rectangle (Goal)
                    </span>
                  )}
                  {newItemType === "strategy" && (
                    <span className="bg-amber-100 border border-amber-600 text-amber-900 rounded px-2 py-0.5 skew-x-[-12deg] font-semibold">
                      Parallelogram (Strategy)
                    </span>
                  )}
                  {newItemType === "evidence" && (
                    <span className="bg-emerald-100 border border-emerald-600 text-emerald-900 rounded-full px-2.5 py-0.5 font-semibold">
                      Circle (Evidence)
                    </span>
                  )}
                  {newItemType === "context" && (
                    <span className="bg-slate-100 border border-slate-600 text-slate-900 rounded-full px-2 py-0.5 font-semibold">
                      Stadium / Capsule (Context)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Item Type (Categorizes Shape)
                  </label>
                  <Select
                    value={newItemType}
                    onValueChange={(val) => setNewItemType(val as GsnItemType)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goal">Goal (Rectangle)</SelectItem>
                      <SelectItem value="strategy">Strategy (Parallelogram)</SelectItem>
                      <SelectItem value="evidence">Evidence / Solution (Circle)</SelectItem>
                      <SelectItem value="context">Context (Stadium)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Target Pillar
                  </label>
                  <Select value={newItemPillar} onValueChange={setNewItemPillar}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Top Level (Under G0/S0)</SelectItem>
                      {PILLARS_SUMMARY.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Parent Node
                  </label>
                  <Select value={newItemParent} onValueChange={setNewItemParent}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eligibleParents.map((node) => (
                        <SelectItem key={node.id} value={node.id}>
                          {node.id}: {node.title.slice(0, 30)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Node ID (Unique)
                  </label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. G1_2, Sn1_2"
                    value={newItemId}
                    onChange={(e) => setNewItemId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Title / Statement
                  </label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. G1.2: Independent Safety Culture Audit"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-medium text-muted-foreground block mb-1">
                    Description / Target Metric
                  </label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="e.g. Annual audit passed with 0 major non-conformances"
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-destructive font-medium">{formError}</p>}

              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setIsAddFormOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddItem}>
                  Add to Diagram
                </Button>
              </div>
            </div>
          )}

          {/* GSN Legend and Pillar Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs p-3 bg-muted/40 rounded-lg border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-muted-foreground mr-1">Pillars:</span>
              {PILLARS_SUMMARY.map((p) => (
                <span
                  key={p.id}
                  className="bg-background border rounded px-2 py-0.5 text-[11px] font-medium"
                  title={p.standard}
                >
                  {p.name}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-muted-foreground">Legend:</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-200 border border-sky-600 inline-block" />
                Goal
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 skew-x-[-12deg] bg-amber-200 border border-amber-600 inline-block" />
                Strategy
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-200 border border-emerald-600 inline-block" />
                Evidence
              </span>
            </div>
          </div>

          {/* Mermaid Chart Viewport */}
          <div
            ref={containerRef}
            className={`overflow-auto w-full h-[520px] border rounded-lg bg-background p-6 flex justify-center items-start ${
              viewMode === "gsn" ? "flex" : "hidden"
            }`}
          >
            <div
              ref={chartRef}
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.15s ease-out" }}
            />
          </div>

          {/* Tree View Viewport */}
          <div
            className={`w-full border rounded-lg bg-background p-4 overflow-auto max-h-[580px] ${
              viewMode === "tree" ? "block" : "hidden"
            }`}
          >
            <div className="space-y-1">
              {treeNodes.map((rootNode) => (
                <GsnTreeItem key={rootNode.id} node={rootNode} allExpanded={allExpanded} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
