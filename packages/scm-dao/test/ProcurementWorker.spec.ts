import { Ledger } from '../src/primitives/Ledger';
import { ProcurementWorker } from '../src/services/ProcurementWorker';

describe('ProcurementWorker', () => {
  let ledger: Ledger;
  let worker: ProcurementWorker;

  beforeEach(() => {
    ledger = new Ledger('test');
    worker = new ProcurementWorker(ledger);
  });

  test('should process procurement request', async () => {
    const input = {
      ReorderSignal: { sku: 'SKU-001', currentLevel: 10, threshold: 50 },
      DemandForecast: { sku: 'SKU-001', forecast: 100 },
      LeadTimes: { leadTime: 7 }
    };

    const result = await worker.execute(input);
    
    expect(result.sku).toBe('SKU-001');
    expect(result.quantity).toBeGreaterThan(0);
    expect(result.orderId).toContain('PO-');
  });

  test('should calculate order quantity correctly', async () => {
    const input = {
      ReorderSignal: { sku: 'SKU-001', currentLevel: 20, threshold: 50 },
      DemandForecast: { sku: 'SKU-001', forecast: 100 },
      LeadTimes: { leadTime: 7 }
    };

    const result = await worker.execute(input);
    
    // Should order forecast + 20% safety stock - current level
    // 100 + 20 - 20 = 100
    expect(result.quantity).toBe(100);
  });
});
