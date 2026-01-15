# Supply Chain DAO Automation Framework

Implementation of the conceptual Supply Chain DAO automation framework as described in `scm-dao.md`.

## Overview

This framework models a supply chain as an emergent system composed of service primitives:
- **Daemons**: Long-lived, watchful, event-reactive services
- **Workers**: Short-lived, task-bound, deterministic services
- **Supervisors**: Health monitoring, escalation, and arbitration
- **Orchestrators**: Flow composition and policy encoding
- **Ledgers**: Shared state, commitments, and proofs
- **Oracles**: Boundary services to external reality

## Architecture

### Core Primitives

Located in `src/primitives/`:
- `Daemon.ts` - Base class for long-running reactive services
- `Worker.ts` - Base class for short-lived task processors
- `Supervisor.ts` - Service monitoring and failure handling
- `Orchestrator.ts` - Flow composition and execution
- `Ledger.ts` - Distributed state management
- `Oracle.ts` - External data integration

### Services

Located in `src/services/`:
- `InventoryDaemon` - Monitors stock levels and emits reorder/overstock signals
- `DemandDaemon` - Analyzes sales velocity and produces demand forecasts
- `SupplierOracle` - Ingests supplier feeds and logistics data
- `ProcurementWorker` - Creates purchase orders based on signals
- `LogisticsWorker` - Generates shipment plans
- `SettlementWorker` - Produces payment instructions
- `OperationsSupervisor` - Monitors all operational services
- `GovernanceDaemon` - Handles DAO proposals and policy updates

### Orchestration

The `SupplyChainFlow` orchestrator implements two main flows:

1. **Replenishment Flow**: 
   ```
   InventoryDaemon.ReorderSignal
   → DemandDaemon.DemandForecast
   → SupplierOracle.LeadTimes
   → ProcurementWorker.PurchaseOrder
   → LogisticsWorker.ShipmentPlan
   → SettlementWorker.PaymentInstruction
   ```

2. **Adaptation Flow**:
   ```
   GovernanceDaemon.PolicyUpdate
   → InventoryDaemon
   → ProcurementWorker
   → LogisticsWorker
   ```

## Installation

```bash
cd packages/scm-dao
npm install
```

## Building

```bash
npm run build
```

## Testing

```bash
npm test
```

## Usage

### Basic Setup

```typescript
import { createSupplyChainDAO } from 'scm-dao';

// Create complete DAO system
const dao = createSupplyChainDAO();

// Start all daemons
await dao.orchestrator.startAll();

// System is now running and reactive to events
```

### Injecting Events

```typescript
import { Event } from 'scm-dao';

// Simulate a stock level change
const stockEvent: Event = {
  type: 'StockLevelChange',
  payload: { 
    sku: 'SKU-001', 
    level: 10, 
    threshold: 50 
  },
  timestamp: Date.now(),
  source: 'warehouse-system'
};

dao.inventoryDaemon.injectEvent(stockEvent);
// This will trigger a ReorderSignal if stock is below threshold
```

### Ingesting External Data

```typescript
// Feed supplier data into the oracle
await dao.supplierOracle.ingest('SupplierFeed', {
  supplierId: 'SUP-001',
  pricing: { SKU001: 10.50 },
  capacity: 10000
});

// Feed logistics data
await dao.supplierOracle.ingest('LogisticsAPI', {
  supplierId: 'SUP-001',
  leadTime: 7
});
```

### Executing Flows

```typescript
// Store signals for flow execution
dao.orchestrator.storeSignal({
  type: 'ReorderSignal',
  data: { sku: 'SKU-001', currentLevel: 10, threshold: 50 }
});

dao.orchestrator.storeSignal({
  type: 'DemandForecast',
  data: { sku: 'SKU-001', forecast: 100 }
});

dao.orchestrator.storeSignal({
  type: 'LeadTimes',
  data: { leadTime: 7 }
});

// Execute the replenishment flow
await dao.orchestrator.executeFlow('Replenishment');
```

### Accessing Ledger Data

```typescript
// Read from inventory ledger
const inventory = await dao.ledger
  .subsection('Inventory')
  .read('SKU-001');

// Read commitments
const commitments = dao.ledger
  .subsection('Commitments')
  .getAll();
```

## Emergent System Properties

As described in the specification, the system exhibits:

- **Optimization**: Local worker decisions + global ledger signals
- **Resilience**: Supervisor + stateless workers
- **Autonomy**: Daemons + governance feedback
- **Transparency**: Ledger + deterministic flows
- **Evolvability**: Orchestrator + policy updates

## System Guarantees

The orchestrator enforces:
- **EventualConsistency(Ledger)**: All changes eventually propagate
- **RoleIsolation**: Services operate independently
- **ReplaceableWorkers**: Workers are stateless and swappable
- **PolicyHotSwap**: Policies can be updated without downtime

## License

Apache-2.0
