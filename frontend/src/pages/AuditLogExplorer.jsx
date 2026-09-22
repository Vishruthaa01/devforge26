import { useState, useEffect } from 'react';
import axios from 'axios';
import { ScrollText, Search, Download } from 'lucide-react';

export default function AuditLogExplorer() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/audit-logs').then(res => setLogs(res.data.data)).catch(console.error);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ScrollText className="text-blue-600" />
            Audit Log Explorer
          </h2>
          <p className="text-sm text-slate-500 mt-1">Immutable ledger of all AI agent requests and security gateway decisions</p>
        </div>
        <button className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Agent</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Decision</th>
              <th className="px-6 py-4">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map(log => (
              <tr key={log._id} className="hover:bg-slate-50 text-sm">
                <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-slate-700">{log.agentId}</td>
                <td className="px-6 py-4 font-mono text-xs">{log.actionRequested}</td>
                <td className="px-6 py-4 text-slate-500">{log.targetRoute}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    log.decision === 'ALLOWED' ? 'bg-green-100 text-green-700' :
                    log.decision === 'BLOCKED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {log.decision}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{log.riskScore || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
