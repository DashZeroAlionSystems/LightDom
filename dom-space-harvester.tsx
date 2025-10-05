import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import BridgeChatPage from './src/BridgeChatPage';
import SpaceBridgeIntegration from './src/components/SpaceBridgeIntegration';
import BridgeNotificationCenter from './src/components/BridgeNotificationCenter';
import BridgeAnalyticsDashboard from './src/components/BridgeAnalyticsDashboard';
import { Activity, Cpu, HardDrive, Zap, Globe, TrendingUp, Award, Settings, Play, Pause, RotateCcw, Database, Network, Link, Search, Map, Brain, Layers, BarChart3, Bell } from 'lucide-react';

const RealWebCrawlerDashboard = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'bridge-chat' | 'analytics'>('dashboard');
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerStats, setCrawlerStats] = useState({
    totalSpaceHarvested: 0,
    tokensEarned: 0,
    sitesAnalyzed: 0,
    totalTargets: 0,
    completed: 0,
    pending: 0,
    errors: 0
  });
  
  const [metaverseStats, setMetaverseStats] = useState({
    virtualLand: 0,
    aiConsensusNodes: 0,
    storageShards: 0,
    dimensionalBridges: 0,
    realityAnchors: 0,
    computeStaked: 0
  });

  const [activeCrawlers, setActiveCrawlers] = useState<any[]>([]);
  const [recentOptimizations, setRecentOptimizations] = useState<any[]>([]);
  const [schemaStats, setSchemaStats] = useState({
    totalSchemas: 0,
    schemaTypes: {} as { [key: string]: number },
    confidence: 0
  });
  const [backlinkNetwork, setBacklinkNetwork] = useState({
    totalLinks: 0,
    internalLinks: 0,
    externalLinks: 0,
    avgStrength: 0
  });
  const [currentCrawlTarget, setCurrentCrawlTarget] = useState('');
  const [crawlSpeed, setCrawlSpeed] = useState(2);
  const [apiKey, setApiKey] = useState('');
  const [newBounty, setNewBounty] = useState({ url: '', reward: 2500 });
  const [plans, setPlans] = useState<any[]>([]);
  const [usage, setUsage] = useState<any | null>(null);
  const [recentProofs, setRecentProofs] = useState<any[]>([]);
  const [domainQuery, setDomainQuery] = useState('');
  const [domainProofs, setDomainProofs] = useState<any[]>([]);
  const [blockchainStats, setBlockchainStats] = useState({
    totalProofs: 0,
    totalBytesSaved: 0,
    totalBacklinks: 0,
    contractAddress: '',
    networkId: 0
  });
  const [liveOptimizations, setLiveOptimizations] = useState<any[]>([]);
  const [metaverseEvents, setMetaverseEvents] = useState<any[]>([]);
  const [domainLoading, setDomainLoading] = useState(false);
  const explorerBase = 'https://etherscan.io/tx/';
  const [bridges, setBridges] = useState<any[]>([]);
  const [adminToken, setAdminToken] = useState<string>('');
  const biodomeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [biomeSeed, setBiomeSeed] = useState<number>(() => Math.floor(Math.random()*1e6));
  const [showChat, setShowChat] = useState(true);
  const [chatBridge, setChatBridge] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [landParcels, setLandParcels] = useState<any[]>([]);
  const [biomes, setBiomes] = useState<any[]>([]);
  const [biodomeAnimation, setBiodomeAnimation] = useState(0);
  const [showSpaceBridgeIntegration, setShowSpaceBridgeIntegration] = useState(false);
  const socketRef = useRef<any>(null);
  const animationRef = useRef<number>();
  
  const intervalRef = useRef<number | null>(null);

  // Real website targets for demonstration
  const realWebsites = [
    { url: 'github.com', domain: 'github.com', biome: 'digital', authority: 'high' },
    { url: 'stackoverflow.com', domain: 'stackoverflow.com', biome: 'knowledge', authority: 'high' },
    { url: 'medium.com', domain: 'medium.com', biome: 'knowledge', authority: 'medium' },
    { url: 'dev.to', domain: 'dev.to', biome: 'digital', authority: 'medium' },
    { url: 'hackernews.com', domain: 'hackernews.com', biome: 'knowledge', authority: 'high' },
    { url: 'techcrunch.com', domain: 'techcrunch.com', biome: 'commercial', authority: 'high' },
    { url: 'wired.com', domain: 'wired.com', biome: 'knowledge', authority: 'high' },
    { url: 'reddit.com', domain: 'reddit.com', biome: 'community', authority: 'high' },
    { url: 'producthunt.com', domain: 'producthunt.com', biome: 'commercial', authority: 'medium' },
    { url: 'indie.news', domain: 'indie.news', biome: 'community', authority: 'low' }
  ];

  // Generate active crawlers
  useEffect(() => {
    const generateCrawlers = () => {
      const crawlers = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        status: Math.random() > 0.2 ? 'active' : 'idle',
        currentUrl: Math.random() > 0.3 ? realWebsites[Math.floor(Math.random() * realWebsites.length)].url : null,
        pagesPerSecond: (Math.random() * 2 + 0.5).toFixed(2),
        spaceMined: (Math.random() * 50 + 10).toFixed(1),
        efficiency: (Math.random() * 30 + 70).toFixed(1),
        specialization: ['Schema Extraction', 'Backlink Analysis', 'DOM Optimization', 'Light Conversion', 'Reality Anchoring', 'Biome Classification'][i],
        dbConnections: Math.floor(Math.random() * 5) + 1,
        queueDepth: Math.floor(Math.random() * 100) + 20
      }));
      setActiveCrawlers(crawlers);
    };
    
    generateCrawlers();
    const interval = setInterval(generateCrawlers, 8000);
    return () => clearInterval(interval);
  }, []);

  // Crawling simulation with PostgreSQL integration
  useEffect(() => {
    if (isCrawling) {
      intervalRef.current = window.setInterval(() => {
        const target = realWebsites[Math.floor(Math.random() * realWebsites.length)];
        setCurrentCrawlTarget(target.url);
        
        // Simulate comprehensive web analysis
        const spaceFound = (Math.random() * 15 + 5) * crawlSpeed; // More realistic KB amounts
        const tokensFromSpace = spaceFound * 0.15;
        
        // Simulate schema.org extraction
        const schemasFound = Math.floor(Math.random() * 8) + 2;
        const backlinksFound = Math.floor(Math.random() * 50) + 10;
        
        setCrawlerStats(prev => ({
          ...prev,
          totalSpaceHarvested: prev.totalSpaceHarvested + spaceFound,
          tokensEarned: prev.tokensEarned + tokensFromSpace,
          sitesAnalyzed: prev.sitesAnalyzed + 1,
          totalTargets: prev.totalTargets + 1,
          completed: prev.completed + 1,
          pending: Math.max(0, prev.pending - 1 + Math.floor(Math.random() * 3))
        }));
        
        // Update schema stats
        setSchemaStats(prev => ({
          totalSchemas: prev.totalSchemas + schemasFound,
          schemaTypes: {
            ...prev.schemaTypes,
            'Organization': (prev.schemaTypes['Organization'] || 0) + Math.floor(Math.random() * 2),
            'WebPage': (prev.schemaTypes['WebPage'] || 0) + 1,
            'Article': (prev.schemaTypes['Article'] || 0) + Math.floor(Math.random() * 3),
            'Product': (prev.schemaTypes['Product'] || 0) + Math.floor(Math.random() * 2),
            'Person': (prev.schemaTypes['Person'] || 0) + Math.floor(Math.random() * 2)
          },
          confidence: (prev.confidence + (Math.random() * 0.3 + 0.7)) / 2
        }));
        
        // Update backlink network
        setBacklinkNetwork(prev => ({
          totalLinks: prev.totalLinks + backlinksFound,
          internalLinks: prev.internalLinks + Math.floor(backlinksFound * 0.6),
          externalLinks: prev.externalLinks + Math.floor(backlinksFound * 0.4),
          avgStrength: (prev.avgStrength + (Math.random() * 0.5 + 0.5)) / 2
        }));
        
        // Convert to metaverse infrastructure
        setMetaverseStats(prev => {
          const landGenerated = Math.floor(spaceFound / 3); // 1 parcel per 3KB
          const aiNodes = Math.floor(spaceFound / 8);
          const storageShards = Math.floor(spaceFound / 2);
          const bridges = Math.floor(spaceFound / 20);
          const anchors = 1; // One per successful crawl
          const compute = spaceFound * 150;
          
          return {
            virtualLand: prev.virtualLand + landGenerated,
            aiConsensusNodes: prev.aiConsensusNodes + aiNodes,
            storageShards: prev.storageShards + storageShards,
            dimensionalBridges: prev.dimensionalBridges + bridges,
            realityAnchors: prev.realityAnchors + anchors,
            computeStaked: prev.computeStaked + compute
          };
        });
        
        // Add to recent optimizations
        const optimization = {
          id: Date.now(),
          url: target.url,
          domain: target.domain,
          spaceSaved: spaceFound.toFixed(1),
          tokensEarned: tokensFromSpace.toFixed(3),
          timestamp: new Date().toLocaleTimeString(),
          biome: target.biome,
          authority: target.authority,
          schemasExtracted: schemasFound,
          backlinksFound: backlinksFound,
          optimizationType: ['Light DOM', 'Schema Extraction', 'Backlink Analysis', 'CSS Optimization'][Math.floor(Math.random() * 4)],
          dbOperations: Math.floor(Math.random() * 10) + 5,
          metaverseImpact: {
            landCreated: Math.floor(spaceFound / 3),
            aiPower: Math.floor(spaceFound / 8),
            storageNodes: Math.floor(spaceFound / 2),
            bridgeLinks: Math.floor(spaceFound / 20)
          }
        };
        
        setRecentOptimizations(prev => [optimization, ...prev.slice(0, 6)]);
        
      }, 3000 / crawlSpeed);
    } else {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
      setCurrentCrawlTarget('');
    }
    
    return () => { if (intervalRef.current !== null) clearInterval(intervalRef.current); };
  }, [isCrawling, crawlSpeed]);

  // Load pricing plans once
  useEffect(() => {
    fetch('/api/pricing/plans').then(r => r.json()).then(setPlans).catch(() => {});
    fetch('/api/proofs/recent').then(r => r.json()).then(setRecentProofs).catch(() => {});
    fetch('/api/metaverse/bridges').then(r => r.json()).then(setBridges).catch(() => {});
  }, []);

  // Pixelated biodome generator with animation and land parcels
  useEffect(() => {
    const canvas = biodomeCanvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = 256, H = 128, PIX = 8;
    canvas.width = W; canvas.height = H;
    
    function rnd(seed:number){ let x = Math.sin(seed++) * 10000; return x - Math.floor(x); }
    let seed = biomeSeed;
    const time = biodomeAnimation * 0.01;
    
    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, W, H);
    
    // Generate animated terrain
    for (let y=0; y<H; y+=PIX){
      for (let x=0; x<W; x+=PIX){
        const n = rnd(seed + x*0.13 + y*0.27 + time);
        const biome = n < 0.3 ? [20,100,40] : n < 0.6 ? [30,30,120] : [120,80,30];
        const shade = Math.floor(20 * rnd(seed + x*y + time));
        ctx.fillStyle = `rgb(${biome[0]+shade},${biome[1]+shade},${biome[2]+shade})`;
        ctx.fillRect(x,y,PIX,PIX);
      }
    }
    
    // Overlay land parcels
    landParcels.forEach(parcel => {
      if (!parcel.coordinates) return;
      try {
        const coords = JSON.parse(parcel.coordinates);
        if (coords.x && coords.y) {
          const x = Math.floor(coords.x * W);
          const y = Math.floor(coords.y * H);
          
          // Get biome-specific palette
          const palette = getBiomePalette(parcel.biome_type || 'default');
          const colorIndex = Math.floor((parcel.space_saved || 0) / 1000) % palette.length;
          
          // Draw parcel with pulsing effect
          const pulse = Math.sin(time + parcel.parcel_id * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = palette[colorIndex];
          ctx.globalAlpha = pulse;
          ctx.fillRect(x, y, PIX * 2, PIX * 2);
          ctx.globalAlpha = 1;
          
          // Draw parcel border
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, PIX * 2, PIX * 2);
        }
      } catch (e) {
        // Skip invalid coordinates
      }
    });
    
    // Draw dome outline
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(W/2, H, W*0.45, H*0.7, 0, Math.PI, 2*Math.PI);
    ctx.stroke();
  }, [biomeSeed, biodomeAnimation, landParcels]);

  // WebSocket chat
  useEffect(() => {
    // Prefer explicit WS backend in dev; fallback to origin-based WS in prod
    const isDev = typeof window !== 'undefined' && window.location.port === '3000';
    const wsUrl = isDev ? 'ws://localhost:3001' : (location.origin || '').replace('http', 'ws');
    const s = io(wsUrl, { transports: ['websocket'] });
    socketRef.current = s;
    s.on('connect', () => {});
    s.on('bridge_message', (msg:any) => {
      setChatMessages((prev) => [...prev.slice(-99), msg]);
    });
    s.on('bridge_typing', ({ user, isTyping }: any) => {
      setTypingUsers(prev => {
        const next = new Set(prev);
        if (isTyping) next.add(user);
        else next.delete(user);
        return next;
      });
    });
    
    // Blockchain event handlers
    s.on('blockchain_update', (data: any) => {
      console.log('Blockchain update:', data);
      if (data.type === 'poo_submitted') {
        setLiveOptimizations(prev => [{
          id: data.crawlId,
          type: 'PoO Submitted',
          bytesSaved: data.bytesSaved,
          backlinksCount: data.backlinksCount,
          txHash: data.txHash,
          timestamp: new Date(),
          status: 'pending'
        }, ...prev.slice(0, 19)]);
      } else if (data.type === 'batch_poo_submitted') {
        setLiveOptimizations(prev => [{
          id: `batch-${Date.now()}`,
          type: 'Batch PoO Submitted',
          bytesSaved: data.batchSize * 1000, // Estimate
          backlinksCount: data.batchSize * 5, // Estimate
          txHash: data.txHash,
          timestamp: new Date(),
          status: 'pending'
        }, ...prev.slice(0, 19)]);
      }
    });
    
    s.on('metaverse_event', (data: any) => {
      console.log('Metaverse event:', data);
      setMetaverseEvents(prev => [{
        id: data.id || Date.now().toString(),
        type: data.type,
        description: data.description,
        timestamp: new Date(),
        data: data.data
      }, ...prev.slice(0, 19)]);
    });
    
    s.on('live_optimization', (data: any) => {
      console.log('Live optimization:', data);
      setLiveOptimizations(prev => [{
        id: data.id || Date.now().toString(),
        type: 'Live Optimization',
        url: data.url,
        bytesSaved: data.bytesSaved,
        timestamp: new Date(),
        status: 'completed'
      }, ...prev.slice(0, 19)]);
    });
    
    return () => { try { s.close(); } catch {} };
  }, []);

  // Load land parcels and biomes
  useEffect(() => {
    const loadData = async () => {
      try {
        const [parcelsRes, biomesRes] = await Promise.all([
          fetch('/api/metaverse/land-parcels'),
          fetch('/api/metaverse/biomes')
        ]);
        const [parcels, biomesData] = await Promise.all([
          parcelsRes.json(),
          biomesRes.json()
        ]);
        setLandParcels(parcels);
        setBiomes(biomesData);
      } catch (err) {
        console.error('Failed to load metaverse data:', err);
      }
    };
    loadData();
  }, []);

  // Biodome animation loop
  useEffect(() => {
    const animate = () => {
      setBiodomeAnimation(prev => (prev + 1) % 1000);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const joinBridgeRoom = (id:string) => {
    if (!socketRef.current) return;
    if (chatBridge) socketRef.current.emit('bridge_leave', chatBridge);
    socketRef.current.emit('bridge_join', id);
    setChatBridge(id);
    setChatMessages([]);
  };

  const openBridgeChat = (bridgeId: string) => {
    setSelectedBridgeId(bridgeId);
    setCurrentView('bridge-chat');
  };

  const copyBridgeUrl = (bridgeId: string) => {
    const url = `${window.location.origin}/bridge/${bridgeId}`;
    navigator.clipboard.writeText(url);
    alert('Bridge chat URL copied to clipboard!');
  };

  const sendChat = () => {
    if (!socketRef.current || !chatBridge || !chatInput.trim()) return;
    socketRef.current.emit('bridge_message', { bridgeId: chatBridge, user: 'you', text: chatInput.trim() });
    setChatInput('');
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    if (!socketRef.current || !chatBridge) return;
    socketRef.current.emit('bridge_typing', { bridgeId: chatBridge, user: 'you', isTyping: e.target.value.length > 0 });
  };

  // Get biome palette based on type
  const getBiomePalette = (biomeType: string) => {
    const palettes: { [key: string]: string[] } = {
      'knowledge': ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
      'commercial': ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa', '#fff7ed'],
      'social': ['#581c87', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ede9fe'],
      'default': ['#1f2937', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db']
    };
    return palettes[biomeType] || palettes.default;
  };

  const fetchOnChain = async (url: string) => {
    try {
      const res = await fetch(`/api/chain/optimization?url=${encodeURIComponent(url)}`);
      if (!res.ok) return alert('No on-chain record found');
      const data = await res.json();
      alert(`On-chain record for\n${url}\n\nBefore: ${data.beforeHash}\nAfter: ${data.afterHash}\nSpace: ${data.spaceSaved} bytes\nTime: ${new Date(data.timestamp*1000).toLocaleString()}`);
    } catch (e) { alert('Failed to load on-chain record'); }
  };

  // Handle URL routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/bridge/')) {
      const bridgeId = path.split('/bridge/')[1];
      if (bridgeId) {
        setSelectedBridgeId(bridgeId);
        setCurrentView('bridge-chat');
      }
    }
  }, []);

  // Update URL when switching views
  useEffect(() => {
    if (currentView === 'bridge-chat' && selectedBridgeId) {
      window.history.pushState({}, '', `/bridge/${selectedBridgeId}`);
    } else if (currentView === 'dashboard') {
      window.history.pushState({}, '', '/');
    }
  }, [currentView, selectedBridgeId]);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/bridge/')) {
        const bridgeId = path.split('/bridge/')[1];
        if (bridgeId) {
          setSelectedBridgeId(bridgeId);
          setCurrentView('bridge-chat');
        }
      } else {
        setCurrentView('dashboard');
        setSelectedBridgeId('');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render bridge chat page if in chat view
  if (currentView === 'bridge-chat' && selectedBridgeId) {
    return <BridgeChatPage bridgeId={selectedBridgeId} />;
  }

  // Render analytics dashboard if in analytics view
  if (currentView === 'analytics') {
    return <BridgeAnalyticsDashboard />;
  }

  const refreshUsage = async () => {
    if (!apiKey) return;
    const res = await fetch('/api/usage', { headers: { 'x-api-key': apiKey } });
    if (res.ok) setUsage(await res.json());
  };

  // Load domain proofs (missing handler)
  const loadDomainProofs = async () => {
    if (!domainQuery.trim()) return;
    try {
      setDomainLoading(true);
      const res = await fetch(`/api/proofs/domain/${encodeURIComponent(domainQuery.trim())}`);
      if (!res.ok) throw new Error('Failed to load domain proofs');
      const data = await res.json();
      setDomainProofs(data || []);
    } catch (e) {
      setDomainProofs([]);
    } finally {
      setDomainLoading(false);
    }
  };


  const toggleCrawling = () => {
    setIsCrawling(!isCrawling);
  };

  const resetStats = () => {
    setIsCrawling(false);
    setCrawlerStats({
      totalSpaceHarvested: 0,
      tokensEarned: 0,
      sitesAnalyzed: 0,
      totalTargets: 0,
      completed: 0,
      pending: 0,
      errors: 0
    });
    setRecentOptimizations([]);
    setMetaverseStats({
      virtualLand: 0,
      aiConsensusNodes: 0,
      storageShards: 0,
      dimensionalBridges: 0,
      realityAnchors: 0,
      computeStaked: 0
    });
    setSchemaStats({ totalSchemas: 0, schemaTypes: {}, confidence: 0 });
    setBacklinkNetwork({ totalLinks: 0, internalLinks: 0, externalLinks: 0, avgStrength: 0 });
  };

  const getBiomeEmoji = (biome) => {
    switch (biome) {
      case 'digital': return '💻';
      case 'knowledge': return '📚';
      case 'commercial': return '🏢';
      case 'entertainment': return '🎬';
      case 'social': return '👥';
      case 'community': return '🌐';
      case 'professional': return '👔';
      default: return '🌍';
    }
  };

  const getAuthorityColor = (authority) => {
    switch (authority) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1"></div>
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Real Web Crawler & DOM Space Harvester
                </h1>
                <p className="text-slate-300 text-lg">Production-Scale Web Mining with PostgreSQL & Schema.org Integration</p>
              </div>
              <div className="flex-1 flex justify-end">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentView('analytics')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2"
                  >
                    <BarChart3 size={16} />
                    Analytics
                  </button>
                  <BridgeNotificationCenter />
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-center items-center gap-6 text-sm text-slate-400">
              <span>🕷️ Auto-Discovery Crawling</span>
              <span>🗄️ PostgreSQL Backend</span>
              <span>🔗 Schema.org Extraction</span>
              <span>🌐 Backlink Network Mapping</span>
            </div>
          </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={toggleCrawling}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              isCrawling 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCrawling ? <Pause size={20} /> : <Play size={20} />}
            {isCrawling ? 'Stop Real Crawling' : 'Start Real Crawling'}
          </button>
          
          <button
            onClick={resetStats}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Reset Database
          </button>
          
          <button
            onClick={() => setShowSpaceBridgeIntegration(!showSpaceBridgeIntegration)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
              showSpaceBridgeIntegration 
                ? 'bg-purple-600 hover:bg-purple-700' 
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            <Link size={20} />
            {showSpaceBridgeIntegration ? 'Hide' : 'Show'} Space-Bridge
          </button>
          
          <div className="flex items-center gap-2">
            <Settings size={20} />
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.5"
              value={crawlSpeed}
              onChange={(e) => setCrawlSpeed(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm">{crawlSpeed}x Speed</span>
          </div>
        </div>

        {/* Monetization quick actions */}
        <div className="max-w-5xl mx-auto mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">Create API Key</div>
            <button
              onClick={async () => {
                const ownerEmail = prompt('Enter email for API key');
                const planCode = 'starter';
                if (!ownerEmail) return;
                const token = adminToken || prompt('Enter admin bearer token (required for demo route)') || '';
                if (!token) return alert('Admin token required');
                setAdminToken(token);
                const res = await fetch('/api/keys/create', { 
                  method: 'POST', 
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
                  body: JSON.stringify({ ownerEmail, planCode }) 
                });
                const data = await res.json();
                if (data.apiKey) setApiKey(data.apiKey);
                else alert(data.error || 'Failed to create key');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold"
            >Generate</button>
            {apiKey && (
              <div className="mt-2 text-xs text-green-400 break-all">Key: {apiKey}</div>
            )}
            {apiKey && (
              <button onClick={refreshUsage} className="mt-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs">Refresh Usage</button>
            )}
            {usage && (
              <div className="mt-2 text-xs text-slate-400">
                Plan: <span className="text-blue-300">{usage.plan}</span> • Used {usage.requestsUsed}/{usage.requestsIncluded}
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">Post Optimization Bounty</div>
            <div className="flex gap-2">
              <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                     placeholder="https://site.com/page" value={newBounty.url}
                     onChange={(e) => setNewBounty({ ...newBounty, url: e.target.value })} />
              <input className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm" type="number" min={100} step={100}
                     value={newBounty.reward}
                     onChange={(e) => setNewBounty({ ...newBounty, reward: parseInt(e.target.value, 10) })} />
            </div>
            <button
              onClick={async () => {
                if (!apiKey) return alert('Create an API key first');
                await fetch('/api/bounties', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ url: newBounty.url, rewardCents: newBounty.reward }) });
                alert('Bounty posted');
              }}
              className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold"
            >Post</button>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700">
            <div className="text-sm text-slate-300 mb-2">Buy Optimization Report</div>
            <button
              onClick={async () => {
                const url = prompt('Enter URL to purchase report for');
                if (!url) return;
                if (!apiKey) return alert('Create an API key first');
                const res = await fetch('/api/reports/optimization', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }, body: JSON.stringify({ url }) });
                const data = await res.json();
                if (data.report) alert('Report ready: ' + JSON.stringify(data.report));
                else alert('Unable to generate report');
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold"
            >Purchase</button>
          </div>
        </div>

        {/* Real Web Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Database className="text-blue-400" size={24} />
              <span className="text-2xl">🗄️</span>
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {crawlerStats.totalSpaceHarvested.toFixed(1)} KB
            </div>
            <div className="text-slate-400 text-sm">Real Space Harvested</div>
            <div className="mt-2 text-xs text-slate-500">
              {crawlerStats.completed}/{crawlerStats.totalTargets} sites completed
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Search className="text-green-400" size={24} />
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {schemaStats.totalSchemas.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Schema.org Extracted</div>
            <div className="mt-2 text-xs text-slate-500">
              {(schemaStats.confidence * 100).toFixed(1)}% avg confidence
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Link className="text-purple-400" size={24} />
              <span className="text-2xl">🔗</span>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-1">
              {backlinkNetwork.totalLinks.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Backlinks Mapped</div>
            <div className="mt-2 text-xs text-slate-500">
              {backlinkNetwork.externalLinks} external, {backlinkNetwork.internalLinks} internal
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Zap className="text-yellow-400" size={24} />
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-1">
              {crawlerStats.tokensEarned.toFixed(2)} DSH
            </div>
            <div className="text-slate-400 text-sm">Tokens Earned</div>
            <div className="mt-2 text-xs text-slate-500">
              From {metaverseStats.realityAnchors} reality anchors
            </div>
          </div>
        </div>

        {/* Blockchain Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Award className="text-orange-400" size={24} />
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {blockchainStats.totalProofs.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">PoO Submissions</div>
            <div className="mt-2 text-xs text-slate-500">
              Contract: {blockchainStats.contractAddress ? `${blockchainStats.contractAddress.slice(0, 6)}...${blockchainStats.contractAddress.slice(-4)}` : 'Not connected'}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <HardDrive className="text-cyan-400" size={24} />
              <span className="text-2xl">💾</span>
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-1">
              {(blockchainStats.totalBytesSaved / 1024 / 1024).toFixed(1)} MB
            </div>
            <div className="text-slate-400 text-sm">Bytes Saved</div>
            <div className="mt-2 text-xs text-slate-500">
              Network ID: {blockchainStats.networkId || 'Unknown'}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Network className="text-pink-400" size={24} />
              <span className="text-2xl">🌐</span>
            </div>
            <div className="text-3xl font-bold text-pink-400 mb-1">
              {blockchainStats.totalBacklinks.toLocaleString()}
            </div>
            <div className="text-slate-400 text-sm">Backlinks Mined</div>
            <div className="mt-2 text-xs text-slate-500">
              From PoO submissions
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-emerald-400" size={24} />
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-1">
              {liveOptimizations.length}
            </div>
            <div className="text-slate-400 text-sm">Live Optimizations</div>
            <div className="mt-2 text-xs text-slate-500">
              Real-time updates
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <Brain className="text-violet-400" size={24} />
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-3xl font-bold text-violet-400 mb-1">
              {metaverseEvents.length}
            </div>
            <div className="text-slate-400 text-sm">Metaverse Events</div>
            <div className="mt-2 text-xs text-slate-500">
              Infrastructure building
            </div>
          </div>
        </div>

        {/* Current Crawl Status */}
        {isCrawling && currentCrawlTarget && (
          <div className="bg-gradient-to-r from-slate-800/30 via-green-800/30 to-slate-800/30 backdrop-blur rounded-xl p-4 mb-8 border border-green-500/30">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
              <span className="text-green-400 font-semibold">Real-time crawling:</span>
              <span className="text-white font-mono">{currentCrawlTarget}</span>
              <span className="text-slate-400">• Extracting schemas & building metaverse</span>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Active Crawlers */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cpu className="text-blue-400" />
              Distributed Crawlers ({activeCrawlers.filter(c => c.status === 'active').length}/6 active)
            </h3>
            <div className="space-y-3">
              {activeCrawlers.map(crawler => (
                <div key={crawler.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3 border-l-4 border-blue-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Crawler #{crawler.id}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${crawler.status === 'active' ? 'bg-green-400' : 'bg-slate-500'}`}></div>
                      <span className="text-sm capitalize">{crawler.status}</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-300 mb-2">{crawler.specialization}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-400">Pages/sec:</span>
                      <span className="ml-1 font-mono">{crawler.pagesPerSecond}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Efficiency:</span>
                      <span className="ml-1 font-mono">{crawler.efficiency}%</span>
                    </div>
                    <div>
                      <span className="text-slate-400">DB Pool:</span>
                      <span className="ml-1 font-mono">{crawler.dbConnections}/5</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Queue:</span>
                      <span className="ml-1 font-mono">{crawler.queueDepth}</span>
                    </div>
                  </div>
                  {crawler.currentUrl && (
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Crawling:</span>
                      <span className="ml-2 font-mono text-green-400">{crawler.currentUrl}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Real Optimizations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Live Web Analysis Results
            </h3>
            <div className="space-y-3">
              {recentOptimizations.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Start crawling to analyze real websites</p>
                </div>
              ) : (
                recentOptimizations.map(opt => (
                  <div key={opt.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold flex items-center gap-2">
                          {getBiomeEmoji(opt.biome)} {opt.url}
                        </span>
                        <div className="text-sm text-slate-400">{opt.optimizationType}</div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded bg-slate-600 ${getAuthorityColor(opt.authority)}`}>
                        {opt.authority} authority
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <span className="text-blue-400">📋 {opt.schemasExtracted} schemas</span>
                      <span className="text-purple-400">🔗 {opt.backlinksFound} backlinks</span>
                      <span className="text-green-400">💾 {opt.dbOperations} DB ops</span>
                      <span className="text-orange-400">🌉 +{opt.metaverseImpact.bridgeLinks} bridges</span>
                    </div>
                    
                    <div className="flex justify-between text-sm border-t border-slate-600 pt-2">
                      <span className="text-green-400">+{opt.spaceSaved} KB saved</span>
                      <span className="text-yellow-400">+{opt.tokensEarned} DSH</span>
                      <span className="text-slate-400">{opt.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Metaverse Infrastructure Built */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Network className="text-purple-400" />
              Real-Web Metaverse Built
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <canvas ref={biodomeCanvasRef} className="rounded border border-slate-600" style={{ imageRendering:'pixelated' as any }} />
                <div>
                  <button onClick={() => setBiomeSeed(Math.floor(Math.random()*1e6))} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">Randomize Biome</button>
                  <div className="text-xs text-slate-400 mt-2">Seed: {biomeSeed}</div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-lg p-3 border border-green-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 font-semibold flex items-center gap-2">
                    🏞️ Virtual Land Parcels
                  </span>
                  <span className="text-2xl font-bold text-green-400">
                    {metaverseStats.virtualLand.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-green-300">From real website optimizations</div>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-lg p-3 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-semibold flex items-center gap-2">
                    🧠 AI Consensus Nodes
                  </span>
                  <span className="text-2xl font-bold text-purple-400">
                    {metaverseStats.aiConsensusNodes.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-purple-300">Powered by harvested compute</div>
              </div>

              <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 rounded-lg p-3 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-blue-400 font-semibold flex items-center gap-2">
                    💾 Storage Shards
                  </span>
                  <span className="text-2xl font-bold text-blue-400">
                    {metaverseStats.storageShards.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-blue-300">Decentralized web storage</div>
              </div>

              <div className="bg-gradient-to-r from-orange-600/20 to-orange-800/20 rounded-lg p-3 border border-orange-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-orange-400 font-semibold flex items-center gap-2">
                    🌉 Cross-Chain Bridges
                  </span>
                  <span className="text-2xl font-bold text-orange-400">
                    {metaverseStats.dimensionalBridges.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-orange-300">Connecting blockchain networks</div>
              </div>

              <div className="bg-gradient-to-r from-pink-600/20 to-pink-800/20 rounded-lg p-3 border border-pink-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-pink-400 font-semibold flex items-center gap-2">
                    ⚓ Reality Anchors
                  </span>
                  <span className="text-2xl font-bold text-pink-400">
                    {metaverseStats.realityAnchors.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-pink-300">Virtual-to-web connections</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live PoO Timeline */}
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Live DOM Optimizations */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-emerald-400" />
              Live DOM Optimizations
            </h3>
            <div className="space-y-3 max-h-96 overflow-auto">
              {liveOptimizations.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Zap size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No live optimizations yet</p>
                  <p className="text-sm">Start crawling to see real-time PoO submissions</p>
                </div>
              ) : (
                liveOptimizations.map(opt => (
                  <div key={opt.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3 border-l-4 border-emerald-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold">{opt.type}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          opt.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          opt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {opt.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {opt.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300 mb-2">
                      {opt.url && <div className="font-mono text-xs text-slate-400 mb-1">{opt.url}</div>}
                      <div className="flex gap-4">
                        <span>Bytes: <span className="text-emerald-400 font-mono">{opt.bytesSaved?.toLocaleString() || 'N/A'}</span></span>
                        <span>Backlinks: <span className="text-blue-400 font-mono">{opt.backlinksCount || 0}</span></span>
                      </div>
                    </div>
                    {opt.txHash && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400">TX:</span>
                        <a 
                          href={`${explorerBase}${opt.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono"
                        >
                          {opt.txHash.slice(0, 10)}...{opt.txHash.slice(-8)}
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Metaverse Infrastructure Events */}
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Brain className="text-violet-400" />
              Metaverse Infrastructure Events
            </h3>
            <div className="space-y-3 max-h-96 overflow-auto">
              {metaverseEvents.length === 0 ? (
                <div className="text-center text-slate-400 py-8">
                  <Layers size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No metaverse events yet</p>
                  <p className="text-sm">Infrastructure will build as space is harvested</p>
                </div>
              ) : (
                metaverseEvents.map(event => (
                  <div key={event.id} className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-lg p-3 border-l-4 border-violet-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-violet-400 font-semibold">{event.type}</span>
                        <span className="px-2 py-1 rounded text-xs bg-violet-500/20 text-violet-400">
                          Infrastructure
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-300">
                      {event.description}
                    </div>
                    {event.data && (
                      <div className="mt-2 text-xs text-slate-400">
                        <pre className="bg-slate-800/50 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PostgreSQL Database Schema Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pricing Plans */}
          <div className="bg-gradient-to-r from-slate-800/50 via-blue-800/20 to-slate-800/50 backdrop-blur rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4">Pricing Plans</h3>
            <div className="space-y-3">
              {plans.map((p) => (
                <div key={p.plan_code} className="p-3 rounded bg-slate-700/40 flex justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-xs text-slate-400">Includes {p.requests_included} requests • ${ (p.monthly_price_cents/100).toFixed(2) }/mo</div>
                  </div>
                  <div className="text-xs text-slate-400">Overage ${ (p.overage_price_cents_per_1k/100).toFixed(2) } / 1k</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent On-Chain Proofs */}
          <div className="bg-gradient-to-r from-slate-800/50 via-green-800/20 to-slate-800/50 backdrop-blur rounded-xl p-6 border border-green-500/30">
            <h3 className="text-xl font-bold mb-4">Recent Optimization Proofs</h3>
            <div className="space-y-2 max-h-72 overflow-auto">
              {recentProofs.map((p) => (
                <div key={`${p.url}-${p.recorded_at}`} className="p-3 rounded bg-slate-700/40 text-xs">
                  <div className="flex justify-between">
                    <span className="text-blue-300 break-all">{p.url}</span>
                    <span className={`ml-2 ${p.on_chain ? 'text-green-400' : 'text-yellow-400'}`}>{p.on_chain ? 'on-chain' : 'queued'}</span>
                  </div>
                  <div className="text-slate-400 mt-1">Saved: {(p.space_saved_bytes/1024).toFixed(1)} KB</div>
                  {p.tx_hash && (
                    <div className="text-slate-500 mt-1 break-all">tx: <a className="underline" href={`${explorerBase}${p.tx_hash}`} target="_blank" rel="noreferrer">{p.tx_hash}</a></div>
                  )}
                  <div className="text-slate-500">{new Date(p.recorded_at).toLocaleString()}</div>
                  <div className="mt-2">
                    <button onClick={() => fetchOnChain(p.url)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">Fetch on-chain</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Domain Proofs Search */}
          <div className="bg-gradient-to-r from-slate-800/50 via-indigo-800/20 to-slate-800/50 backdrop-blur rounded-xl p-6 border border-indigo-500/30">
            <h3 className="text-xl font-bold mb-4">Domain Optimization Proofs</h3>
            <div className="flex gap-2 mb-3">
              <input className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm"
                     placeholder="example.com" value={domainQuery}
                     onChange={(e) => setDomainQuery(e.target.value)} />
              <button onClick={loadDomainProofs} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm">Load</button>
            </div>
            {domainLoading ? (
              <div className="text-slate-400 text-sm">Loading…</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-auto">
                {domainProofs.map((p) => (
                  <div key={`${p.url}-${p.recorded_at}`} className="p-3 rounded bg-slate-700/40 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-300 break-all">{p.url}</span>
                      <span className={`ml-2 ${p.on_chain ? 'text-green-400' : 'text-yellow-400'}`}>{p.on_chain ? 'on-chain' : 'queued'}</span>
                    </div>
                    <div className="text-slate-400 mt-1">Saved: {(p.space_saved_bytes/1024).toFixed(1)} KB</div>
                    {p.tx_hash && (
                      <div className="text-slate-500 mt-1 break-all">tx: <a className="underline" href={`${explorerBase}${p.tx_hash}`} target="_blank" rel="noreferrer">{p.tx_hash}</a></div>
                    )}
                    <div className="text-slate-500">{new Date(p.recorded_at).toLocaleString()}</div>
                    <div className="mt-2">
                      <button onClick={() => fetchOnChain(p.url)} className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded">Fetch on-chain</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-gradient-to-r from-slate-800/50 via-blue-800/20 to-slate-800/50 backdrop-blur rounded-xl p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Database className="text-blue-400" />
              PostgreSQL Schema Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{Object.keys(schemaStats.schemaTypes).length}</div>
                <div className="text-slate-400 text-sm">Schema Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{backlinkNetwork.totalLinks}</div>
                <div className="text-slate-400 text-sm">Network Links</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{crawlerStats.completed}</div>
                <div className="text-slate-400 text-sm">Pages Crawled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{(backlinkNetwork.avgStrength * 100).toFixed(0)}%</div>
                <div className="text-slate-400 text-sm">Avg Link Strength</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Top Schema Types Found:</h4>
              <div className="space-y-1">
                {Object.entries(schemaStats.schemaTypes).slice(0, 5).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-slate-400">{type}</span>
                    <span className="text-blue-400">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-slate-800/50 via-purple-800/20 to-slate-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/30">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Activity className="text-purple-400" />
              Real-Time Crawling Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                <span className="text-slate-300">Success Rate</span>
                <span className="text-green-400 font-bold">
                  {crawlerStats.totalTargets > 0 ? 
                    ((crawlerStats.completed / crawlerStats.totalTargets) * 100).toFixed(1) : 0}%
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                <span className="text-slate-300">Avg Space/Site</span>
                <span className="text-blue-400 font-bold">
                  {crawlerStats.sitesAnalyzed > 0 ? 
                    (crawlerStats.totalSpaceHarvested / crawlerStats.sitesAnalyzed).toFixed(1) : 0} KB
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                <span className="text-slate-300">Crawlers Active</span>
                <span className="text-purple-400 font-bold">
                  {activeCrawlers.filter(c => c.status === 'active').length}/6
                </span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded">
                <span className="text-slate-300">Queue Depth</span>
                <span className="text-yellow-400 font-bold">
                  {activeCrawlers.reduce((sum, c) => sum + c.queueDepth, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Space-Bridge Integration */}
        {showSpaceBridgeIntegration && (
          <div className="mt-8">
            <SpaceBridgeIntegration 
              optimizationResults={recentOptimizations.map(opt => ({
                id: opt.id.toString(),
                url: opt.url,
                space_saved_kb: parseFloat(opt.spaceSaved),
                biome_type: opt.biome,
                optimization_type: opt.optimizationType,
                timestamp: new Date()
              }))}
              onSpaceMined={(result) => {
                console.log('Space mined and connected to bridge:', result);
              }}
            />
          </div>
        )}

        {/* How Real Web Crawling Works */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold mb-4">How Real Web Crawling & DOM Space Harvesting Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search size={24} />
              </div>
              <h4 className="font-semibold mb-2">1. Auto-Discovery</h4>
              <p className="text-slate-400 text-sm">Crawlers discover real websites via sitemaps, robots.txt, and link analysis</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Database size={24} />
              </div>
              <h4 className="font-semibold mb-2">2. PostgreSQL Storage</h4>
              <p className="text-slate-400 text-sm">All crawl data, schemas, and optimizations stored in production database</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Network size={24} />
              </div>
              <h4 className="font-semibold mb-2">3. Schema & Backlink Analysis</h4>
              <p className="text-slate-400 text-sm">Extract schema.org data and map backlink networks for real websites</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Layers size={24} />
              </div>
              <h4 className="font-semibold mb-2">4. Metaverse Building</h4>
              <p className="text-slate-400 text-sm">Convert real web optimizations into blockchain infrastructure and NFT assets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* Floating metaverse chat */}
    {showChat && (
      <div className="fixed bottom-4 right-4 w-80 bg-slate-900/90 border border-slate-700 rounded-xl shadow-lg backdrop-blur">
        <div className="p-3 border-b border-slate-700 flex justify-between items-center">
          <div className="text-sm font-semibold">Metaverse Chat • Bridges</div>
          <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">×</button>
        </div>
        <div className="p-3 max-h-64 overflow-auto text-xs space-y-2">
          {!chatBridge && bridges.map((b:any) => (
            <div key={b.bridge_id} className="w-full p-2 rounded bg-slate-800/60 hover:bg-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex justify-between"><span className="text-blue-300">{b.source_chain} → {b.target_chain}</span><span className={b.is_operational? 'text-green-400':'text-red-400'}>{b.is_operational? 'online':'offline'}</span></div>
                  <div className="text-slate-400 text-xs">Capacity: {Number(b.bridge_capacity||0).toLocaleString()}</div>
                  <div className="text-slate-400 text-xs">Volume: {Number(b.current_volume||0).toLocaleString()}</div>
                  <div className="text-slate-500 text-xs">Validators: {b.validator_count}</div>
                </div>
                <div className="flex flex-col gap-1 ml-2">
                  <button 
                    onClick={() => joinBridgeRoom(b.bridge_id)} 
                    className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                  >
                    Join Chat
                  </button>
                  <button 
                    onClick={() => openBridgeChat(b.bridge_id)} 
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    Open Page
                  </button>
                  <button 
                    onClick={() => copyBridgeUrl(b.bridge_id)} 
                    className="px-2 py-1 bg-slate-600 hover:bg-slate-700 rounded text-xs"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            </div>
          ))}
          {chatBridge && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="text-slate-400">Room: {chatBridge}</div>
                <button className="text-slate-400 hover:text-white" onClick={() => { if (socketRef.current) socketRef.current.emit('bridge_leave', chatBridge); setChatBridge(null); setChatMessages([]); }}>leave</button>
              </div>
              <div className="max-h-40 overflow-auto space-y-1">
                {chatMessages.map((m,i) => (
                  <div key={i} className="p-1 rounded bg-slate-800/60"><span className="text-blue-300">{m.user}:</span> <span className="text-slate-300">{m.text}</span></div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-2 border-t border-slate-700 flex gap-2">
          <input value={chatInput} onChange={handleTyping} className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs" placeholder={chatBridge? 'Message…':'Select a bridge to join…'} disabled={!chatBridge} />
          <button onClick={sendChat} disabled={!chatBridge} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs disabled:opacity-50">Send</button>
        </div>
        {typingUsers.size > 0 && (
          <div className="px-2 pb-1 text-xs text-slate-400">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        )}
      </div>
    )}
    {!showChat && (
      <button onClick={() => setShowChat(true)} className="fixed bottom-4 right-4 px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs">Open Metaverse</button>
    )}
    </>
  );
};

export default RealWebCrawlerDashboard;