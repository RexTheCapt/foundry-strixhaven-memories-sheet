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

In Foundry's **Add-on Modules** tab choose **Install Module** and paste this manifest URL:

```
https://github.com/RexTheCapt/foundry-strixhaven-memories-sheet/releases/latest/download/module.json
```

Then enable **Strixhaven Memories Sheet** under **Manage Modules** in your world.

## Data

Values are stored on the actor under `flags.strixhaven-memories-sheet`, so they travel with actor
exports and compendium copies. Disabling the module hides the tab but keeps the data.

## Tests

```
node --test
```
