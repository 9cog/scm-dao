import { Worker } from "../primitives/Worker";
import { Ledger, LedgerSubsections } from "../primitives/Ledger";

interface SettlementInput {
  DeliveryProof?: any;
}

interface PaymentInstruction {
  paymentId: string;
  orderId: string;
  amount: number;
  recipient: string;
  method: string;
  status: "pending" | "processed" | "failed";
}

/**
 * SettlementWorker - consumes delivery proofs and produces payment instructions
 */
export class SettlementWorker extends Worker<
  SettlementInput,
  PaymentInstruction
> {
  private ledger: Ledger;

  constructor(ledger: Ledger) {
    super("SettlementWorker");
    this.ledger = ledger;
  }

  protected async process(input: SettlementInput): Promise<PaymentInstruction> {
    const { DeliveryProof } = input;

    // Create payment instruction
    const paymentInstruction: PaymentInstruction = {
      paymentId: `PAY-${Date.now()}`,
      orderId: DeliveryProof?.orderId || "UNKNOWN",
      amount: DeliveryProof?.amount || 0,
      recipient: DeliveryProof?.supplierId || "UNKNOWN",
      method: "CRYPTO_TRANSFER",
      status: "pending",
    };

    return paymentInstruction;
  }

  protected async commit(output: PaymentInstruction): Promise<void> {
    await this.ledger
      .subsection(LedgerSubsections.Financials)
      .write(output.paymentId, output);
  }
}
