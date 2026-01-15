/**
 * Example: Basic Supply Chain DAO Usage
 *
 * This example demonstrates how to set up and run a basic supply chain automation.
 */

import { createSupplyChainDAO, Event, Signal } from "../src";

async function main() {
  console.log("=== Supply Chain DAO Example ===\n");

  // 1. Create the complete DAO system
  console.log("1. Creating DAO system...");
  const dao = createSupplyChainDAO();
  console.log("✓ DAO system created\n");

  // 2. Start all daemons
  console.log("2. Starting daemons...");
  await dao.orchestrator.startAll();
  console.log("✓ All daemons started\n");

  // 3. Execute procurement
  console.log("3. Executing procurement worker...");
  const purchaseOrder = await dao.procurementWorker.execute({
    ReorderSignal: { sku: "WIDGET-001", currentLevel: 15, threshold: 50 },
    DemandForecast: { forecast: 330 },
    LeadTimes: { leadTime: 5 },
  });
  console.log("✓ Purchase order created:", {
    orderId: purchaseOrder.orderId,
    sku: purchaseOrder.sku,
    quantity: purchaseOrder.quantity,
  });
  console.log("");

  // 4. Stop all daemons
  console.log("4. Stopping daemons...");
  await dao.orchestrator.stopAll();
  console.log("✓ All daemons stopped\n");

  console.log("=== Example completed successfully ===");
}

// Run the example
main().catch(console.error);
