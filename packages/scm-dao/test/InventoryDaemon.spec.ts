import { Ledger } from '../src/primitives/Ledger';
import { InventoryDaemon } from '../src/services/InventoryDaemon';
import { Event } from '../src/types';

describe('InventoryDaemon', () => {
  let ledger: Ledger;
  let daemon: InventoryDaemon;

  beforeEach(() => {
    ledger = new Ledger('test');
    daemon = new InventoryDaemon(ledger);
  });

  test('should start and stop daemon', async () => {
    await daemon.start();
    expect(daemon.isRunning()).toBe(true);
    
    await daemon.stop();
    expect(daemon.isRunning()).toBe(false);
  });

  test('should emit ReorderSignal when stock is low', async () => {
    await daemon.start();
    
    let signalEmitted = false;
    // Override onEmit to capture signals
    const originalEmit = (daemon as any).onEmit;
    (daemon as any).onEmit = (signal: any) => {
      if (signal.type === 'ReorderSignal') {
        expect(signal.data.sku).toBe('SKU-001');
        expect(signal.data.currentLevel).toBe(10);
        signalEmitted = true;
      }
      originalEmit.call(daemon, signal);
    };

    const event: Event = {
      type: 'StockLevelChange',
      payload: { sku: 'SKU-001', level: 10, threshold: 50 },
      timestamp: Date.now(),
      source: 'test'
    };

    daemon.injectEvent(event);
    expect(signalEmitted).toBe(true);
  });

  test('should emit OverstockSignal when stock is high', async () => {
    await daemon.start();
    
    let signalEmitted = false;
    const originalEmit = (daemon as any).onEmit;
    (daemon as any).onEmit = (signal: any) => {
      if (signal.type === 'OverstockSignal') {
        expect(signal.data.sku).toBe('SKU-002');
        expect(signal.data.currentLevel).toBe(200);
        signalEmitted = true;
      }
      originalEmit.call(daemon, signal);
    };

    const event: Event = {
      type: 'StockLevelChange',
      payload: { sku: 'SKU-002', level: 200, threshold: 50 },
      timestamp: Date.now(),
      source: 'test'
    };

    daemon.injectEvent(event);
    expect(signalEmitted).toBe(true);
  });
});
