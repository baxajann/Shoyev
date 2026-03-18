import { IssueStatus, STATUS_LABELS, STATUS_COLORS, STATUS_DOT } from '@/lib/types';

interface StatusBadgeProps {
  status: IssueStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <span className={`status-badge ${STATUS_COLORS[status]}`}
      style={{ fontSize: size === 'sm' ? '11px' : '12px', padding: size === 'sm' ? '3px 8px' : '4px 10px' }}>
      <span className={`${STATUS_DOT[status]} pulse-dot`}
        style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block' }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
