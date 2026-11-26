export const MODULE_ID = "strixhaven-memories-sheet";

/** Row counts, matching the printed Strixhaven Memories page. */
export const RELATIONSHIP_ROWS = 8;
export const YEARS = 4;
export const ENTRIES_PER_YEAR = 3;
export const EXTRACURRICULAR_ROWS = 2;

const count = length => Array.from({ length }, (_, i) => i + 1);

/**
 * Turn the stored actor flags into the fixed rows shown on the tab.
 * Rows are keyed objects (r1, y1.e1, c1) rather than arrays, so that Foundry's
 * form handling merges them into the actor without replacing neighbouring rows.
 * @param {object} [data]  The module's flags on the actor.
 * @returns {object}       Template context. Each `path` is the form field prefix for that row.
 */
export function prepareStrixhaven(data = {}) {
  const root = `flags.${MODULE_ID}`;
  return {
    relationships: count(RELATIONSHIP_ROWS).map(n => ({
      ...data.relationships?.[`r${n}`],
      number: n,
      path: `${root}.relationships.r${n}`
    })),
    years: count(YEARS).map(year => ({
      number: year,
      entries: count(ENTRIES_PER_YEAR).map(n => ({
        ...data.reportCards?.[`y${year}`]?.[`e${n}`],
        number: n,
        year,
        first: n === 1,
        path: `${root}.reportCards.y${year}.e${n}`
      }))
    })),
    entriesPerYear: ENTRIES_PER_YEAR,
    extracurriculars: count(EXTRACURRICULAR_ROWS).map(n => ({
      ...data.extracurriculars?.[`c${n}`],
      number: n,
      path: `${root}.extracurriculars.c${n}`
    })),
    job: {
      ...data.job,
      path: `${root}.job`
    }
  };
}
