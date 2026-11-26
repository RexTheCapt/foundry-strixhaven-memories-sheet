export const MODULE_ID = "strixhaven-memories-sheet";

/** Row counts, matching the printed Strixhaven Memories page. */
export const YEARS = 4;
export const ENTRIES_PER_YEAR = 3;

/** Rows a character starts with; players can add and remove relationship and extracurricular rows. */
export const DEFAULT_RELATIONSHIP_ROWS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8"];
export const DEFAULT_CLUB_ROWS = ["c1", "c2"];

export const CLUB_NAMES = [
  "Dead Languages Society",
  "Intramural Gymnastics Club",
  "Distinguished Society of Fine Artists",
  "Fantastical Horticulture Club",
  "Dragonchess Club",
  "Intramural Silkball Club",
  "Playactors Drama Guild",
  "Student Paper Star",
  "Dragonsguard Historical Society",
  "Intramural Water-Dancing Club",
  "Show Band Association",
  "Student-Mages of Faith",
  "Future Entrepreneurs Club",
  "Mage Tower Cheer Squad",
  "Iron-Lifters Society",
  "Live-Action Roleplaying Guild"
];

/** In dropdown order: partner first, then from the highest points to the lowest. */
export const RELATIONSHIP_TYPES = [
  { value: "partner", label: "STRIXHAVEN_MEMORIES.Relationships.Partner" },
  { value: "friend", label: "STRIXHAVEN_MEMORIES.Relationships.Friend" },
  { value: "neutral", label: "STRIXHAVEN_MEMORIES.Relationships.Neutral" },
  { value: "rival", label: "STRIXHAVEN_MEMORIES.Relationships.Rival" }
];

/** The relationship that grants a daily inspiration. */
export const INSPIRING_RELATIONSHIP = "partner";

export const MIN_POINTS = -5;
export const MAX_POINTS = 5;
/** Points at which someone becomes a friend, or with the sign reversed, a rival. */
export const BOND_POINTS = 2;
export const MAX_REPORT_DICE = 2;

const count = length => Array.from({ length }, (_, i) => i + 1);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const integer = value => Math.trunc(Number(value)) || 0;

export const clampPoints = value => clamp(integer(value), MIN_POINTS, MAX_POINTS);

/**
 * The relationship which follows from a points change. Becoming or ceasing to be a partner is a manual
 * decision, so a partner stays one.
 * @param {number} points
 * @param {string} current  The relationship before the change.
 * @returns {string}
 */
export function relationshipForPoints(points, current) {
  if ( current === INSPIRING_RELATIONSHIP ) return current;
  if ( points >= BOND_POINTS ) return "friend";
  if ( points <= -BOND_POINTS ) return "rival";
  return "neutral";
}

/**
 * Reduce an extracurricular's name to what identifies it, so that for example
 * "Strixhaven Show Band Association" and "Show Band Association" are the same club.
 * @param {string} [name]
 * @returns {string}
 */
export function clubKey(name = "") {
  return name.toLowerCase()
    .replace(/\b(strixhaven|student paper|club|of|the)\b/g, " ")
    .replace(/[^a-z]+/g, "");
}

/**
 * Find the skills and tools named in free text such as "Performance or Sleight of Hand".
 * @param {string} text
 * @param {{value: string, label: string}[]} options  Every selectable skill and tool.
 * @returns {{values: string[], complete: boolean}}   `complete` is false if some of the text matched nothing.
 */
export function parseProficiencies(text, options) {
  const parts = (text ?? "").split(/[,;/\n]|\bor\b|\band\b/i).map(p => p.trim().toLowerCase()).filter(p => p);
  const matches = parts.map(part => options.find(o => o.label.toLowerCase() === part)?.value);
  return { values: [...new Set(matches.filter(m => m))], complete: matches.every(m => m) };
}

/** The skill and tool choice for one row. Rows saved before the dropdowns existed only have free text. */
function prepareProficiencies(row, options) {
  const legacy = parseProficiencies(row?.skills, options);
  const selected = row?.proficiencies ?? legacy.values;
  const choices = group => options.filter(o => o.group === group)
    .map(o => ({ value: o.value, label: o.label, selected: selected.includes(o.value) }));
  return {
    proficiencies: selected,
    choices: { skills: choices("skill"), tools: choices("tool") },
    note: !selected.length && !legacy.complete ? row.skills : ""
  };
}

function prepareRelationship(row = {}, id, number, path) {
  const stored = (row.relationship ?? "").trim();
  const known = RELATIONSHIP_TYPES.find(t => t.value === stored.toLowerCase());
  const relationship = known?.value ?? stored;
  const relationshipOptions = RELATIONSHIP_TYPES.map(t => ({ ...t, selected: t.value === relationship }));
  // Keep anything typed before this was a dropdown.
  if ( stored && !known ) relationshipOptions.push({ value: stored, text: stored, selected: true });
  const hasPoints = (row.points !== null) && (row.points !== undefined) && (row.points !== "");
  const points = hasPoints ? clampPoints(row.points) : null;
  return {
    ...row,
    id,
    number,
    path,
    points,
    tone: points > 0 ? "sm-positive" : points < 0 ? "sm-negative" : "",
    relationship,
    relationshipOptions
  };
}

function prepareReportEntry(row, options) {
  const d4s = clamp(integer(row?.d4s), 0, MAX_REPORT_DICE);
  const spent = clamp(integer(row?.spent), 0, d4s);
  return {
    rerolls: row?.rerolls,
    ...prepareProficiencies(row, options),
    d4s,
    spent,
    left: d4s - spent,
    d4Options: Array.from({ length: MAX_REPORT_DICE + 1 }, (_, value) => ({ value, selected: value === d4s })),
    dice: count(d4s).map(i => ({ number: i, available: i <= d4s - spent }))
  };
}

function prepareClubRows(data, options, clubs, root) {
  const order = data.extracurricularOrder ?? DEFAULT_CLUB_ROWS;
  const canonical = name => CLUB_NAMES.find(c => clubKey(c) === clubKey(name)) ?? name ?? "";
  const names = order.map(id => canonical(data.extracurriculars?.[id]?.name));
  return order.map((id, index) => {
    const row = data.extracurriculars?.[id];
    const name = names[index];
    const listed = !name || CLUB_NAMES.includes(name) ? CLUB_NAMES : [...CLUB_NAMES, name];
    return {
      ...prepareProficiencies(row, options),
      id,
      number: index + 1,
      path: `${root}.extracurriculars.${id}`,
      name,
      member: row?.member,
      d4: !!row?.d4,
      description: name ? clubs.find(c => clubKey(c.name) === clubKey(name))?.description : undefined,
      nameOptions: listed.map(value => ({
        value,
        selected: value === name,
        // The same extracurricular cannot be picked in two rows.
        disabled: (value !== name) && names.includes(value)
      }))
    };
  });
}

/**
 * Turn the stored actor flags into the rows shown on the tab.
 * Rows are keyed objects (r1, y1.e1, c1) rather than arrays, so that Foundry's
 * form handling merges them into the actor without replacing neighbouring rows.
 * @param {object} [data]                 The module's flags on the actor.
 * @param {object} [config]
 * @param {object[]} [config.options]     Selectable skills and tools: `{value, label, group}`.
 * @param {object[]} [config.clubs]       The GM's extracurricular list, from `parseClubs`.
 * @returns {object}                      Template context. Each `path` is the form field prefix for that row.
 */
export function prepareStrixhaven(data = {}, { options = [], clubs = [] } = {}) {
  const root = `flags.${MODULE_ID}`;
  return {
    relationships: (data.relationshipOrder ?? DEFAULT_RELATIONSHIP_ROWS).map((id, index) =>
      prepareRelationship(data.relationships?.[id], id, index + 1, `${root}.relationships.${id}`)),
    years: count(YEARS).map(year => ({
      number: year,
      entries: count(ENTRIES_PER_YEAR).map(n => ({
        ...prepareReportEntry(data.reportCards?.[`y${year}`]?.[`e${n}`], options),
        number: n,
        year,
        first: n === 1,
        path: `${root}.reportCards.y${year}.e${n}`
      }))
    })),
    entriesPerYear: ENTRIES_PER_YEAR,
    extracurriculars: prepareClubRows(data, options, clubs, root),
    canAddClub: (data.extracurricularOrder ?? DEFAULT_CLUB_ROWS).length < CLUB_NAMES.length,
    job: {
      ...data.job,
      path: `${root}.job`
    }
  };
}
