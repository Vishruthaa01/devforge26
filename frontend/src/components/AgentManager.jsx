import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Key, AlertCircle, Save } from 'lucide-react';

export default function AgentManager() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const availableActions = [
    'READ_CUSTOMER', 'UPDATE_CUSTOMER', 'DELETE_CUSTOMER',
    'READ_SALES', 'VIEW_SALES', 'EXPORT_SALES', 'VIEW_REPORT', 'EXPORT_REPORT',
    'EXECUTE_REFUND', 'CREATE_LEAD', 'UPDATE_LEAD',
    'VIEW_INVENTORY'
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/roles');
      setRoles(res.data.data.filter(r => !['Admin', 'HR', 'IT_Support', 'Procurement'].includes(r.name))); // filter for relevant bots
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleToggle = (roleId, action) => {
    setRoles(roles.map(role => {
      if (role._id === roleId) {
        const newActions = role.allowedActions.includes(action)
          ? role.allowedActions.filter(a => a !== action)
          : [...role.allowedActions, action];
        return { ...role, allowedActions: newActions };
      }
      return role;
    }));
  };

  const saveRole = async (role) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/roles/${role._id}`, {
        allowedActions: role.allowedActions
      });
      setMessage({ type: 'success', text: `Permissions saved for ${role.name}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save permissions' });
    }
  };

  if (loading) return <div>Loading Agent Permissions...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-purple-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Dynamic Agent Permissions</h2>
          <p className="text-sm text-gray-500">Configure least-privilege RBAC for AI Agents on the fly.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <AlertCircle size={16} />
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {roles.map(role => (
          <div key={role._id} className="border rounded-lg p-5 bg-gray-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Key size={16} className="text-gray-500" />
                  {role.name} Role
                </h3>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
              </div>
              <button 
                onClick={() => saveRole(role)}
                className="flex items-center gap-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition"
              >
                <Save size={14} /> Save
              </button>
            </div>
            
            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2">
              {availableActions.map(action => (
                <label key={action} className="flex items-center gap-3 p-2 bg-white border rounded hover:bg-gray-100 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={role.allowedActions.includes(action)}
                    onChange={() => handleToggle(role._id, action)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm font-mono text-gray-700">{action}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
