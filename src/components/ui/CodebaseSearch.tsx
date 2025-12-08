/**
 * CodebaseSearch Component
 * 
 * A reusable component for semantic search across the codebase
 * Uses mxbai-embed-large embeddings for high-quality search results
 * 
 * Features:
 * - Semantic search with similarity scores
 * - Context retrieval for AI prompts
 * - Model switching support
 * - Real-time search results
 */

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Code, 
  FileCode, 
  Brain, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Copy,
  Check,
  Database,
  Zap,
  Settings
} from 'lucide-react';
import { Button } from './Button';
import { useCodebaseIndex, CodebaseSearchResult, EmbeddingModel } from '@/hooks/useCodebaseIndex';

export interface CodebaseSearchProps {
  /** Callback when search results are returned */
  onSearchResults?: (results: CodebaseSearchResult[]) => void;
  /** Callback when context is retrieved (for AI integration) */
  onContextRetrieved?: (context: string, files: string[]) => void;
  /** Whether to show the model selector */
  showModelSelector?: boolean;
  /** Whether to show statistics */
  showStats?: boolean;
  /** Placeholder text for the search input */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Default number of results */
  defaultTopK?: number;
  /** Default similarity threshold */
  defaultThreshold?: number;
}

export const CodebaseSearch: React.FC<CodebaseSearchProps> = ({
  onSearchResults,
  onContextRetrieved,
  showModelSelector = true,
  showStats = true,
  placeholder = 'Search codebase semantically...',
  className,
  defaultTopK = 10,
  defaultThreshold = 0.5,
}) => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(defaultTopK);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [contextMode, setContextMode] = useState(false);

  const {
    isLoading,
    isIndexing,
    error,
    searchResults,
    context,
    stats,
    models,
    currentModel,
    search,
    getContext,
    fetchStats,
    fetchModels,
    switchModel,
    buildIndex,
  } = useCodebaseIndex();

  // Fetch stats and models on mount
  useEffect(() => {
    fetchStats();
    fetchModels();
  }, [fetchStats, fetchModels]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    if (contextMode) {
      const ctx = await getContext(query, { maxTokens: 4000, topK });
      if (ctx && onContextRetrieved) {
        onContextRetrieved(ctx.context, ctx.files);
      }
    } else {
      const results = await search(query, { topK, threshold });
      if (onSearchResults) {
        onSearchResults(results);
      }
    }
  }, [query, contextMode, topK, threshold, search, getContext, onSearchResults, onContextRetrieved]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Copy code to clipboard
  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Toggle result expansion
  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with stats */}
      {showStats && stats && (
        <div className="flex items-center gap-4 text-sm text-on-surface-variant">
          <div className="flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <span>{stats.fileCount} files indexed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code className="h-4 w-4" />
            <span>{stats.chunkCount} code chunks</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Brain className="h-4 w-4" />
            <span>{currentModel}</span>
          </div>
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl border-2 border-outline bg-surface p-2 focus-within:border-primary transition-colors">
          <Search className="h-5 w-5 text-on-surface-variant ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-2 py-2 text-base text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            disabled={isLoading}
          />
          
          {/* Mode toggle */}
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setContextMode(false)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                !contextMode 
                  ? 'bg-primary text-on-primary' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              Search
            </button>
            <button
              onClick={() => setContextMode(true)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                contextMode 
                  ? 'bg-primary text-on-primary' 
                  : 'text-on-surface-variant hover:bg-surface-container-highest'
              )}
            >
              AI Context
            </button>
          </div>

          <Button
            variant="filled"
            size="sm"
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            {contextMode ? 'Get Context' : 'Search'}
          </Button>
        </div>

        {/* Advanced options toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-on-surface-variant mt-2 hover:text-on-surface transition-colors"
        >
          <Settings className="h-3 w-3" />
          Advanced options
          {showAdvanced ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Advanced options */}
      {showAdvanced && (
        <div className="flex flex-wrap gap-4 p-4 rounded-xl bg-surface-container border border-outline">
          <div className="flex items-center gap-2">
            <label className="text-sm text-on-surface-variant">Results:</label>
            <input
              type="number"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value) || 10)}
              min={1}
              max={50}
              className="w-16 px-2 py-1 rounded border border-outline bg-surface text-on-surface text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-on-surface-variant">Threshold:</label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 0.5)}
              min={0}
              max={1}
              step={0.1}
              className="w-20 px-2 py-1 rounded border border-outline bg-surface text-on-surface text-sm"
            />
          </div>
          
          {/* Model selector */}
          {showModelSelector && models.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-on-surface-variant">Model:</label>
              <select
                value={currentModel}
                onChange={(e) => switchModel(e.target.value)}
                className="px-2 py-1 rounded border border-outline bg-surface text-on-surface text-sm"
                disabled={isLoading}
              >
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name} {model.recommended && '⭐'}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <Button
            variant="outlined"
            size="sm"
            onClick={() => buildIndex({ incremental: true })}
            disabled={isIndexing}
            className="gap-1"
          >
            {isIndexing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
            {isIndexing ? 'Indexing...' : 'Rebuild Index'}
          </Button>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container">
          {error}
        </div>
      )}

      {/* Context display */}
      {contextMode && context && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface">
              AI Context Retrieved
            </h3>
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span>~{context.tokenEstimate} tokens</span>
              <span>•</span>
              <span>{context.files.length} files</span>
            </div>
          </div>
          
          <div className="relative">
            <pre className="p-4 rounded-xl bg-surface-container-highest text-on-surface text-sm overflow-x-auto max-h-96">
              {context.context}
            </pre>
            <button
              onClick={() => handleCopy(context.context, 'context')}
              className="absolute top-2 right-2 p-2 rounded-lg bg-surface hover:bg-surface-container transition-colors"
            >
              {copiedId === 'context' ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4 text-on-surface-variant" />
              )}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {context.files.map((file, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs"
              >
                {file}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {!contextMode && searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-on-surface">
            {searchResults.length} Results
          </h3>
          
          <div className="space-y-2">
            {searchResults.map((result) => (
              <div
                key={result.id}
                className="rounded-xl border border-outline bg-surface overflow-hidden transition-shadow hover:shadow-level-1"
              >
                {/* Result header */}
                <div
                  onClick={() => toggleExpand(result.id)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-container-lowest"
                >
                  <div className="flex items-center gap-3">
                    <FileCode className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-on-surface">{result.relativePath}</p>
                      <p className="text-sm text-on-surface-variant">
                        Lines {result.startLine}-{result.endLine} • {result.fileType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-16 h-2 rounded-full bg-surface-container-highest overflow-hidden"
                      >
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${result.similarity * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-on-surface-variant">
                        {(result.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                    {expandedResult === result.id ? (
                      <ChevronUp className="h-5 w-5 text-on-surface-variant" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-on-surface-variant" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {expandedResult === result.id && (
                  <div className="border-t border-outline">
                    <div className="relative">
                      <pre className="p-4 bg-surface-container-highest text-on-surface text-sm overflow-x-auto max-h-64">
                        <code>{result.content}</code>
                      </pre>
                      <button
                        onClick={() => handleCopy(result.content, result.id)}
                        className="absolute top-2 right-2 p-2 rounded-lg bg-surface hover:bg-surface-container transition-colors"
                      >
                        {copiedId === result.id ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <Copy className="h-4 w-4 text-on-surface-variant" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && searchResults.length === 0 && !context && query && (
        <div className="text-center py-8 text-on-surface-variant">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No results found. Try a different search query.</p>
        </div>
      )}
    </div>
  );
};

export default CodebaseSearch;
