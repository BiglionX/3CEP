import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  onClick: (route: string) => void;
  disabled?: boolean;
}

export function RoleCard({
  id,
  name,
  description,
  icon,
  color,
  route,
  onClick,
  disabled = false,
}: RoleCardProps) {
  return (
    <Card
      className={`
        cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        border-2 hover:border-blue-300
      `}
      onClick={() => !disabled && onClick(route)}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div
            className={`${color} w-16 h-16 rounded-full flex items-center justify-center mb-4 text-white`}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-gray-600 mb-4">{description}</p>
          <Button
            variant={disabled ? 'secondary' : 'default'}
            className="w-full"
            disabled={disabled}
          >
            {disabled ? '即将开? : '进入系统'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
