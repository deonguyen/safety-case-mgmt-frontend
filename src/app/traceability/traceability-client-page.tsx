"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  getExecutionSummary,
  getSpecificationImplementCount,
} from "@/src/services/traceability-service";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { Pie, PieChart, Label } from "recharts";

export default function TraceabilityClientPage() {
  const { projectId } = useUserSettingContext();
  const [implementCountData, setImplementCountData] = useState<any>(null);
  const [testSummaryData, setTestSummaryData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const { pieChartData, pieChartConfig, stats } = useMemo(() => {
    let implemented = 0;
    let total = 0;

    if (implementCountData) {
      if (Array.isArray(implementCountData)) {
        if (
          implementCountData.length > 0 &&
          Array.isArray(implementCountData[0])
        ) {
          implementCountData.forEach((item: any) => {
            implemented += Number(item[2]) || 0;
            total += Number(item[3]) || 0;
          });
        } else {
          implemented = Number(implementCountData[0]) || 0;
          total = Number(implementCountData[1]) || 0;
        }
      } else {
        implemented =
          Number(
            implementCountData.implemented_specs ??
              implementCountData.implemented ??
              0,
          ) || 0;
        total =
          Number(
            implementCountData.total_specs ??
              implementCountData.total ??
              0,
          ) || 0;
      }
    }

    const unimplemented = Math.max(0, total - implemented);
    const percentage = total > 0 ? Math.round((implemented / total) * 100) : 0;

    const pieChartData = [
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
    ];

    const pieChartConfig = {
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

    const stats = {
      total,
      implemented,
      unimplemented,
      percentage,
    };

    return { pieChartData, pieChartConfig, stats };
  }, [implementCountData]);

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

  const { testPieChartData, testPieChartConfig, testStats } = useMemo(() => {
    if (!testSummaryData) {
      return {
        testPieChartData: [],
        testPieChartConfig: { count: { label: "Count" } },
        testStats: { total: 0, passed: 0, failed: 0, passRate: 0 },
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
    let total = 0;
    let passed = 0;
    let failed = 0;

    if (Array.isArray(testSummaryData)) {
      data = testSummaryData.map((item: any) => ({
        status: item.status,
        count: Number(item.count) || 0,
        fill: colors[item.status?.toLowerCase()] || "#94a3b8",
      }));
      data.forEach((item: any) => {
        const status = item.status?.toLowerCase();
        if (status === "passed") passed = item.count;
        if (status === "failed") failed = item.count;
        total += item.count || 0;
      });
    } else {
      total = Number(testSummaryData.total_cases) || 0;
      passed = Number(testSummaryData.passed_cases) || 0;
      failed = Number(testSummaryData.failed_cases) || 0;

      if (testSummaryData.passed_cases !== undefined) {
        data.push({ status: "passed", count: passed, fill: colors.passed });
      }
      if (testSummaryData.failed_cases !== undefined) {
        data.push({ status: "failed", count: failed, fill: colors.failed });
      }
      ["untested", "skipped", "blocked"].forEach((status) => {
        const key = `${status}_cases`;
        if (testSummaryData[key] !== undefined) {
          data.push({
            status,
            count: Number(testSummaryData[key]) || 0,
            fill: colors[status],
          });
        }
      });
    }

    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    const config = {
      count: { label: "Count" },
      ...Object.fromEntries(
        data.map((item: any) => [
          item.status,
          {
            label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
            color: colors[item.status?.toLowerCase()] || "#94a3b8",
          },
        ]),
      ),
    };

    return {
      testPieChartData: data,
      testPieChartConfig: config,
      testStats: { total, passed, failed, passRate },
    };
  }, [testSummaryData]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Traceability Matrix</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Implementation vs Specification</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ChartContainer
              config={pieChartConfig}
              className="min-h-[260px] w-full max-w-xs"
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
                  innerRadius={65}
                  outerRadius={95}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {`${stats.percentage}%`}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg min-w-32">
                <span className="text-3xl font-bold">{stats.total}</span>
                <span className="text-xs text-muted-foreground text-center">
                  Total Specifications
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-emerald-600">
                  {stats.implemented}
                </span>
                <span className="text-xs text-emerald-600 font-medium text-center">
                  Implemented
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-800/40 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-slate-600 dark:text-slate-400">
                  {stats.unimplemented}
                </span>
                <span className="text-xs text-muted-foreground font-medium text-center">
                  Unimplemented
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Execution Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
            <ChartContainer
              config={testPieChartConfig}
              className="min-h-[260px] w-full max-w-xs"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={testPieChartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={65}
                  outerRadius={95}
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
                              className="fill-foreground text-3xl font-bold"
                            >
                              {`${testStats.passRate}%`}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className="fill-muted-foreground text-xs"
                            >
                              Pass Rate
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-col gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-muted rounded-lg min-w-32">
                <span className="text-3xl font-bold">{testStats.total}</span>
                <span className="text-xs text-muted-foreground text-center">
                  Total Cases
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-emerald-600">
                  {testStats.passed}
                </span>
                <span className="text-xs text-emerald-600 font-medium text-center">
                  Passed Cases
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-destructive/10 rounded-lg min-w-32">
                <span className="text-3xl font-bold text-destructive">
                  {testStats.failed}
                </span>
                <span className="text-xs text-destructive font-medium text-center">
                  Failed Cases
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {categoryCharts.length > 0 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Category Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Code implementation progress by category
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoryCharts.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base truncate" title={item.name}>
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
                  <ChartContainer
                    config={pieChartConfig}
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
        </div>
      )}
    </div>
  );
}
