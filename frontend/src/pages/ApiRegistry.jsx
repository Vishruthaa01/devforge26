import { useState } from 'react';
import { Network, Search, Plus, Filter, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function ApiRegistry() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data representing the dynamically seeded EnterpriseAPIs
  const apis = [
    { id: 'CustomerAPI', name: 'Customer Management API', baseUrl: '/api/enterprise/customers', endpoints: 4, sensitivity: 'CONFIDENTIAL', riskLevel: 'MEDIUM', status: 'ACTIVE' },
    { id: 'FinanceAPI', name: 'Finance & Payments API', baseUrl: '/api/enterprise/finance', endpoints: 2, sensitivity: 'RESTRICTED', riskLevel: 'HIGH', status: 'ACTIVE' },
    { id: 'SalesAPI', name: 'Sales Reporting API', baseUrl: '/api/enterprise/sales', endpoints: 3, sensitivity: 'INTERNAL', riskLevel: 'LOW', status: 'ACTIVE' },
    { id: 'HRApi', name: 'Employee Data API', baseUrl: '/api/enterprise/hr', endpoints: 5, sensitivity: 'RESTRICTED', riskLevel: 'HIGH', status: 'DEPRECATED' }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Network className="text-blue-600" />
            Enterprise API Registry
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage API perimeters and authorization rules</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Plus size={16} /> Register API
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search APIs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="px-4 py-2 border rounded-md text-sm font-medium text-slate-600 bg-white flex items-center gap-2">
            <Filter size={16} /> Filters
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">API Name</th>
              <th className="px-6 py-4">Base URL</th>
              <th className="px-6 py-4">Endpoints</th>
              <th className="px-6 py-4">Sensitivity</th>
              <th className="px-6 py-4">Risk Level</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {apis.map((api) => (
              <tr key={api.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{api.name}</td>
                <td className="px-6 py-4 text-slate-500 font-mono text-sm">{api.baseUrl}</td>
                <td className="px-6 py-4 text-slate-600">{api.endpoints}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${api.sensitivity === 'RESTRICTED' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                    {api.sensitivity}
                  </span>
                </td>
                <td className="px-6 py-4 flex items-center gap-1">
                  {api.riskLevel === 'HIGH' ? <ShieldAlert size={14} className="text-red-500"/> : <ShieldCheck size={14} className="text-green-500"/>}
                  <span className="text-sm font-medium">{api.riskLevel}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${api.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {api.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
