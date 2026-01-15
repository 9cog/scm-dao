import { Daemon } from "./Daemon";
import { Worker } from "./Worker";

/**
 * Supervisor primitive - health, escalation, arbitration
 */
export class Supervisor {
  private name: string;
  private monitoredServices: (Daemon | Worker)[] = [];
  private failureHandlers: Map<
    string,
    ((service: Daemon | Worker, error: Error) => void)[]
  > = new Map();

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Monitor a service
   */
  monitor(service: Daemon | Worker): void {
    this.monitoredServices.push(service);
  }

  /**
   * Register failure handler
   */
  onFailure(handler: (service: Daemon | Worker, error: Error) => void): void {
    const key = "default";
    if (!this.failureHandlers.has(key)) {
      this.failureHandlers.set(key, []);
    }
    this.failureHandlers.get(key)!.push(handler);
  }

  /**
   * Handle service failure
   */
  async handleFailure(
    service: Daemon | Worker,
    error: Error
  ): Promise<void> {
    const handlers = this.failureHandlers.get("default") || [];
    for (const handler of handlers) {
      handler(service, error);
    }
  }

  /**
   * Retry a failed operation
   */
  async retry<T>(operation: () => Promise<T>, maxAttempts = 3): Promise<T> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) {
          throw lastError;
        }
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
      }
    }
    throw lastError!;
  }

  /**
   * Quarantine a service
   */
  quarantine(service: Daemon | Worker): void {
    const index = this.monitoredServices.indexOf(service);
    if (index !== -1) {
      this.monitoredServices.splice(index, 1);
    }
  }

  /**
   * Escalate to DAO governance
   */
  async escalateToDAO(issue: string, context: any): Promise<void> {
    // Placeholder for DAO escalation logic
    console.log(`Escalating to DAO: ${issue}`, context);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getName(): string {
    return this.name;
  }

  getMonitoredServices(): (Daemon | Worker)[] {
    return [...this.monitoredServices];
  }
}
