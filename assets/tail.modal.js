defineCustomElement(
  "tail-modal",
  class ModalDialog extends Dialog {
    lockScroll = true;
    constructor() {
      super("modal", true);
    }
  }
);

defineCustomElement(
  "modal-content",
  class ModalContent extends H {
    connectedCallback() {
      setAttributes(
        this,
        ["aria-hidden", "true"],
        ["aria-modal", "true"],
        ["aria-labelledby", this.parentElement.id],
        ["role", "dialog"]
      );
      if (this.getAttribute("from") === "right") {
        this.classList.add(
          "group-entering:block",
          "group-entering:opacity-0",
          "group-entering:translate-x-full",
          "group-in:translate-x-0",
          "group-in:opacity-100",
          "group-exiting:block",
          "group-exiting:translate-x-full",
          "group-exiting:opacity-0",
          "group-out:opacity-0",
          "group-out:hidden"
        );
      } else {
        this.classList.add(
          "group-entering:block",
          "group-entering:opacity-0",
          "group-entering:scale-95",
          "group-in:scale-100",
          "group-in:opacity-100",
          "group-exiting:block",
          "group-exiting:scale-90",
          "group-exiting:opacity-0",
          "group-out:opacity-0",
          "group-out:hidden"
        );
      }
    }
  }
);

defineCustomElement(
  "modal-overlay",
  class ModalOverlay extends H {
    connectedCallback() {
      setAttributes(this, ["tabindex", "-1"]);
      this.classList.add(
        // "group-in:opacity-100",
        // "group-exiting:opacity-0",
        "group-out:hidden",
        "group-entering:block",
        // "group-entering:opacity-0",
        "z-[50]"
      );
    }
  }
);

defineCustomElement(
  "modal-header",
  class ModalHeader extends H {
    connectedCallback() {
      this.classList.add("first-element:flex-1");
    }
  }
);

defineCustomElement("modal-footer", class ModalFooter extends H {});
defineCustomElement(
  "modal-trigger",
  class ModalTrigger extends Trigger {
    type = "modal";
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
  "modal-close",
  class CloseButton extends Trigger {
    type = "modal";
    mode = "Close";
  }
);
