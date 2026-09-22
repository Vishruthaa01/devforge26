import { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function SecurityAlerts() {
  const alerts = [
    { id: '1', severity: 'CRITICAL', type: 'HIGH_RISK_BLOCK', title: 'High Risk Action Blocked', description: 'Risk Score 85 exceeded block threshold of 70.', agentId: 'FinanceBot', date: new Date().toLocaleString() },
    { id: '2', severity: 'HIGH', type: 'POLICY_VIOLATION', title: 'Policy Violation Block', description: 'Agent blocked by policy: Block Analytics Data Export', agentId: 'AnalyticsBot', date: new Date().toLocaleString() }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm border-l-4 border-l-red-500">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="text-red-500" />
            Security Alert Center
          </h2>
          <p className="text-sm text-slate-500 mt-1">Investigate and acknowledge critical system and agent anomalies</p>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-white border rounded-lg p-5 shadow-sm flex items-start gap-4">
            <div className={`p-3 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-slate-800">{alert.title}</h3>
                <span className="text-xs text-slate-500">{alert.date}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
              <div className="mt-3 flex gap-3">
                <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">Agent: {alert.agentId}</span>
                <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">Type: {alert.type}</span>
              </div>
            </div>
            <button className="text-sm font-bold text-blue-600 hover:text-blue-800">
              Acknowledge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
