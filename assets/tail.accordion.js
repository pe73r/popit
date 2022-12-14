defineCustomElement(
  "accordion-group",
  class AG extends HTMLElement {
    constructor() {
      super();
      eventListener(this, "click", this.onClick);
    }

    connectedCallback() {
      this.id = makeId("accordion-group");
      this.oneAtATime = this.getAttribute("oneAtATime") !== "false";
    }

    onClick = (e) => {
      const trigger = e.composedPath().find((element) => element.tagName?.toLowerCase() === "accordion-trigger");
      if (!this.elements)
        this.elements = Array.from(this.childNodes).filter((el) => el.tagName?.toLowerCase() === "accordion-element");

      if (!trigger || (trigger && !trigger.id.includes(this.id))) return;
      const accordion = trigger.parentElement;
      const isOpen = accordion.getAttribute("data-open") === "true";
      if (!this.oneAtATime) {
        trigger.parentElement.setAttribute("data-open", String(!isOpen));
      } else {
        this.elements.forEach((element) => {
          element.setAttribute("data-open", String(element === accordion && !isOpen));
        });
      }
    };
  }
);

defineCustomElement(
  "accordion-element",
  class AE extends H {
    static get observedAttributes() {
      return ["data-open"];
    }

    connectedCallback() {
      if(this.getAttribute('data-open') != "true") this.setAttribute("data-open", "false");
      this.id = `${this.parentElement.id}-${makeId("accordion-element")}`;
    }

    attributeChangedCallback(_name, oldValue, newValue) {
      if (oldValue === newValue) return;
      if (!this.trigger) this.trigger = this.querySelector(`#${this.id}-trigger`);
      if (!this.content) this.content = this.querySelector("accordion-content");
      const trigger = this.trigger;
      const content = this.content;
      if (!content || !trigger) return;
      trigger.setAttribute("aria-expanded", newValue);

      if (newValue === "true") {
        content.removeAttribute("hidden");
        content.style.height = `${content.scrollHeight}px`;
        setTimeout(() => {
          content.style.height = "auto";
        }, 150);
      } else {
        this.content.style.height = `${content.scrollHeight}px`;

        setTimeout(() => {
          content.style.height = `0px`;
        });
        setTimeout(() => {
          content.setAttribute("hidden", "true");
        }, 150);
      }
    }
  }
);

defineCustomElement(
  "accordion-content",
  class AC extends H {
    connectedCallback() {
      const accordionId = this.parentElement.id;
      setAttributes(
        this,
        ["id", `${accordionId}-content`],
        ["role", "region"],
        ["aria-labelledby", `${accordionId}-trigger`]
      );
      if(this.parentElement.getAttribute('data-open') != 'true') this.style.height = `0px`;
    }
  }
);

defineCustomElement(
  "accordion-trigger",
  class AT extends H {
    connectedCallback() {
      const accordionId = this.parentElement.id;
      setAttributes(
        this,
        ["id", `${accordionId}-trigger`],
        ["aria-expanded", "false"],
        ["role", "button"],
        ["tabindex", "0"],
        ["aria-pressed", "false"],
        ["aria-controls", `${accordionId}-content`]
      );
      eventListener(this, "keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.click();
        }
      });
    }
  }
);

defineCustomElement("accordion-header", class AH extends H {});
defineCustomElement("accordion-icon", class AI extends H {});
