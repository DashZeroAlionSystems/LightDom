/**
 * PromptDashboard Component
 * 
 * Comprehensive prompt dashboard with:
 * - DeepSeek integration for real-time conversation
 * - Schema generation from prompts
 * - Step-by-step feedback cards
 * - Conversation history and review
 */

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Layers, Database, MessageSquare, History, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PromptInput from './ui/PromptInput';
import FeedbackCard, { FeedbackCardProps, FeedbackStatus } from './ui/FeedbackCard';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface GeneratedArtifact {
  id: string;
  type: 'schema' | 'component' | 'workflow' | 'task';
  name: string;
  content: any;
  timestamp: Date;
}

interface FeedbackStep {
  id: string;
  step: number;
  title: string;
  content: string;
  status: FeedbackStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
  schema?: any;
}

export const PromptDashboard: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [feedbackSteps, setFeedbackSteps] = useState<FeedbackStep[]>([]);
  const [artifacts, setArtifacts] = useState<GeneratedArtifact[]>([]);
  const [selectedModel, setSelectedModel] = useState('deepseek-r1');
  const [activeTab, setActiveTab] = useState<'conversation' | 'feedback' | 'artifacts'>('feedback');
  
  const feedbackEndRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new feedback arrives
  useEffect(() => {
    if (activeTab === 'feedback') {
      feedbackEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'conversation') {
      conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feedbackSteps, conversation, activeTab]);

  /**
   * Handle sending a prompt to DeepSeek
   */
  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isProcessing) return;

    setIsProcessing(true);
    setPrompt('');

    // Add user message to conversation
    const userMessage: ConversationMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: new Date()
    };
    setConversation(prev => [...prev, userMessage]);

    // Add initial processing feedback
    const initialFeedback: FeedbackStep = {
      id: `step-${Date.now()}-1`,
      step: feedbackSteps.length + 1,
      title: 'Analyzing prompt',
      content: 'DeepSeek is analyzing your request...',
      status: 'processing',
      timestamp: new Date()
    };
    setFeedbackSteps(prev => [...prev, initialFeedback]);

    try {
      // Call the DeepSeek API with streaming
      await processPromptWithStreaming(promptText);
    } catch (error) {
      console.error('Error processing prompt:', error);
      
      // Add error feedback
      const errorFeedback: FeedbackStep = {
        id: `step-${Date.now()}-error`,
        step: feedbackSteps.length + 2,
        title: 'Error processing request',
        content: error instanceof Error ? error.message : 'An unknown error occurred',
        status: 'error',
        timestamp: new Date()
      };
      setFeedbackSteps(prev => [...prev, errorFeedback]);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process prompt with real-time streaming from DeepSeek
   */
  const processPromptWithStreaming = async (promptText: string) => {
    const response = await fetch('/api/deepseek/chat/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText,
        model: selectedModel,
        conversation: conversation.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    let fullResponse = '';
    let currentStepId = `step-${Date.now()}-2`;
    let stepNumber = feedbackSteps.length + 2;

    // Update initial processing feedback to success
    setFeedbackSteps(prev => prev.map(step => 
      step.status === 'processing' 
        ? { ...step, status: 'success', content: 'Prompt analyzed successfully' }
        : step
    ));

    // Add streaming response feedback
    const streamingFeedback: FeedbackStep = {
      id: currentStepId,
      step: stepNumber,
      title: 'DeepSeek is thinking...',
      content: '',
      status: 'processing',
      timestamp: new Date()
    };
    setFeedbackSteps(prev => [...prev, streamingFeedback]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              
              if (parsed.type === 'content') {
                fullResponse += parsed.content;
                
                // Update streaming feedback with new content
                setFeedbackSteps(prev => prev.map(step =>
                  step.id === currentStepId
                    ? { ...step, content: fullResponse }
                    : step
                ));
              } else if (parsed.type === 'schema') {
                // Schema generated
                const schemaFeedback: FeedbackStep = {
                  id: `step-${Date.now()}-schema`,
                  step: stepNumber + 1,
                  title: 'Schema generated',
                  content: 'DeepSeek has generated a schema based on your prompt',
                  status: 'success',
                  timestamp: new Date(),
                  schema: parsed.schema
                };
                setFeedbackSteps(prev => [...prev, schemaFeedback]);

                // Add to artifacts
                const artifact: GeneratedArtifact = {
                  id: `artifact-${Date.now()}`,
                  type: 'schema',
                  name: parsed.schema.name || 'Generated Schema',
                  content: parsed.schema,
                  timestamp: new Date()
                };
                setArtifacts(prev => [...prev, artifact]);
              } else if (parsed.type === 'component') {
                // Component generated
                const componentFeedback: FeedbackStep = {
                  id: `step-${Date.now()}-component`,
                  step: stepNumber + 2,
                  title: 'Component generated',
                  content: 'UI component has been generated',
                  status: 'success',
                  timestamp: new Date(),
                  metadata: {
                    componentName: parsed.component.name,
                    type: parsed.component.type
                  }
                };
                setFeedbackSteps(prev => [...prev, componentFeedback]);

                // Add to artifacts
                const artifact: GeneratedArtifact = {
                  id: `artifact-${Date.now()}`,
                  type: 'component',
                  name: parsed.component.name,
                  content: parsed.component,
                  timestamp: new Date()
                };
                setArtifacts(prev => [...prev, artifact]);
              }
            } catch (e) {
              // Not JSON, might be plain text
              console.debug('Non-JSON chunk:', data);
            }
          }
        }
      }

      // Mark streaming as complete
      setFeedbackSteps(prev => prev.map(step =>
        step.id === currentStepId
          ? { ...step, status: 'success', title: 'DeepSeek response' }
          : step
      ));

      // Add assistant message to conversation
      const assistantMessage: ConversationMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date()
      };
      setConversation(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Streaming error:', error);
      setFeedbackSteps(prev => prev.map(step =>
        step.id === currentStepId
          ? { ...step, status: 'error', content: 'Error during streaming' }
          : step
      ));
    }
  };

  /**
   * Handle feedback review
   */
  const handleReview = (id: string, approved: boolean) => {
    console.log(`Feedback ${id} ${approved ? 'approved' : 'rejected'}`);
    // Could save review status to backend
  };

  /**
   * Clear conversation and feedback
   */
  const handleClear = () => {
    if (confirm('Clear all conversation history and feedback?')) {
      setConversation([]);
      setFeedbackSteps([]);
      setArtifacts([]);
    }
  };

  /**
   * Export artifacts
   */
  const handleExport = () => {
    const exportData = {
      conversation,
      feedbackSteps,
      artifacts,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-session-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Prompt Dashboard</h1>
              <p className="text-sm text-gray-500">AI-powered workflow generation with DeepSeek</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <Sparkles className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">{selectedModel}</span>
            </div>
            
            <button
              onClick={handleExport}
              disabled={artifacts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </button>

            <button
              onClick={handleClear}
              disabled={conversation.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{conversation.length} messages</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
            <Layers className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">{feedbackSteps.length} steps</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
            <Database className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">{artifacts.length} artifacts</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Prompt Input */}
        <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Enter Your Prompt</h2>
            <PromptInput
              onSend={handleSendPrompt}
              loading={isProcessing}
              aiModel={selectedModel}
              onModelChange={setSelectedModel}
              supportedModels={['deepseek-r1', 'deepseek-chat', 'gpt-4']}
              showExamples={conversation.length === 0}
            />
          </div>
        </div>

        {/* Right Panel - Tabs */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex gap-1">
              {[
                { id: 'feedback', label: 'Step-by-Step Feedback', icon: Layers },
                { id: 'conversation', label: 'Conversation', icon: MessageSquare },
                { id: 'artifacts', label: 'Generated Artifacts', icon: Database }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'feedback' && (
              <div className="space-y-4">
                {feedbackSteps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Layers className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium">No feedback yet</p>
                    <p className="text-sm">Enter a prompt to see step-by-step feedback</p>
                  </div>
                ) : (
                  <>
                    {feedbackSteps.map((step) => (
                      <FeedbackCard
                        key={step.id}
                        {...step}
                        onReview={handleReview}
                        defaultExpanded={step.status === 'processing' || feedbackSteps.indexOf(step) === feedbackSteps.length - 1}
                      />
                    ))}
                    <div ref={feedbackEndRef} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'conversation' && (
              <div className="space-y-4">
                {conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <MessageSquare className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Start a conversation with DeepSeek</p>
                  </div>
                ) : (
                  <>
                    {conversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'p-4 rounded-lg',
                          msg.role === 'user'
                            ? 'bg-blue-50 border border-blue-200 ml-12'
                            : 'bg-gray-50 border border-gray-200 mr-12'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">
                            {msg.role === 'user' ? 'You' : 'DeepSeek'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-gray-700">{msg.content}</div>
                      </div>
                    ))}
                    <div ref={conversationEndRef} />
                  </>
                )}
              </div>
            )}

            {activeTab === 'artifacts' && (
              <div className="space-y-4">
                {artifacts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Database className="h-12 w-12 mb-3" />
                    <p className="text-lg font-medium">No artifacts generated</p>
                    <p className="text-sm">Schemas and components will appear here</p>
                  </div>
                ) : (
                  <>
                    {artifacts.map((artifact) => (
                      <div key={artifact.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{artifact.name}</h3>
                            <p className="text-sm text-gray-500">
                              Type: {artifact.type} • {artifact.timestamp.toLocaleString()}
                            </p>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                            View
                          </button>
                        </div>
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-64">
                          {JSON.stringify(artifact.content, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDashboard;
