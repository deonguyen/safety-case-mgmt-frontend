"use client";

import { ProjectSpecificationModel } from "@/src/types/project-specification-model";
import { getProjectSpecifications } from "@/src/services/project-specification-service";
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
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import SpecificationCentralizeMilestoneBaseline from "./specification-centralize-milestone-baseline";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";

export default function SpecificationCentralizeClientPage() {
  const [projectSpecifications, setProjectSpecifications] = useState<
    ProjectSpecificationModel[]
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const { userSetting, projectId } = useUserSettingContext();
  const pageSize = userSetting?.page_size || 25;

  useEffect(() => {
    const fetchSpecifications = async () => {
      if (!projectId) return;

      setIsLoading(true);
      try {
        const response = await getProjectSpecifications(
          projectId,
          page,
          pageSize,
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

    fetchSpecifications();
  }, [page, pageSize, userSetting, projectId]);

  const rowSpans = useMemo(() => {
    const spans = {
      component: new Array(projectSpecifications.length).fill(1),
      function: new Array(projectSpecifications.length).fill(1),
      parent: new Array(projectSpecifications.length).fill(1),
    };

    for (let i = projectSpecifications.length - 2; i >= 0; i--) {
      const current = projectSpecifications[i];
      const next = projectSpecifications[i + 1];

      if (current.component_name === next.component_name) {
        spans.component[i] = spans.component[i + 1] + 1;
        spans.component[i + 1] = 0;

        if (current.function_name === next.function_name) {
          spans.function[i] = spans.function[i + 1] + 1;
          spans.function[i + 1] = 0;

          if (current.parent_name === next.parent_name) {
            spans.parent[i] = spans.parent[i + 1] + 1;
            spans.parent[i + 1] = 0;
          }
        }
      }
    }
    return spans;
  }, [projectSpecifications]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Specification Centralize
        </h1>
        <Dialog
          open={isMilestoneDialogOpen}
          onOpenChange={setIsMilestoneDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>Milestone Baseline</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Milestone Baseline</DialogTitle>
            </DialogHeader>
            <SpecificationCentralizeMilestoneBaseline
              onClose={() => setIsMilestoneDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>ID</TableHead>
              <TableHead>Component</TableHead>
              <TableHead>Function</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Specification Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : projectSpecifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No specifications found.
                </TableCell>
              </TableRow>
            ) : (
              projectSpecifications.map((spec, index) => (
                <TableRow key={spec.id || index} className="hover:bg-muted">
                  <TableCell>{spec.id}</TableCell>
                  {rowSpans.component[index] > 0 && (
                    <TableCell rowSpan={rowSpans.component[index]}>
                      {spec.component_name}
                    </TableCell>
                  )}
                  {rowSpans.function[index] > 0 && (
                    <TableCell rowSpan={rowSpans.function[index]}>
                      {spec.function_name}
                    </TableCell>
                  )}
                  {rowSpans.parent[index] > 0 && (
                    <TableCell rowSpan={rowSpans.parent[index]}>
                      {spec.parent_name}
                    </TableCell>
                  )}
                  <TableCell>{spec.specification_name}</TableCell>
                  <TableCell>{spec.specification_type}</TableCell>
                  <TableCell>{spec.category1}</TableCell>
                  <TableCell>{spec.specification_version}</TableCell>
                </TableRow>
              ))
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
    </div>
  );
}
