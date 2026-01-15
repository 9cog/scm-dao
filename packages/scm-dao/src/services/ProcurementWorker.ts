import { Worker } from '../primitives/Worker';
import { Ledger, LedgerSubsections } from '../primitives/Ledger';
import { Signal } from '../types';

interface ProcurementInput {
  ReorderSignal?: any;
  DemandForecast?: any;
  LeadTimes?: any;
}

interface PurchaseOrder {
  orderId: string;
  sku: string;
  quantity: number;
  supplierId: string;
  expectedDelivery: Date;
  totalCost: number;
}

/**
 * ProcurementWorker - consumes signals and produces purchase orders
 */
export class ProcurementWorker extends Worker<ProcurementInput, PurchaseOrder> {
  private ledger: Ledger;

  constructor(ledger: Ledger) {
    super('ProcurementWorker');
    this.ledger = ledger;
  }

  protected async process(input: ProcurementInput): Promise<PurchaseOrder> {
    const { ReorderSignal, DemandForecast, LeadTimes } = input;
    
    // Determine order quantity based on demand forecast and current stock
    const quantity = this.calculateOrderQuantity(
      ReorderSignal?.currentLevel || 0,
      DemandForecast?.forecast || 0
    );

    // Select supplier (simplified logic)
    const supplierId = 'SUPPLIER_001';
    
    // Calculate expected delivery based on lead time
    const leadTime = LeadTimes?.leadTime || 7;
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + leadTime);

    const purchaseOrder: PurchaseOrder = {
      orderId: `PO-${Date.now()}`,
      sku: ReorderSignal?.sku || 'UNKNOWN',
      quantity,
      supplierId,
      expectedDelivery,
      totalCost: quantity * 10 // Simplified pricing
    };

    return purchaseOrder;
  }

  protected async commit(output: PurchaseOrder): Promise<void> {
    const commitment = await this.ledger
      .subsection(LedgerSubsections.Commitments)
      .createCommitment(output.orderId, output);
    
    await this.ledger
      .subsection(LedgerSubsections.Commitments)
      .commitCommitment(commitment.id);
  }

  private calculateOrderQuantity(currentLevel: number, forecast: number): number {
    // Order to cover forecast plus safety stock
    const safetyStock = forecast * 0.2;
    return Math.max(0, Math.ceil(forecast + safetyStock - currentLevel));
  }
}
