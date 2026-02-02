#!/usr/bin/env node

import Sentinel from './index';
import { ConfigLoader } from './utils/config';

async function main(): Promise<void> {
  try {
    const config = await ConfigLoader.loadConfig();
    const sentinel = new Sentinel(config);

    // Initialize and start
    await sentinel.initialize();
    await sentinel.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down Sentinel...');
      await sentinel.dispose();
      process.exit(0);
    });

    // Simulate events for demo
    setInterval(() => {
      const demoEvent = {
        source: `system_${Math.floor(Math.random() * 5)}`,
        timestamp: new Date(),
        data: {
          cpu_usage: Math.random() * 100,
          memory_usage: Math.random() * 100,
          network_traffic: Math.random() * 10000,
        },
      };
      sentinel.analyzeEvent(demoEvent).catch(console.error);
    }, 5000);

    // Listen for events
    sentinel.on('threat:detected', (threat) => {
      console.log('\n🚨 THREAT ALERT:', threat.name, `(Severity: ${threat.severity}/10)`);
    });

    sentinel.on('anomaly:detected', (anomaly) => {
      console.log('\n⚠️  ANOMALY DETECTED:', anomaly.type, `(${anomaly.severity})`);
    });

    sentinel.on('incident:created', (incident) => {
      console.log('\n📋 INCIDENT CREATED:', incident.id, `(Status: ${incident.status})`);
    });

    sentinel.on('response:completed', (result) => {
      console.log('\n✅ RESPONSE COMPLETED:', result.incidentId);
      console.log('   Actions:', result.actions.join(', '));
    });

    console.log('Sentinel is running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
