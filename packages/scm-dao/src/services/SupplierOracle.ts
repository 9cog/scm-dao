import { Oracle } from '../primitives/Oracle';
import { Signal } from '../types';

/**
 * SupplierOracle - ingests supplier feeds and logistics APIs
 */
export class SupplierOracle extends Oracle {
  constructor() {
    super('SupplierOracle');
  }

  protected async onIngest(source: string, data: any): Promise<void> {
    if (source === 'SupplierFeed') {
      this.processSupplierFeed(data);
    } else if (source === 'LogisticsAPI') {
      this.processLogisticsAPI(data);
    }
  }

  protected onEmit(signal: Signal): void {
    console.log(`[${this.name}] Emitting signal:`, signal.type);
  }

  private processSupplierFeed(data: any): void {
    const { supplierId, pricing, capacity } = data;
    
    this.emit({
      type: 'Pricing',
      data: { supplierId, pricing },
      metadata: { source: this.name, timestamp: Date.now() }
    });

    this.emit({
      type: 'Capacity',
      data: { supplierId, capacity },
      metadata: { source: this.name, timestamp: Date.now() }
    });
  }

  private processLogisticsAPI(data: any): void {
    const { supplierId, leadTime } = data;
    
    this.emit({
      type: 'LeadTimes',
      data: { supplierId, leadTime },
      metadata: { source: this.name, timestamp: Date.now() }
    });
  }
}
