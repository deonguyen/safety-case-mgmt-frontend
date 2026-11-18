import { useMemo } from "react";
import { Button } from "@/src/components/ui/button"; // Adjust this path if your shadcn components are located elsewhere
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useUserSettingContext } from "@/src/components/context/user-setting-context";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function PaginationControl({
  page,
  totalPages,
  isLoading = false,
  onPageChange,
}: PaginationControlsProps) {
  const { setUserSettingPageSize, pageSize } = useUserSettingContext();
  const paginationRange = useMemo(() => {
    const totalPageCount = totalPages;
    const siblingCount = 2; // This creates a block of 5 pages around the current one.

    // The total number of pages to show before we start using ellipses.
    const totalPageNumbers = 5 + 2 * siblingCount;

    if (totalPageCount <= totalPageNumbers) {
      return Array.from({ length: totalPageCount }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, totalPageCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPageCount - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPageCount;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "...", totalPageCount];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPageCount - rightItemCount + 1 + i,
      );
      return [firstPageIndex, "...", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [firstPageIndex, "...", ...middleRange, "...", lastPageIndex];
    }
    return []; // Should be unreachable
  }, [totalPages, page]);

  const handlePageSizeChange = (value: string) => {
    setUserSettingPageSize(Number(value));
    onPageChange(1); // Reset to first page when changing page size
  };

  return (
    <div className="flex items-center justify-between w-full p-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={handlePageSizeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={`${pageSize}`} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10,  20, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={page === 1 || isLoading}
          className="h-9 w-9"
          title="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(page - 1, 1))}
          disabled={page === 1 || isLoading}
          className="h-9 w-9"
          title="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-1">
          {paginationRange?.map((pageNumber, index) => {
            if (typeof pageNumber === "string") {
              return (
                <span
                  key={index}
                  className="flex h-9 w-9 items-center justify-center"
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={index}
                variant={pageNumber === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className={`h-9 w-9 ${
                  pageNumber === page
                    ? "bg-[#3f51b5] hover:bg-[#3f51b5]/90 text-white"
                    : ""
                }`}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onPageChange(!totalPages || page === totalPages ? page : page + 1)
          }
          disabled={page === totalPages || totalPages === 0 || isLoading}
          className="h-9 w-9"
          title="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || totalPages === 0 || isLoading}
          className="h-9 w-9"
          title="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
