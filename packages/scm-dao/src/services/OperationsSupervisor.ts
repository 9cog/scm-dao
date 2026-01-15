import { Supervisor } from "../primitives/Supervisor";
import { InventoryDaemon } from "./InventoryDaemon";
import { DemandDaemon } from "./DemandDaemon";
import { ProcurementWorker } from "./ProcurementWorker";
import { LogisticsWorker } from "./LogisticsWorker";
import { SettlementWorker } from "./SettlementWorker";

/**
 * OperationsSupervisor - monitors all operations services
 */
export class OperationsSupervisor extends Supervisor {
  constructor() {
    super("OperationsSupervisor");
  }

  /**
   * Setup monitoring for all operations services
   */
  setupMonitoring(
    inventoryDaemon: InventoryDaemon,
    demandDaemon: DemandDaemon,
    procurementWorker: ProcurementWorker,
    logisticsWorker: LogisticsWorker,
    settlementWorker: SettlementWorker
  ): void {
    this.monitor(inventoryDaemon);
    this.monitor(demandDaemon);
    this.monitor(procurementWorker);
    this.monitor(logisticsWorker);
    this.monitor(settlementWorker);

    // Setup failure handlers
    this.onFailure(async (service, error) => {
      console.log(
        `Service ${service.getName()} failed with error:`,
        error.message
      );

      // Try to retry
      try {
        await this.retry(async () => {
          throw error; // Placeholder for actual retry logic
        }, 3);
      } catch (retryError) {
        // Quarantine the service
        this.quarantine(service);

        // Escalate to DAO
        await this.escalateToDAO("Service failure after retries", {
          service: service.getName(),
          error: error.message,
        });
      }
    });
  }
}
