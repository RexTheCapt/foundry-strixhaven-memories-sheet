import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MODULE_ID, prepareStrixhaven } from "../scripts/data.js";

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");

test("an actor without data gets every row from the printed page", () => {
  const sheet = prepareStrixhaven(undefined);
  assert.equal(sheet.relationships.length, 8);
  assert.deepEqual(sheet.years.map(y => y.entries.length), [3, 3, 3, 3]);
  assert.equal(sheet.extracurriculars.length, 2);
  assert.equal(sheet.job.path, `flags.${MODULE_ID}.job`);
});

test("stored values land in their own rows, including zero and negative numbers", () => {
  const sheet = prepareStrixhaven({
    relationships: { r3: { name: "Quill", points: -2, inspiration: true } },
    reportCards: { y2: { e3: { rerolls: 0, d4s: 2, skills: "History" } } },
    extracurriculars: { c2: { d4: true } },
    job: { employer: "Bow's End Tavern" }
  });
  assert.equal(sheet.relationships[2].points, -2);
  assert.equal(sheet.relationships[1].name, undefined);
  assert.equal(sheet.years[1].entries[2].rerolls, 0);
  assert.equal(sheet.years[1].entries[2].path, `flags.${MODULE_ID}.reportCards.y2.e3`);
  assert.equal(sheet.extracurriculars[1].d4, true);
  assert.equal(sheet.job.employer, "Bow's End Tavern");
});

test("the module id matches the manifest", () => {
  assert.equal(JSON.parse(read("module.json")).id, MODULE_ID);
});

test("every localization key used by the module exists", () => {
  const lang = JSON.parse(read("lang/en.json"));
  const source = read("templates/strixhaven-tab.hbs") + read("scripts/module.js");
  const keys = new Set(source.match(/STRIXHAVEN_MEMORIES(\.\w+)+/g));
  assert.ok(keys.size > 0);
  for ( const key of keys ) {
    const value = key.split(".").reduce((node, part) => node?.[part], lang);
    assert.equal(typeof value, "string", key);
  }
});
