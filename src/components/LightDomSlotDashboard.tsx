/**
 * Light DOM Slot Dashboard
 * Comprehensive dashboard for managing and monitoring Light DOM slots
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LightDomSlot, useLightDomSlot } from './LightDomSlot';
import { lightDomSlotSystem, SlotConfig, SlotOptimization } from '../core/LightDomSlotSystem';
import { useBlockchain } from '../hooks/useBlockchain';
import { Activity, Zap, Database, TrendingUp, Settings, Play, Pause, RotateCcw, Layers, Monitor } from 'lucide-react';

export const LightDomSlotDashboard: React.FC = () => {
  const [activeSlots, setActiveSlots] = useState<SlotConfig[]>([]);
  const [slotOptimizations, setSlotOptimizations] = useState<Map<string, SlotOptimization>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [totalSpaceSaved, setTotalSpaceSaved] = useState(0);
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [newSlotConfig, setNewSlotConfig] = useState({
    id: '',
    name: '',
    type: 'dynamic' as const,
    optimizationLevel: 'moderate' as const,
    priority: 'medium' as const,
  });

  const blockchain = useBlockchain();
  const slotHook = useLightDomSlot(selectedSlot);

  // Initialize dashboard
  useEffect(() => {
    const slots = lightDomSlotSystem.getAllSlots();
    setActiveSlots(slots);
    setSelectedSlot(slots[0]?.id || '');
  }, []);

  // Monitor all slots
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      const newOptimizations = new Map<string, SlotOptimization>();
      let totalSaved = 0;

      activeSlots.forEach(slot => {
        const optimization = lightDomSlotSystem.getSlotOptimization(slot.id);
        if (optimization) {
          newOptimizations.set(slot.id, optimization);
          totalSaved += optimization.spaceSaved;
        }
      });

      setSlotOptimizations(newOptimizations);
      setTotalSpaceSaved(totalSaved);
    }, 1000);

    return () => clearInterval(interval);
  }, [isMonitoring, activeSlots]);

  const handleStartMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  const handleStopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const handleOptimizeAllSlots = useCallback(async () => {
    const optimizations = await Promise.all(
      activeSlots.map(slot => lightDomSlotSystem.optimizeSlot(slot.id))
    );

    const history = optimizations
      .filter(opt => opt !== null)
      .map(opt => ({
        ...opt,
        timestamp: Date.now(),
      }));

    setOptimizationHistory(prev => [...prev, ...history]);

    // Submit to blockchain if connected
    if (blockchain.isConnected) {
      for (const opt of optimizations) {
        if (opt && opt.spaceSaved > 0) {
          await blockchain.submitOptimizationProof(
            window.location.href,
            opt.slotId,
            opt.spaceSaved
          );
        }
      }
    }
  }, [activeSlots, blockchain]);

  const handleCreateSlot = useCallback(() => {
    if (!newSlotConfig.id || !newSlotConfig.name) {
      alert('Please provide slot ID and name');
      return;
    }

    const config: SlotConfig = {
      ...newSlotConfig,
      allowedElements: ['*'], // Allow all by default
    };

    lightDomSlotSystem.registerSlot(config);
    setActiveSlots(lightDomSlotSystem.getAllSlots());
    setNewSlotConfig({
      id: '',
      name: '',
      type: 'dynamic',
      optimizationLevel: 'moderate',
      priority: 'medium',
    });
  }, [newSlotConfig]);

  const getSlotStatusColor = (slotId: string): string => {
    const optimization = slotOptimizations.get(slotId);
    if (!optimization) return '#718096';
    if (optimization.spaceSaved > 1000) return '#38a169';
    if (optimization.spaceSaved > 100) return '#d69e2e';
    return '#e53e3e';
  };

  return (
    <div style={{ padding: '20px', background: '#f7fafc', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ 
            margin: '0 0 10px 0', 
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Layers size={24} />
            Light DOM Slot Dashboard
          </h1>
          <p style={{ margin: 0, color: '#718096' }}>
            Manage and optimize Light DOM slots for improved performance and space efficiency
          </p>
        </div>

        {/* Control Panel */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h2 style={{ margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} />
              Control Panel
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!isMonitoring ? (
                <button
                  onClick={handleStartMonitoring}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={16} />
                  Start Monitoring
                </button>
              ) : (
                <button
                  onClick={handleStopMonitoring}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <Pause size={16} />
                  Stop Monitoring
                </button>
              )}
              <button
                onClick={handleOptimizeAllSlots}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Zap size={16} />
                Optimize All
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
          }}>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ color: '#4a5568', fontSize: '14px', marginBottom: '4px' }}>Active Slots</div>
              <div style={{ color: '#2d3748', fontSize: '24px', fontWeight: 'bold' }}>
                {activeSlots.length}
              </div>
            </div>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ color: '#4a5568', fontSize: '14px', marginBottom: '4px' }}>Total Space Saved</div>
              <div style={{ color: '#38a169', fontSize: '24px', fontWeight: 'bold' }}>
                {(totalSpaceSaved / 1024).toFixed(2)} KB
              </div>
            </div>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ color: '#4a5568', fontSize: '14px', marginBottom: '4px' }}>Monitoring Status</div>
              <div style={{ 
                color: isMonitoring ? '#38a169' : '#e53e3e', 
                fontSize: '18px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <Monitor size={16} />
                {isMonitoring ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div style={{ 
              background: '#f7fafc', 
              padding: '16px', 
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ color: '#4a5568', fontSize: '14px', marginBottom: '4px' }}>Blockchain Status</div>
              <div style={{ 
                color: blockchain.isConnected ? '#38a169' : '#e53e3e', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                {blockchain.isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
        </div>

        {/* Slot Management */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Active Slots */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Active Slots</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {activeSlots.map(slot => {
                const optimization = slotOptimizations.get(slot.id);
                return (
                  <div
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    style={{
                      padding: '12px',
                      border: `2px solid ${selectedSlot === slot.id ? '#4299e1' : '#e2e8f0'}`,
                      borderRadius: '6px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      background: selectedSlot === slot.id ? '#ebf8ff' : 'white',
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{slot.name}</span>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: getSlotStatusColor(slot.id),
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '12px', color: '#718096' }}>
                      ID: {slot.id} | Type: {slot.type} | Level: {slot.optimizationLevel}
                    </div>
                    {optimization && (
                      <div style={{ fontSize: '11px', color: '#4a5568', marginTop: '4px' }}>
                        Saved: {optimization.spaceSaved} bytes | Strategy: {optimization.optimizationStrategy}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create New Slot */}
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Create New Slot</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Slot ID"
                value={newSlotConfig.id}
                onChange={(e) => setNewSlotConfig(prev => ({ ...prev, id: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                placeholder="Slot Name"
                value={newSlotConfig.name}
                onChange={(e) => setNewSlotConfig(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              />
              <select
                value={newSlotConfig.type}
                onChange={(e) => setNewSlotConfig(prev => ({ ...prev, type: e.target.value as any }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                <option value="static">Static</option>
                <option value="dynamic">Dynamic</option>
                <option value="lazy">Lazy</option>
              </select>
              <select
                value={newSlotConfig.optimizationLevel}
                onChange={(e) => setNewSlotConfig(prev => ({ ...prev, optimizationLevel: e.target.value as any }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <select
                value={newSlotConfig.priority}
                onChange={(e) => setNewSlotConfig(prev => ({ ...prev, priority: e.target.value as any }))}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <button
                onClick={handleCreateSlot}
                style={{
                  padding: '10px 16px',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Create Slot
              </button>
            </div>
          </div>
        </div>

        {/* Demo Slots */}
        <div style={{ 
          background: 'white', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Demo Slots</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <LightDomSlot
              slotId="header"
              slotConfig={{
                name: 'Header Slot',
                type: 'static',
                optimizationLevel: 'moderate',
                priority: 'high',
              }}
            >
              <header style={{ background: '#4299e1', color: 'white', padding: '16px', borderRadius: '4px' }}>
                <h2>Website Header</h2>
                <nav>
                  <a href="#" style={{ color: 'white', marginRight: '16px' }}>Home</a>
                  <a href="#" style={{ color: 'white', marginRight: '16px' }}>About</a>
                  <a href="#" style={{ color: 'white' }}>Contact</a>
                </nav>
              </header>
            </LightDomSlot>

            <LightDomSlot
              slotId="main"
              slotConfig={{
                name: 'Main Content',
                type: 'dynamic',
                optimizationLevel: 'aggressive',
                priority: 'high',
              }}
            >
              <main style={{ background: '#f7fafc', padding: '16px', borderRadius: '4px' }}>
                <h2>Main Content Area</h2>
                <p>This is the main content area with various elements that can be optimized.</p>
                <img 
                  src="data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='100' height='100' fill='%23ddd'/%3E%3C/svg%3E" 
                  alt="Demo image" 
                  style={{ width: '100px', height: '100px' }}
                />
              </main>
            </LightDomSlot>

            <LightDomSlot
              slotId="sidebar"
              slotConfig={{
                name: 'Sidebar',
                type: 'lazy',
                optimizationLevel: 'conservative',
                priority: 'medium',
              }}
            >
              <aside style={{ background: '#e2e8f0', padding: '16px', borderRadius: '4px' }}>
                <h3>Sidebar</h3>
                <ul>
                  <li>Navigation Item 1</li>
                  <li>Navigation Item 2</li>
                  <li>Navigation Item 3</li>
                </ul>
              </aside>
            </LightDomSlot>
          </div>
        </div>

        {/* Optimization History */}
        {optimizationHistory.length > 0 && (
          <div style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#2d3748' }}>Optimization History</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {optimizationHistory.map((opt, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    background: '#f7fafc',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d3748' }}>
                    Slot: {opt.slotId}
                  </div>
                  <div style={{ fontSize: '12px', color: '#718096' }}>
                    Space Saved: {opt.spaceSaved} bytes | Strategy: {opt.optimizationStrategy}
                  </div>
                  <div style={{ fontSize: '11px', color: '#a0aec0' }}>
                    {new Date(opt.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};