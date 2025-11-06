import { SpaceBridgeService } from '../../../src/services/SpaceBridgeService';
import { BridgeNotificationService } from '../../../src/services/BridgeNotificationService';

// Mock dependencies
jest.mock('../../../src/services/BridgeNotificationService');
jest.mock('socket.io-client', () => ({
  io: jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    close: jest.fn(),
    connected: true,
  })),
}));

describe('SpaceBridgeService', () => {
  let spaceBridgeService: SpaceBridgeService;
  let mockNotificationService: jest.Mocked<BridgeNotificationService>;

  beforeEach(() => {
    mockNotificationService = new BridgeNotificationService() as jest.Mocked<BridgeNotificationService>;
    spaceBridgeService = new SpaceBridgeService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchBridges', () => {
    it('should fetch bridges successfully', async () => {
      const mockBridges = [
        {
          bridge_id: 'bridge_1',
          source_chain: 'Ethereum',
          target_chain: 'Polygon',
          bridge_capacity: 1000000,
          current_volume: 500000,
          is_operational: true,
          validator_count: 5,
        },
      ];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBridges),
      });

      const result = await spaceBridgeService.fetchBridges();

      expect(result).toEqual(mockBridges);
      expect(global.fetch).toHaveBeenCalledWith('/api/metaverse/bridges');
    });

    it('should handle fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(spaceBridgeService.fetchBridges()).rejects.toThrow('Network error');
    });
  });

  describe('joinBridge', () => {
    it('should join bridge successfully', async () => {
      const bridgeId = 'bridge_1';
      const mockResponse = { success: true, message: 'Joined bridge successfully' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await spaceBridgeService.joinBridge(bridgeId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(`/api/metaverse/bridge/${bridgeId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });

  describe('connectSpaceToBridge', () => {
    it('should connect space to bridge successfully', async () => {
      const optimizationResult = {
        id: 'opt_1',
        url: 'https://example.com',
        space_saved_kb: 100,
        biome_type: 'digital',
        optimization_type: 'compression',
        timestamp: new Date(),
      };
      const bridgeId = 'bridge_1';
      const mockResponse = { success: true, connection_id: 'conn_1' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await spaceBridgeService.connectSpaceToBridge(optimizationResult, bridgeId);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/metaverse/connect-space-to-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimization_id: optimizationResult.id,
          bridge_id: bridgeId,
          space_mined_kb: optimizationResult.space_saved_kb,
          biome_type: optimizationResult.biome_type,
        }),
      });
    });
  });

  describe('autoConnectSpaceMining', () => {
    it('should auto-connect digital biome to web-dom-metaverse bridge', async () => {
      const optimizationResult = {
        id: 'opt_1',
        url: 'https://example.com',
        space_saved_kb: 100,
        biome_type: 'digital',
        optimization_type: 'compression',
        timestamp: new Date(),
      };

      const mockResponse = { success: true, connection_id: 'conn_1' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await spaceBridgeService.autoConnectSpaceMining(optimizationResult);

      expect(global.fetch).toHaveBeenCalledWith('/api/metaverse/connect-space-to-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimization_id: optimizationResult.id,
          bridge_id: 'bridge_web_dom_metaverse',
          space_mined_kb: optimizationResult.space_saved_kb,
          biome_type: optimizationResult.biome_type,
        }),
      });
    });

    it('should auto-connect knowledge biome to lightdom-space bridge', async () => {
      const optimizationResult = {
        id: 'opt_1',
        url: 'https://example.com',
        space_saved_kb: 100,
        biome_type: 'knowledge',
        optimization_type: 'compression',
        timestamp: new Date(),
      };

      const mockResponse = { success: true, connection_id: 'conn_1' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await spaceBridgeService.autoConnectSpaceMining(optimizationResult);

      expect(global.fetch).toHaveBeenCalledWith('/api/metaverse/connect-space-to-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimization_id: optimizationResult.id,
          bridge_id: 'bridge_lightdom_space',
          space_mined_kb: optimizationResult.space_saved_kb,
          biome_type: optimizationResult.biome_type,
        }),
      });
    });

    it('should auto-connect social biome to ethereum-polygon bridge', async () => {
      const optimizationResult = {
        id: 'opt_1',
        url: 'https://example.com',
        space_saved_kb: 100,
        biome_type: 'social',
        optimization_type: 'compression',
        timestamp: new Date(),
      };

      const mockResponse = { success: true, connection_id: 'conn_1' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await spaceBridgeService.autoConnectSpaceMining(optimizationResult);

      expect(global.fetch).toHaveBeenCalledWith('/api/metaverse/connect-space-to-bridge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optimization_id: optimizationResult.id,
          bridge_id: 'bridge_ethereum_polygon',
          space_mined_kb: optimizationResult.space_saved_kb,
          biome_type: optimizationResult.biome_type,
        }),
      });
    });
  });

  describe('sendMessage', () => {
    it('should send message successfully', async () => {
      const bridgeId = 'bridge_1';
      const message = 'Hello, bridge!';
      const mockResponse = { success: true, message_id: 'msg_1' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await spaceBridgeService.sendMessage(bridgeId, message);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(`/api/metaverse/bridge/${bridgeId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    });
  });

  describe('getBridgeStats', () => {
    it('should get bridge stats successfully', async () => {
      const bridgeId = 'bridge_1';
      const mockStats = {
        bridge_id: bridgeId,
        total_messages: 100,
        active_participants: 5,
        total_space_connected: 1000,
        efficiency_score: 85,
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStats),
      });

      const result = await spaceBridgeService.getBridgeStats(bridgeId);

      expect(result).toEqual(mockStats);
      expect(global.fetch).toHaveBeenCalledWith(`/api/metaverse/bridge/${bridgeId}/stats`);
    });
  });
});