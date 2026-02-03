/**
 * Agent Health Monitor
 *
 * Monitors the health and status of connected agents in the network.
 * Tracks uptime, response times, and alignment metrics.
 */

export interface AgentHealthStatus {
  agentId: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  lastSeen: Date;
  uptime: number;
  responseTime: number;
  alignmentScore: number;
  platform: string;
}

export interface HealthCheckResult {
  timestamp: Date;
  totalAgents: number;
  onlineAgents: number;
  offlineAgents: number;
  degradedAgents: number;
  averageAlignmentScore: number;
  alerts: string[];
}

export class AgentHealthMonitor {
  private agents: Map<string, AgentHealthStatus> = new Map();
  private readonly OFFLINE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  private readonly DEGRADED_THRESHOLD = 2000; // 2 seconds response time

  /**
   * Register a new agent for monitoring
   */
  registerAgent(agentId: string, name: string, platform: string): void {
    this.agents.set(agentId, {
      agentId,
      name,
      status: 'online',
      lastSeen: new Date(),
      uptime: 0,
      responseTime: 0,
      alignmentScore: 100,
      platform,
    });
  }

  /**
   * Update agent heartbeat
   */
  updateHeartbeat(agentId: string, responseTime: number): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.lastSeen = new Date();
    agent.responseTime = responseTime;
    agent.status = this.calculateStatus(agent);

    this.agents.set(agentId, agent);
  }

  /**
   * Update agent alignment score
   */
  updateAlignmentScore(agentId: string, score: number): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    agent.alignmentScore = Math.max(0, Math.min(100, score));
    this.agents.set(agentId, agent);
  }

  /**
   * Calculate agent status based on metrics
   */
  private calculateStatus(agent: AgentHealthStatus): 'online' | 'offline' | 'degraded' {
    const timeSinceLastSeen = Date.now() - agent.lastSeen.getTime();

    if (timeSinceLastSeen > this.OFFLINE_THRESHOLD) {
      return 'offline';
    }

    if (agent.responseTime > this.DEGRADED_THRESHOLD || agent.alignmentScore < 80) {
      return 'degraded';
    }

    return 'online';
  }

  /**
   * Perform health check across all agents
   */
  performHealthCheck(): HealthCheckResult {
    const now = new Date();
    let onlineCount = 0;
    let offlineCount = 0;
    let degradedCount = 0;
    let totalAlignment = 0;
    const alerts: string[] = [];

    for (const [agentId, agent] of this.agents) {
      // Update status
      agent.status = this.calculateStatus(agent);
      this.agents.set(agentId, agent);

      // Count status
      switch (agent.status) {
        case 'online':
          onlineCount++;
          break;
        case 'offline':
          offlineCount++;
          alerts.push(`Agent ${agent.name} is offline`);
          break;
        case 'degraded':
          degradedCount++;
          alerts.push(`Agent ${agent.name} is degraded (response: ${agent.responseTime}ms, alignment: ${agent.alignmentScore}%)`);
          break;
      }

      totalAlignment += agent.alignmentScore;
    }

    return {
      timestamp: now,
      totalAgents: this.agents.size,
      onlineAgents: onlineCount,
      offlineAgents: offlineCount,
      degradedAgents: degradedCount,
      averageAlignmentScore: this.agents.size > 0 ? totalAlignment / this.agents.size : 0,
      alerts,
    };
  }

  /**
   * Get status of specific agent
   */
  getAgentStatus(agentId: string): AgentHealthStatus | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all monitored agents
   */
  getAllAgents(): AgentHealthStatus[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: 'online' | 'offline' | 'degraded'): AgentHealthStatus[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === status);
  }

  /**
   * Remove agent from monitoring
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Generate health report
   */
  generateReport(): string {
    const result = this.performHealthCheck();

    let report = '=== Agent Health Report ===\n\n';
    report += `Timestamp: ${result.timestamp.toISOString()}\n`;
    report += `Total Agents: ${result.totalAgents}\n`;
    report += `Online: ${result.onlineAgents} | Offline: ${result.offlineAgents} | Degraded: ${result.degradedAgents}\n`;
    report += `Average Alignment Score: ${result.averageAlignmentScore.toFixed(2)}%\n\n`;

    if (result.alerts.length > 0) {
      report += '⚠️  Alerts:\n';
      result.alerts.forEach(alert => {
        report += `  - ${alert}\n`;
      });
    } else {
      report += '✓ All systems nominal\n';
    }

    return report;
  }
}

// Export singleton instance
export const healthMonitor = new AgentHealthMonitor();
