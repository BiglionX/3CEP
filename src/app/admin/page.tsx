import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // 自动重定向到管理后台仪表盘
  redirect('/admin/dashboard');
}
