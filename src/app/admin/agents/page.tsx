import dynamic from 'next/dynamic';

const AgentsDashboard = dynamic(
  () => import('@/components/admin/AgentsDashboard').then(mod => mod.default),
  { ssr: false }
);

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <AgentsDashboard />
    </div>
  );
}
