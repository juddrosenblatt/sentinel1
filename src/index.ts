import { EventEmitter } from 'events';
import { Logger } from './utils/logger';
import { ConfigLoader } from './utils/config';
import { ThreatDetectionEngine } from './detection/threat-engine';
import { IncidentResponseOrchestrator } from './response/orchestrator';
import { AnomalyDetector } from './detection/anomaly-detector';
import { EventSystem } from './core/event-system';

export interface SentinelConfig {
  logging: {
    level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
    format: 'json' | 'pretty' | 'compact';
    colors: boolean;
  };
  detection: {
    enableMLDetection: boolean;
    enableAnomalyDetection: boolean;
    threatThreshold: number;
    updateInterval: number;
  };
  response: {
    autoRespond: boolean;
    maxConcurrentIncidents: number;
    responseTimeout: number;
  };
  monitoring: {
    dataSourceTimeout: number;
    metricsInterval: number;
    alertChannels: string[];
  };
}

export class Sentinel extends EventEmitter {
  private logger: Logger;
  private config: SentinelConfig;
  private threatEngine: ThreatDetectionEngine;
  private responseOrchestrator: IncidentResponseOrchestrator;
  private anomalyDetector: AnomalyDetector;
  private eventSystem: EventSystem;
  private isRunning: boolean = false;

  constructor(config?: Partial<SentinelConfig>) {
    super();
    this.config = this.mergeConfig(config);
    this.logger = new Logger(this.config.logging);
    this.threatEngine = new ThreatDetectionEngine(this.config.detection, this.logger);
    this.responseOrchestrator = new IncidentResponseOrchestrator(
      this.config.response,
      this.logger
    );
    this.anomalyDetector = new AnomalyDetector(this.logger);
    this.eventSystem = new EventSystem();
    this.setupEventHandlers();
  }

  private mergeConfig(config?: Partial<SentinelConfig>): SentinelConfig {
    return {
      logging: {
        level: 'info',
        format: 'pretty',
        colors: true,
        ...config?.logging,
      },
      detection: {
        enableMLDetection: true,
        enableAnomalyDetection: true,
        threatThreshold: 7.0,
        updateInterval: 300000,
        ...config?.detection,
      },
      response: {
        autoRespond: true,
        maxConcurrentIncidents: 10,
        responseTimeout: 30000,
        ...config?.response,
      },
      monitoring: {
        dataSourceTimeout: 5000,
        metricsInterval: 60000,
        alertChannels: ['console', 'email'],
        ...config?.monitoring,
      },
    };
  }

  private setupEventHandlers(): void {
    this.threatEngine.on('threat:detected', (threat) => {
      this.logger.info(`Threat detected: ${threat.name} (Severity: ${threat.severity})`);
      this.emit('threat:detected', threat);
      
      if (this.config.response.autoRespond && threat.severity >= this.config.detection.threatThreshold) {
        this.responseOrchestrator.respondToThreat(threat);
      }
    });

    this.anomalyDetector.on('anomaly:detected', (anomaly) => {
      this.logger.warn(`Anomaly detected: ${anomaly.type}`);
      this.emit('anomaly:detected', anomaly);
    });

    this.responseOrchestrator.on('incident:created', (incident) => {
      this.logger.info(`Incident created: ${incident.id}`);
      this.emit('incident:created', incident);
    });

    this.responseOrchestrator.on('response:completed', (result) => {
      this.logger.info(`Response completed for incident: ${result.incidentId}`);
      this.emit('response:completed', result);
    });
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing Sentinel...');
    
    try {
      await this.threatEngine.initialize();
      await this.anomalyDetector.initialize();
      await this.responseOrchestrator.initialize();
      this.logger.info('Sentinel initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Sentinel', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Sentinel is already running');
      return;
    }

    this.logger.info('Starting Sentinel threat detection...');
    this.isRunning = true;
    this.emit('sentinel:started');

    try {
      await this.threatEngine.start();
      await this.anomalyDetector.start();
      this.logger.info('Sentinel threat detection started');
    } catch (error) {
      this.logger.error('Failed to start Sentinel', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('Sentinel is not running');
      return;
    }

    this.logger.info('Stopping Sentinel...');
    this.isRunning = false;

    try {
      await this.threatEngine.stop();
      await this.anomalyDetector.stop();
      await this.responseOrchestrator.cleanup();
      this.logger.info('Sentinel stopped');
      this.emit('sentinel:stopped');
    } catch (error) {
      this.logger.error('Error while stopping Sentinel', error);
      throw error;
    }
  }

  getStatus(): {
    isRunning: boolean;
    threatEngine: string;
    responseOrchestrator: string;
    anomalyDetector: string;
  } {
    return {
      isRunning: this.isRunning,
      threatEngine: this.threatEngine.getStatus(),
      responseOrchestrator: this.responseOrchestrator.getStatus(),
      anomalyDetector: this.anomalyDetector.getStatus(),
    };
  }

  async analyzeEvent(event: Record<string, any>): Promise<void> {
    await this.threatEngine.analyzeEvent(event);
    await this.anomalyDetector.analyzeMetric(event);
  }

  getActiveIncidents() {
    return this.responseOrchestrator.getActiveIncidents();
  }

  async respondToManualAlert(alertData: Record<string, any>): Promise<void> {
    await this.responseOrchestrator.handleManualAlert(alertData);
  }

  async dispose(): Promise<void> {
    await this.stop();
    this.logger.info('Sentinel disposed');
  }
}

export default Sentinel;
