# Strixhaven Memories Sheet

A Foundry VTT module that adds the contents of the Strixhaven Memories character sheet page to the
standard D&D 5e character sheet, as a new **Strixhaven** tab (graduation cap icon).

| Section | Fields | Rows |
| --- | --- | --- |
| Relationships | Name, Points, Relationship, Inspiration, Boon/Bane | 8 to start, add and remove as you like |
| Report Cards | Rerolls, d4s, Skills | Years 1 to 4, entries #1 to #3 |
| Extracurriculars | Name, d4, Skills, Member | 2 to start, add and remove as you like |
| Job | Employer, Job, Coworker | 1 |

The fields can be edited in both play and edit mode, and are read-only for anyone who cannot edit the
actor.

## Rules

**Relationships.** Points run from -5 to +5, green when positive and red when negative. Boon/Bane is
free text for the DM's choice at +2 or -2; no boon or bane is applied automatically. The relationship
is Friend, Neutral, Partner or Rival. Changing the points sets it to Friend at +2 or more, Rival at -2
or less and Neutral in between. Partner is only set or removed by hand. Choosing Partner ticks
Inspiration. Spend it as you would normal
inspiration, by unticking it.

**Report cards.** Each entry holds 0, 1 or 2 d4s and any number of skills and tools. Each d4 can be
used once per day on a check with one of them.

**Extracurriculars.** Each one is chosen from a list and cannot be picked twice. Its d4 can be used
once per day on a check with one of its skills or tools.

**Members.** Picking an extracurricular adds its members (from the GM's list below) to Relationships.
Anyone already listed under the same name is skipped, empty rows are filled first, and rows are added
when needed. Changing or removing an extracurricular leaves the relationships in place.

**Using a d4.** When you roll a matching skill or tool check, the roll dialog lists the available d4s
under **Strixhaven d4s**. Tick the ones to add; dice from different rows stack. They are marked as
used once the check is rolled. A ticked box on the sheet means the die is available, and you can tick
or untick it by hand. Rolls that skip the dialog (such as Shift-click) do not offer d4s.

**Long rest.** All d4s become available again, and Inspiration is ticked for Partners and unticked for
everyone else.

## Requirements

- Foundry VTT v14
- D&D 5e system 6.0 or newer, using its default character sheet

## Installation

In Foundry's **Add-on Modules** tab choose **Install Module** and paste this manifest URL:

```
https://github.com/RexTheCapt/foundry-strixhaven-memories-sheet/releases/latest/download/module.json
```

Then enable **Strixhaven Memories Sheet** under **Manage Modules** in your world.

## Extracurricular details

The module ships without any book content. To have Skills and Member filled in when a player picks an
extracurricular, the GM opens **Configure Settings → Strixhaven Memories Sheet → Edit List** and pastes
the details in this form:

```
Teapot Society
Skills: History, Insight
Member: Ada Example, Bo Sample
An optional description, shown as a tooltip on the sheet.
```

Repeat for each entry, using the names from the sheet's dropdown (a leading "Strixhaven" or a trailing
"Club" may differ). Page references such as `p45` and any introduction before the first name are
ignored. Without this list, players choose the skills and tools themselves, and no members are added.

## Data

Values are stored on the actor under `flags.strixhaven-memories-sheet`, so they travel with actor
exports and compendium copies. Disabling the module hides the tab but keeps the data.

## Tests

```
node --test
```
