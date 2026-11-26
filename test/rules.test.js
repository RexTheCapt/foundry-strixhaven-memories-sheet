import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CLUB_NAMES, clubKey, MODULE_ID, parseProficiencies, prepareStrixhaven, relationshipForPoints
} from "../scripts/data.js";
import { availableDice, longRestUpdates, restLabel, spendUpdates } from "../scripts/dice.js";

const root = `flags.${MODULE_ID}`;
const options = [
  { value: "skill:ath", label: "Athletics", group: "skill" },
  { value: "skill:his", label: "History", group: "skill" },
  { value: "skill:slt", label: "Sleight of Hand", group: "skill" },
  { value: "skill:prf", label: "Performance", group: "skill" },
  { value: "tool:thief", label: "Thieves' Tools", group: "tool" }
];
const prepare = data => prepareStrixhaven(data, { options });

test("relationship points stay within -5 and +5 and are coloured by sign", () => {
  const rows = prepare({ relationships: { r1: { points: 9 }, r2: { points: -8 }, r3: { points: 0 }, r4: {} } })
    .relationships;
  assert.deepEqual(rows.slice(0, 4).map(r => [r.points, r.tone]),
    [[5, "sm-positive"], [-5, "sm-negative"], [0, ""], [null, ""]]);
});

test("a relationship typed before the dropdown existed is matched or kept", () => {
  const [a, b] = prepare({ relationships: { r1: { relationship: "Rival" }, r2: { relationship: "Mentor" } } })
    .relationships;
  assert.equal(a.relationship, "rival");
  assert.equal(a.relationshipOptions.length, 4);
  assert.deepEqual(b.relationshipOptions.at(-1), { value: "Mentor", text: "Mentor", selected: true });
});

test("free text skills are recognised, and unrecognised text is shown", () => {
  assert.deepEqual(parseProficiencies("Performance or Sleight of Hand", options),
    { values: ["skill:prf", "skill:slt"], complete: true });
  const [first, second] = prepare({ reportCards: { y1: { e1: { skills: "History, Thieves' Tools" },
    e2: { skills: "Basket weaving" } } } }).years[0].entries;
  assert.deepEqual(first.proficiencies, ["skill:his", "tool:thief"]);
  assert.equal(first.note, "");
  assert.equal(second.note, "Basket weaving");
});

test("a report card holds at most two dice", () => {
  const [a, b] = prepare({ reportCards: { y1: { e1: { d4s: 7, spent: 9 }, e2: { d4s: 2, spent: 1 } } } })
    .years[0].entries;
  assert.deepEqual([a.d4s, a.left], [2, 0]);
  assert.deepEqual(b.dice.map(d => d.available), [true, false]);
});

test("rows default to two, follow the stored order and may all be removed", () => {
  assert.deepEqual(prepare().extracurriculars.map(c => c.id), ["c1", "c2"]);
  assert.deepEqual(prepare({ extracurricularOrder: ["c2", "cX", "c9"] }).extracurriculars.map(c => c.id),
    ["c2", "cX", "c9"]);
  assert.deepEqual(prepare({ extracurricularOrder: [] }).extracurriculars, []);
});

test("an extracurricular cannot be chosen twice", () => {
  const [a, b] = prepare({ extracurriculars: { c1: { name: "Dragonchess Club" } } }).extracurriculars;
  const option = (row, value) => row.nameOptions.find(o => o.value === value);
  assert.equal(option(a, "Dragonchess Club").disabled, false);
  assert.equal(option(b, "Dragonchess Club").disabled, true);
  assert.equal(option(b, "Show Band Association").disabled, false);
  assert.equal(a.nameOptions.length, CLUB_NAMES.length);
});

test("longer official names select the listed extracurricular", () => {
  assert.equal(new Set(CLUB_NAMES.map(clubKey)).size, 16);
  for ( const [long, short] of [
    ["Strixhaven Show Band Association", "Show Band Association"], ["Strixhaven Star", "Student Paper Star"],
    ["Future Entrepreneurs of Strixhaven", "Future Entrepreneurs Club"],
    ["Strixhaven Iron-Lifters Society", "Iron-Lifters Society"]
  ] ) {
    assert.equal(prepare({ extracurriculars: { c1: { name: long } } }).extracurriculars[0].name, short);
  }
});

const day = {
  reportCards: { y1: { e1: { d4s: 2, spent: 0, proficiencies: ["skill:his"] } },
    y2: { e3: { d4s: 1, spent: 1, proficiencies: ["skill:his"] } } },
  extracurriculars: { c1: { name: "Dead Languages Society", d4: true, proficiencies: ["skill:ath", "skill:his"] },
    c2: { name: "Dragonchess Club", d4: false, proficiencies: ["skill:his"] } },
  relationships: { r1: { relationship: "partner", inspiration: false }, r2: { relationship: "friend",
    inspiration: true }, r3: { relationship: "partner", inspiration: true } }
};

test("only unused dice for the rolled skill or tool are offered, and sources stack", () => {
  assert.deepEqual(availableDice(prepare(day), ["skill:his"]).map(d => d.id), ["report-1-1", "club-c1"]);
  assert.deepEqual(availableDice(prepare(day), ["skill:ath"]).map(d => d.id), ["club-c1"]);
  assert.deepEqual(availableDice(prepare(day), ["tool:thief"]), []);
});

test("rolling uses up the chosen dice", () => {
  assert.deepEqual(spendUpdates(prepare(day), ["report-1-1", "report-2-3", "club-c1"]), {
    [`${root}.reportCards.y1.e1.spent`]: 1,
    [`${root}.extracurriculars.c1.d4`]: false
  });
});

test("a long rest restores dice and sets inspiration for partners only", () => {
  assert.deepEqual(longRestUpdates(prepare(day)), {
    [`${root}.reportCards.y2.e3.spent`]: 0,
    [`${root}.extracurriculars.c2.d4`]: true,
    [`${root}.relationships.r1.inspiration`]: true,
    [`${root}.relationships.r2.inspiration`]: false
  });
});

test("points decide between rival, neutral and friend", () => {
  assert.deepEqual([-5, -2, -1, 0, 1, 2, 5].map(p => relationshipForPoints(p, "")),
    ["rival", "rival", "neutral", "neutral", "neutral", "friend", "friend"]);
  assert.equal(relationshipForPoints(0, "friend"), "neutral");
});

test("points never change a partner", () => {
  assert.deepEqual([-5, 0, 5].map(p => relationshipForPoints(p, "partner")), ["partner", "partner", "partner"]);
});

test("every value a long rest changes has a name for the chat message", () => {
  const paths = Object.keys(longRestUpdates(prepare(day)));
  assert.ok(paths.length >= 4);
  for ( const path of paths ) assert.ok(restLabel(path), path);
  assert.deepEqual(restLabel(`${root}.reportCards.y2.e3.spent`),
    { key: "STRIXHAVEN_MEMORIES.Rest.Report", data: { year: "2", number: "3" } });
  assert.equal(restLabel("system.attributes.hp.value"), undefined);
  assert.equal(restLabel("flags.other-module.relationships.r1.inspiration"), undefined);
});
