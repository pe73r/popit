defineCustomElement(
  "tail-popup",
  class Popup extends Dialog {
    closeOnClickOutside = true;
    constructor() {
      super("popup", false);
    }
  }
);

defineCustomElement(
  "popup-content",
  class PopupContent extends H {
    connectedCallback() {
      this.classList.add(
        "group-entering:block",
        "group-entering:opacity-0",
        "group-entering:scale-95",
        "group-in:scale-100",
        "group-in:opacity-100",
        "group-exiting:d-block",
        "group-exiting:scale-90",
        "group-exiting:opacity-0",
        "group-out:opacity-0",
        "group-out:hidden"
      );
    }
  }
);

defineCustomElement(
  "popup-trigger",
  class PopupTrigger extends Trigger {
    type = "popup";
    mode = "Toggle";
  }
);
