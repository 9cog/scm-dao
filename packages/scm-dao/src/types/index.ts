/**
 * Core event type for the DAO system
 */
export interface Event<T = any> {
  type: string;
  payload: T;
  timestamp: number;
  source: string;
}

/**
 * Signal type for inter-service communication
 */
export interface Signal<T = any> {
  type: string;
  data: T;
  metadata?: Record<string, any>;
}

/**
 * State entry for ledger storage
 */
export interface LedgerEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  signature?: string;
}

/**
 * Commitment for ledger operations
 */
export interface Commitment<T = any> {
  id: string;
  data: T;
  state: "pending" | "committed" | "failed";
  timestamp: number;
}

/**
 * Policy for governance
 */
export interface Policy {
  id: string;
  rules: Record<string, any>;
  version: number;
  authority: string;
}
