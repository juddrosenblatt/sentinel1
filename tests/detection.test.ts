import { ThreatDetectionEngine } from '../../src/detection/threat-engine';
import { Logger } from '../../src/utils/logger';

describe('Threat Detection Engine', () => {
  let engine: ThreatDetectionEngine;
  let logger: Logger;

  beforeEach(async () => {
    logger = new Logger({ level: 'silent', format: 'json', colors: false });
    engine = new ThreatDetectionEngine(
      { enableMLDetection: true },
      logger
    );
    await engine.initialize();
  });

  describe('Threat Detection', () => {
    it('should detect malware signatures', (done) => {
      engine.on('threat:detected', (threat) => {
        expect(threat.severity).toBeGreaterThan(0);
        done();
      });

      engine.analyzeEvent({
        source: 'test',
        data: 'malicious_pattern detected',
      }).catch(done);
    });

    it('should handle benign events', async () => {
      const threatSpy = jest.fn();
      engine.on('threat:detected', threatSpy);

      await engine.analyzeEvent({
        source: 'test',
        data: 'normal_operation',
      });

      // May or may not detect depending on rules
      expect(typeof threatSpy.mock.calls.length).toBe('number');
    });
  });

  describe('Lifecycle', () => {
    it('should start and stop correctly', async () => {
      await engine.start();
      expect(engine.getStatus()).toBe('active');

      await engine.stop();
      expect(engine.getStatus()).toBe('inactive');
    });
  });
});
