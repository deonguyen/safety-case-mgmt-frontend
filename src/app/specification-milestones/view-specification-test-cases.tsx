// ==========================================
// IMPORTS
// ==========================================
import { Button } from "@/src/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import ServiceProxy from "@/src/services/service-proxy";
import { useEffect, useState } from "react";

// ==========================================
// INTERFACES
// ==========================================
interface ViewSpecificationTestCasesProps {
  title: string;
  projectId: number;
  specificationId: number;
  specificationRevisionId: number;
  specificationContent: string;
  onClose?: () => void;
  onHide?: () => void;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function ViewSpecificationTestCases({
  title,
  projectId,
  specificationId,
  specificationRevisionId,
  specificationContent,
  onClose,
  onHide,
}: ViewSpecificationTestCasesProps) {
  // ==========================================
  // STATE
  // ==========================================
  const [testCases, setTestCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    const fetchTestCases = async () => {
      if (specificationContent) {
        setIsLoading(true);
        try {
          // 1. Fetch existing test suites for the given specification revision
          const testSuiteResponse: any =
            await ServiceProxy.getSpecificationTestSuites(
              projectId,
              specificationId,
              specificationRevisionId,
            );
          if (testSuiteResponse?.error) {
            console.error(testSuiteResponse.error);
            setTestCases([]);
            return;
          }
          let testSuiteData = testSuiteResponse?.data || testSuiteResponse;
          if (typeof testSuiteData === "string") {
            try {
              testSuiteData = JSON.parse(testSuiteData);
            } catch (e) {
              testSuiteData = [];
            }
          }

          if (testSuiteData && testSuiteData.length > 0 && testSuiteData[0].raw_content) {
            // 2a. If test suite exists, parse the raw_content
            try {
              let rawString = testSuiteData[0].raw_content;
              // rawString = rawString.replace(/```json/gi, "").replace(/```/g, "").trim();
              const parsed = JSON.parse(rawString);
              setTestCases(parsed.test_cases || []);
            } catch (e) {
              console.error("Failed to parse existing test suite content", e);
              setTestCases([]);
            }
          } else {
            // 2b. If no test suite exists, dynamically generate test cases
            try {
              const testCasesResponse: any =
                await ServiceProxy.generateTestCases(
                  projectId,
                  specificationId,
                  specificationRevisionId,
                  specificationContent,
                );
              if (testCasesResponse?.error) {
                console.error(testCasesResponse.error);
                setTestCases([]);
                return;
              }
              let data = testCasesResponse?.data || testCasesResponse;
              if (typeof data === "string") {
                try {
                  data = JSON.parse(data);
                } catch (e) {
                  data = [];
                }
              }
              setTestCases(data.test_cases);
            } catch (error) {
              console.error("Failed to generate test cases:", error);
              setTestCases([]);
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Failed to generate test cases:", error);
          setTestCases([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setTestCases([]);
      }
    };

    fetchTestCases();
  }, [
    projectId,
    specificationContent,
    specificationId,
    specificationRevisionId,
  ]);

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base truncate max-w-[340px]" title={title}>
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
          <Table>
            <TableHeader>
              <TableRow className="bg-muted">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Expected Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Generating test cases...
                  </TableCell>
                </TableRow>
              ) : testCases.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No test cases generated.
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((tc: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-muted">
                    <TableCell>{tc.code || ""}</TableCell>
                    <TableCell>{tc.name || ""}</TableCell>
                    <TableCell className="whitespace-pre-wrap">
                      {tc.description || ""}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap">
                      {tc.steps || ""}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap">
                      {tc.expected_result || ""}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
