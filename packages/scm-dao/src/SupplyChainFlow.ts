import { Orchestrator } from "./primitives/Orchestrator";
import { InventoryDaemon } from "./services/InventoryDaemon";
import { DemandDaemon } from "./services/DemandDaemon";
import { SupplierOracle } from "./services/SupplierOracle";
import { ProcurementWorker } from "./services/ProcurementWorker";
import { LogisticsWorker } from "./services/LogisticsWorker";
import { SettlementWorker } from "./services/SettlementWorker";
import { GovernanceDaemon } from "./services/GovernanceDaemon";
import { Signal } from "./types";

/**
 * SupplyChainFlow - Orchestrates the supply chain processes
 */
export class SupplyChainFlow extends Orchestrator {
  private inventoryDaemon: InventoryDaemon;
  private demandDaemon: DemandDaemon;
  private supplierOracle: SupplierOracle;
  private procurementWorker: ProcurementWorker;
  private logisticsWorker: LogisticsWorker;
  private settlementWorker: SettlementWorker;
  private governanceDaemon: GovernanceDaemon;

  private signalBus: Map<string, Signal[]> = new Map();

  constructor(
    inventoryDaemon: InventoryDaemon,
    demandDaemon: DemandDaemon,
    supplierOracle: SupplierOracle,
    procurementWorker: ProcurementWorker,
    logisticsWorker: LogisticsWorker,
    settlementWorker: SettlementWorker,
    governanceDaemon: GovernanceDaemon
  ) {
    super("SupplyChainFlow");

    this.inventoryDaemon = inventoryDaemon;
    this.demandDaemon = demandDaemon;
    this.supplierOracle = supplierOracle;
    this.procurementWorker = procurementWorker;
    this.logisticsWorker = logisticsWorker;
    this.settlementWorker = settlementWorker;
    this.governanceDaemon = governanceDaemon;

    this.setupFlows();
    this.setupGuarantees();
  }

  private setupFlows(): void {
    // Replenishment flow
    this.registerFlow({
      name: "Replenishment",
      steps: [
        "InventoryDaemon.ReorderSignal",
        "DemandDaemon.DemandForecast",
        "SupplierOracle.LeadTimes",
        "ProcurementWorker.PurchaseOrder",
        "LogisticsWorker.ShipmentPlan",
        "SettlementWorker.PaymentInstruction",
      ],
      execute: async () => {
        await this.executeReplenishmentFlow();
      },
    });

    // Adaptation flow
    this.registerFlow({
      name: "Adaptation",
      steps: [
        "GovernanceDaemon.PolicyUpdate",
        "InventoryDaemon",
        "ProcurementWorker",
        "LogisticsWorker",
      ],
      execute: async () => {
        await this.executeAdaptationFlow();
      },
    });
  }

  private setupGuarantees(): void {
    this.addGuarantee("EventualConsistency(Ledger)");
    this.addGuarantee("RoleIsolation");
    this.addGuarantee("ReplaceableWorkers");
    this.addGuarantee("PolicyHotSwap");
  }

  private async executeReplenishmentFlow(): Promise<void> {
    // Collect signals from each step
    const reorderSignal = this.getSignal("ReorderSignal");
    const demandForecast = this.getSignal("DemandForecast");
    const leadTimes = this.getSignal("LeadTimes");

    if (!reorderSignal || !demandForecast || !leadTimes) {
      console.log("Waiting for required signals...");
      return;
    }

    // Execute procurement
    const purchaseOrder = await this.procurementWorker.execute({
      ReorderSignal: reorderSignal.data,
      DemandForecast: demandForecast.data,
      LeadTimes: leadTimes.data,
    });

    // Execute logistics
    const shipmentPlan = await this.logisticsWorker.execute({
      PurchaseOrder: purchaseOrder,
      Capacity: this.getSignal("Capacity")?.data,
    });

    // Settlement would happen after delivery proof
    console.log(
      `Replenishment flow completed: Order ${purchaseOrder.orderId} -> Shipment ${shipmentPlan.shipmentId}`
    );
  }

  private async executeAdaptationFlow(): Promise<void> {
    const policyUpdate = this.getSignal("PolicyUpdate");

    if (!policyUpdate) {
      console.log("No policy update available");
      return;
    }

    console.log("Applying policy update:", policyUpdate.data);
    // Policy updates would affect service behavior
  }

  /**
   * Store a signal in the signal bus
   */
  storeSignal(signal: Signal): void {
    if (!this.signalBus.has(signal.type)) {
      this.signalBus.set(signal.type, []);
    }
    this.signalBus.get(signal.type)!.push(signal);
  }

  /**
   * Get the latest signal of a type
   */
  private getSignal(type: string): Signal | undefined {
    const signals = this.signalBus.get(type);
    return signals && signals.length > 0
      ? signals[signals.length - 1]
      : undefined;
  }

  /**
   * Start all daemons
   */
  async startAll(): Promise<void> {
    await this.inventoryDaemon.start();
    await this.demandDaemon.start();
    await this.governanceDaemon.start();
  }

  /**
   * Stop all daemons
   */
  async stopAll(): Promise<void> {
    await this.inventoryDaemon.stop();
    await this.demandDaemon.stop();
    await this.governanceDaemon.stop();
  }
}
