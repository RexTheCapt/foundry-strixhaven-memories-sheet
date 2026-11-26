import { parseClubs } from "./clubs.js";
import { MODULE_ID } from "./data.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export const CLUBS_SETTING = "extracurriculars";

/** Settings window where the GM pastes the list of extracurriculars offered in the sheet's picker. */
export class ExtracurricularConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @override */
  static DEFAULT_OPTIONS = {
    id: `${MODULE_ID}-extracurriculars`,
    tag: "form",
    window: {
      title: "STRIXHAVEN_MEMORIES.Config.Title",
      icon: "fa-solid fa-graduation-cap",
      contentClasses: ["standard-form"]
    },
    position: { width: 560 },
    form: {
      handler: ExtracurricularConfig.#onSubmit,
      closeOnSubmit: true
    }
  };

  /** @override */
  static PARTS = {
    list: { template: `modules/${MODULE_ID}/templates/extracurricular-config.hbs` },
    footer: { template: "templates/generic/form-footer.hbs" }
  };

  /** @override */
  async _prepareContext(options) {
    return {
      text: game.settings.get(MODULE_ID, CLUBS_SETTING),
      buttons: [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "STRIXHAVEN_MEMORIES.Config.Save" }]
    };
  }

  static async #onSubmit(event, form, formData) {
    const text = formData.object.text ?? "";
    await game.settings.set(MODULE_ID, CLUBS_SETTING, text);
    const count = parseClubs(text).length;
    if ( !count && text.trim() ) ui.notifications.warn("STRIXHAVEN_MEMORIES.Config.NoneFound", { localize: true });
    else ui.notifications.info(game.i18n.format("STRIXHAVEN_MEMORIES.Config.Saved", { count }));
  }
}
