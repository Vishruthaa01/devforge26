import { useState } from 'react';
import axios from 'axios';
import { Bot, Terminal, Send, ShieldAlert, Cpu } from 'lucide-react';

export default function AgentSimulator() {
  const [activeBot, setActiveBot] = useState('CustomerBot');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const logToTerminal = (message, error = false, clear = false, customColor = null) => {
    setTerminalOutput(prev => clear ? [{ message, error, customColor }] : [...prev, { message, error, customColor }]);
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userInput = chatInput;
    setChatInput('');
    setIsLoading(true);

    logToTerminal(`\n[YOU]: ${userInput}`, false, false, 'text-blue-300 font-bold');
    logToTerminal(`[NLP]: Parsing intent...`, false, false, 'text-gray-400');

    try {
      // 1. NLP parsing
      const nlpRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/nlp/parse-intent`, { text: userInput });
      const intent = nlpRes.data.data;

      if (intent.action === 'UNKNOWN') {
        logToTerminal(`[BOT]: ${intent.error}`, true);
        setIsLoading(false);
        return;
      }

      logToTerminal(`[NLP]: Parsed Intent -> ${intent.action}`, false, false, 'text-purple-400 font-bold');
      logToTerminal(`> Forwarding to Security Gateway via ${intent.method} ${intent.path}...`, false, false, 'text-gray-400');

      // 2. Gateway Request Phase
      const config = {
        method: intent.method,
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${intent.path}`,
        headers: { 'x-agent-id': activeBot }
      };
      
      if (intent.method !== 'GET') {
        config.data = intent.payload;
      }
      
      const res = await axios(config);
      
      if (res.status === 202) {
        logToTerminal(`STATUS: 202 ACCEPTED`, false, false, 'text-yellow-400');
        logToTerminal(`WARNING: Sensitive Operation Detected. Risk Score: ${res.data.riskScore}. Execution paused pending Human Approval.`, false, false, 'text-yellow-400');
      } else {
        logToTerminal(`STATUS: ${res.status} OK`);
        logToTerminal(JSON.stringify(res.data, null, 2));
      }
      
    } catch (err) {
      if (err.response) {
        logToTerminal(`STATUS: ${err.response.status} FORBIDDEN`, true);
        logToTerminal(JSON.stringify(err.response.data, null, 2), true);
      } else if (err.message === 'Network Error') {
        logToTerminal(`ERROR: Network Error - Is the backend server running?`, true);
      } else {
        logToTerminal(`ERROR: ${err.message}`, true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Cpu className="text-blue-600" />
          Natural Language Agent Simulator
        </h2>
        
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeBot === 'CustomerBot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
            onClick={() => { setActiveBot('CustomerBot'); logToTerminal('Switched to CustomerBot', false, true); }}
          >
            CustomerBot
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeBot === 'FinanceBot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
            onClick={() => { setActiveBot('FinanceBot'); logToTerminal('Switched to FinanceBot', false, true); }}
          >
            FinanceBot
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${activeBot === 'AnalyticsBot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:bg-slate-300'}`}
            onClick={() => { setActiveBot('AnalyticsBot'); logToTerminal('Switched to AnalyticsBot', false, true); }}
          >
            AnalyticsBot
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: NLP Chat Console */}
        <div className="bg-white rounded-lg border shadow-sm flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
            <Bot className="text-slate-700" />
            <h3 className="text-lg font-bold text-slate-800">Agent Chat Interface</h3>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
            <div className="space-y-4">
              <div className="bg-blue-100 text-blue-900 p-4 rounded-lg rounded-tl-none inline-block max-w-[85%]">
                <p className="text-sm">Hello! I am <strong>{activeBot}</strong>. You can ask me to perform actions using natural language.</p>
                <p className="text-xs mt-2 opacity-75">Try things like: <br/>- "Find customer C1023"<br/>- "Update customer C1023 phone 555-0000"<br/>- "Show today's sales"<br/>- "Refund 5000 to C1023"<br/>- "Export all customer data"</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t">
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isLoading}
                placeholder={`Tell ${activeBot} what to do...`}
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" 
                disabled={isLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel: Gateway Terminal */}
        <div className="bg-black rounded-lg border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[500px]">
          <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal size={16} />
              <span className="text-sm font-mono">Live Gateway Terminal</span>
            </div>
            {isLoading && <span className="text-xs text-blue-400 animate-pulse">Processing...</span>}
          </div>
          <div className="p-4 font-mono text-sm overflow-y-auto flex-1">
            {terminalOutput.map((log, idx) => (
              <pre key={idx} className={`whitespace-pre-wrap mb-1 ${log.customColor ? log.customColor : (log.error ? 'text-red-500 font-bold' : 'text-green-400')}`}>
                {log.message}
              </pre>
            ))}
            {terminalOutput.length === 0 && (
              <span className="text-slate-600">Waiting for agent actions...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
