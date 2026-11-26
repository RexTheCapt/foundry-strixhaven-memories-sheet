import { CLUBS_SETTING, readSheet } from "./actor.js";
import { MODULE_ID } from "./data.js";
import { ExtracurricularConfig } from "./extracurricular-config.js";
import { registerRollHooks } from "./rolls.js";
import { activateTab } from "./sheet.js";

const TAB_ID = "strixhaven";

Hooks.once("init", () => {
  const Sheet = globalThis.dnd5e?.applications?.actor?.CharacterActorSheet;
  if ( !Sheet ) {
    console.error(`${MODULE_ID} | The D&D 5e character sheet was not found; the Strixhaven tab was not added.`);
    return;
  }

  game.settings.register(MODULE_ID, CLUBS_SETTING, {
    scope: "world",
    config: false,
    type: String,
    default: "",
    onChange: () => {
      for ( const app of foundry.applications.instances.values() ) {
        if ( app instanceof Sheet ) app.render();
      }
    }
  });
  game.settings.registerMenu(MODULE_ID, CLUBS_SETTING, {
    name: "STRIXHAVEN_MEMORIES.Config.Title",
    label: "STRIXHAVEN_MEMORIES.Config.Button",
    hint: "STRIXHAVEN_MEMORIES.Config.Hint",
    icon: "fa-solid fa-graduation-cap",
    type: ExtracurricularConfig,
    restricted: true
  });

  Sheet.PARTS[TAB_ID] = {
    container: { classes: ["tab-body"], id: "tabs" },
    template: `modules/${MODULE_ID}/templates/strixhaven-tab.hbs`,
    templates: [`modules/${MODULE_ID}/templates/proficiencies.hbs`],
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
  if ( partId === TAB_ID ) context.strixhaven = readSheet(sheet.actor);
});

Hooks.on("renderCharacterActorSheet", activateTab);

registerRollHooks();
