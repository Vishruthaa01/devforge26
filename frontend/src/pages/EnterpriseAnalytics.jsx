import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, DollarSign, Users, ShoppingCart } from 'lucide-react';

export default function EnterpriseAnalytics() {
  const salesTrend = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const productData = [
    { name: 'Prod A', sales: 400 },
    { name: 'Prod B', sales: 300 },
    { name: 'Prod C', sales: 200 },
    { name: 'Prod D', sales: 278 },
    { name: 'Prod E', sales: 189 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-purple-600" />
            Analytics & Sales Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">Nexora Enterprise - Business Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-full text-purple-600"><DollarSign size={24} /></div>
          <div><p className="text-sm text-slate-500">Total Revenue</p><p className="text-2xl font-bold">$245,000</p></div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600"><ShoppingCart size={24} /></div>
          <div><p className="text-sm text-slate-500">Total Orders</p><p className="text-2xl font-bold">1,204</p></div>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full text-green-600"><Users size={24} /></div>
          <div><p className="text-sm text-slate-500">Active Customers</p><p className="text-2xl font-bold">892</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Weekly Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#9333ea" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Top Products by Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
