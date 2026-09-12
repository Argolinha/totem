import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change: string;
  changeColor: string;
}

export default function StatCard({ icon: Icon, title, value, change, changeColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-vive-primary/10 rounded-lg text-vive-primary">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          <span className={`text-xs font-semibold ${changeColor}`}>{change}</span>
        </div>
      </div>
    </div>
  );
}