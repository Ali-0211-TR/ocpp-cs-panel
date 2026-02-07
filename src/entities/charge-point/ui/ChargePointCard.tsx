import type React from 'react';
import { Badge, Card } from '@shared/ui';
import { formatDate } from '@shared/lib';
import type { ChargePointDto } from '../model/types';
import { Wifi, WifiOff, Plug } from 'lucide-react';

interface Props {
  chargePoint: ChargePointDto;
  onClick?: () => void;
}

export const ChargePointCard: React.FC<Props> = ({ chargePoint: cp, onClick }) => (
  <div className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
  <Card>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        {cp.is_online ? (
          <Wifi className="text-green-500" size={18} />
        ) : (
          <WifiOff className="text-gray-400" size={18} />
        )}
        <h3 className="font-semibold text-gray-900">{cp.id}</h3>
      </div>
      <Badge variant={cp.is_online ? 'green' : 'red'}>{cp.is_online ? 'Online' : 'Offline'}</Badge>
    </div>
    <div className="space-y-1 text-sm text-gray-600">
      {cp.vendor && <p>Vendor: {cp.vendor}</p>}
      {cp.model && <p>Model: {cp.model}</p>}
      <p>Connectors: {cp.connectors.length}</p>
      <p>Registered: {formatDate(cp.registered_at)}</p>
    </div>
    {cp.connectors.length > 0 && (
      <div className="flex gap-2 mt-3 flex-wrap">
        {cp.connectors.map((c) => (
          <div key={c.id} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
            <Plug size={12} />
            <span>#{c.id}</span>
            <Badge variant={c.status === 'Available' ? 'green' : c.status === 'Charging' ? 'blue' : 'gray'} className="text-[10px]">
              {c.status}
            </Badge>
          </div>
        ))}
      </div>
    )}
  </Card>
  </div>
);
