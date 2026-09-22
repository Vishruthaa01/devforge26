import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Users, FileText, CheckCircle, Clock, XCircle, ShieldAlert, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AgentManager from '../components/AgentManager';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, pendingRes] = await Promise.all([
          axios.get('http://localhost:5000/api/audit-logs'),
          axios.get('http://localhost:5000/api/admin/pending')
        ]);
        setLogs(logsRes.data.data);
        setPending(pendingRes.data.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Socket.io Integration
    const socket = io('http://localhost:5000');

    socket.on('request.allowed', (newLog) => {
      setLogs(prev => [newLog, ...prev]);
    });

    socket.on('request.blocked', (newLog) => {
      setLogs(prev => [newLog, ...prev]);
    });

    socket.on('approval.pending', (newPending) => {
      setPending(prev => [newPending, ...prev]);
    });

    socket.on('approval.approved', (req) => {
      setPending(prev => prev.filter(p => p._id !== req._id));
    });

    socket.on('approval.rejected', (req) => {
      setPending(prev => prev.filter(p => p._id !== req._id));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/${decision}/${id}`);
      // Remove from UI instantly for snappy UX
      setPending(prev => prev.filter(req => req._id !== id));
    } catch (err) {
      console.error('Failed to execute decision', err);
    }
  };

  const totalAgents = new Set([...logs.map(l => l.agentId), ...pending.map(p => p.agentId)]).size;
  const totalRequests = logs.length + pending.length;
  const allowedRequests = logs.filter(l => l.decision !== 'BLOCKED').length;
  const pendingRequests = pending.length;
  const blockedRequests = logs.filter(l => l.decision === 'BLOCKED').length;

  const liveActivity = [
    ...pending.map(p => ({
      id: p._id,
      agent: p.agentId,
      action: p.action,
      resource: p.resource || p.payload?.resource || 'N/A',
      risk: p.riskScore || 0,
      riskFactors: p.riskFactors || {},
      status: 'APPROVAL'
    })),
    ...logs.map(l => ({
      id: l._id,
      agent: l.agentId,
      action: l.actionRequested,
      resource: l.resource || l.payload?.resource || 'N/A',
      risk: l.riskScore || 0,
      riskFactors: l.riskFactors || {},
      status: l.decision === 'BLOCKED' ? 'BLOCKED' : l.decision === 'PENDING' ? 'APPROVAL' : 'ALLOWED'
    }))
  ];

  return (
    <div className="min-h-screen bg-white p-6 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard (Overview)</h1>
        </div>

        {/* Top Section: KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{totalAgents}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-full">
              <FileText className="text-gray-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-full">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Allowed</p>
              <p className="text-2xl font-bold text-gray-900">{allowedRequests}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-full">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-full">
              <XCircle className="text-red-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Blocked</p>
              <p className="text-2xl font-bold text-gray-900">{blockedRequests}</p>
            </div>
          </div>
        </div>

        {/* Visual Analytics: Traffic & Threats */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Traffic & Threats Analyzer</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { time: '10:00', allowed: 12, blocked: 0, pending: 0 },
                { time: '10:15', allowed: 25, blocked: 2, pending: 1 },
                { time: '10:30', allowed: 18, blocked: 5, pending: 3 },
                { time: '10:45', allowed: 30, blocked: 1, pending: 0 },
                { time: '11:00', allowed: 45, blocked: 8, pending: 2 },
                { time: '11:15', allowed: Math.max(0, allowedRequests - 50), blocked: Math.max(0, blockedRequests - 10), pending: Math.max(0, pendingRequests - 2) },
                { time: 'Now', allowed: allowedRequests, blocked: blockedRequests, pending: pendingRequests }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="allowed" stackId="1" stroke="#22c55e" fill="#bbf7d0" name="Allowed" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#eab308" fill="#fef08a" name="Pending" />
                <Area type="monotone" dataKey="blocked" stackId="1" stroke="#ef4444" fill="#fecaca" name="Blocked" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Live Activity Table */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Live Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Agent</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Action</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Resource</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Risk</th>
                    <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading && liveActivity.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading data...</td>
                    </tr>
                  ) : liveActivity.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No activity found.</td>
                    </tr>
                  ) : (
                    liveActivity.map((activity) => {
                      let dotColor = 'bg-gray-400';
                      let badgeClass = 'bg-gray-100 text-gray-800';
                      
                      if (activity.status === 'ALLOWED') {
                        dotColor = 'bg-green-500';
                        badgeClass = 'bg-green-100 text-green-800';
                      } else if (activity.status === 'APPROVAL') {
                        dotColor = 'bg-yellow-500';
                        badgeClass = 'bg-yellow-100 text-yellow-800';
                      } else if (activity.status === 'BLOCKED') {
                        dotColor = 'bg-red-500';
                        badgeClass = 'bg-red-100 text-red-800';
                      }

                      return (
                        <tr 
                          key={activity.id} 
                          className="hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedRequest(activity)}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                            {activity.agent}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                            {activity.action}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {activity.resource}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 relative group">
                            <span className="font-semibold cursor-help border-b border-dashed border-gray-400 pb-0.5">{activity.risk}</span>
                            
                            {/* Hover Tooltip Breakdown */}
                            {activity.riskFactors && Object.keys(activity.riskFactors).length > 0 && (
                              <div className="absolute left-0 bottom-full mb-2 hidden w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg group-hover:block z-10">
                                <p className="font-bold border-b border-gray-700 pb-1 mb-2">Risk Breakdown ({activity.risk})</p>
                                <div className="flex justify-between py-0.5"><span>Action (A):</span> <span>{activity.riskFactors.actionRisk || 0}</span></div>
                                <div className="flex justify-between py-0.5"><span>Data (S):</span> <span>{activity.riskFactors.dataSensitivity || 0}</span></div>
                                <div className="flex justify-between py-0.5"><span>Value (V):</span> <span>{activity.riskFactors.transactionValue || 0}</span></div>
                                <div className="flex justify-between py-0.5"><span>Freq (F):</span> <span>{activity.riskFactors.frequencyAnomaly || 0}</span></div>
                                <div className="flex justify-between py-0.5"><span>Behavior (B):</span> <span>{activity.riskFactors.agentBehavior || 0}</span></div>
                                
                                {/* Little triangular arrow */}
                                <div className="absolute left-4 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900"></div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeClass}`}>
                                {activity.status}
                              </span>
                              
                              {activity.status === 'APPROVAL' && (
                                <div className="flex gap-2 ml-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDecision(activity.id, 'approve'); }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleDecision(activity.id, 'reject'); }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dynamic Agent & Policy Management */}
        <AgentManager />
      </div>

      {/* Traceability & Risk Breakdown Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Activity className="text-blue-600" />
                Request Traceability
              </h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-gray-500 hover:text-gray-800 transition"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Agent ID</p>
                  <p className="font-mono text-gray-900">{selectedRequest.agent}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Action</p>
                  <p className="font-mono text-gray-900">{selectedRequest.action}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 col-span-2">
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Target Resource</p>
                  <p className="font-mono text-gray-900 truncate">{selectedRequest.resource}</p>
                </div>
              </div>

              {/* Risk Score Breakdown Visual */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 border-b pb-1">Mathematical Risk Score (A+S+V+F+B)</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden flex">
                    {/* Visual stack based on risk factors */}
                    <div style={{width: `${selectedRequest.riskFactors?.actionRisk || 0}%`}} className="bg-blue-500 h-full"></div>
                    <div style={{width: `${selectedRequest.riskFactors?.dataSensitivity || 0}%`}} className="bg-purple-500 h-full"></div>
                    <div style={{width: `${selectedRequest.riskFactors?.transactionValue || 0}%`}} className="bg-red-500 h-full"></div>
                    <div style={{width: `${selectedRequest.riskFactors?.frequencyAnomaly || 0}%`}} className="bg-yellow-500 h-full"></div>
                    <div style={{width: `${selectedRequest.riskFactors?.agentBehavior || 0}%`}} className="bg-orange-500 h-full"></div>
                  </div>
                  <span className={`font-bold text-lg ${selectedRequest.risk >= 70 ? 'text-red-600' : selectedRequest.risk >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {selectedRequest.risk} / 100
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Action Risk: {selectedRequest.riskFactors?.actionRisk || 0}</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Data Sensitivity: {selectedRequest.riskFactors?.dataSensitivity || 0}</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Transaction Val: {selectedRequest.riskFactors?.transactionValue || 0}</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Frequency: {selectedRequest.riskFactors?.frequencyAnomaly || 0}</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Behavior: {selectedRequest.riskFactors?.agentBehavior || 0}</div>
                </div>
              </div>

              {/* Rationale */}
              <div className="bg-blue-50 text-blue-900 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-sm mb-1">Gateway Decision Rationale</h3>
                <p className="text-sm">
                  {selectedRequest.status === 'BLOCKED' && 'Blocked due to Risk Score exceeding strict security thresholds or explicitly failed Policy Engine rule.'}
                  {selectedRequest.status === 'APPROVAL' && 'Paused for Human Approval. The transaction value or risk profile triggered the medium-risk queue.'}
                  {selectedRequest.status === 'ALLOWED' && 'Allowed. Request successfully cleared RBAC, Policy Engine, and evaluated safely below the Risk Threshold.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
