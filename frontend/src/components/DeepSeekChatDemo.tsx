import React, { useState, useEffect, useMemo } from 'react';
import { Plus, User, MessageSquare, Zap, Trash2, Sparkles, Cpu, RefreshCw, GitBranch, GitPullRequest, Columns, PanelRight } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'primary' | 'extended' | 'complement' | 'custom'>('primary');

  const isProcessing = pendingRequests > 0;

  const { Shell: SidebarShell, Section: SidebarSection, Item: SidebarItem, Divider: SidebarDivider } = PromptSidebar;

  const latestAssistantMessage = useMemo(() => {
    const assistantMessages = messages.filter((message) => message.role === 'assistant');
    return assistantMessages.length ? assistantMessages[assistantMessages.length - 1] : null;
  }, [messages]);

  const recentUserPrompts = useMemo(
    () => messages.filter((message) => message.role === 'user').slice(-5).reverse(),
    [messages]
  );

  // Load agents on mount
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await axios.get('/api/agent/sessions');
      if (response.data) {
        // Transform sessions to agents for display
        const agentList: Agent[] = response.data.map((session: any) => ({
          session_id: session.session_id,
          instance_id: '', // Will be populated when instances are loaded
          name: session.name,
          model_name: 'deepseek-r1:7b',
          status: session.status === 'active' ? 'active' : 'idle',
          created_at: session.created_at
        }));
        setAgents(agentList);

        // Auto-select first agent if available
        if (agentList.length > 0 && !selectedAgent) {
          setSelectedAgent(agentList[0]);
          loadAgentMessages(agentList[0].session_id);
        }
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  };

  const loadAgentMessages = async (sessionId: string) => {
    try {
      const response = await axios.get(`/api/agent/messages/${sessionId}`);
      if (response.data) {
        const messageList: Message[] = response.data.map((msg: any) => ({
          id: msg.message_id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        }));
        setMessages(messageList);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const createAgent = async () => {
    if (!newAgentName.trim()) return;

    setIsCreatingAgent(true);
    try {
      // Create agent session
      const sessionResponse = await axios.post('/api/agent/sessions', {
        name: newAgentName,
        description: `DeepSeek agent: ${newAgentName}`,
        agent_type: 'deepseek'
      });

      if (sessionResponse.data) {
        const sessionId = sessionResponse.data.session_id;

        // Create agent instance
        const instanceResponse = await axios.post('/api/agent/instances', {
          session_id: sessionId,
          name: newAgentName,
          model_name: 'deepseek-r1:7b',
          max_tokens: 4096,
          temperature: 0.7
        });

        if (instanceResponse.data) {
          const newAgent: Agent = {
            session_id: sessionId,
            instance_id: instanceResponse.data.instance_id,
            name: newAgentName,
            model_name: 'deepseek-r1:7b',
            status: 'idle',
            created_at: new Date().toISOString()
          };

          setAgents(prev => [...prev, newAgent]);
          setSelectedAgent(newAgent);
          setNewAgentName('');
          setMessages([]); // Clear messages for new agent
        }
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const deleteAgent = async (agent: Agent) => {
    if (!confirm(`Delete agent "${agent.name}"?`)) return;

    try {
      await axios.delete(`/api/agent/sessions/${agent.session_id}`);
      setAgents(prev => prev.filter(a => a.session_id !== agent.session_id));

      if (selectedAgent?.session_id === agent.session_id) {
        setSelectedAgent(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      alert('Failed to delete agent. Please try again.');
    }
  };

  const promptTokens = useMemo(() => {
    if (!selectedAgent) {
      return [
        {
          id: 'no-agent',
          label: 'No agent selected',
          tone: 'warning' as const,
          icon: <User className="w-3.5 h-3.5" />
        }
      ];
    }

    const statusTone: 'default' | 'accent' | 'warning' =
      selectedAgent.status === 'busy'
        ? 'warning'
        : selectedAgent.status === 'active'
          ? 'accent'
          : 'default';

    return [
      {
        id: 'agent',
        label: selectedAgent.name,
        tone: 'accent' as const,
        icon: <Sparkles className="w-3.5 h-3.5" />
      },
      {
        id: 'model',
        label: selectedAgent.model_name,
        tone: 'default' as const,
        icon: <Cpu className="w-3.5 h-3.5" />
      },
      {
        id: 'status',
        label: `Status: ${selectedAgent.status}`,
        tone: statusTone,
        icon: <Zap className="w-3.5 h-3.5" />
      }
    ];
  }, [selectedAgent]);

  const promptActions = useMemo((): PromptAction[] => {
    if (!selectedAgent) {
      return [];
    }

    return [
      {
        id: 'refresh-context',
        icon: <RefreshCw className="w-4 h-4" />,
        label: 'Refresh context',
        onClick: () => {
          loadAgentMessages(selectedAgent.session_id);
          loadAgents();
        }
      }
    ];
  }, [loadAgents, loadAgentMessages, selectedAgent]);

  const promptHeader = useMemo(() => {
    if (!selectedAgent) {
      return {
        title: 'Agent',
        subtitle: 'Choose or create an agent to start',
        leading: (
          <div className="flex items-center gap-3 text-on-surface">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">No agent selected</span>
              <span className="text-xs text-on-surface-variant">Create a DeepSeek agent to begin</span>
            </div>
          </div>
        )
      };
    }

    return {
      title: selectedAgent.name,
      subtitle: selectedAgent.model_name,
      leading: (
        <div className="flex items-center gap-3 text-on-surface">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            selectedAgent.status === 'active'
              ? 'bg-primary/15 text-primary'
              : 'bg-surface-container-high text-on-surface'
          }`}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{selectedAgent.name}</span>
            <span className="text-xs text-on-surface-variant">{selectedAgent.model_name}</span>
          </div>
        </div>
      ),
      trailing: (
        <div className="flex items-center gap-2 text-xs text-on-surface-variant/80">
          <Zap className="h-3.5 w-3.5" />
          {selectedAgent.status === 'busy' ? 'Running tasks' : 'Ready for prompts'}
        </div>
      )
    };
  }, [selectedAgent]);

  const handlePromptSend = async (prompt: string) => {
    if (!selectedAgent) {
      alert('Please select an agent first');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    // Create user message locally for optimistic UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmedPrompt,
      timestamp: new Date().toISOString()
    };

    const conversationPayload = [...messages, userMessage].map((message) => ({
      role: message.role,
      content: message.content
    }));

    setMessages((prev) => [...prev, userMessage]);
    setPendingRequests((prev) => prev + 1);

    try {
      // Send prompt to DeepSeek
      const response = await axios.post('/api/deepseek/chat', {
        session_id: selectedAgent.session_id,
        instance_id: selectedAgent.instance_id,
        prompt: trimmedPrompt,
        model: selectedAgent.model_name,
        conversation: conversationPayload
      });

      if (response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response || response.data.content || 'Response received',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Failed to send prompt:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setPendingRequests((prev) => Math.max(0, prev - 1));
    }
  };

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    loadAgentMessages(agent.session_id);
  };

  return (
    <div className="flex h-screen bg-surface">
      {/* Sidebar */}
      <div className="w-80 bg-surface-overlay border-r border-outline flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-outline">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface">DeepSeek Agents</h2>
            <Button
              variant="filled"
              size="sm"
              onClick={() => setIsCreatingAgent(!isCreatingAgent)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Agent
            </Button>
          </div>

          {/* Add Agent Form */}
          {isCreatingAgent && (
            <div className="space-y-3 mb-4">
              <Input
                placeholder="Agent name..."
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createAgent()}
              />
              <div className="flex gap-2">
                <Button
                  variant="filled"
                  size="sm"
                  onClick={createAgent}
                  isLoading={isCreatingAgent}
                  className="flex-1"
                >
                  Create
                </Button>
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={() => {
                    setIsCreatingAgent(false);
                    setNewAgentName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Agents List */}
        <div className="flex-1 overflow-y-auto">
          {agents.length === 0 ? (
            <div className="p-4 text-center text-on-surface-variant">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agents yet</p>
              <p className="text-xs">Click "Add Agent" to create one</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {agents.map((agent) => (
                <div
                  key={agent.session_id}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    selectedAgent?.session_id === agent.session_id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-surface'
                  }`}
                  onClick={() => selectAgent(agent)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{agent.name}</span>
                      <Badge
                        variant={agent.status === 'active' ? 'success' : 'secondary'}
                        className="text-xs"
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-on-surface-variant">
                      {agent.model_name}
                    </div>
                  </div>
                  <Button
                    variant="text"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAgent(agent);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-outline bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {selectedAgent ? selectedAgent.name : 'DeepSeek Chat'}
              </h1>
              <p className="text-sm text-on-surface-variant">
                {selectedAgent ? `Powered by ${selectedAgent.model_name}` : 'Select an agent to start chatting'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-on-surface-variant mt-12">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm">Send a message to begin chatting with your DeepSeek agent</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-overlay border border-outline'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-surface-overlay border border-outline rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="p-4 border-t border-outline bg-surface">
          {selectedAgent ? (
            <PromptInput
              onSend={handlePromptSend}
              loading={isProcessing}
              placeholder={`Ask ${selectedAgent.name} anything...`}
              tokens={promptTokens}
              actions={promptActions}
              header={promptHeader}
              helperText="Use @ to reference data streams or # to mention campaigns. /menu for quick commands."
              usage="Shift + Enter for newline · Enter to send"
              maxLength={4000}
              allowSendWhileLoading
            />
          ) : (
            <div className="text-center text-on-surface-variant py-4">
              <p className="text-sm">Select or create an agent to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepSeekChatDemo;
