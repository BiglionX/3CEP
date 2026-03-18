import DictLayout from '@/components/admin/DictLayout';

export default function DictRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 注意：这个布局继承自 /admin/layout.tsx → RoleAwareLayout，已经有侧边栏了
  // 这里只需要提供 DictLayout 的标签导航，不需要 AdminLayout
  return <DictLayout>{children}</DictLayout>;
}
