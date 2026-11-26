import { MODULE_ID, prepareStrixhaven } from "./data.js";

const TAB_ID = "strixhaven";

Hooks.once("init", () => {
  const Sheet = globalThis.dnd5e?.applications?.actor?.CharacterActorSheet;
  if ( !Sheet ) {
    console.error(`${MODULE_ID} | The D&D 5e character sheet was not found; the Strixhaven tab was not added.`);
    return;
  }

  Sheet.PARTS[TAB_ID] = {
    container: { classes: ["tab-body"], id: "tabs" },
    template: `modules/${MODULE_ID}/templates/strixhaven-tab.hbs`,
    scrollable: [""]
  };

  // Place the tab after the biography/bastion tabs, ahead of special traits.
  const index = Sheet.TABS.findIndex(t => t.tab === "specialTraits");
  Sheet.TABS.splice(index < 0 ? Sheet.TABS.length : index, 0, {
    tab: TAB_ID,
    label: "STRIXHAVEN_MEMORIES.Tab",
    icon: "fa-solid fa-graduation-cap"
  });
});

Hooks.on("dnd5e.prepareSheetContext", (sheet, partId, context) => {
  if ( partId !== TAB_ID ) return;
  // Source data, so that effects applied to the actor are never written back by the form.
  context.strixhaven = prepareStrixhaven(sheet.actor._source.flags?.[MODULE_ID]);
});
