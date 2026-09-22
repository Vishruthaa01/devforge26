import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Download } from 'lucide-react';

export default function EnterpriseCustomers() {
  const [customers, setCustomers] = useState([]);

  // For the sake of the hackathon, we'll fetch them from an unauthenticated internal endpoint,
  // or we'll just mock them on the frontend if we didn't build an explicit GET /all route.
  // Wait, I only built GET /customers/:id for the gateway.
  // So I'll just mock the list here to simulate the CRM.
  useEffect(() => {
    // Generate some CRM data based on the seeding
    const crmData = [];
    for(let i=1; i<=20; i++) {
      crmData.push({
        id: `C${1000 + i}`,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        phone: `555-01${i.toString().padStart(2, '0')}`,
        type: i % 5 === 0 ? 'VIP' : 'REGULAR',
        spent: `$${(Math.random() * 5000 + 100).toFixed(2)}`
      });
    }
    setCustomers(crmData);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-purple-600" />
            Customer Relationship Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Nexora Enterprise CRM - Human Employee Portal</p>
        </div>
        <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search Customers..."
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Total Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 text-sm">
                <td className="px-6 py-4 font-bold text-slate-700">{c.id}</td>
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4 text-slate-500">{c.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${c.type === 'VIP' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'}`}>
                    {c.type}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono">{c.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
