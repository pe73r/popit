defineCustomElement(
  "tail-megamenu",
  class TailMegamenu extends HTMLElement {
    connectedCallback() {}
  }
);

defineCustomElement(
  "megamenu-element",
  class TailMegamenu extends HTMLElement {
    connectedCallback() {}
  }
);

defineCustomElement(
  "megamenu-sub",
  class TailMegamenu extends HTMLElement {
    connectedCallback() {
      const observerContainer = new MutationObserver(() => {
        const triggers = this.querySelectorAll("megamenu-sub-trigger");
        const menus = this.querySelectorAll("megamenu-sub-menu");
        if (triggers.length && menus.length) {
          this.init(triggers, menus);
          this.showMenu(triggers[0], menus[0]);

          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }
    init = (triggers, menus) => {
      Array.from(triggers).forEach((trigger) => {
        trigger.addEventListener("click", this.onTriggerClicked);
      });
    };
    onTriggerClicked = (event) => {
      const trigger = event.composedPath().find((el) => el.tagName?.toLowerCase() === "megamenu-sub-trigger");
      const menu = this.querySelector(`megamenu-sub-menu[data-menu="${trigger.getAttribute("data-menu")}"]`);

      this.showMenu(trigger, menu);
    };
    showMenu = (trigger, menu) => {
      if (this.currentMenu) {
        this.currentMenu.removeAttribute("aria-expanded");
      }
      if (this.currentTrigger) {
        this.currentTrigger.removeAttribute("aria-expanded");
      }

      trigger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-expanded", "true");

      this.currentMenu = menu;
      this.currentTrigger = trigger;
    };
  }
);

defineCustomElement("megamenu-sub-trigger", class TailMegamenu extends H {});
defineCustomElement("megamenu-sub-menu", class TailMegamenu extends H {});
