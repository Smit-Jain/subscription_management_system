import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Download } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/Badge';
import { FilterBar } from '../../../components/ui/FilterBar';
import { Avatar } from '../../../components/ui/Avatar';
import { getInvoices, generateInvoices } from '../services/billing.service';
import { formatDate, formatCurrency } from '../../../utils/index';
import { useToast } from '../../../context/ToastContext';

const STATUS_OPTIONS = ['draft', 'confirmed', 'paid', 'pending', 'overdue', 'cancelled'].map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '' });
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // TODO(C): Replace with real API
    getInvoices().then(setInvoices);
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateInvoices();
      toast.success(`Generated ${result.generated || 0} new invoice(s).`);
      const updated = await getInvoices();
      setInvoices(updated);
    } catch (err) {
      toast.error(err.message || 'Invoice generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCsv = () => {
    if (!filtered.length) {
      toast.info('No invoices to export.');
      return;
    }
    const headers = ['Invoice Number', 'Customer', 'Issue Date', 'Due Date', 'Status', 'Total'];
    const rows = filtered.map((i) => [
      i.number,
      `"${i.customerName || ''}"`,
      i.issueDate,
      i.dueDate,
      i.status,
      i.total,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Invoices exported to CSV.');
  };

  const filtered = invoices.filter((inv) => {
    if (filters.status && inv.status !== filters.status) return false;
    if (filters.dateFrom && inv.issueDate < filters.dateFrom) return false;
    if (filters.dateTo   && inv.issueDate > filters.dateTo)   return false;
    return true;
  });

  const handleFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  const columns = [
    { key: 'number', label: 'Invoice #', sortable: true, render: (v) => <span className="font-mono text-xs font-semibold text-ink">{v}</span> },
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={v} size="sm" />
          <span className="text-sm font-medium">{v}</span>
        </div>
      ),
    },
    { key: 'issueDate', label: 'Issue Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'dueDate',   label: 'Due Date',   sortable: true, render: (v) => formatDate(v) },
    { key: 'status',    label: 'Status',  sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'total',     label: 'Total',   sortable: true, render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${filtered.length} invoices`}
        actions={
          <>
            <Button variant="ghost" icon={Download} onClick={handleExportCsv}>Export CSV</Button>
            <Button variant="accent" icon={Zap} loading={generating} onClick={handleGenerate}>
              Generate Invoices Now
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <FilterBar
          filters={[
            { key: 'status',   type: 'select', label: 'Status',   value: filters.status,   options: STATUS_OPTIONS },
            { key: 'dateFrom', type: 'date',   label: 'From',     value: filters.dateFrom },
            { key: 'dateTo',   type: 'date',   label: 'To',       value: filters.dateTo },
          ]}
          onFilterChange={handleFilter}
          onReset={() => setFilters({ status: '', dateFrom: '', dateTo: '' })}
        />
      </div>

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/admin/invoices/${row.id}`)}
          searchable={false}
        />
      </div>
    </div>
  );
}
