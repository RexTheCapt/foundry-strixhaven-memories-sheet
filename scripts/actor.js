import { parseClubs } from "./clubs.js";
import { MODULE_ID, prepareStrixhaven } from "./data.js";

export const CLUBS_SETTING = "extracurriculars";

/** The GM's extracurricular list. */
export const getClubs = () => parseClubs(game.settings.get(MODULE_ID, CLUBS_SETTING));

/** Every skill and tool a d4 can be tied to. */
export function proficiencyOptions() {
  const skills = Object.entries(CONFIG.DND5E.skills)
    .map(([key, { label }]) => ({ value: `skill:${key}`, label, group: "skill" }));
  const tools = Object.keys(CONFIG.DND5E.tools).map(key => ({
    value: `tool:${key}`, label: dnd5e.documents.Trait.keyLabel(key, { trait: "tool" }), group: "tool"
  }));
  const byLabel = (a, b) => a.label.localeCompare(b.label, game.i18n.lang);
  return [...skills.sort(byLabel), ...tools.sort(byLabel)];
}

/** The tab's rows for an actor. Reads source data, so applied effects are never written back. */
export function readSheet(actor) {
  return prepareStrixhaven(actor._source.flags?.[MODULE_ID], { options: proficiencyOptions(), clubs: getClubs() });
}
