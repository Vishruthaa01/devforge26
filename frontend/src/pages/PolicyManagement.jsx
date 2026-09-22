import { Shield, Plus, Lock } from 'lucide-react';

export default function PolicyManagement() {
  const policies = [
    { id: '1', name: 'Block Analytics Data Export', condition: 'IF Agent.Role = Analytics AND Action = EXPORT_CUSTOMERS', effect: 'BLOCK', priority: 10, enabled: true },
    { id: '2', name: 'Delete Customer Approval', condition: 'IF Action = DELETE_CUSTOMER', effect: 'APPROVAL', priority: 20, enabled: true },
    { id: '3', name: 'Massive Refund Approval', condition: 'IF Action = EXECUTE_REFUND AND Payload.amount > 10000', effect: 'APPROVAL', priority: 30, enabled: true }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            Security Policy Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage dynamic gateway rules and condition expressions</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Plus size={16} /> Create Policy
        </button>
      </div>

      <div className="grid gap-4">
        {policies.map(policy => (
          <div key={policy.id} className="bg-white border rounded-lg p-5 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-800">{policy.name}</h3>
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono border">Priority: {policy.priority}</span>
              </div>
              <p className="text-sm font-mono text-slate-600 bg-slate-50 p-2 rounded border mt-2">
                {policy.condition}
              </p>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 text-sm font-bold rounded-full ${policy.effect === 'BLOCK' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {policy.effect}
              </span>
              <p className="text-xs text-slate-400 mt-2">Enabled</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
