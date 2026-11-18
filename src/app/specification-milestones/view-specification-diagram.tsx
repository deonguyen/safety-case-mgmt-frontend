import { Button } from "@/src/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState, useRef } from "react";
import mermaid from "mermaid";
import { convertMarkdownToHtml, generateDiagram } from "@/src/services/generative-ai-service";

interface ViewSpecificationDiagramProps {
  title: string;
  content: string;
  projectId: number;
  specificationId: number;
  onClose?: () => void;
  onHide?: () => void;
}

export function MermaidViewer({ specInterface, projectId, specificationId}: { specInterface: string, projectId: number, specificationId: number}) {
  const [chart, setChart] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Check for HTML: Look for matching opening/closing tags
    const htmlRegex = /<([a-z][a-z0-9]*)\b[^>]*>.*?<\/\1>/i;

    const isHtml = htmlRegex.test(specInterface);
    if(isHtml){
      setProcessedContent(specInterface);
    }
    else
      convertMarkdownToHtml(specInterface).then(setProcessedContent);
  }, [specInterface]);

  let input_data = "";
  let output_data = "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(processedContent, "text/html");
  const headers = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

  const inHeader = Array.from(headers).find(
    (h) => h.textContent?.trim().toUpperCase() === "IN",
  );
  if (inHeader) {
    let next = inHeader.nextElementSibling;
    while (
      next &&
      !["H1", "H2", "H3", "H4", "H5", "H6"].includes(next.tagName)
    ) {
      input_data += next.outerHTML;
      next = next.nextElementSibling;
    }
  }
  const outHeader = Array.from(headers).find(
    (h) => h.textContent?.trim().toUpperCase() === "OUT",
  );
  if (outHeader) {
    let next = outHeader.nextElementSibling;
    while (
      next &&
      !["H1", "H2", "H3", "H4", "H5", "H6"].includes(next.tagName)
    ) {
      output_data += next.outerHTML;
      next = next.nextElementSibling;
    }
  }

  useEffect(() => {
    let isMounted = true;
    const generate = async () => {
      try {
        setIsLoading(true);
        const response = await generateDiagram(
          projectId, 
          specificationId,
          input_data || " ",
          output_data || " ",
        );
        let diagramText =
          response?.data?.diagram ||
          response?.data?.response ||
          response?.data?.text ||
          response?.data?.generated_diagram ||
          "";
        diagramText = diagramText
          .replace(/```mermaid/gi, "")
          .replace(/```/g, "")
          .trim();
        if (isMounted) setChart(diagramText);
      } catch (error) {
        console.error("Error generating diagram:", error);
        if (isMounted) setChart("graph TD\n Error-->Generation_Failed");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (input_data || output_data) {
      generate();
    }
    return () => {
      isMounted = false;
    };
  }, [input_data, output_data]);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    const renderDiagram = async () => {
      if (chart && chartRef.current) {
        try {
          chartRef.current.innerHTML = "";
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const { svg } = await mermaid.render(id, chart);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error("Mermaid syntax error:", error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `<div class="p-4 text-red-500 font-bold">Syntax Error in Diagram Generation</div><pre class="text-xs bg-muted p-4 rounded overflow-auto text-left whitespace-pre-wrap">${chart.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
          }
        }
      }
    };

    renderDiagram();
  }, [chart]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Generating Diagram...</p>;
  }

  return chart ? (
    <div className="flex flex-col w-full gap-2">
      <div className="flex flex-row items-center gap-2">
        <Button
          size="sm"
          onClick={() => setZoom((prev) => Math.max(prev - 0.2, 0.4))}
        >
          Zoom Out
        </Button>
        <Button size="sm" onClick={() => setZoom(1)}>
          Reset
        </Button>
        <Button
          size="sm"
          onClick={() => setZoom((prev) => Math.min(prev + 0.2, 3))}
        >
          Zoom In
        </Button>
        <p className="text-xs">{Math.round(zoom * 100)}%</p>
      </div>
      <div className="overflow-auto w-full border border-gray-200 p-4">
        <div
          ref={chartRef}
          style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
        ></div>
      </div>
    </div>
  ) : null;
}

export default function ViewSpecificationDiagram({
  title,
  content,
  projectId,
  specificationId,
  onClose,
  onHide,
}: ViewSpecificationDiagramProps) {
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
      <div className="flex-1 overflow-y-auto p-4 flex justify-center items-center bg-muted/20">
        <MermaidViewer specInterface={content} projectId={projectId} specificationId={specificationId} />
      </div>
    </div>
  );
}