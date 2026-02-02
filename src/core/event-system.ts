import { EventEmitter } from 'events';

export class EventSystem extends EventEmitter {
  private eventHistory: Array<{ timestamp: Date; event: string; data: any }> = [];
  private maxHistorySize: number = 10000;

  emit(event: string | symbol, ...args: any[]): boolean {
    this.recordEvent(event as string, args[0]);
    return super.emit(event, ...args);
  }

  private recordEvent(event: string, data: any): void {
    this.eventHistory.push({
      timestamp: new Date(),
      event,
      data,
    });

    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  getEventHistory(limit: number = 100): typeof this.eventHistory {
    return this.eventHistory.slice(-limit);
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}
