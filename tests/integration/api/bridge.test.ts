import request from 'supertest';
import { Express } from 'express';

// Mock the Express app
const mockApp = {
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  use: jest.fn(),
  listen: jest.fn(),
} as unknown as Express;

// Mock database
const mockDb = {
  query: jest.fn(),
};

describe('Bridge API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/metaverse/bridges', () => {
    it('should fetch all bridges successfully', async () => {
      const mockBridges = [
        {
          bridge_id: 'bridge_1',
          source_chain: 'Ethereum',
          target_chain: 'Polygon',
          bridge_capacity: 1000000,
          current_volume: 500000,
          is_operational: true,
          validator_count: 5,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        },
        {
          bridge_id: 'bridge_2',
          source_chain: 'Polygon',
          target_chain: 'Arbitrum',
          bridge_capacity: 2000000,
          current_volume: 1000000,
          is_operational: true,
          validator_count: 8,
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        },
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: mockBridges,
      });

      const response = await request(mockApp)
        .get('/api/metaverse/bridges')
        .expect(200);

      expect(response.body).toEqual(mockBridges);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM dimensional_bridges WHERE is_operational = TRUE ORDER BY created_at DESC'
      );
    });

    it('should return empty array when no bridges exist', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .get('/api/metaverse/bridges')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should handle database error', async () => {
      mockDb.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await request(mockApp)
        .get('/api/metaverse/bridges')
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Failed to fetch bridges',
      });
    });
  });

  describe('POST /api/metaverse/bridges', () => {
    it('should create a new bridge successfully', async () => {
      const bridgeData = {
        source_chain: 'Ethereum',
        target_chain: 'Polygon',
        bridge_capacity: 1000000,
        validator_count: 5,
      };

      const createdBridge = {
        id: 'uuid-123',
        bridge_id: 'bridge_ethereum_polygon',
        source_chain: bridgeData.source_chain,
        target_chain: bridgeData.target_chain,
        bridge_capacity: bridgeData.bridge_capacity,
        current_volume: 0,
        is_operational: true,
        validator_count: bridgeData.validator_count,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [createdBridge],
      });

      const response = await request(mockApp)
        .post('/api/metaverse/bridges')
        .send(bridgeData)
        .expect(201);

      expect(response.body).toEqual(createdBridge);
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO dimensional_bridges (source_chain, target_chain, bridge_capacity, validator_count) VALUES ($1, $2, $3, $4) RETURNING *',
        [bridgeData.source_chain, bridgeData.target_chain, bridgeData.bridge_capacity, bridgeData.validator_count]
      );
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        source_chain: 'Ethereum',
        // Missing target_chain, bridge_capacity, validator_count
      };

      const response = await request(mockApp)
        .post('/api/metaverse/bridges')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Missing required fields: source_chain, target_chain, bridge_capacity, validator_count',
      });
    });

    it('should return error for invalid bridge capacity', async () => {
      const invalidData = {
        source_chain: 'Ethereum',
        target_chain: 'Polygon',
        bridge_capacity: -1000, // Invalid negative capacity
        validator_count: 5,
      };

      const response = await request(mockApp)
        .post('/api/metaverse/bridges')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Bridge capacity must be a positive number',
      });
    });

    it('should return error for invalid validator count', async () => {
      const invalidData = {
        source_chain: 'Ethereum',
        target_chain: 'Polygon',
        bridge_capacity: 1000000,
        validator_count: 0, // Invalid zero validators
      };

      const response = await request(mockApp)
        .post('/api/metaverse/bridges')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Validator count must be at least 1',
      });
    });
  });

  describe('POST /api/metaverse/connect-space-to-bridge', () => {
    it('should connect space to bridge successfully', async () => {
      const connectionData = {
        optimization_id: 'opt_1',
        bridge_id: 'bridge_1',
        space_mined_kb: 100,
        biome_type: 'digital',
      };

      const connection = {
        id: 'conn_1',
        optimization_id: connectionData.optimization_id,
        bridge_id: connectionData.bridge_id,
        space_mined_kb: connectionData.space_mined_kb,
        biome_type: connectionData.biome_type,
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [connection],
      }).mockResolvedValueOnce({
        rows: [{ current_volume: 500000 }],
      });

      const response = await request(mockApp)
        .post('/api/metaverse/connect-space-to-bridge')
        .send(connectionData)
        .expect(201);

      expect(response.body).toEqual(connection);
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO space_bridge_connections (optimization_id, bridge_id, space_mined_kb, biome_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [connectionData.optimization_id, connectionData.bridge_id, connectionData.space_mined_kb, connectionData.biome_type]
      );
    });

    it('should return error for missing required fields', async () => {
      const incompleteData = {
        optimization_id: 'opt_1',
        // Missing bridge_id, space_mined_kb, biome_type
      };

      const response = await request(mockApp)
        .post('/api/metaverse/connect-space-to-bridge')
        .send(incompleteData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Missing required fields: optimization_id, bridge_id, space_mined_kb, biome_type',
      });
    });

    it('should return error for invalid space amount', async () => {
      const invalidData = {
        optimization_id: 'opt_1',
        bridge_id: 'bridge_1',
        space_mined_kb: -50, // Invalid negative space
        biome_type: 'digital',
      };

      const response = await request(mockApp)
        .post('/api/metaverse/connect-space-to-bridge')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Space mined must be a positive number',
      });
    });

    it('should return error for non-existent bridge', async () => {
      const connectionData = {
        optimization_id: 'opt_1',
        bridge_id: 'nonexistent_bridge',
        space_mined_kb: 100,
        biome_type: 'digital',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [], // No bridge found
      });

      const response = await request(mockApp)
        .post('/api/metaverse/connect-space-to-bridge')
        .send(connectionData)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Bridge not found',
      });
    });
  });

  describe('GET /api/metaverse/space-bridge-connections', () => {
    it('should fetch space-bridge connections successfully', async () => {
      const mockConnections = [
        {
          id: 'conn_1',
          optimization_id: 'opt_1',
          bridge_id: 'bridge_1',
          space_mined_kb: 100,
          biome_type: 'digital',
          created_at: '2023-01-01T00:00:00Z',
        },
        {
          id: 'conn_2',
          optimization_id: 'opt_2',
          bridge_id: 'bridge_2',
          space_mined_kb: 200,
          biome_type: 'knowledge',
          created_at: '2023-01-02T00:00:00Z',
        },
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: mockConnections,
      });

      const response = await request(mockApp)
        .get('/api/metaverse/space-bridge-connections')
        .expect(200);

      expect(response.body).toEqual(mockConnections);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM space_bridge_connections ORDER BY created_at DESC'
      );
    });

    it('should filter connections by bridge_id', async () => {
      const bridgeId = 'bridge_1';
      const mockConnections = [
        {
          id: 'conn_1',
          optimization_id: 'opt_1',
          bridge_id: bridgeId,
          space_mined_kb: 100,
          biome_type: 'digital',
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: mockConnections,
      });

      const response = await request(mockApp)
        .get(`/api/metaverse/space-bridge-connections?bridge_id=${bridgeId}`)
        .expect(200);

      expect(response.body).toEqual(mockConnections);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM space_bridge_connections WHERE bridge_id = $1 ORDER BY created_at DESC',
        [bridgeId]
      );
    });

    it('should filter connections by biome_type', async () => {
      const biomeType = 'digital';
      const mockConnections = [
        {
          id: 'conn_1',
          optimization_id: 'opt_1',
          bridge_id: 'bridge_1',
          space_mined_kb: 100,
          biome_type: biomeType,
          created_at: '2023-01-01T00:00:00Z',
        },
      ];

      mockDb.query.mockResolvedValueOnce({
        rows: mockConnections,
      });

      const response = await request(mockApp)
        .get(`/api/metaverse/space-bridge-connections?biome_type=${biomeType}`)
        .expect(200);

      expect(response.body).toEqual(mockConnections);
      expect(mockDb.query).toHaveBeenCalledWith(
        'SELECT * FROM space_bridge_connections WHERE biome_type = $1 ORDER BY created_at DESC',
        [biomeType]
      );
    });
  });

  describe('GET /api/metaverse/bridge/:bridgeId/stats', () => {
    it('should get bridge stats successfully', async () => {
      const bridgeId = 'bridge_1';
      const mockStats = {
        bridge_id: bridgeId,
        total_messages: 150,
        active_participants: 8,
        total_space_connected: 2500,
        efficiency_score: 85,
        participant_retention_rate: 0.75,
        message_frequency: 2.5,
        avg_space_per_connection: 125,
        top_biome_types: ['digital', 'knowledge', 'social'],
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockStats],
      });

      const response = await request(mockApp)
        .get(`/api/metaverse/bridge/${bridgeId}/stats`)
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [bridgeId]
      );
    });

    it('should return error for non-existent bridge', async () => {
      const bridgeId = 'nonexistent_bridge';

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .get(`/api/metaverse/bridge/${bridgeId}/stats`)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Bridge not found',
      });
    });
  });

  describe('POST /api/metaverse/bridge/:bridgeId/join', () => {
    it('should join bridge successfully', async () => {
      const bridgeId = 'bridge_1';
      const userId = 'user_1';

      const mockParticipant = {
        id: 'participant_1',
        bridge_id: bridgeId,
        user_id: userId,
        is_active: true,
        joined_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockParticipant],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/join`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Joined bridge successfully',
        participant: mockParticipant,
      });
    });

    it('should return error for non-existent bridge', async () => {
      const bridgeId = 'nonexistent_bridge';

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/join`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Bridge not found',
      });
    });

    it('should return error for already joined bridge', async () => {
      const bridgeId = 'bridge_1';
      const userId = 'user_1';

      const existingParticipant = {
        id: 'participant_1',
        bridge_id: bridgeId,
        user_id: userId,
        is_active: true,
        joined_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [existingParticipant],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/join`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'User is already a participant in this bridge',
      });
    });
  });

  describe('POST /api/metaverse/bridge/:bridgeId/leave', () => {
    it('should leave bridge successfully', async () => {
      const bridgeId = 'bridge_1';
      const userId = 'user_1';

      const mockParticipant = {
        id: 'participant_1',
        bridge_id: bridgeId,
        user_id: userId,
        is_active: false,
        joined_at: '2023-01-01T00:00:00Z',
        left_at: '2023-01-01T01:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockParticipant],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/leave`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Left bridge successfully',
      });
    });

    it('should return error for non-existent bridge', async () => {
      const bridgeId = 'nonexistent_bridge';

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/leave`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Bridge not found',
      });
    });

    it('should return error for user not in bridge', async () => {
      const bridgeId = 'bridge_1';
      const userId = 'user_1';

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/leave`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'User is not a participant in this bridge',
      });
    });
  });

  describe('POST /api/metaverse/bridge/:bridgeId/chat', () => {
    it('should send message successfully', async () => {
      const bridgeId = 'bridge_1';
      const userId = 'user_1';
      const messageData = {
        message: 'Hello, bridge!',
      };

      const mockMessage = {
        id: 'msg_1',
        bridge_id: bridgeId,
        user_id: userId,
        message: messageData.message,
        message_type: 'text',
        created_at: '2023-01-01T00:00:00Z',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [mockMessage],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/chat`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(messageData)
        .expect(201);

      expect(response.body).toEqual(mockMessage);
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO bridge_messages (bridge_id, user_id, message, message_type) VALUES ($1, $2, $3, $4) RETURNING *',
        [bridgeId, userId, messageData.message, 'text']
      );
    });

    it('should return error for empty message', async () => {
      const bridgeId = 'bridge_1';
      const messageData = {
        message: '',
      };

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/chat`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(messageData)
        .expect(400);

      expect(response.body).toMatchObject({
        error: 'Message cannot be empty',
      });
    });

    it('should return error for non-existent bridge', async () => {
      const bridgeId = 'nonexistent_bridge';
      const messageData = {
        message: 'Hello, bridge!',
      };

      mockDb.query.mockResolvedValueOnce({
        rows: [],
      });

      const response = await request(mockApp)
        .post(`/api/metaverse/bridge/${bridgeId}/chat`)
        .set('Authorization', 'Bearer mock-jwt-token')
        .send(messageData)
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Bridge not found',
      });
    });
  });
});