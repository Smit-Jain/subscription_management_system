import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export function DataTable({
  columns,
  data,
  onRowClick,
  searchable = true,
  pageSize = 10,
  emptyMessage = 'No records found.',
}) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const filtered = data.filter((row) => {
    if (!search) return true;
    return Object.values(row).some((v) =>
      String(v).toLowerCase().includes(search.toLowerCase())
    );
  });

  const sorted = sortBy
    ? [...filtered].sort((a, b) => {
        const va = a[sortBy], vb = b[sortBy];
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {searchable && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            className="w-full bg-cream border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink
              placeholder-ink-soft focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all"
            placeholder="Search…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cream border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-semibold text-ink-soft text-xs uppercase tracking-wide
                    ${col.sortable ? 'cursor-pointer select-none hover:text-ink' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortBy === col.key && (
                      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-ink-soft">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-border last:border-0 transition-colors bg-paper
                    ${onRowClick ? 'cursor-pointer hover:bg-forest-light/30' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>
            Showing {Math.min((safePage - 1) * pageSize + 1, sorted.length)}–
            {Math.min(safePage * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg hover:bg-cream disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p, i, arr) => (
                <span key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-1">…</span>
                  )}
                  <button
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                      ${p === safePage ? 'bg-forest text-paper' : 'hover:bg-cream text-ink-soft'}`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg hover:bg-cream disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
