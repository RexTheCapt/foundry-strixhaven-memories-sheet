import { readSheet } from "./actor.js";
import { MODULE_ID } from "./data.js";
import { availableDice, longRestUpdates, spendUpdates } from "./dice.js";

/* Adds the Strixhaven d4s to dnd5e's skill and tool check dialogs, and restores them on a long rest. */

const FIELD = "strixhaven.";

const isCharacter = actor => actor?.type === "character";

function dieLabel(die) {
  if ( die.type === "report" ) return game.i18n.format("STRIXHAVEN_MEMORIES.Dice.Report", die);
  return game.i18n.format("STRIXHAVEN_MEMORIES.Dice.Club", {
    name: die.name || `${game.i18n.localize("STRIXHAVEN_MEMORIES.Extracurriculars.Title")} ${die.number}`
  });
}

/** Offer every die which applies to this check as a checkbox in the roll dialog. */
function offerDice(app, element) {
  const { subject, skill, tool } = app.config;
  const host = element.querySelector('[data-application-part="configuration"]');
  if ( !isCharacter(subject) || !host || host.parentElement.querySelector(".strixhaven-dice") ) return;
  const proficiencies = [skill && `skill:${skill}`, tool && `tool:${tool}`].filter(p => p);
  const dice = availableDice(readSheet(subject), proficiencies);
  if ( !dice.length ) return;

  const create = (tag, properties) => Object.assign(document.createElement(tag), properties);
  const fieldset = create("fieldset", { className: "strixhaven-dice" });
  fieldset.append(create("legend", { textContent: game.i18n.localize("STRIXHAVEN_MEMORIES.Dice.Title") }));
  for ( const die of dice ) {
    const group = create("div", { className: "form-group" });
    const inputs = create("div", { className: "form-fields" });
    const box = document.createElement("dnd5e-checkbox");
    box.setAttribute("name", `${FIELD}${die.id}`);
    box.setAttribute("aria-label", dieLabel(die));
    inputs.append(box);
    group.append(create("label", { textContent: dieLabel(die) }), inputs);
    fieldset.append(group);
  }
  host.after(fieldset);
  app.setPosition({ height: "auto" });
}

/** Add 1d4 to the check for each ticked box. */
function addDice(process, config, index, { formData } = {}) {
  if ( (index !== 0) || !formData || !isCharacter(process.subject) ) return;
  // `object` holds real booleans; `formData.get` would return the string "false".
  const chosen = Object.entries(formData.object)
    .filter(([name, value]) => name.startsWith(FIELD) && (value === true))
    .map(([name]) => name.slice(FIELD.length));
  if ( !chosen.length ) return;
  for ( const _ of chosen ) config.parts.push("1d4");
  config.options.strixhavenDice = chosen;
}

/** Once the check has been rolled, mark its dice as used. */
async function useDice(rolls, { subject }) {
  const chosen = rolls[0]?.options.strixhavenDice;
  if ( !chosen?.length ) return;
  await subject.update(spendUpdates(readSheet(subject), chosen));
}

function onRest(actor, result) {
  if ( !result.longRest || !isCharacter(actor) || !actor._source.flags?.[MODULE_ID] ) return;
  Object.assign(result.updateData, longRestUpdates(readSheet(actor)));
}

export function registerRollHooks() {
  Hooks.on("renderSkillToolRollConfigurationDialog", offerDice);
  Hooks.on("dnd5e.postBuildRollConfig", addDice);
  Hooks.on("dnd5e.rollSkill", useDice);
  Hooks.on("dnd5e.rollToolCheck", useDice);
  Hooks.on("dnd5e.preRestCompleted", onRest);
}
