import { INSPIRING_RELATIONSHIP } from "./data.js";

/*
 * The daily resources: report card d4s, extracurricular d4s and relationship inspiration.
 * Every function takes the rows returned by `prepareStrixhaven`.
 */

const reportEntries = sheet => sheet.years.flatMap(y => y.entries);

/**
 * The d4s that can be added to a check right now, at most one per report card entry or extracurricular.
 * @param {object} sheet          Prepared rows.
 * @param {string[]} proficiencies  What is being rolled, for example `["skill:his"]`.
 * @returns {object[]}
 */
export function availableDice(sheet, proficiencies) {
  const applies = row => row.proficiencies.some(p => proficiencies.includes(p));
  return [
    ...reportEntries(sheet).filter(e => (e.left > 0) && applies(e))
      .map(e => ({ id: `report-${e.year}-${e.number}`, type: "report", year: e.year, number: e.number, left: e.left })),
    ...sheet.extracurriculars.filter(c => c.d4 && applies(c))
      .map(c => ({ id: `club-${c.id}`, type: "club", name: c.name, number: c.number }))
  ];
}

/**
 * Actor updates which use up the chosen dice.
 * @param {object} sheet   Prepared rows.
 * @param {string[]} ids   Ids from `availableDice`.
 * @returns {object}       Flattened update data.
 */
export function spendUpdates(sheet, ids) {
  const updates = {};
  for ( const entry of reportEntries(sheet) ) {
    if ( ids.includes(`report-${entry.year}-${entry.number}`) && (entry.left > 0) ) {
      updates[`${entry.path}.spent`] = entry.spent + 1;
    }
  }
  for ( const club of sheet.extracurriculars ) {
    if ( ids.includes(`club-${club.id}`) ) updates[`${club.path}.d4`] = false;
  }
  return updates;
}

/**
 * Actor updates for a long rest: all d4s come back, and inspiration is set according to each relationship.
 * @param {object} sheet  Prepared rows.
 * @returns {object}      Flattened update data.
 */
export function longRestUpdates(sheet) {
  const updates = {};
  for ( const entry of reportEntries(sheet) ) {
    if ( entry.spent > 0 ) updates[`${entry.path}.spent`] = 0;
  }
  for ( const club of sheet.extracurriculars ) {
    if ( club.name && !club.d4 ) updates[`${club.path}.d4`] = true;
  }
  for ( const row of sheet.relationships ) {
    const inspired = row.relationship === INSPIRING_RELATIONSHIP;
    if ( !!row.inspiration !== inspired ) updates[`${row.path}.inspiration`] = inspired;
  }
  return updates;
}
