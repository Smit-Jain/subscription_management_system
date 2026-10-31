import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { DataTable } from '../../../../components/ui/DataTable';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { getCustomerInvoices } from '../../services/finance.service';
import { mockCurrentCustomer } from '../../../../mock/users';
import { formatDate, formatCurrency } from '../../../../utils/index';
import { useToast } from '../../../../context/ToastContext';

export default function MyInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // TODO(D): Use auth token to filter customer invoices server-side
    getCustomerInvoices(mockCurrentCustomer.id).then(setInvoices);
  }, []);

  const columns = [
    { key: 'number',    label: 'Invoice #', render: (v) => <span className="font-mono text-xs font-semibold">{v}</span> },
    { key: 'issueDate', label: 'Date',      sortable: true, render: (v) => formatDate(v) },
    { key: 'dueDate',   label: 'Due Date',  sortable: true, render: (v) => formatDate(v) },
    { key: 'status',    label: 'Status',    render: (v) => <StatusBadge status={v} /> },
    { key: 'total',     label: 'Total',     sortable: true, render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    {
      key: 'id', label: '',
      render: (v) => (
        <Button size="sm" variant="ghost" icon={Download} onClick={(e) => { e.stopPropagation(); toast.success('Invoice PDF downloading…'); }}>
          Download
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="My Invoices" subtitle="View and download your invoices" />
      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable
          columns={columns}
          data={invoices}
          onRowClick={(row) => navigate(`/customer/invoices/${row.id}`)}
        />
      </div>
    </div>
  );
}
