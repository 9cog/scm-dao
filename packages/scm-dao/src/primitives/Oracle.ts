import { Signal } from "../types";

/**
 * Oracle primitive - boundary service to external reality
 */
export abstract class Oracle {
  protected name: string;
  private feeds: Map<string, any> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Ingest data from external sources
   */
  async ingest(source: string, data: any): Promise<void> {
    this.feeds.set(source, data);
    await this.onIngest(source, data);
  }

  /**
   * Emit processed signals
   */
  protected emit(signal: Signal): void {
    this.onEmit(signal);
  }

  /**
   * Hook for ingesting external data
   */
  protected abstract onIngest(source: string, data: any): Promise<void>;

  /**
   * Hook for emitting signals
   */
  protected abstract onEmit(signal: Signal): void;

  /**
   * Get feed data
   */
  protected getFeed(source: string): any {
    return this.feeds.get(source);
  }

  getName(): string {
    return this.name;
  }
}
