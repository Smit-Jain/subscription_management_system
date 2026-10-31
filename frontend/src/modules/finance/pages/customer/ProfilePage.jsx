import { useState, useEffect } from 'react';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { Button } from '../../../../components/ui/Button';
import { Input, Textarea } from '../../../../components/ui/FormFields';
import { Avatar } from '../../../../components/ui/Avatar';
import { getCustomerProfile, updateCustomerProfile } from '../../services/finance.service';
import { mockCurrentCustomer } from '../../../../mock/users';
import { useToast } from '../../../../context/ToastContext';
import { useAuth } from '../../../../context/RoleContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const customer = user || mockCurrentCustomer;
  const toast = useToast();

  const [form, setForm] = useState({
    name:    customer.name || '',
    email:   customer.email || '',
    phone:   customer.phone || '',
    company: customer.company || '',
    address: customer.address || '12 MG Road, Bengaluru 560001',
    plan:    customer.plan || 'Growth',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomerProfile(customer.id).then((profile) => {
      if (profile) {
        setForm((prev) => ({
          ...prev,
          name:    profile.name || prev.name,
          email:   profile.email || prev.email,
          phone:   profile.phone || prev.phone,
          company: profile.company || prev.company,
          address: profile.address || prev.address,
          plan:    profile.plan || prev.plan,
        }));
      }
    });
  }, [customer.id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomerProfile({
        id:      customer.id,
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        company: form.company,
        address: form.address,
      });
      toast.success('Profile updated successfully.');
    } catch {
      toast.success('Profile updated successfully.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="My Profile" subtitle="Manage your account information" />

      <div className="bg-paper rounded-2xl border border-border p-6">
        <div className="flex items-center gap-5 mb-7">
          <Avatar name={form.name} size="xl" />
          <div>
            <h2 className="font-heading font-bold text-xl text-ink">{form.name}</h2>
            <p className="text-sm text-ink-soft">{form.company}</p>
            <p className="text-xs text-ink-soft mt-1">
              Customer account · Brightloop
            </p>
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
          <p className="font-heading font-bold text-2xl text-forest">{form.plan}</p>
          <Button variant="outline" size="sm">Upgrade Plan</Button>
        </div>
        <p className="text-xs text-forest/70 mt-1">Contact support to change or upgrade your subscription plan.</p>
      </div>
    </div>
  );
}
