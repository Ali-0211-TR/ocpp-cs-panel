import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCreateTariff } from '@entities/tariff';
import { Button, Input, Modal } from '@shared/ui';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateTariffForm({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [tariffType, setTariffType] = useState('flat');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [pricePerMinute, setPricePerMinute] = useState('0');
  const [sessionFee, setSessionFee] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');

  const mutation = useCreateTariff();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        name,
        tariff_type: tariffType,
        price_per_kwh: Number(pricePerKwh),
        price_per_minute: Number(pricePerMinute),
        session_fee: Number(sessionFee),
        currency,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Tariff created');
          onClose();
        },
        onError: () => toast.error('Failed to create tariff'),
      },
    );
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Tariff">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tariff Type</label>
          <select
            value={tariffType}
            onChange={(e) => setTariffType(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="flat">Flat</option>
            <option value="time_based">Time Based</option>
            <option value="energy_based">Energy Based</option>
            <option value="combined">Combined</option>
          </select>
        </div>
        <Input label="Price per kWh" type="number" step="0.01" value={pricePerKwh} onChange={(e) => setPricePerKwh(e.target.value)} required />
        <Input label="Price per Minute" type="number" step="0.01" value={pricePerMinute} onChange={(e) => setPricePerMinute(e.target.value)} />
        <Input label="Session Fee" type="number" step="0.01" value={sessionFee} onChange={(e) => setSessionFee(e.target.value)} />
        <Input label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
