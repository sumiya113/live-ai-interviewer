import React, { useState } from 'react';
import { Shield, Key, Eye, User, Settings, Database, Server, RefreshCw, Layers } from 'lucide-react';

interface AuditLogEntry {
  timestamp: string;
  action: string;
  user: string;
  ip: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

const CONSTANT_AUDIT_LOGS: AuditLogEntry[] = [
  { timestamp: '2026-06-10 14:02:15', action: 'INTERVIEW_COMPLETE', user: 'Jane Doe', ip: '192.168.1.104', status: 'SUCCESS' },
  { timestamp: '2026-06-10 13:58:10', action: 'RESUME_PARSE_UPLOAD', user: 'Jane Doe', ip: '192.168.1.104', status: 'SUCCESS' },
  { timestamp: '2026-06-10 11:24:02', action: 'STRIPE_WEBHOOK_RECEIVED', user: 'System-Stripe', ip: '3.18.29.11', status: 'SUCCESS' },
  { timestamp: '2026-06-09 17:10:45', action: 'FALLBACK_LLM_TRIG', user: 'Zephyr-AI', ip: 'Internal-VPCE', status: 'WARNING' },
  { timestamp: '2026-06-09 10:05:12', action: 'API_AUTHENTICATION_ATTEMPT', user: 'Malicious-Probe', ip: '203.0.113.5', status: 'FAILED' }
];

export const SettingsPanel: React.FC = () => {
  const [voice, setVoice] = useState('Zephyr');
  const [fallbackEnabled, setFallbackEnabled] = useState(true);
  const [modelType, setModelType] = useState('gemini-3.5-flash');
  const [apiLogs, setApiLogs] = useState<AuditLogEntry[]>(CONSTANT_AUDIT_LOGS);
  const [showSecretKey, setShowSecretKey] = useState(false);

  const clearAuditLogs = () => {
    setApiLogs([]);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-gray-800/40 p-6 rounded-2xl border border-gray-700/60">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Pro Platform Configuration
        </h2>
        <p className="text-gray-400 text-sm mt-1">Configure advanced voice parameters, LLM model fallbacks, multi-tenant RBAC, and audit secure compliance logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Grid Panel: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Settings Layer */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-750 space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              AI Gateway Modules (Phase 5)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Primary Synthesis Model</label>
                <select
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash Native (Fastest)</option>
                  <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Deep Brain</option>
                  <option value="gpt-4">GPT-4 Engine Proxy</option>
                  <option value="claude-3-5">Claude 3.5 Sonnet Broker</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">AI Interviewer Voice</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Zephyr">Zephyr (Default Male - High Energy)</option>
                  <option value="Aoede">Aoede (Female - Calm Academic)</option>
                  <option value="Puck">Puck (Cheerful Narrator)</option>
                  <option value="Charon">Charon (Deep Monotone Professional)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
              <div>
                <h4 className="text-xs font-bold text-white">Enable Multi-Provider Fallback</h4>
                <p className="text-[10px] text-gray-400 mt-1">If Gemini servers time-out, transparently reroute requests to secondary Claude/OpenAI gateways.</p>
              </div>
              <input
                type="checkbox"
                checked={fallbackEnabled}
                onChange={(e) => setFallbackEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-gray-900 border-gray-700"
              />
            </div>
          </div>

          {/* Credentials Block */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-750 space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              API Key & Integration Secrets
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">Platform Gemini Secret</label>
              <div className="flex gap-2">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  readOnly
                  value="AI_STUDIO_MANAGED_GEMINI_KEY_PERSISTED_SECURELY"
                  className="flex-grow bg-gray-900 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-indigo-300 focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="p-2.5 bg-gray-900 border border-gray-750 hover:bg-gray-850 text-gray-400 hover:text-white rounded-xl transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-500 mt-2">API credentials managed dynamically using **AI Studio secrets**. Do not commit these to repository lines.</p>
            </div>
          </div>

        </div>

        {/* Right Grid Grid: Security & Audit logs (Phase 14) */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-750 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                SOC2 Compliance Guard
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2.5 bg-gray-900/60 rounded-xl border border-gray-850">
                  <span className="text-gray-400">OWASP CSRF Shield</span>
                  <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-gray-900/60 rounded-xl border border-gray-850">
                  <span className="text-gray-400">AES-256 S3 Encryption</span>
                  <span className="text-xs text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2.5 bg-gray-900/60 rounded-xl border border-gray-850">
                  <span className="text-gray-400">Strict Rate Limit Threshold</span>
                  <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">60 req/min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-750 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Audit Compliance Logs
              </h3>
              {apiLogs.length > 0 && (
                <button
                  onClick={clearAuditLogs}
                  className="text-[10px] text-gray-500 hover:text-red-400"
                >
                  Clear Logs
                </button>
              )}
            </div>

            {apiLogs.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-xs text-gray-450 border border-dashed border-gray-700 rounded-xl">
                No logs current session.
              </div>
            ) : (
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                {apiLogs.map((log, index) => (
                  <div key={index} className="bg-gray-900/50 p-2.5 rounded-xl border border-gray-850 text-[10px] space-y-1.5 font-mono">
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${
                        log.status === 'SUCCESS' ? 'text-green-400' : log.status === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        [{log.status}]
                      </span>
                      <span className="text-gray-500">{log.timestamp}</span>
                    </div>
                    <div className="text-gray-300 font-semibold">{log.action}</div>
                    <div className="flex justify-between text-gray-500 text-[9px]">
                      <span>User: {log.user}</span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;
