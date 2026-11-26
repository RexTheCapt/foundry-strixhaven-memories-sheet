import { getClubs, proficiencyOptions } from "./actor.js";
import {
  clampPoints, clubKey, DEFAULT_CLUB_ROWS, DEFAULT_RELATIONSHIP_ROWS, INSPIRING_RELATIONSHIP, MODULE_ID,
  parseProficiencies, prepareStrixhaven, relationshipForPoints
} from "./data.js";
import { memberUpdates } from "./members.js";

/*
 * Behaviour of the tab's fields. The `change` handlers run on the field itself, before the event reaches
 * the sheet's form, so what they adjust is saved by the same form submission.
 */

const field = (row, key) => row.querySelector(`[name$=".${key}"]`);

function onPoints(input) {
  if ( input.value !== "" ) {
    input.value = clampPoints(input.value);
    const relationship = field(input.closest("tr"), "relationship");
    relationship.value = relationshipForPoints(Number(input.value), relationship.value);
  }
  input.classList.toggle("sm-positive", Number(input.value) > 0);
  input.classList.toggle("sm-negative", Number(input.value) < 0);
}

function onRelationship(select) {
  field(select.closest("tr"), "inspiration").checked = select.value === INSPIRING_RELATIONSHIP;
}

/** The module's data as the form currently shows it, including edits which are still being saved. */
function currentData(sheet) {
  const { FormDataExtended } = foundry.applications.ux;
  const typed = foundry.utils.expandObject(new FormDataExtended(sheet.form).object).flags?.[MODULE_ID];
  const stored = foundry.utils.deepClone(sheet.actor._source.flags?.[MODULE_ID] ?? {});
  return foundry.utils.mergeObject(stored, typed ?? {});
}

/**
 * Fill a row for the newly picked extracurricular, using the GM's list where it has an entry, and add its
 * members to the relationships. Everything is saved in one submission of the sheet.
 */
function onClub(sheet, select, event) {
  event.stopPropagation(); // Submitted below instead of by the form's own change handling.
  const path = select.name.replace(/\.name$/, "");
  const name = select.value;
  const entry = name ? getClubs().find(c => clubKey(c.name) === clubKey(name)) : undefined;
  const updateData = { [`${path}.d4`]: !!name };
  // Skills and member belong to the previous club. A row that had no club keeps what the player filled in.
  if ( entry || select.dataset.previous ) {
    updateData[`${path}.member`] = entry?.member ?? "";
    updateData[`${path}.proficiencies`] = parseProficiencies(entry?.skills, proficiencyOptions()).values;
  }
  if ( entry?.member ) {
    const rows = prepareStrixhaven(currentData(sheet));
    Object.assign(updateData, memberUpdates(rows, entry.member, () => `r${foundry.utils.randomID()}`));
  }
  sheet.submit({ updateData });
}

function onDiceCount(select) {
  const spent = field(select.closest("tr"), "spent");
  spent.value = Math.min(Number(spent.value), Number(select.value));
}

function onDie(box) {
  const cell = box.closest(".sm-dice");
  field(cell, "spent").value = Array.from(cell.querySelectorAll(".sm-die")).filter(d => !d.checked).length;
}

/** The two lists whose rows can be added and removed. */
const LISTS = {
  relationship: {
    rows: "relationships", order: "relationshipOrder", defaults: DEFAULT_RELATIONSHIP_ROWS, prefix: "r"
  },
  club: { rows: "extracurriculars", order: "extracurricularOrder", defaults: DEFAULT_CLUB_ROWS, prefix: "c" }
};

async function addRow(actor, { order, defaults, prefix }) {
  const ids = actor._source.flags?.[MODULE_ID]?.[order] ?? defaults;
  await actor.update({ [`flags.${MODULE_ID}.${order}`]: [...ids, `${prefix}${foundry.utils.randomID()}`] });
}

async function removeRow(actor, { rows, order, defaults }, id) {
  const data = actor._source.flags?.[MODULE_ID];
  const updates = { [`flags.${MODULE_ID}.${order}`]: (data?.[order] ?? defaults).filter(o => o !== id) };
  if ( data?.[rows]?.[id] ) updates[`flags.${MODULE_ID}.${rows}.${id}`] = _del;
  await actor.update(updates);
}

/**
 * Attach the handlers after the character sheet renders.
 * @param {ApplicationV2} sheet  The character sheet.
 * @param {HTMLElement} element  Its root element.
 */
export function activateTab(sheet, element) {
  const tab = element.querySelector(".tab.strixhaven-memories");
  if ( !tab ) return;
  const on = (selector, type, handler) => {
    for ( const target of tab.querySelectorAll(selector) ) target[`on${type}`] = event => handler(target, event);
  };
  on(".sm-points", "change", onPoints);
  on(".sm-relationship", "change", onRelationship);
  on(".sm-club-name", "change", (select, event) => onClub(sheet, select, event));
  on(".sm-dice-count", "change", onDiceCount);
  on(".sm-die", "change", onDie);
  for ( const [type, list] of Object.entries(LISTS) ) {
    on(`.sm-add-${type}`, "click", () => addRow(sheet.actor, list));
    on(`.sm-remove-${type}`, "click", button => removeRow(sheet.actor, list, button.dataset.id));
  }
}
