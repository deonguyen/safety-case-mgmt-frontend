"use client";

import { PaginationControl } from "@/src/app/controls/pagination-control";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { ServiceProxy } from "@/src/services/service-proxy";
import { ProjectCodeBuildSnapshotModel } from "@/src/types/project-code-build-snapshot-model";
import { useEffect, useState } from "react";

export default function BuildSnapshotClientPage() {
  const { userSetting, projectId } = useUserSettingContext();
  const [snapshots, setSnapshots] = useState<ProjectCodeBuildSnapshotModel[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = userSetting?.page_size || 25;
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (!projectId) return;

    const fetchSnapshots = async () => {
      setIsLoading(true);
      const response = await ServiceProxy.getProjectCodeBuildSnapshots(
        projectId,
        page,
        pageSize,
      );
      setSnapshots(response.snapshots || []);
      setTotalPages(
        response.count ? Math.ceil(response.count / pageSize) : 0,
      );
      setIsLoading(false);
    };

    fetchSnapshots();
  }, [projectId, page, pageSize]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Build Snapshots</h1>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Build Status</TableHead>
              <TableHead>Deploy Status</TableHead>
              <TableHead>Github Event</TableHead>
              <TableHead>GitHub SHA</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : snapshots.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No snapshots found.
                </TableCell>
              </TableRow>
            ) : (
              snapshots.map((snapshot) => (
                <TableRow key={snapshot.id}>
                  <TableCell>{snapshot.build_status}</TableCell>
                  <TableCell>{snapshot.deploy_status}</TableCell>
                  <TableCell>{snapshot.github_event}</TableCell>
                  <TableCell>{snapshot.github_sha}</TableCell>
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