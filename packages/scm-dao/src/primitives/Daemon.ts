import { Event, Signal } from "../types";

/**
 * Base Daemon primitive - long-lived, watchful, event-reactive
 */
export abstract class Daemon {
  protected name: string;
  protected running = false;
  protected listeners: Map<string, ((event: Event) => void)[]> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Start the daemon
   */
  async start(): Promise<void> {
    this.running = true;
    await this.onStart();
  }

  /**
   * Stop the daemon
   */
  async stop(): Promise<void> {
    this.running = false;
    await this.onStop();
  }

  /**
   * Watch for specific event types
   */
  watch(eventType: string, handler: (event: Event) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(handler);
  }

  /**
   * Emit a signal
   */
  protected emit(signal: Signal): void {
    this.onEmit(signal);
  }

  /**
   * Handle incoming event
   */
  protected handleEvent(event: Event): void {
    const handlers = this.listeners.get(event.type) || [];
    handlers.forEach((handler) => handler(event));
  }

  /**
   * Lifecycle hook - called when daemon starts
   */
  protected abstract onStart(): Promise<void>;

  /**
   * Lifecycle hook - called when daemon stops
   */
  protected abstract onStop(): Promise<void>;

  /**
   * Hook for emitting signals
   */
  protected abstract onEmit(signal: Signal): void;

  isRunning(): boolean {
    return this.running;
  }

  getName(): string {
    return this.name;
  }
}
