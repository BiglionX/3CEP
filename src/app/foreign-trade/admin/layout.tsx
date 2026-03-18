'use client';

export default function ForeignTradeAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 注意：这个布局继承自 /foreign-trade/company/layout.tsx，已经有侧边栏了
  // 这里只需要提供内容区域，不需要再添加侧边栏

  return (
    <div className="w-full">
      {children}
    </div>
  );
}
