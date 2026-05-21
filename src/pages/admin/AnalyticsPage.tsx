import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

// Dados de exemplo para analytics
const analyticsData = [
  { name: 'Jan', visits: 1200 },
  { name: 'Fev', visits: 2100 },
  { name: 'Mar', visits: 1800 },
  { name: 'Abr', visits: 2400 },
  { name: 'Mai', visits: 2000 },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-4 lg:p-8"
    >
      <div className="flex items-center gap-2 text-white">
        <Activity size={24} className="text-brand-orange" />
        <h1 className="text-3xl font-black">Analytics</h1>
      </div>

      <div className="p-6 rounded-2xl bg-[#0B1020]/50 border border-white/5 backdrop-blur-md">
        <h2 className="mb-4 text-white font-medium">Visitas Mensais</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData}>
            <XAxis dataKey="name" stroke="#ffffff40" />
            <YAxis stroke="#ffffff40" />
            <Tooltip
              contentStyle={{ backgroundColor: '#050505', border: 'none' }}
              cursor={{ fill: '#ffffff05' }}
            />
            <Bar dataKey="visits" fill="#FF6A00" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
