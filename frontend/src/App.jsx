import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EnterpriseLayout from './layouts/EnterpriseLayout';
import AdminDashboard from './pages/AdminDashboard';
import AgentSimulator from './pages/AgentSimulator';
import ApiRegistry from './pages/ApiRegistry';
import PolicyManagement from './pages/PolicyManagement';
import AuditLogExplorer from './pages/AuditLogExplorer';
import SecurityAlerts from './pages/SecurityAlerts';
import EnterpriseCustomers from './pages/EnterpriseCustomers';
import EnterpriseAnalytics from './pages/EnterpriseAnalytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EnterpriseLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="agents" element={<AgentSimulator />} />
          <Route path="apis" element={<ApiRegistry />} />
          <Route path="policies" element={<PolicyManagement />} />
          <Route path="audit-logs" element={<AuditLogExplorer />} />
          <Route path="security-alerts" element={<SecurityAlerts />} />
          <Route path="enterprise/customers" element={<EnterpriseCustomers />} />
          <Route path="enterprise/analytics" element={<EnterpriseAnalytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
