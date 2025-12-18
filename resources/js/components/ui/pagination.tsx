import React from 'react'
import { Link } from '@inertiajs/react'

interface PaginationProps {
  currentPage: number
  lastPage: number
}

export default function Pagination({ currentPage, lastPage }: PaginationProps) {
  if (!lastPage || lastPage <= 1) return null

  const start = Math.max(1, currentPage - 3)
  const end = Math.min(lastPage, currentPage + 3)

  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav className="flex items-center space-x-2" aria-label="Pagination">
      {/* Previous */}
      <Link
        href={`?page=${Math.max(1, currentPage - 1)}`}
        className={`px-3 py-1 rounded-md border bg-background hover:shadow-sm ${currentPage === 1 ? 'opacity-50 pointer-events-none' : ''}`}
        preserveState
      >
        Prev
      </Link>

      {/* First page + ellipsis if needed */}
      {start > 1 && (
        <>
          <Link href={`?page=1`} className="px-3 py-1 rounded-md border" preserveState>
            1
          </Link>
          {start > 2 && <span className="px-2">…</span>}
        </>
      )}

      {/* Page numbers window */}
      {pages.map((p) => (
        <Link
          key={p}
          href={`?page=${p}`}
          className={`px-3 py-1 rounded-md border ${p === currentPage ? 'bg-primary text-white' : ''}`}
          preserveState
        >
          {p}
        </Link>
      ))}

      {/* Last page + ellipsis if needed */}
      {end < lastPage && (
        <>
          {end < lastPage - 1 && <span className="px-2">…</span>}
          <Link href={`?page=${lastPage}`} className="px-3 py-1 rounded-md border" preserveState>
            {lastPage}
          </Link>
        </>
      )}

      {/* Next */}
      <Link
        href={`?page=${Math.min(lastPage, currentPage + 1)}`}
        className={`px-3 py-1 rounded-md border bg-background hover:shadow-sm ${currentPage === lastPage ? 'opacity-50 pointer-events-none' : ''}`}
        preserveState
      >
        Next
      </Link>
    </nav>
  )
}
