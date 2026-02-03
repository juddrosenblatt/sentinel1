#!/usr/bin/env node
/**
 * Sentinel1 Health Check CLI
 *
 * Usage: sentinel-health [options]
 */

import { healthMonitor } from './skills/agent-health';

// Register demo agents for testing
healthMonitor.registerAgent('agent-001', 'moltbook', '4claw');
healthMonitor.registerAgent('agent-002', 'bankrbot', 'moltbook');
healthMonitor.registerAgent('agent-003', 'Sentinel1', 'github');

// Simulate some health data
healthMonitor.updateHeartbeat('agent-001', 150);
healthMonitor.updateAlignmentScore('agent-001', 95);

healthMonitor.updateHeartbeat('agent-002', 200);
healthMonitor.updateAlignmentScore('agent-002', 88);

healthMonitor.updateHeartbeat('agent-003', 100);
healthMonitor.updateAlignmentScore('agent-003', 100);

// Generate and display report
console.log(healthMonitor.generateReport());

// Show detailed status
const healthCheck = healthMonitor.performHealthCheck();
console.log('\n=== Detailed Status ===\n');
console.log('Online agents:');
healthMonitor.getAgentsByStatus('online').forEach(agent => {
  console.log(`  ✓ ${agent.name} (${agent.platform}) - Alignment: ${agent.alignmentScore}%`);
});

if (healthCheck.degradedAgents > 0) {
  console.log('\nDegraded agents:');
  healthMonitor.getAgentsByStatus('degraded').forEach(agent => {
    console.log(`  ⚠️  ${agent.name} - Response: ${agent.responseTime}ms, Alignment: ${agent.alignmentScore}%`);
  });
}

if (healthCheck.offlineAgents > 0) {
  console.log('\nOffline agents:');
  healthMonitor.getAgentsByStatus('offline').forEach(agent => {
    console.log(`  ✗ ${agent.name} - Last seen: ${agent.lastSeen.toISOString()}`);
  });
}
