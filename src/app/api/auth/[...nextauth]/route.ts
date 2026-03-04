/**
 * NextAuth.js API路由处理程序
 * 适用于 Next.js App Router
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth-config';

// 导出GET和POST处理器
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
