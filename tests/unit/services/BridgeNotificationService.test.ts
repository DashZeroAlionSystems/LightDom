import { BridgeNotificationService } from '../../../src/services/BridgeNotificationService';

describe('BridgeNotificationService', () => {
  let notificationService: BridgeNotificationService;

  beforeEach(() => {
    notificationService = new BridgeNotificationService();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default preferences', () => {
      expect(notificationService['preferences']).toEqual({
        space_mined: true,
        user_joined: true,
        user_left: true,
        bridge_created: true,
        optimization_complete: true,
        system_alert: true,
      });
    });

    it('should load preferences from localStorage', () => {
      const savedPreferences = {
        space_mined: false,
        user_joined: true,
        user_left: false,
        bridge_created: true,
        optimization_complete: true,
        system_alert: false,
      };
      localStorage.setItem('bridge_notification_preferences', JSON.stringify(savedPreferences));

      const newService = new BridgeNotificationService();
      expect(newService['preferences']).toEqual(savedPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences and save to localStorage', () => {
      const newPreferences = {
        space_mined: false,
        user_joined: true,
        user_left: false,
        bridge_created: true,
        optimization_complete: true,
        system_alert: false,
      };

      notificationService.updatePreferences(newPreferences);

      expect(notificationService['preferences']).toEqual(newPreferences);
      expect(localStorage.getItem('bridge_notification_preferences')).toBe(JSON.stringify(newPreferences));
    });
  });

  describe('getPreferences', () => {
    it('should return current preferences', () => {
      const preferences = notificationService.getPreferences();
      expect(preferences).toEqual(notificationService['preferences']);
    });
  });

  describe('sendBridgeNotification', () => {
    beforeEach(() => {
      // Mock browser notifications
      Object.defineProperty(window, 'Notification', {
        value: jest.fn().mockImplementation(() => ({
          close: jest.fn(),
        })),
        writable: true,
      });
    });

    it('should send notification when preference is enabled', async () => {
      const mockNotification = {
        id: 'notif_1',
        bridge_id: 'bridge_1',
        type: 'space_mined' as const,
        title: 'Space Mined',
        message: '100KB space mined',
        timestamp: new Date(),
        read: false,
      };

      notificationService['preferences'].space_mined = true;

      const result = await notificationService.sendBridgeNotification(
        'bridge_1',
        'space_mined',
        'Space Mined',
        '100KB space mined'
      );

      expect(result.id).toBeDefined();
      expect(result.bridge_id).toBe('bridge_1');
      expect(result.type).toBe('space_mined');
      expect(result.title).toBe('Space Mined');
      expect(result.message).toBe('100KB space mined');
      expect(result.read).toBe(false);
    });

    it('should not send notification when preference is disabled', async () => {
      notificationService['preferences'].space_mined = false;

      const result = await notificationService.sendBridgeNotification(
        'bridge_1',
        'space_mined',
        'Space Mined',
        '100KB space mined'
      );

      expect(result).toBeNull();
    });
  });

  describe('notifySpaceMined', () => {
    it('should create space mined notification', async () => {
      notificationService['preferences'].space_mined = true;

      const result = await notificationService.notifySpaceMined(
        'bridge_1',
        100,
        'https://example.com',
        'digital'
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('space_mined');
      expect(result?.title).toBe('Space Mined!');
      expect(result?.message).toContain('100KB');
      expect(result?.message).toContain('https://example.com');
    });
  });

  describe('notifyUserJoined', () => {
    it('should create user joined notification', async () => {
      notificationService['preferences'].user_joined = true;

      const result = await notificationService.notifyUserJoined(
        'bridge_1',
        'user_123',
        'John Doe'
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('user_joined');
      expect(result?.title).toBe('User Joined');
      expect(result?.message).toContain('John Doe');
    });
  });

  describe('notifyUserLeft', () => {
    it('should create user left notification', async () => {
      notificationService['preferences'].user_left = true;

      const result = await notificationService.notifyUserLeft(
        'bridge_1',
        'user_123',
        'John Doe'
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('user_left');
      expect(result?.title).toBe('User Left');
      expect(result?.message).toContain('John Doe');
    });
  });

  describe('notifyBridgeCreated', () => {
    it('should create bridge created notification', async () => {
      notificationService['preferences'].bridge_created = true;

      const result = await notificationService.notifyBridgeCreated(
        'bridge_1',
        'Ethereum',
        'Polygon'
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('bridge_created');
      expect(result?.title).toBe('New Bridge Created');
      expect(result?.message).toContain('Ethereum');
      expect(result?.message).toContain('Polygon');
    });
  });

  describe('notifyOptimizationComplete', () => {
    it('should create optimization complete notification', async () => {
      notificationService['preferences'].optimization_complete = true;

      const result = await notificationService.notifyOptimizationComplete(
        'bridge_1',
        'https://example.com',
        150
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('optimization_complete');
      expect(result?.title).toBe('Optimization Complete');
      expect(result?.message).toContain('https://example.com');
      expect(result?.message).toContain('150KB');
    });
  });

  describe('notifySystemAlert', () => {
    it('should create system alert notification', async () => {
      notificationService['preferences'].system_alert = true;

      const result = await notificationService.notifySystemAlert(
        'bridge_1',
        'Bridge Maintenance',
        'Bridge will be under maintenance for 1 hour'
      );

      expect(result).not.toBeNull();
      expect(result?.type).toBe('system_alert');
      expect(result?.title).toBe('Bridge Maintenance');
      expect(result?.message).toContain('maintenance');
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request notification permission', async () => {
      const mockPermission = 'granted';
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: mockPermission,
          requestPermission: jest.fn().mockResolvedValue(mockPermission),
        },
        writable: true,
      });

      const result = await notificationService.requestNotificationPermission();

      expect(result).toBe(mockPermission);
    });
  });

  describe('setupBackgroundSync', () => {
    it('should setup background sync', async () => {
      const mockServiceWorker = {
        register: jest.fn().mockResolvedValue({}),
      };
      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockServiceWorker,
        writable: true,
      });

      await notificationService.setupBackgroundSync();

      expect(mockServiceWorker.register).toHaveBeenCalled();
    });
  });

  describe('setupPeriodicSync', () => {
    it('should setup periodic sync', async () => {
      const mockServiceWorker = {
        register: jest.fn().mockResolvedValue({}),
      };
      Object.defineProperty(navigator, 'serviceWorker', {
        value: mockServiceWorker,
        writable: true,
      });

      await notificationService.setupPeriodicSync();

      expect(mockServiceWorker.register).toHaveBeenCalled();
    });
  });
});