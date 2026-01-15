// Core exports
export * from './types';
export * from './primitives';
export * from './services';
export { SupplyChainFlow } from './SupplyChainFlow';

// Re-export main classes for convenience
import { Ledger } from './primitives/Ledger';
import { SupplyChainFlow } from './SupplyChainFlow';
import { InventoryDaemon } from './services/InventoryDaemon';
import { DemandDaemon } from './services/DemandDaemon';
import { SupplierOracle } from './services/SupplierOracle';
import { ProcurementWorker } from './services/ProcurementWorker';
import { LogisticsWorker } from './services/LogisticsWorker';
import { SettlementWorker } from './services/SettlementWorker';
import { GovernanceDaemon } from './services/GovernanceDaemon';
import { OperationsSupervisor } from './services/OperationsSupervisor';

/**
 * Factory function to create a complete Supply Chain DAO system
 */
export function createSupplyChainDAO() {
  const ledger = new Ledger('SupplyChainDAO');
  
  const inventoryDaemon = new InventoryDaemon(ledger);
  const demandDaemon = new DemandDaemon(ledger);
  const supplierOracle = new SupplierOracle();
  const procurementWorker = new ProcurementWorker(ledger);
  const logisticsWorker = new LogisticsWorker(ledger);
  const settlementWorker = new SettlementWorker(ledger);
  const governanceDaemon = new GovernanceDaemon(ledger);
  
  const supervisor = new OperationsSupervisor();
  supervisor.setupMonitoring(
    inventoryDaemon,
    demandDaemon,
    procurementWorker,
    logisticsWorker,
    settlementWorker
  );
  
  const orchestrator = new SupplyChainFlow(
    inventoryDaemon,
    demandDaemon,
    supplierOracle,
    procurementWorker,
    logisticsWorker,
    settlementWorker,
    governanceDaemon
  );
  
  return {
    ledger,
    inventoryDaemon,
    demandDaemon,
    supplierOracle,
    procurementWorker,
    logisticsWorker,
    settlementWorker,
    governanceDaemon,
    supervisor,
    orchestrator
  };
}
