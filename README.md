# Strixhaven Memories Sheet

A Foundry VTT module that adds the contents of the Strixhaven Memories character sheet page to the
standard D&D 5e character sheet, as a new **Strixhaven** tab (graduation cap icon).

| Section | Fields | Rows |
| --- | --- | --- |
| Relationships | Name, Points, Relationship, Inspiration (checkbox), Boon/Bane | 8 |
| Report Cards | Rerolls, d4s, Skills | Years 1 to 4, entries #1 to #3 |
| Extracurriculars | Name, d4 (checkbox), Skills, Member | 2 |
| Job | Employer, Job, Coworker | 1 |

The fields are record keeping only: nothing is rolled or applied to the character automatically.
They can be edited in both play and edit mode, and are read-only for anyone who cannot edit the actor.

## Requirements

- Foundry VTT v14
- D&D 5e system 6.0 or newer, using its default character sheet

## Installation

Copy `module.json`, `scripts/`, `templates/`, `styles/` and `lang/` into
`<Foundry user data>/Data/modules/strixhaven-memories-sheet/`. The folder name must match the
module id. Restart Foundry, then enable **Strixhaven Memories Sheet** under **Manage Modules**.

## Data

Values are stored on the actor under `flags.strixhaven-memories-sheet`, so they travel with actor
exports and compendium copies. Disabling the module hides the tab but keeps the data.

## Tests

```
node --test
```
