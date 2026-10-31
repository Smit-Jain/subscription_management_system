import { useState } from 'react';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { Button } from '../../../../components/ui/Button';
import { Input, Textarea } from '../../../../components/ui/FormFields';
import { Avatar } from '../../../../components/ui/Avatar';
import { mockCurrentCustomer } from '../../../../mock/users';
import { useToast } from '../../../../context/ToastContext';

export default function ProfilePage() {
  const customer = mockCurrentCustomer;
  const toast = useToast();
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    company: customer.company,
    address: customer.address,
  });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO(D): PUT /customers/:id with updated profile data
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success('Profile updated successfully.');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="bg-paper rounded-2xl border border-border p-6">
        <div className="flex items-center gap-5 mb-7">
          <Avatar name={customer.name} size="xl" />
          <div>
            <h2 className="font-heading font-bold text-xl text-ink">{customer.name}</h2>
            <p className="text-sm text-ink-soft">{customer.company}</p>
            <p className="text-xs text-ink-soft mt-1">Customer since {new Date(customer.joined).getFullYear()}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" value={form.name}    onChange={set('name')}    required />
            <Input label="Email"     value={form.email}   onChange={set('email')}   type="email" required />
            <Input label="Phone"     value={form.phone}   onChange={set('phone')} />
            <Input label="Company"   value={form.company} onChange={set('company')} />
          </div>
          <Textarea label="Address" value={form.address} onChange={set('address')} rows={2} />

          <div className="flex justify-end pt-2">
            <Button variant="primary" type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>

      {/* Plan info */}
      <div className="bg-forest-light rounded-2xl border border-mint/30 p-5">
        <p className="text-xs font-semibold text-ink-soft uppercase tracking-wide mb-2">Current Plan</p>
        <div className="flex items-center justify-between">
          <p className="font-heading font-bold text-2xl text-forest">{customer.plan}</p>
          <Button variant="outline" size="sm">Upgrade Plan</Button>
        </div>
        <p className="text-xs text-forest/70 mt-1">Contact support to change or upgrade your subscription plan.</p>
      </div>
    </div>
  );
}
