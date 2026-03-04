import ClientLandingPage from './ClientLandingPage';

// 支持的角色页面
const SUPPORTED_ROLES = ['overview', 'ops', 'tech', 'biz', 'partner'];

export default function LandingPage({ params }: { params: { role: string } }) {
  const { role } = params;

  return <ClientLandingPage role={role} />;
}

// 生成静态参数（用于SSG）
export async function generateStaticParams() {
  return SUPPORTED_ROLES.map(role => ({
    role,
  }));
}
