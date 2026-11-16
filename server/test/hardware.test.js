import test from "node:test";
import assert from "node:assert/strict";
import { getHardwareSnapshot } from "../src/hardware.js";

test("simulated hardware mode is deterministic and clearly labelled", async () => {
  const snapshot = await getHardwareSnapshot({ mode: "simulated" });
  assert.equal(snapshot.source, "simulated");
  assert.match(snapshot.note, /simulated/i);
  assert.ok(snapshot.cpu.cores > 0);
});
