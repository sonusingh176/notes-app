"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown, ArrowUp, ChevronLeft, ChevronRight,
  Loader2, Search, X
} from "lucide-react";

// Project ke dark theme ke saath match karta reusable DataTable
// Client-side filtering + pagination — server-side ke liye onQueryChange prop use karo
export function DataTable({
  columns,
  rows,
  loading = false,
  error,
  searchPlaceholder,
  emptyMessage = "Nothing to show.",
  // Server-side mode ke liye (optional)
  query,
  onQueryChange,
  total,
  page,
  limit,
  totalPages,
}) {
  const isServerSide = !!onQueryChange;

  // ── Client-side state (server-side nahi hai to yahi use hoga) ──
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // Search debounce — har keystroke pe request nahi jaayegi
  const firstRender = useRef(true);
  useEffect(() => {
    if (!isServerSide) return;
    if (firstRender.current) { firstRender.current = false; return; }
    const t = setTimeout(() => {
      onQueryChange({ ...query, search: search || undefined, page: 1 });
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // ── Client-side filtering + sorting + pagination ──
  const filteredRows = isServerSide ? rows : rows.filter((row) => {
    if (!search) return true;
    return columns.some((col) => {
      const val = row[col.accessorKey];
      return val && String(val).toLowerCase().includes(search.toLowerCase());
    });
  });

  const sortedRows = isServerSide ? filteredRows : [...filteredRows].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] ?? "";
    const bVal = b[sortKey] ?? "";
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const _total = isServerSide ? total : sortedRows.length;
  const _totalPages = isServerSide ? totalPages : Math.ceil(_total / pageSize);
  const _page = isServerSide ? page : currentPage;
  const _limit = isServerSide ? limit : pageSize;

  const paginatedRows = isServerSide
    ? sortedRows
    : sortedRows.slice((_page - 1) * _limit, _page * _limit);

  const from = _total === 0 ? 0 : (_page - 1) * _limit + 1;
  const to = Math.min(_page * _limit, _total);

  function toggleSort(col) {
    if (!col.sortable) return;
    if (isServerSide) {
      const isCurrent = query.sort === col.sortKey;
      onQueryChange({
        ...query,
        sort: col.sortKey,
        order: isCurrent ? (query.order === "asc" ? "desc" : "asc") : "asc",
        page: 1,
      });
    } else {
      setSortOrder(sortKey === col.accessorKey && sortOrder === "asc" ? "desc" : "asc");
      setSortKey(col.accessorKey);
      setCurrentPage(1);
    }
  }

  function goTo(p) {
    if (isServerSide) onQueryChange({ ...query, page: p });
    else setCurrentPage(p);
  }

  const activeSortKey = isServerSide ? query?.sort : sortKey;
  const activeSortOrder = isServerSide ? query?.order : sortOrder;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      {searchPlaceholder && (
        <div className="relative w-full sm:max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!isServerSide) setCurrentPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-[#1b2231] py-2 pl-9 pr-8 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#b480ff]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      
        <div className="w-full overflow-x-auto rounded-xl border border-white/10 -mx-0 sm:mx-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#11182b] text-xs uppercase text-gray-500">
            <tr>
              {columns.map((col) => {
                const active = activeSortKey === (col.sortKey ?? col.accessorKey);
                return (
                  <th key={col.key ?? col.accessorKey} className="px-4 py-3 select-none">
                    {col.sortable ? (
                      <button
                        onClick={() => toggleSort(col)}
                        className="flex items-center gap-1 hover:text-white transition"
                      >
                        {col.header}
                        {active ? (activeSortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : null}
                      </button>
                    ) : (
                      <span>{col.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-[#1b2231]">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-gray-500">
                  <Loader2 size={20} className="mx-auto animate-spin" />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-red-400">{error}</td>
              </tr>
            ) : paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-gray-500">{emptyMessage}</td>
              </tr>
            ) : (
              paginatedRows.map((row, i) => (
                <tr key={row._id ?? i} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  {columns.map((col) => (
                    <td key={col.key ?? col.accessorKey} className="px-4 py-3 text-gray-300">
                      {col.render ? col.render(row) : row[col.accessorKey]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>{from}–{to} of {_total}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(_page - 1)}
            disabled={_page <= 1}
            className="rounded-lg border border-white/10 p-1.5 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs">{_page} / {Math.max(_totalPages, 1)}</span>
          <button
            onClick={() => goTo(_page + 1)}
            disabled={_page >= _totalPages}
            className="rounded-lg border border-white/10 p-1.5 hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}