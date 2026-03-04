import EnhancedAdminLayout from '@/components/admin/EnhancedAdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EnhancedAdminLayout>{children}</EnhancedAdminLayout>;
}
