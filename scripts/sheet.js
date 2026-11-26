import { getClubs, proficiencyOptions, readSheet } from "./actor.js";
import {
  clampPoints, clubKey, DEFAULT_CLUB_ROWS, INSPIRING_RELATIONSHIP, MODULE_ID, parseProficiencies
} from "./data.js";

/*
 * Behaviour of the tab's fields. The `change` handlers run on the field itself, before the event reaches
 * the sheet's form, so everything they adjust is saved by the same form submission.
 */

const field = (row, key) => row.querySelector(`[name$=".${key}"]`);

function onPoints(input) {
  if ( input.value !== "" ) input.value = clampPoints(input.value);
  input.classList.toggle("sm-positive", Number(input.value) > 0);
  input.classList.toggle("sm-negative", Number(input.value) < 0);
}

function onRelationship(select) {
  field(select.closest("tr"), "inspiration").checked = select.value === INSPIRING_RELATIONSHIP;
}

/** Fill a row for the newly picked extracurricular, using the GM's list where it has an entry. */
function onClub(select) {
  const row = select.closest(".sm-row");
  const name = select.value;
  const entry = name ? getClubs().find(c => clubKey(c.name) === clubKey(name)) : undefined;
  field(row, "d4").checked = !!name;
  // Skills and member belong to the previous club. A row that had no club keeps what the player filled in.
  if ( !entry && !select.dataset.previous ) return;
  field(row, "member").value = entry?.member ?? "";
  // Set last: this element announces the change itself, which submits the form.
  field(row, "proficiencies").value = parseProficiencies(entry?.skills, proficiencyOptions()).values;
}

function onDiceCount(select) {
  const spent = field(select.closest("tr"), "spent");
  spent.value = Math.min(Number(spent.value), Number(select.value));
}

function onDie(box) {
  const cell = box.closest(".sm-dice");
  field(cell, "spent").value = Array.from(cell.querySelectorAll(".sm-die")).filter(d => !d.checked).length;
}

async function addClub(actor) {
  const order = readSheet(actor).extracurriculars.map(c => c.id);
  await actor.update({ [`flags.${MODULE_ID}.extracurricularOrder`]: [...order, `c${foundry.utils.randomID()}`] });
}

async function removeClub(actor, id) {
  const data = actor._source.flags?.[MODULE_ID];
  const order = data?.extracurricularOrder ?? DEFAULT_CLUB_ROWS;
  const updates = { [`flags.${MODULE_ID}.extracurricularOrder`]: order.filter(o => o !== id) };
  if ( data?.extracurriculars?.[id] ) updates[`flags.${MODULE_ID}.extracurriculars.${id}`] = _del;
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
  const on = (selector, event, handler) => {
    for ( const target of tab.querySelectorAll(selector) ) target[`on${event}`] = () => handler(target);
  };
  on(".sm-points", "change", onPoints);
  on(".sm-relationship", "change", onRelationship);
  on(".sm-club-name", "change", onClub);
  on(".sm-dice-count", "change", onDiceCount);
  on(".sm-die", "change", onDie);
  on(".sm-add-club", "click", () => addClub(sheet.actor));
  on(".sm-remove-club", "click", button => removeClub(sheet.actor, button.dataset.id));
}
