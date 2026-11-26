import { test } from "node:test";
import assert from "node:assert/strict";
import { MODULE_ID, prepareStrixhaven } from "../scripts/data.js";
import { memberUpdates } from "../scripts/members.js";

const root = `flags.${MODULE_ID}`;
const ids = () => { let n = 0; return () => `new${++n}`; };
const update = (data, members) => memberUpdates(prepareStrixhaven(data), members, ids());

test("relationship rows default to eight, follow the stored order and may all be removed", () => {
  assert.deepEqual(prepareStrixhaven().relationships.map(r => r.id),
    ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"]);
  const rows = prepareStrixhaven({ relationshipOrder: ["r3", "rX"] }).relationships;
  assert.deepEqual(rows.map(r => [r.id, r.number]), [["r3", 1], ["rX", 2]]);
  assert.deepEqual(prepareStrixhaven({ relationshipOrder: [] }).relationships, []);
});

test("members fill the first empty rows without touching rows in use", () => {
  const data = { relationships: { r1: { name: "Ada" }, r2: { points: 0 }, r4: { boonBane: "Boon" },
    r5: { name: "", points: null, relationship: "", inspiration: false, boonBane: "" } } };
  assert.deepEqual(update(data, "Bo, Cy"), {
    [`${root}.relationships.r3.name`]: "Bo",
    [`${root}.relationships.r5.name`]: "Cy"
  });
});

test("people already listed, or named twice, are not added again", () => {
  const data = { relationships: { r1: { name: "  bo   Sample " } } };
  assert.deepEqual(update(data, "Bo Sample, Cy, cy, "), { [`${root}.relationships.r2.name`]: "Cy" });
  assert.deepEqual(update(data, ""), {});
});

test("rows are added once no empty row is left", () => {
  assert.deepEqual(update({ relationshipOrder: ["r1"] }, "Ada, Bo, Cy"), {
    [`${root}.relationships.r1.name`]: "Ada",
    [`${root}.relationshipOrder`]: ["r1", "new1", "new2"],
    [`${root}.relationships.new1.name`]: "Bo",
    [`${root}.relationships.new2.name`]: "Cy"
  });
});
