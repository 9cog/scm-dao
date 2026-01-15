/**
 * Flow definition
 */
export interface Flow {
  name: string;
  steps: string[];
  execute(): Promise<void>;
}

/**
 * Orchestrator primitive - flow composition, policy encoding
 */
export class Orchestrator {
  private name: string;
  private flows: Map<string, Flow> = new Map();
  private guarantees: string[] = [];

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Register a flow
   */
  registerFlow(flow: Flow): void {
    this.flows.set(flow.name, flow);
  }

  /**
   * Execute a flow
   */
  async executeFlow(flowName: string): Promise<void> {
    const flow = this.flows.get(flowName);
    if (!flow) {
      throw new Error(`Flow ${flowName} not found`);
    }
    await flow.execute();
  }

  /**
   * Add a guarantee
   */
  addGuarantee(guarantee: string): void {
    this.guarantees.push(guarantee);
  }

  /**
   * Get all flows
   */
  getFlows(): Flow[] {
    return Array.from(this.flows.values());
  }

  /**
   * Get guarantees
   */
  getGuarantees(): string[] {
    return [...this.guarantees];
  }

  getName(): string {
    return this.name;
  }
}
