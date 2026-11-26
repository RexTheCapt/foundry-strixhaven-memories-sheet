const PAGE_REFERENCE = /^p\.?\s*\d+$/i;
const SKILLS = /^skills?\s*:\s*/i;
const MEMBERS = /^members?\s*:\s*/i;

/**
 * Read a pasted list of extracurriculars. Each entry is a name line followed by a "Skills:" line, then
 * optionally a "Member:" line and a description. Blank lines, page references ("p45") and any text
 * before the first name are ignored.
 * @param {string} [text]  The pasted list.
 * @returns {{name: string, skills: string, member: string, description: string}[]}
 */
export function parseClubs(text = "") {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !PAGE_REFERENCE.test(l));
  const starts = lines.flatMap((line, i) => (i > 0) && SKILLS.test(line) ? [i] : []);
  return starts.map((start, n) => {
    // The line before the next "Skills:" line is the next entry's name.
    const end = n + 1 < starts.length ? starts[n + 1] - 1 : lines.length;
    const body = lines.slice(start + 1, end);
    return {
      name: lines[start - 1],
      skills: lines[start].replace(SKILLS, ""),
      member: body.filter(l => MEMBERS.test(l)).map(l => l.replace(MEMBERS, "")).join(", "),
      description: body.filter(l => !MEMBERS.test(l)).join(" ")
    };
  });
}
