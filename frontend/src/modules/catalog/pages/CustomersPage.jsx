import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { StatusBadge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { getCustomers } from '../../catalog/services/catalog.service';
import { formatDate } from '../../../utils/index';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO(B): Replace with real API
    getCustomers().then(setCustomers);
  }, []);

  const columns = [
    {
      key: 'name', label: 'Customer', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} size="sm" />
          <div>
            <p className="font-medium text-ink text-sm">{v}</p>
            <p className="text-xs text-ink-soft">{row.company}</p>
          </div>
        </div>
      ),
    },
    { key: 'email',  label: 'Email',  sortable: true },
    { key: 'phone',  label: 'Phone' },
    { key: 'plan',   label: 'Plan',   sortable: true,
      render: (v) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
          ${v === 'Enterprise' ? 'bg-lilac/40 text-violet-700' : v === 'Growth' ? 'bg-forest-light text-forest' : 'bg-sky/10 text-sky'}`}>
          {v}
        </span>
      ),
    },
    { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={v} /> },
    { key: 'joined', label: 'Joined', sortable: true, render: (v) => formatDate(v) },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers total`}
        actions={
          <Button variant="primary" icon={UserPlus}>Add Customer</Button>
        }
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable
          columns={columns}
          data={customers}
          onRowClick={(row) => navigate(`/admin/customers/${row.id}`)}
        />
      </div>
    </div>
  );
}
