import { Daemon } from '../primitives/Daemon';
import { Ledger, LedgerSubsections } from '../primitives/Ledger';
import { Event, Signal } from '../types';

/**
 * DemandDaemon - watches sales velocity and market signals
 */
export class DemandDaemon extends Daemon {
  private ledger: Ledger;

  constructor(ledger: Ledger) {
    super('DemandDaemon');
    this.ledger = ledger;
  }

  protected async onStart(): Promise<void> {
    this.watch('SalesVelocity', (event) => this.handleSalesVelocity(event));
    this.watch('MarketSignal', (event) => this.handleMarketSignal(event));
  }

  protected async onStop(): Promise<void> {
    // Cleanup
  }

  protected onEmit(signal: Signal): void {
    console.log(`[${this.name}] Emitting signal:`, signal.type);
  }

  private handleSalesVelocity(event: Event): void {
    const { sku, velocity, period } = event.payload;
    
    // Calculate demand forecast
    const forecast = this.calculateForecast(velocity, period);
    
    this.emit({
      type: 'DemandForecast',
      data: { sku, forecast, velocity, period },
      metadata: { source: this.name, timestamp: Date.now() }
    });

    // Update ledger
    this.ledger.subsection(LedgerSubsections.Forecasts).write(sku, {
      forecast,
      velocity,
      period,
      timestamp: Date.now()
    });
  }

  private handleMarketSignal(event: Event): void {
    const { signal, impact } = event.payload;
    this.ledger.subsection(LedgerSubsections.Forecasts).write('market_signals', {
      signal,
      impact,
      timestamp: Date.now()
    });
  }

  private calculateForecast(velocity: number, period: number): number {
    // Simple linear forecast (can be enhanced with ML models)
    return velocity * period * 1.1; // 10% buffer
  }

  public injectEvent(event: Event): void {
    this.handleEvent(event);
  }
}
