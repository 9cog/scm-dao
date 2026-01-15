import { Daemon } from "../primitives/Daemon";
import { Ledger } from "../primitives/Ledger";
import { Event, Signal, Policy } from "../types";

/**
 * GovernanceDaemon - watches ledger and proposal events, emits policy updates
 */
export class GovernanceDaemon extends Daemon {
  private ledger: Ledger;
  private policies: Map<string, Policy> = new Map();

  constructor(ledger: Ledger) {
    super("GovernanceDaemon");
    this.ledger = ledger;
  }

  protected async onStart(): Promise<void> {
    this.watch("ProposalEvent", (event) => this.handleProposal(event));
    this.watch("LedgerUpdate", (event) => this.handleLedgerUpdate(event));
  }

  protected async onStop(): Promise<void> {
    // Cleanup
  }

  protected onEmit(signal: Signal): void {
    console.log(`[${this.name}] Emitting signal:`, signal.type);
  }

  private handleProposal(event: Event): void {
    const { proposalId, policy, votes } = event.payload;

    // Check if proposal passed (simplified token-weighted voting)
    if (this.proposalPassed(votes)) {
      // Update policy
      const newPolicy: Policy = {
        id: proposalId,
        rules: policy,
        version: Date.now(),
        authority: "DAO.TokenWeighted",
      };

      this.policies.set(proposalId, newPolicy);

      // Emit policy update signal
      this.emit({
        type: "PolicyUpdate",
        data: newPolicy,
        metadata: { source: this.name, timestamp: Date.now() },
      });
    }
  }

  private handleLedgerUpdate(event: Event): void {
    // Monitor ledger for anomalies or issues that need governance attention
    const { subsection, key } = event.payload;
    console.log(`Ledger update in ${subsection}: ${key}`);
  }

  private proposalPassed(votes: any): boolean {
    // Simplified voting logic - majority rule
    return (votes.for || 0) > (votes.against || 0);
  }

  public injectEvent(event: Event): void {
    if (!this.running) {
      throw new Error(`Cannot inject event: ${this.name} is not running`);
    }
    this.handleEvent(event);
  }

  public getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }
}
