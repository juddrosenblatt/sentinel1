import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  value: number;
  threshold: number;
  details: Record<string, any>;
}

export class AnomalyDetector extends EventEmitter {
  private isRunning: boolean = false;
  private baseline: Map<string, number> = new Map();
  private deviationThreshold: number = 3; // Standard deviations

  constructor(private logger: Logger) {
    super();
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Anomaly Detector');
    this.setupBaselines();
  }

  private setupBaselines(): void {
    // Setup baseline metrics
    this.baseline.set('cpu_usage', 50);
    this.baseline.set('memory_usage', 60);
    this.baseline.set('network_traffic', 1000);
    this.baseline.set('request_rate', 500);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info('Anomaly Detector started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    this.logger.info('Anomaly Detector stopped');
  }

  async analyzeMetric(metric: Record<string, any>): Promise<void> {
    if (!this.isRunning) return;

    for (const [key, baselineValue] of this.baseline) {
      if (metric[key] !== undefined) {
        const currentValue = metric[key];
        const deviation = Math.abs(currentValue - (baselineValue as number)) / (baselineValue as number);

        if (deviation > this.deviationThreshold) {
          const anomaly: Anomaly = {
            id: `anomaly_${Date.now()}`,
            type: key,
            severity: deviation > 5 ? 'high' : 'medium',
            timestamp: new Date(),
            value: currentValue,
            threshold: baselineValue as number,
            details: metric,
          };
          this.emit('anomaly:detected', anomaly);
        }
      }
    }
  }

  getStatus(): string {
    return this.isRunning ? 'active' : 'inactive';
  }

  updateBaseline(key: string, value: number): void {
    this.baseline.set(key, value);
    this.logger.debug(`Updated baseline for ${key}: ${value}`);
  }
}
