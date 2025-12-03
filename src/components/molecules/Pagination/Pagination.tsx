import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '../../atoms/Button';

const paginationStyles = cva('flex items-center gap-1', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const pageButtonStyles = cva(
  'flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-md transition-colors',
  {
    variants: {
      active: {
        true: 'bg-primary text-primary-foreground font-medium',
        false: 'bg-transparent text-foreground hover:bg-accent',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: 'cursor-pointer',
      },
    },
    defaultVariants: {
      active: false,
      disabled: false,
    },
  }
);

export interface PaginationProps extends VariantProps<typeof paginationStyles> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  size,
  className,
}) => {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Always show first page
    pages.push(1);

    // Show left dots
    if (shouldShowLeftDots) {
      pages.push('...');
    } else if (leftSiblingIndex === 2) {
      pages.push(2);
    }

    // Show middle pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Show right dots
    if (shouldShowRightDots) {
      pages.push('...');
    } else if (rightSiblingIndex === totalPages - 1) {
      pages.push(totalPages - 1);
    }

    // Always show last page (if more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className={`${paginationStyles({ size })} ${className || ''}`}>
      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </Button>
      )}

      {showPrevNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      )}

      {pages.map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span key={`dots-${index}`} className="px-3 py-2">
              {page}
            </span>
          );
        }

        return (
          <button
            key={page}
            className={pageButtonStyles({
              active: currentPage === page,
              disabled: false,
            })}
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        );
      })}

      {showPrevNext && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {showFirstLast && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
