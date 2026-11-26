import { parseClubs } from "./clubs.js";
import { MODULE_ID, prepareStrixhaven } from "./data.js";
import { CLUBS_SETTING, ExtracurricularConfig } from "./extracurricular-config.js";

const TAB_ID = "strixhaven";

const getClubs = () => parseClubs(game.settings.get(MODULE_ID, CLUBS_SETTING));

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
  context.strixhaven = prepareStrixhaven(sheet.actor._source.flags?.[MODULE_ID], getClubs());
});

// Picking an extracurricular fills its row. The change event then reaches the sheet's form, which saves it.
Hooks.on("renderCharacterActorSheet", (sheet, element) => {
  for ( const picker of element.querySelectorAll("select.sm-club-picker") ) {
    picker.onchange = () => {
      const club = getClubs().find(c => c.name === picker.value);
      picker.value = "";
      if ( !club ) return;
      const row = picker.closest(".sm-row");
      for ( const key of ["name", "skills", "member"] ) {
        row.querySelector(`textarea[name$=".${key}"]`).value = club[key];
      }
    };
  }
});
