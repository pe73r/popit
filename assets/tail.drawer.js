defineCustomElement(
  "tail-drawer",
  class TailDrawer extends HeaderDialog {
    lockScroll = true;
    constructor() {
      super("drawer", true);
    }
  }
);

defineCustomElement(
  "drawer-content",
  class DrawerContent extends H {
    connectedCallback() {
      setAttributes(
        this,
        ["aria-hidden", "true"],
        ["aria-modal", "true"],
        ["aria-labelledby", "drawer"],
        ["role", "dialog"]
      );
      this.classList.add(
        "group-entering:block",
        "group-entering:-translate-x-full",
        "group-in:translate-x-0",
        "group-in:opacity-100",
        "group-exiting:d-block",
        "group-exiting:-translate-x-full",
        "group-exiting:opacity-0",
        "group-out:opacity-0",
        "group-out:hidden"
      );
    }
  }
);

defineCustomElement(
  "drawer-overlay",
  class DrawerOverlay extends H {
    connectedCallback() {
      setAttributes(this, ["tabindex", "-1"]);
      this.classList.add(
        "group-in:opacity-100",
        "group-exiting:opacity-0",
        "group-out:hidden",
        "group-entering:block",
        "group-entering:opacity-0",
        "z-[50]"
      );

      if (this.parentElement.getAttribute("data-full-height") === "true") {
        window.addEventListener("resize", this.setHeight);
        this.setHeight();
      }
    }
    setHeight = () => {
      console.log("setHeight", this.tagName);
      this.style.minHeight = window.innerHeight + "px";
      this.style.height = window.innerHeight + "px";
      this.style.maxHeight = window.innerHeight + "px";
    };
  }
);

defineCustomElement(
  "drawer-header",
  class DrawerHeader extends H {
    connectedCallback() {
      this.classList.add("first-element:flex-1");
    }
  }
);

defineCustomElement("drawer-inner", class DrawerInner extends H {});
defineCustomElement("drawer-footer", class DrawerFooter extends H {});
defineCustomElement(
  "drawer-trigger",
  class DrawerTrigger extends Trigger {
    type = "drawer";
    mode = "Open";

    connectedCallback() {
      if (this.dataset.opened === "true") {
        setTimeout(() => {
          this.click();
        }, 300);
      }
    }
  }
);
defineCustomElement(
  "drawer-close",
  class DrawerClose extends Trigger {
    type = "drawer";
    mode = "Close";
  }
);
