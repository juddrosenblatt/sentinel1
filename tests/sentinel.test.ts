import { Sentinel } from '../../src/index';

describe('Sentinel Core', () => {
  let sentinel: Sentinel;

  beforeEach(async () => {
    sentinel = new Sentinel({
      logging: { level: 'silent', format: 'json', colors: false },
    });
    await sentinel.initialize();
  });

  afterEach(async () => {
    await sentinel.dispose();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      const status = sentinel.getStatus();
      expect(status.isRunning).toBe(false);
    });

    it('should start detection engine', async () => {
      await sentinel.start();
      const status = sentinel.getStatus();
      expect(status.threatEngine).toBe('active');
    });
  });

  describe('Event Handling', () => {
    it('should emit threat detected event', async () => {
      await sentinel.start();
      
      const threatPromise = new Promise((resolve) => {
        sentinel.once('threat:detected', resolve);
      });

      const testEvent = {
        source: 'test',
        data: { pattern: 'malicious_pattern' },
      };

      await sentinel.analyzeEvent(testEvent);
      const threat = await Promise.race([
        threatPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 1000)
        ),
      ]);

      expect(threat).toBeDefined();
    });
  });

  describe('Incident Management', () => {
    it('should track incidents', async () => {
      await sentinel.start();
      const incidents = sentinel.getActiveIncidents();
      expect(Array.isArray(incidents)).toBe(true);
    });
  });
});
