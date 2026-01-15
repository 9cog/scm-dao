import { LedgerEntry, Commitment } from "../types";

/**
 * Ledger primitive - shared state, commitments, proofs
 */
export class Ledger {
  private storage: Map<string, LedgerEntry> = new Map();
  private commitments: Map<string, Commitment> = new Map();
  private subsections: Map<string, Ledger> = new Map();

  constructor(private name: string = "root") {}

  /**
   * Write data to ledger
   */
  async write<T>(key: string, value: T): Promise<void> {
    const entry: LedgerEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
    };
    this.storage.set(key, entry);
  }

  /**
   * Read data from ledger
   */
  async read<T>(key: string): Promise<T | undefined> {
    const entry = this.storage.get(key);
    return entry?.value as T | undefined;
  }

  /**
   * Create a commitment
   */
  async createCommitment<T>(id: string, data: T): Promise<Commitment<T>> {
    const commitment: Commitment<T> = {
      id,
      data,
      state: "pending",
      timestamp: Date.now(),
    };
    this.commitments.set(id, commitment);
    return commitment;
  }

  /**
   * Commit a pending commitment
   */
  async commitCommitment(id: string): Promise<void> {
    const commitment = this.commitments.get(id);
    if (commitment && commitment.state === "pending") {
      commitment.state = "committed";
    }
  }

  /**
   * Fail a commitment
   */
  async failCommitment(id: string): Promise<void> {
    const commitment = this.commitments.get(id);
    if (commitment && commitment.state === "pending") {
      commitment.state = "failed";
    }
  }

  /**
   * Get a subsection of the ledger
   */
  subsection(name: string): Ledger {
    if (!this.subsections.has(name)) {
      this.subsections.set(name, new Ledger(`${this.name}.${name}`));
    }
    return this.subsections.get(name)!;
  }

  /**
   * Get all entries
   */
  getAll(): LedgerEntry[] {
    return Array.from(this.storage.values());
  }

  getName(): string {
    return this.name;
  }
}

/**
 * Static ledger subsections as defined in spec
 */
export const LedgerSubsections = {
  Inventory: "Inventory",
  Forecasts: "Forecasts",
  Commitments: "Commitments",
  Logistics: "Logistics",
  Financials: "Financials",
  All: "All",
};
