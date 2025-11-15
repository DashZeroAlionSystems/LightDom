import React, { useState, useEffect, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { Button, Input, Badge, PromptInput, PromptSidebar } from '@/components/ui';
import axios from 'axios';

interface Agent {
  session_id: string;
  instance_id: string;
  name: string;
  model_name: string;
  status: 'active' | 'idle' | 'busy';
  created_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const DeepSeekChatDemo: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [pendingRequests, setPendingRequests] = useState(0);

  const isProcessing = pendingRequests > 0;

  const { Shell: SidebarShell, Section: SidebarSection, Item: SidebarItem, Divider: SidebarDivider } = PromptSidebar;

  useEffect(() => { loadAgents(); }, []);

  const loadAgents = async () => {
    try {
      const res = await axios.get('/api/agent/sessions');
      if (res.data) {
        const list: Agent[] = res.data.map((s: any) => ({
          session_id: s.session_id,
          instance_id: s.instance_id || '',
          name: s.name,
          model_name: s.model_name || 'deepseek-r1:7b',
          status: s.status || 'idle',
          created_at: s.created_at
        }));
        setAgents(list);
        if (list.length && !selectedAgent) {
          setSelectedAgent(list[0]);
          loadAgentMessages(list[0].session_id);
        }
      }
    } catch (err) {
      console.error('loadAgents error', err);
    }
  };

  const loadAgentMessages = async (sessionId: string) => {
    try {
      const res = await axios.get(`/api/agent/messages/${sessionId}`);
      if (res.data) {
        const msgs: Message[] = res.data.map((m: any) => ({
          id: m.message_id,
          role: m.role,
          content: m.content,
          timestamp: m.created_at
        }));
        setMessages(msgs);
      }
    } catch (err) {
      console.error('loadAgentMessages error', err);
    }
  };

  const createAgent = async () => {
    if (!newAgentName.trim()) return;
    setIsCreatingAgent(true);
    try {
      const sessionRes = await axios.post('/api/agent/sessions', { name: newAgentName, description: `DeepSeek agent: ${newAgentName}`, agent_type: 'deepseek' });
      if (sessionRes.data) {
        const sessionId = sessionRes.data.session_id;
        const instanceRes = await axios.post('/api/agent/instances', { session_id: sessionId, name: newAgentName, model_name: 'deepseek-r1:7b' });
        const newAgent: Agent = {
          session_id: sessionId,
          instance_id: instanceRes.data?.instance_id || '',
          name: newAgentName,
          model_name: 'deepseek-r1:7b',
          status: 'idle',
          created_at: new Date().toISOString()
        };
        setAgents((p) => [...p, newAgent]);
        setSelectedAgent(newAgent);
        setNewAgentName('');
        setMessages([]);
      }
    } catch (err) {
      console.error('createAgent error', err);
      alert('Failed to create agent');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const deleteAgent = async (agent: Agent) => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return;
    try {
      await axios.delete(`/api/agent/sessions/${agent.session_id}`);
      setAgents((p) => p.filter(a => a.session_id !== agent.session_id));
      if (selectedAgent?.session_id === agent.session_id) {
        setSelectedAgent(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('deleteAgent error', err);
      alert('Failed to delete agent');
    }
  };

  const promptTokens = useMemo(() => {
    if (!selectedAgent) return [{ id: 'no-agent', label: 'No agent selected', tone: 'warning' as const, icon: <LucideIcons.User className="w-3.5 h-3.5" /> }];
    return [
      { id: 'agent', label: selectedAgent.name, tone: 'accent' as const, icon: <LucideIcons.Sparkles className="w-3.5 h-3.5" /> },
      { id: 'model', label: selectedAgent.model_name, tone: 'default' as const, icon: <LucideIcons.Cpu className="w-3.5 h-3.5" /> },
      { id: 'status', label: `Status: ${selectedAgent.status}`, tone: selectedAgent.status === 'busy' ? 'warning' : selectedAgent.status === 'active' ? 'accent' : 'default', icon: <LucideIcons.Zap className="w-3.5 h-3.5" /> }
    ];
  }, [selectedAgent]);

  const promptActions = useMemo(() => {
    if (!selectedAgent) return [] as any[];
    return [
      { id: 'refresh-context', icon: <LucideIcons.RefreshCw className="w-4 h-4" />, label: 'Refresh context', onClick: () => { loadAgentMessages(selectedAgent.session_id); loadAgents(); } }
    ];
  }, [selectedAgent]);

  const promptHeader = useMemo(() => {
    if (!selectedAgent) return { title: 'Agent', subtitle: 'Choose or create an agent to start', leading: (
      <div className="flex items-center gap-3 text-on-surface">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LucideIcons.User className="h-5 w-5" /></div>
        <div className="flex flex-col"><span className="text-sm font-semibold">No agent selected</span><span className="text-xs text-on-surface-variant">Create a DeepSeek agent to begin</span></div>
      </div>
    ) };
    return { title: selectedAgent.name, subtitle: selectedAgent.model_name, leading: (
      <div className="flex items-center gap-3 text-on-surface">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${selectedAgent.status === 'active' ? 'bg-primary/15 text-primary' : 'bg-surface-container-high text-on-surface'}`}><LucideIcons.Sparkles className="h-5 w-5" /></div>
        <div className="flex flex-col"><span className="text-sm font-semibold">{selectedAgent.name}</span><span className="text-xs text-on-surface-variant">{selectedAgent.model_name}</span></div>
      </div>
    ), trailing: (<div className="flex items-center gap-2 text-xs text-on-surface-variant/80"><LucideIcons.Zap className="h-3.5 w-3.5" />{selectedAgent.status === 'busy' ? 'Running tasks' : 'Ready for prompts'}</div>) };
  }, [selectedAgent]);

  const handlePromptSend = async (prompt: string) => {
    if (!selectedAgent) { alert('Please select an agent first'); return; }
    const trimmed = prompt.trim(); if (!trimmed) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: trimmed, timestamp: new Date().toISOString() };
    const conversation = [...messages, userMessage].map(m => ({ role: m.role, content: m.content }));
    setMessages(prev => [...prev, userMessage]);
    setPendingRequests(p => p + 1);
    try {
      const res = await axios.post('/api/deepseek/chat', { session_id: selectedAgent.session_id, instance_id: selectedAgent.instance_id, prompt: trimmed, model: selectedAgent.model_name, conversation });
      if (res.data) {
        const assistantMessage: Message = { id: (Date.now()+1).toString(), role: 'assistant', content: res.data.response || res.data.content || 'Response received', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('handlePromptSend error', err);
      setMessages(prev => [...prev, { id: (Date.now()+2).toString(), role: 'assistant', content: 'Sorry, I encountered an error processing your request.', timestamp: new Date().toISOString() }]);
    } finally { setPendingRequests(p => Math.max(0, p-1)); }
  };

  const selectAgent = (agent: Agent) => { setSelectedAgent(agent); loadAgentMessages(agent.session_id); };

  return (
    <div className="flex h-screen bg-surface">
      <div className="w-80 bg-surface-overlay border-r border-outline flex flex-col">
        <div className="p-4 border-b border-outline">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">DeepSeek Agents</h2>
            <Button variant="filled" size="sm" onClick={() => setIsCreatingAgent(v => !v)} leftIcon={<LucideIcons.Plus className="w-4 h-4" />}>Add Agent</Button>
          </div>
          {isCreatingAgent && (
            <div className="space-y-3 mb-4">
              <Input placeholder="Agent name..." value={newAgentName} onChange={(e) => setNewAgentName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && createAgent()} />
              <div className="flex gap-2">
                <Button variant="filled" size="sm" onClick={createAgent} isLoading={isCreatingAgent} className="flex-1">Create</Button>
                <Button variant="outlined" size="sm" onClick={() => { setIsCreatingAgent(false); setNewAgentName(''); }}>Cancel</Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {agents.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant">
              <LucideIcons.User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agents yet</p>
              <p className="text-xs">Click "Add Agent" to create one</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {agents.map(agent => (
                <div key={agent.session_id} className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedAgent?.session_id === agent.session_id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-surface'}`} onClick={() => selectAgent(agent)}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <Badge variant={agent.status === 'active' ? 'success' : 'secondary'} className="text-xs">{agent.status}</Badge>
                    </div>
                    <div className="text-xs text-on-surface-variant">{agent.model_name}</div>
                  </div>
                  <Button variant="text" size="sm" onClick={(e) => { e.stopPropagation(); deleteAgent(agent); }} className="opacity-0 group-hover:opacity-100 transition-opacity"><LucideIcons.Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-outline bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center"><LucideIcons.Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h1 className="text-xl font-semibold">{selectedAgent ? selectedAgent.name : 'DeepSeek Chat'}</h1>
              <p className="text-sm text-on-surface-variant">{selectedAgent ? `Powered by ${selectedAgent.model_name}` : 'Select an agent to start chatting'}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-on-surface-variant mt-12">
              <LucideIcons.MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">Send a message to begin chatting with your DeepSeek agent</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-on-primary' : 'bg-surface-overlay border border-outline'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-surface-overlay border border-outline rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline bg-surface">
          {selectedAgent ? (
            <PromptInput onSend={handlePromptSend} loading={isProcessing} placeholder={`Ask ${selectedAgent.name} anything...`} tokens={promptTokens} actions={promptActions} header={promptHeader} helperText="Use @ to reference data streams or # to mention campaigns. /menu for quick commands." usage="Shift + Enter for newline · Enter to send" maxLength={4000} allowSendWhileLoading />
          ) : (
            <div className="text-center text-on-surface-variant py-4"><p className="text-sm">Select or create an agent to start chatting</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepSeekChatDemo;
