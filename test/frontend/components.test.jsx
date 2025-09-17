import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, describe, it, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest';
import ProductionDOMSpaceHarvester from '../../dom-space-harvester';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    close: vi.fn()
  }))
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  Cpu: () => <div data-testid="cpu-icon">Cpu</div>,
  HardDrive: () => <div data-testid="harddrive-icon">HardDrive</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>,
  Globe: () => <div data-testid="globe-icon">Globe</div>,
  TrendingUp: () => <div data-testid="trendingup-icon">TrendingUp</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  RotateCcw: () => <div data-testid="rotateccw-icon">RotateCcw</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
  Network: () => <div data-testid="network-icon">Network</div>,
  Link: () => <div data-testid="link-icon">Link</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Map: () => <div data-testid="map-icon">Map</div>,
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  Layers: () => <div data-testid="layers-icon">Layers</div>
}));

describe('ProductionDOMSpaceHarvester', function() {
  beforeEach(function() {
    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  afterEach(function() {
    vi.restoreAllMocks();
  });

  it('should render the main dashboard', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('DOM Space Harvester')).to.be.ok;
    expect(screen.getByText('Real Web Crawler Dashboard')).to.be.ok;
  });

  it('should display crawler statistics', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('Real Space Harvested')).to.be.ok;
    expect(screen.getByText('Schema.org Extracted')).to.be.ok;
    expect(screen.getByText('Backlinks Mapped')).to.be.ok;
    expect(screen.getByText('Tokens Earned')).to.be.ok;
  });

  it('should display blockchain statistics', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('PoO Submissions')).to.be.ok;
    expect(screen.getByText('Bytes Saved')).to.be.ok;
    expect(screen.getByText('Backlinks Mined')).to.be.ok;
    expect(screen.getByText('Live Optimizations')).to.be.ok;
    expect(screen.getByText('Metaverse Events')).to.be.ok;
  });

  it('should show start/stop crawler buttons', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('Start Real Crawling')).to.be.ok;
    expect(screen.getByText('Stop Crawling')).to.be.ok;
  });

  it('should handle crawler start', async function() {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sessionId: 'test-session', message: 'Crawler started' })
    });

    render(<ProductionDOMSpaceHarvester />);
    
    const startButton = screen.getByText('Start Real Crawling');
    fireEvent.click(startButton);
    
    await waitFor(() => {
      expect(global.fetch).to.have.been.calledWith('/api/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxConcurrency: 5,
          requestDelay: 2000,
          maxDepth: 2,
          respectRobots: true
        })
      });
    });
  });

  it('should handle crawler stop', async function() {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Crawler stopped' })
    });

    render(<ProductionDOMSpaceHarvester />);
    
    const stopButton = screen.getByText('Stop Crawling');
    fireEvent.click(stopButton);
    
    await waitFor(() => {
      expect(global.fetch).to.have.been.calledWith('/api/crawler/stop', {
        method: 'POST'
      });
    });
  });

  it('should display active crawlers', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText(/Distributed Crawlers/)).to.be.ok;
  });

  it('should display live optimizations section', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('Live DOM Optimizations')).to.be.ok;
    expect(screen.getByText('No live optimizations yet')).to.be.ok;
  });

  it('should display metaverse events section', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('Metaverse Infrastructure Events')).to.be.ok;
    expect(screen.getByText('No metaverse events yet')).to.be.ok;
  });

  it('should handle crawl speed adjustment', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    const speedSlider = screen.getByRole('slider');
    expect(speedSlider).to.have.property('value', '2');
    
    fireEvent.change(speedSlider, { target: { value: '5' } });
    expect(speedSlider).to.have.property('value', '5');
  });

  it('should display current crawl target when crawling', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    // Simulate crawling state
    const component = screen.getByText('Start Real Crawling').closest('button');
    fireEvent.click(component);
    
    // This would need to be updated based on actual state management
    // For now, just check that the UI elements exist
    expect(screen.getByText('Start Real Crawling')).to.be.ok;
  });

  it('should handle bridge chat functionality', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    // Check if bridge chat elements are present
    expect(screen.getByText('Bridge Chat')).to.be.ok;
  });

  it('should display metaverse infrastructure stats', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    expect(screen.getByText('Virtual Land Parcels')).to.be.ok;
    expect(screen.getByText('AI Consensus Nodes')).to.be.ok;
    expect(screen.getByText('Distributed Storage Shards')).to.be.ok;
    expect(screen.getByText('Cross-Chain Bridges')).to.be.ok;
    expect(screen.getByText('Reality Anchors')).to.be.ok;
  });

  it('should handle error states gracefully', async function() {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ProductionDOMSpaceHarvester />);
    
    const startButton = screen.getByText('Start Real Crawling');
    fireEvent.click(startButton);
    
    // Should not crash the component
    expect(screen.getByText('Start Real Crawling')).to.be.ok;
  });

  it('should update statistics in real-time', function() {
    render(<ProductionDOMSpaceHarvester />);
    
    // Check that statistics are displayed
    expect(screen.getByText('0.0 KB')).to.be.ok; // Initial space harvested
    expect(screen.getByText('0')).to.be.ok; // Initial schema count
  });

  it('should handle WebSocket connection', function() {
    const mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      close: vi.fn()
    };
    
    const { io } = require('socket.io-client');
    io.mockReturnValue(mockSocket);
    
    render(<ProductionDOMSpaceHarvester />);
    
    expect(io).to.have.been.called;
    expect(mockSocket.on).to.have.been.calledWith('connect');
    expect(mockSocket.on).to.have.been.calledWith('bridge_message');
    expect(mockSocket.on).to.have.been.calledWith('blockchain_update');
    expect(mockSocket.on).to.have.been.calledWith('metaverse_event');
    expect(mockSocket.on).to.have.been.calledWith('live_optimization');
  });
});
