import { Ledger, LedgerSubsections } from "../src/primitives/Ledger";

describe("Ledger", () => {
  let ledger: Ledger;

  beforeEach(() => {
    ledger = new Ledger("test");
  });

  test("should write and read data", async () => {
    await ledger.write("key1", { value: "test" });
    const result = await ledger.read("key1");
    expect(result).toEqual({ value: "test" });
  });

  test("should create and commit commitments", async () => {
    const commitment = await ledger.createCommitment("c1", { data: "test" });
    expect(commitment.state).toBe("pending");

    await ledger.commitCommitment("c1");
    // Commitment should now be committed (internal state)
  });

  test("should create subsections", () => {
    const inventory = ledger.subsection(LedgerSubsections.Inventory);
    expect(inventory.getName()).toBe("test.Inventory");
  });

  test("should handle multiple writes", async () => {
    await ledger.write("key1", "value1");
    await ledger.write("key2", "value2");

    const entries = ledger.getAll();
    expect(entries).toHaveLength(2);
  });
});
