import RoleAwareLayout from '@/components/admin/RoleAwareLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleAwareLayout>{children}</RoleAwareLayout>;
}
