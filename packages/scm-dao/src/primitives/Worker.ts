import { Signal } from "../types";

/**
 * Base Worker primitive - short-lived, task-bound, deterministic
 */
export abstract class Worker<TInput = any, TOutput = any> {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Execute the worker task
   */
  async execute(input: TInput): Promise<TOutput> {
    const result = await this.process(input);
    await this.commit(result);
    return result;
  }

  /**
   * Process the input and produce output
   */
  protected abstract process(input: TInput): Promise<TOutput>;

  /**
   * Commit the result to the ledger
   */
  protected abstract commit(output: TOutput): Promise<void>;

  /**
   * Consume signals
   */
  consume(...signals: Signal[]): any {
    return this.extractData(signals);
  }

  /**
   * Extract data from signals for processing
   */
  protected extractData(signals: Signal[]): any {
    return signals.reduce((acc, signal) => {
      acc[signal.type] = signal.data;
      return acc;
    }, {} as Record<string, any>);
  }

  getName(): string {
    return this.name;
  }
}
