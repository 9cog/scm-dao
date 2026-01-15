import { createSupplyChainDAO } from '../src';

describe('SupplyChainDAO Integration', () => {
  test('should create complete DAO system', () => {
    const dao = createSupplyChainDAO();
    
    expect(dao.ledger).toBeDefined();
    expect(dao.inventoryDaemon).toBeDefined();
    expect(dao.demandDaemon).toBeDefined();
    expect(dao.supplierOracle).toBeDefined();
    expect(dao.procurementWorker).toBeDefined();
    expect(dao.logisticsWorker).toBeDefined();
    expect(dao.settlementWorker).toBeDefined();
    expect(dao.governanceDaemon).toBeDefined();
    expect(dao.supervisor).toBeDefined();
    expect(dao.orchestrator).toBeDefined();
  });

  test('should start and stop daemons', async () => {
    const dao = createSupplyChainDAO();
    
    await dao.orchestrator.startAll();
    expect(dao.inventoryDaemon.isRunning()).toBe(true);
    expect(dao.demandDaemon.isRunning()).toBe(true);
    
    await dao.orchestrator.stopAll();
    expect(dao.inventoryDaemon.isRunning()).toBe(false);
    expect(dao.demandDaemon.isRunning()).toBe(false);
  });

  test('should have replenishment flow registered', () => {
    const dao = createSupplyChainDAO();
    
    const flows = dao.orchestrator.getFlows();
    const replenishmentFlow = flows.find(f => f.name === 'Replenishment');
    
    expect(replenishmentFlow).toBeDefined();
    expect(replenishmentFlow?.steps).toContain('InventoryDaemon.ReorderSignal');
  });

  test('should have guarantees defined', () => {
    const dao = createSupplyChainDAO();
    
    const guarantees = dao.orchestrator.getGuarantees();
    
    expect(guarantees).toContain('EventualConsistency(Ledger)');
    expect(guarantees).toContain('RoleIsolation');
    expect(guarantees).toContain('ReplaceableWorkers');
    expect(guarantees).toContain('PolicyHotSwap');
  });
});
