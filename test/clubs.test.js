import { test } from "node:test";
import assert from "node:assert/strict";
import { parseClubs } from "../scripts/clubs.js";
import { prepareStrixhaven } from "../scripts/data.js";

const list = `Club Options
p1
Students can join any of these.

Teapot Society
p1
Skills: History, Insight

Member: Ada Example, Bo "Bee" Sample

They brew tea.

They also drink it.

Kite-Flyers of the Hill
p. 2
Skills: Nature or Survival

Member: Cy Placeholder

Kites.
`;

test("a pasted list is split into entries, skipping the introduction and page references", () => {
  assert.deepEqual(parseClubs(list.replaceAll("\n", "\r\n")), [
    {
      name: "Teapot Society", skills: "History, Insight", member: "Ada Example, Bo \"Bee\" Sample",
      description: "They brew tea. They also drink it."
    },
    { name: "Kite-Flyers of the Hill", skills: "Nature or Survival", member: "Cy Placeholder", description: "Kites." }
  ]);
});

test("member and description are optional", () => {
  assert.deepEqual(parseClubs("A\nSkills: Arcana\nB\nSkills: Nature").map(c => [c.name, c.member, c.description]),
    [["A", "", ""], ["B", "", ""]]);
});

test("empty or unrecognised text gives no entries", () => {
  assert.deepEqual(parseClubs(), []);
  assert.deepEqual(parseClubs("just some notes"), []);
  assert.deepEqual(parseClubs("Skills: with no name above"), []);
});

test("a row naming a listed entry gets its description", () => {
  const clubs = parseClubs(list);
  const sheet = prepareStrixhaven({ extracurriculars: { c2: { name: "Teapot Society" } } }, { clubs });
  assert.equal(sheet.extracurriculars[1].description, "They brew tea. They also drink it.");
  assert.equal(sheet.extracurriculars[0].description, undefined);
});
