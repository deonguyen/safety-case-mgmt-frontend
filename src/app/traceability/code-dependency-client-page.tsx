"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Button } from "@/src/components/ui/button";
import { getCodeDependencyTraces } from "@/src/services/traceability-service";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";

export default function CodeDependencyClientPage() {
  const { projectId } = useUserSettingContext();
  const [zoom, setZoom] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartData, setChartData] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      try {
        const res = await getCodeDependencyTraces();
        if (res.results) {
          const data = res.results;
          let chartStr = "";

          if (typeof data === "string") {
            chartStr = data;
          } else if (Array.isArray(data)) {
            const diagrams = (data as any[]).filter((item: { diagram?: string }) => item.diagram).map((item: { diagram?: string }) => item.diagram as string);
            if (diagrams.length > 0) {
              chartStr = diagrams[0];
            } else {
              let chart = "graph TD\n";
              let hasEdges = false;
              (data as any[]).forEach((item: { source?: string; caller?: string; name?: string; target?: string; callee?: string; dependency?: string }) => {
                const source = item.source || item.caller || item.name;
                const target = item.target || item.callee || item.dependency;
                if (source && target) {
                  const srcId = String(source).replace(/[^a-zA-Z0-9_]/g, "_");
                  const tgtId = String(target).replace(/[^a-zA-Z0-9_]/g, "_");
                  chart += `  ${srcId}["${source}"] --> ${tgtId}["${target}"]\n`;
                  hasEdges = true;
                }
              });
              chartStr = hasEdges ? chart : "graph TD\n  A[No Dependencies Found]";
            }
          } else if (typeof data === "object" && data !== null) {
            chartStr = (data as any).diagram || JSON.stringify(data);
          }

          chartStr = chartStr.replace(/```mermaid/gi, "").replace(/```/g, "").replace(/&gt;/g, ">").replace(/&lt;/g, "<").trim();
          setChartData(chartStr);
        } else if (res.error) { 
          console.error("Error fetching code dependency traces:", res.error);
          setChartData(`graph TD\nError[${res.error}]`);
        }
      } catch (error) {
        console.error("Unexpected error fetching code dependency traces:", error);
        setChartData(`graph TD\nError[Unexpected error occurred while fetching data]`);
      }
    };
    fetchData();  
  }, [projectId]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    const renderDiagram = async () => {
      if (chartData && chartRef.current) {
        try {
          chartRef.current.innerHTML = "";
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const { svg } = await mermaid.render(id, chartData);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid syntax error:", error);
          if (chartRef.current) {
            const safeChartData = typeof chartData === "string" 
              ? chartData.replace(/</g, "&lt;").replace(/>/g, "&gt;") 
              : JSON.stringify(chartData, null, 2);
            chartRef.current.innerHTML = `<div class="p-4 flex flex-col gap-2"><div class="text-red-500 font-bold">Syntax Error in Diagram Generation</div><pre class="text-xs bg-muted p-4 rounded overflow-auto text-left whitespace-pre-wrap border border-red-200">${safeChartData}</pre></div>`;
          }
        }
      }
    };

    renderDiagram();
  }, [chartData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        setZoom((prev) => Math.max(0.1, Math.min(prev + (e.deltaY > 0 ? -0.1 : 0.1), 100)));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <h1 className="text-2xl font-bold tracking-tight shrink-0">Code Dependency</h1>
      <div className="flex flex-col w-full gap-4 flex-1 overflow-hidden">
        <div className="flex flex-row items-center gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.4))}>
            Zoom Out
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(1)}>
            Reset
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom((prev) => Math.min(prev + 0.2, 100))}>
            Zoom In
          </Button>
          <p className="text-sm text-muted-foreground ml-2">{Math.round(zoom * 100)}%</p>
          <p className="text-xs text-muted-foreground ml-2">(Ctrl + Scroll to zoom)</p>
        </div>
        <div ref={containerRef} className="overflow-auto w-full h-full border rounded-md bg-muted/30 p-6 flex justify-center">
          <div ref={chartRef} style={{ transform: `scale(${zoom})`, transformOrigin: "top center", transition: "transform 0.2s ease-in-out" }}></div>
        </div>
      </div>
    </div>
  );
}