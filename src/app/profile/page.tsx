'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Camera,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  location: string;
  role: string;
  memberLevel: string;
  totalOrders: number;
  totalSpent: number;
  lastActive: string;
}

export default function ProfilePage() {
  // 重定向到仪表板页?  useEffect(() => {
    window.location.href = '/profile/dashboard';
  }, []);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

