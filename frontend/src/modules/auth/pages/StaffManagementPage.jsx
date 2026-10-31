import { useState, useEffect } from 'react';
import { UserPlus, Trash2, Shield, User } from 'lucide-react';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/Badge';
import { Avatar } from '../../../components/ui/Avatar';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Input, Select } from '../../../components/ui/FormFields';
import { getStaff, addStaff, deleteStaff } from '../services/auth.service';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/index';

const INITIAL_FORM = { name: '', email: '', phone: '', role: 'staff', department: 'Sales' };

export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // TODO(A): Replace with real API
    getStaff().then(setStaff);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    // TODO(A): Validate email uniqueness before submission
    setLoading(true);
    try {
      const newMember = await addStaff({ ...form, joined: new Date().toISOString().slice(0, 10), status: 'active' });
      setStaff((prev) => [newMember, ...prev]);
      setAddOpen(false);
      setForm(INITIAL_FORM);
      toast.success(`${form.name} added to staff.`);
    } catch {
      toast.error('Failed to add staff member.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // TODO(A): Check if staff has active subscriptions before deletion
    try {
      await deleteStaff(deleteId);
      setStaff((prev) => prev.filter((s) => s.id !== deleteId));
      toast.success('Staff member removed.');
    } catch {
      toast.error('Failed to remove staff member.');
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: 'name', label: 'Staff Member', sortable: true,
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <Avatar name={v} size="sm" />
          <div>
            <p className="font-medium text-ink text-sm">{v}</p>
            <p className="text-xs text-ink-soft">{row.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'department', label: 'Department', sortable: true },
    {
      key: 'role', label: 'Role',
      render: (v) => (
        <span className="flex items-center gap-1.5 text-xs font-semibold">
          {v === 'admin' ? <Shield size={12} className="text-forest" /> : <User size={12} className="text-ink-soft" />}
          {v === 'admin' ? 'Admin' : 'Staff'}
        </span>
      ),
    },
    { key: 'phone', label: 'Phone' },
    { key: 'joined', label: 'Joined', render: (v) => formatDate(v) },
    {
      key: 'status', label: 'Status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      key: 'id', label: '',
      render: (v) => (
        <button onClick={(e) => { e.stopPropagation(); setDeleteId(v); }} className="p-1.5 text-ink-soft hover:text-coral transition-colors rounded-lg hover:bg-coral/5">
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff Management"
        subtitle="Manage admin and staff accounts"
        breadcrumb="Admin"
        actions={
          <Button variant="primary" icon={UserPlus} onClick={() => setAddOpen(true)}>
            Add Staff
          </Button>
        }
      />

      <div className="bg-paper rounded-2xl border border-border p-5">
        <DataTable columns={columns} data={staff} />
      </div>

      {/* Add Staff Modal */}
      <Modal
        open={addOpen} onClose={() => setAddOpen(false)} title="Add Staff Member" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} loading={loading}>Add Member</Button>
          </>
        }
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <Input label="Full Name" placeholder="Deepa Nambiar" value={form.name} onChange={set('name')} required />
          <Input label="Email Address" type="email" placeholder="deepa@brightloop.io" value={form.email} onChange={set('email')} required />
          <Input label="Phone" placeholder="+91 98100 00000" value={form.phone} onChange={set('phone')} />
          <Select label="Role" value={form.role} onChange={set('role')}>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
          <Select label="Department" value={form.department} onChange={set('department')}>
            {['Sales', 'Finance', 'Engineering', 'Support', 'Operations'].map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove Staff Member"
        message="Are you sure you want to remove this staff member? This action cannot be undone."
        confirmLabel="Remove"
      />
    </div>
  );
}
