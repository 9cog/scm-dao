import { Daemon } from "../primitives/Daemon";
import { Ledger, LedgerSubsections } from "../primitives/Ledger";
import { Event, Signal } from "../types";

/**
 * InventoryDaemon - watches stock levels and SKU events
 */
export class InventoryDaemon extends Daemon {
  private ledger: Ledger;

  constructor(ledger: Ledger) {
    super("InventoryDaemon");
    this.ledger = ledger;
  }

  protected async onStart(): Promise<void> {
    // Watch for stock level changes
    this.watch("StockLevelChange", (event) =>
      this.handleStockLevelChange(event)
    );
    this.watch("SKUEvent", (event) => this.handleSKUEvent(event));
  }

  protected async onStop(): Promise<void> {
    // Cleanup
  }

  protected onEmit(signal: Signal): void {
    // Emit signals to connected systems
    console.log(`[${this.name}] Emitting signal:`, signal.type);
  }

  private handleStockLevelChange(event: Event): void {
    const { sku, level, threshold } = event.payload;

    // Check if reorder needed
    if (level < threshold) {
      this.emit({
        type: "ReorderSignal",
        data: { sku, currentLevel: level, threshold },
        metadata: { source: this.name, timestamp: Date.now() },
      });
    }

    // Check for overstock
    if (level > threshold * 3) {
      this.emit({
        type: "OverstockSignal",
        data: { sku, currentLevel: level, threshold },
        metadata: { source: this.name, timestamp: Date.now() },
      });
    }

    // Update ledger
    this.ledger.subsection(LedgerSubsections.Inventory).write(sku, {
      level,
      threshold,
      lastUpdate: Date.now(),
    });
  }

  private handleSKUEvent(event: Event): void {
    const { sku, eventType, data } = event.payload;
    this.ledger.subsection(LedgerSubsections.Inventory).write(`${sku}_events`, {
      eventType,
      data,
      timestamp: Date.now(),
    });
  }

  // Public method to inject events for testing
  injectEvent(event: Event): void {
    this.handleEvent(event);
  }
}
