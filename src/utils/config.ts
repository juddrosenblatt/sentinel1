import fs from 'fs/promises';
import path from 'path';
import * as process from 'process';

export class ConfigLoader {
  static async loadConfig(configPath?: string): Promise<Record<string, any>> {
    const defaultPath = configPath || path.join(process.cwd(), 'sentinel.config.json');

    try {
      if (await this.fileExists(defaultPath)) {
        const content = await fs.readFile(defaultPath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to load config from ${defaultPath}`, error);
    }

    return this.getDefaultConfig();
  }

  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private static getDefaultConfig(): Record<string, any> {
    return {
      logging: {
        level: 'info',
        format: 'pretty',
        colors: true,
      },
      detection: {
        enableMLDetection: true,
        enableAnomalyDetection: true,
        threatThreshold: 7.0,
      },
      response: {
        autoRespond: true,
        maxConcurrentIncidents: 10,
      },
    };
  }
}
