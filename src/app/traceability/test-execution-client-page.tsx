"use client";

import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { getSpecificationTestSuitesBySql } from "@/src/services/specification-test-suite-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/components/ui/chart";
import { Pie, PieChart, Label } from "recharts";

// import { ProjectSpecificationModel } from "@/src/types/project-specification-model";
import { SpecificationTestCaseModel } from "@/src/types/specification-test-case-model";
import { SpecificationTestSuiteModel } from "@/src/types/specification-test-suite-model";
import { SpecificationTestSuiteResultSetModel } from "@/src/types/specification-test-suite-result-set-model";
import { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { PaginationControl } from "@/src/app/controls/pagination-control";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { getExecutionSummary } from "@/src/services/traceability-service";

export default function TestExecutionClientPage() {
  const { userSetting, projectId } = useUserSettingContext();
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = userSetting?.page_size || 25;
  const [totalPages, setTotalPages] = useState(0);

  const [testSuites, setTestSuites] = useState<SpecificationTestSuiteModel[]>(
    [],
  );
  const [testCases, setTestCases] = useState<SpecificationTestCaseModel[]>([]);
  const [
    specificationTestSuiteResultSets,
    setSpecificationTestSuiteResultSets,
  ] = useState<SpecificationTestSuiteResultSetModel[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [testSummaryData, setTestSummaryData] = useState<any>(null);

  const { pieChartData, pieChartConfig, summaryStats } = useMemo(() => {
    if (!testSummaryData) {
      return {
        pieChartData: [],
        pieChartConfig: {},
        summaryStats: { total: 0, passed: 0, failed: 0 },
      };
    }

    const colors: { [key: string]: string } = {
      passed: "#22c55e",
      failed: "#ef4444",
      untested: "#f97316",
      skipped: "#6b7280",
      blocked: "#eab308",
      "in progress": "#3b82f6",
    };

    let data: any[] = [];
    let summaryStats = { total: 0, passed: 0, failed: 0 };

    if (Array.isArray(testSummaryData)) {
      data = testSummaryData.map((item: any) => ({
        ...item,
        status: item.status,
        count: item.count,
        fill: colors[item.status?.toLowerCase()] || "#ccc",
      }));
      let passed = 0;
      let failed = 0;
      let total = 0;
      data.forEach((item: any) => {
        if (item.status?.toLowerCase() === "passed") passed = item.count;
        if (item.status?.toLowerCase() === "failed") failed = item.count;
        total += item.count || 0;
      });
      summaryStats = { total, passed, failed };
    } else {
      summaryStats = {
        total: testSummaryData.total_cases || 0,
        passed: testSummaryData.passed_cases || 0,
        failed: testSummaryData.failed_cases || 0,
      };

      if (testSummaryData.passed_cases !== undefined) {
        data.push({
          status: "passed",
          count: testSummaryData.passed_cases,
          fill: colors.passed,
        });
      }
      if (testSummaryData.failed_cases !== undefined) {
        data.push({
          status: "failed",
          count: testSummaryData.failed_cases,
          fill: colors.failed,
        });
      }
      ["untested", "skipped", "blocked"].forEach((status) => {
        const key = `${status}_cases`;
        if (testSummaryData[key] !== undefined) {
          data.push({
            status,
            count: testSummaryData[key],
            fill: colors[status],
          });
        }
      });
    }

    const config = {
      count: { label: "Count" },
      ...Object.fromEntries(
        data.map((item: any) => [
          item.status,
          {
            label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            color: colors[item.status.toLowerCase()] || "#ccc",
          },
        ]),
      ),
    };

    return { pieChartData: data, pieChartConfig: config, summaryStats };
  }, [testSummaryData]);

  const handleCellClick = (title: string, content: string) => {
    if (!content) return;
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function fetchTableData() {
      if (!projectId) return;
      setIsLoading(true);
      try {
        const response = await getSpecificationTestSuitesBySql(
          Number(projectId),
          page,
          pageSize,
        );

        const data = response?.results;
        const count = response?.count;

        setSpecificationTestSuiteResultSets(data || []);
        setTotalPages(count ? Math.ceil(count / pageSize) : 0);
      } catch (error) {
        console.error("Failed to fetch test execution data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTableData();
  }, [projectId, page, pageSize]);

  useEffect(() => {
    async function fetchSummaryData() {
      if (!projectId) return;
      try {
        const testSummaries = await getExecutionSummary();
        const summaryRaw = testSummaries?.results;
        if (summaryRaw) {
          try {
            setTestSummaryData(
              typeof summaryRaw === "string"
                ? JSON.parse(summaryRaw)
                : summaryRaw,
            );
          } catch (e) {
            console.error("Failed to parse test summary data:", e);
          }
        }
      } catch (error) {
        console.error("Failed to fetch test summary data:", error);
      }
    }
    fetchSummaryData();
  }, [projectId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Test Execution</h1>

      {pieChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ChartContainer
              config={pieChartConfig}
              className="min-h-[300px] w-full max-w-sm"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={pieChartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                  }) => {
                    if (midAngle !== undefined) {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill="white"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                        >
                          {`${((percent || 0) * 100).toFixed(0)}%`}
                        </text>
                      );
                    }
                  }}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {summaryStats.total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-sm"
                            >
                              Total Cases
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-row md:flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg min-w-32">
                <span className="text-3xl font-bold">{summaryStats.total}</span>
                <span className="text-xs text-muted-foreground text-center">
                  Total Cases
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-emerald-600">
                  {summaryStats.passed}
                </span>
                <span className="text-xs text-emerald-600 font-medium text-center">
                  Passed Cases
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-destructive/10 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-destructive">
                  {summaryStats.failed}
                </span>
                <span className="text-xs text-destructive font-medium text-center">
                  Failed Cases
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              {/* <TableHead>Project Spec ID</TableHead> */}
              <TableHead>Specification Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Test Suite Name</TableHead>
              {/* <TableHead>Test Case Code</TableHead> */}
              <TableHead>Test Case Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Expected Result</TableHead>
              <TableHead>Actual Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : specificationTestSuiteResultSets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  No test execution results found.
                </TableCell>
              </TableRow>
            ) : (
              specificationTestSuiteResultSets.map(
                (result: any, index: number) => (
                  <TableRow key={result.id || index} className="hover:bg-muted">
                    {/* <TableCell>{result.project_specification_id}</TableCell> */}
                    <TableCell>{result.specification_name}</TableCell>
                    <TableCell>{result.category1}</TableCell>
                    <TableCell>{result.test_suite_name}</TableCell>
                    {/* <TableCell>{result.test_case_code}</TableCell> */}
                    <TableCell>{result.test_case_name}</TableCell>
                    <TableCell className="max-w-[250px]">
                      {result.test_case_description && (
                        <div
                          className="cursor-pointer truncate text-sm hover:underline"
                          onClick={() =>
                            handleCellClick(
                              "Description",
                              result.test_case_description,
                            )
                          }
                        >
                          {/* {result.test_case_description} */}
                          View Description
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {result.test_case_steps && (
                        <div
                          className="cursor-pointer truncate text-sm hover:underline"
                          onClick={() =>
                            handleCellClick("Steps", result.test_case_steps)
                          }
                        >
                          {/* {result.test_case_steps} */}
                          View Steps
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {result.expected_result && (
                        <div
                          className="cursor-pointer truncate text-sm hover:underline"
                          onClick={() =>
                            handleCellClick(
                              "Expected Result",
                              result.expected_result,
                            )
                          }
                        >
                          {/* {result.expected_result} */}
                          View Expected Result
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {result.actual_result && (
                        <div
                          className="cursor-pointer truncate text-sm hover:underline"
                          onClick={() =>
                            handleCellClick(
                              "Actual Result",
                              result.actual_result,
                            )
                          }
                        >
                          {/* {result.actual_result} */}
                          View Actual Result
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )
            )}
          </TableBody>
        </Table>
      </div>
      <PaginationControl
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={setPage}
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto rounded-md border bg-muted p-4 text-sm whitespace-pre-wrap break-words">
            {modalContent}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
