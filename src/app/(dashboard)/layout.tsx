import RoleAwareLayout from '@/components/admin/RoleAwareLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleAwareLayout>{children}</RoleAwareLayout>;
}
