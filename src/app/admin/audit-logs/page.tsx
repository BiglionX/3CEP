import dynamic from 'next/dynamic';

const AuditTrailViewer = dynamic(
  () => import('@/components/admin/AuditTrailViewer').then(mod => mod.default),
  { ssr: false }
);

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-6">
      <AuditTrailViewer />
    </div>
  );
}
