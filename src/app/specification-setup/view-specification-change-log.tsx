import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { getSpecificationRevisionsBySpecificationId } from "@/src/services/specification-revision-service";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { PaginationControl } from "@/src/app/controls/pagination-control";

interface ViewSpecificationChangeLogProps {
  specificationId: number;
  specificationName: string;
  onClose?: () => void;
  onHide?: () => void;
}

export default function ViewSpecificationChangeLog({
  specificationId,
  specificationName,
  onHide,
}: ViewSpecificationChangeLogProps) {
    const { userSetting, projectId } = useUserSettingContext();
    const [specificationRevisionChangeLogs, setSpecificationRevisionChangeLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const pageSize = userSetting?.page_size || 25;
    const [totalPages, setTotalPages] = useState(0);
    

    useEffect(() => {
        const fetchSpecificationRevisionChangeLogs = async () => {
            setIsLoading(true);
            try {
                const res = await getSpecificationRevisionsBySpecificationId(specificationId, page, pageSize);
                setSpecificationRevisionChangeLogs((res.specificationRevisions as any) || []);
                if (res.count) {
                    setTotalPages(res.count ? Math.ceil(res.count / pageSize) : 0);
                }
            } catch {
            } finally {
                setIsLoading(false);
            }
        };
        if (specificationId) {
            fetchSpecificationRevisionChangeLogs();
        }
    }, [projectId, page, pageSize, specificationId]);
    
  return (
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 h-[44px] shrink-0">
        <div>
          <h3 className="font-semibold text-base">
            Specification Change Log
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
              <FontAwesomeIcon
                icon={faChevronRight}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-4 border-b bg-muted/40 shrink-0">
        <div>
          Name: {specificationName}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="h-11 [&>th]:h-11 [&>th]:font-bold">
                <TableHead>ID</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Change Summary</TableHead>
                <TableHead>Change Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">Loading...</TableCell>
                </TableRow>
              ) : specificationRevisionChangeLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">No change log found.</TableCell>
                </TableRow>
              ) : (
                specificationRevisionChangeLogs.map((log: any, index: number) => (
                  <TableRow
                    key={log.id || index}
                    className="even:bg-blue-50/60 hover:bg-blue-100/60 dark:even:bg-slate-800/40 dark:hover:bg-slate-800/70 transition-colors"
                  >
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.version}</TableCell>
                    <TableCell className="whitespace-pre-wrap">{log.change_summary}</TableCell>
                    <TableCell>
                      {new Date(log.change_date).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>
        {totalPages > 1 && (
          <div className="p-2 border-t shrink-0">
            <PaginationControl
              page={page}
              totalPages={totalPages}
              isLoading={isLoading}
              onPageChange={setPage}
            />
          </div>
        )}
    </div>
  );
}
