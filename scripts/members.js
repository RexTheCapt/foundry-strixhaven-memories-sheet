import { MODULE_ID } from "./data.js";

const normalize = name => (name ?? "").trim().replace(/\s+/g, " ").toLowerCase();

const isBlank = row => [row.name, row.points, row.relationship, row.inspiration, row.boonBane]
  .every(value => (value === null) || (value === undefined) || (value === false) || (String(value).trim() === ""));

/**
 * Actor updates which give each member of an extracurricular a relationship row. People who already have one
 * are skipped, empty rows are filled first, and further rows are added when none are left.
 * @param {object} sheet           Rows returned by `prepareStrixhaven`.
 * @param {string} members         Names separated by commas, as in the GM's list.
 * @param {() => string} createId  Makes the id for an added row.
 * @returns {object}               Flattened update data.
 */
export function memberUpdates(sheet, members, createId) {
  const updates = {};
  const known = new Set(sheet.relationships.map(r => normalize(r.name)));
  const blank = sheet.relationships.filter(isBlank);
  const order = sheet.relationships.map(r => r.id);
  for ( const name of (members ?? "").split(/[,;\n]/).map(n => n.trim()) ) {
    if ( !name || known.has(normalize(name)) ) continue;
    known.add(normalize(name));
    let path = blank.shift()?.path;
    if ( !path ) {
      const id = createId();
      path = `flags.${MODULE_ID}.relationships.${id}`;
      order.push(id);
      updates[`flags.${MODULE_ID}.relationshipOrder`] = order;
    }
    updates[`${path}.name`] = name;
  }
  return updates;
}
