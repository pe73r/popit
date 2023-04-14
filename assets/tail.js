const H = HTMLElement;
function setAttributes(element, ...attribute) {
  attribute.forEach(([key, value]) => element.setAttribute(key, value));
}
function eventListener(element, event, cb, remove) {
  element[remove ? "removeEventListener" : "addEventListener"](event, cb);
}

function defineCustomElement(name, component) {
  customElements.define(name, component);
}
function inPath(e, ...tags) {
  return e.composedPath().find((element) => tags.includes(element.tagName?.toLowerCase()));
}

function triggerEvent(type, detail) {
  document.dispatchEvent(new Event(type, { bubbles: true, detail }));
}

function makeId(type) {
  return `${type}-${parseInt(
    Math.ceil(Math.random() * Date.now())
      .toPrecision(6)
      .toString()
      .replace(".", "")
  )}`;
}
class Dialog extends H {
  constructor(type, withOverlay) {
    super();
    this.withOverlay = withOverlay;
    this.type = type;
  }
  connectedCallback() {
    this.id = makeId(this.type);
    this.classList.add("group");
    this.st("out", false);
    eventListener(this, "click", this.onClick);
  }

  onClick = (e) => {
    const { type, withOverlay, isOpen, toggle } = this;
    if (
      inPath(e, `${type}-trigger`, `${type}-close`) ||
      (withOverlay && inPath(e, `${type}-overlay`) && !inPath(e, `${type}-content`) && isOpen)
    ) {
      return toggle();
    }
  };

  select = (part) => {
    if (!this[part]) this[part] = this.querySelector(`${this.type}-${part}`);
    return this[part];
  };

  st = (state, open) => {
    if (this.lockScroll) {
      this.scrollerWidth = window.innerWidth - document.body.offsetWidth;
      document.body.style.marginRight = open ? `${this.scrollerWidth}px` : "0px";
      document.body.style.overflow = open ? "hidden" : "auto";
    }

    if (open && this.getAttribute("fit-page") === "true") {
      const { height: headerHeight } = document.querySelector("tail-header").getBoundingClientRect();
      this.select("overlay").style.height = `calc(100vh - ${headerHeight}px)`;
      this.select("overlay").style.top = `${headerHeight}px`;
      this.select("overlay").style.padding = `0px`;
      this.select("content").style.height = `${window.innerHeight - headerHeight}px`;
      this.select("content").style.width = `100vw`;
    }

    setAttributes(this, ["data-transition", state]);
    const content = this.select("content");
    content && setAttributes(content, ["aria-hidden", String(!open)]);
    this.isOpen = open;

    // Lock scroll if needed

    // On clickoutside the thing
    if (this.closeOnClickOutside) {
      eventListener(document, "click", this.oco, !open);
    }
    // On escape close the thing
    eventListener(document, "keyup", this.oku, !open);

    this.trapFocus(this, open);
  };

  displayCarousels = () => {
    Array.from(this.querySelectorAll("tail-carousel"))
      .concat(Array.from(this.querySelectorAll("tail-tabs")))
      .forEach((carousel) => {
        carousel.setAttribute("displayed", "true");
      });
  };

  onNavigate = (e) => {
    var isTabPressed = e.key === "Tab" || e.keyCode === 9;
    if (!isTabPressed) return;
    if (e.shiftKey) {
      if (document.activeElement === this.firstFocusableEl) {
        this.lastFocusableEl.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === this.lastFocusableEl) {
        this.firstFocusableEl.focus();
        e.preventDefault();
      }
    }
  };

  trapFocus = (element, trap) => {
    if (!this.firstFocusableEl) {
      var focusableEls = element.querySelectorAll(
        `a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), ${this.type}-close, [role="button"]`
      );
      this.firstFocusableEl = focusableEls[0];
      this.lastFocusableEl = focusableEls[focusableEls.length - 1];
    }
    eventListener(element, "keydown", this.onNavigate, !trap);
  };

  close = () => {
    this.st("exiting");
    this.to = setTimeout(() => this.st("out", false), 150);

    const onClose = this.getAttribute("onClose");
    if (onClose) {
      try {
        eval(onClose);
      } catch (error) {
        console.error(error);
      }
    }
  };

  open = () => {
    this.displayCarousels();
    this.st("entering");
    if (this.closest("tail-carouse")) this.closest("tail-carouse").setAttribute("displayed", "false");
    this.to = setTimeout(() => this.st("in", true));
  };

  toggle = () => {
    if (this.to) {
      window.clearTimeout(this.to);
    }
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  oku = (event) => {
    if (event.code && event.code.toUpperCase() === "ESCAPE") this.toggle();
  };
  oco = (event) => {
    if (this.contains(event.target)) return;
    this.toggle();
  };
}

const getProps = (element) => {
  return element.propsDefinition.reduce((acc, [prop, type]) => {
    let value = element.getAttribute(prop);
    if (value) {
      switch (type) {
        case "string": {
          break;
        }
        case "boolean": {
          value = value === "true";
          break;
        }
        case "number": {
          value = Number(value);
          break;
        }
      }
      acc[prop] = value;
    }
    return acc;
  }, {});
};

function throttle(callback, time) {
  if (!this.throttlePause) {
    this.throttlePause = true;
    setTimeout(() => {
      callback();
      this.throttlePause = false;
    }, time);
  }
}

setButtonElement = (element) => {
  setAttributes(element, ["role", "button"], ["tabindex", "0"], ["aria-pressed", "false"]);

  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      element.click();
    }
  });
};

class Btn extends H {
  connectedCallback() {
    setAttributes(this, ["role", "button"], ["tabindex", "0"], ["aria-pressed", "false"]);

    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.click();
      }
    });
  }
}
class Trigger extends H {
  connectedCallback() {
    setAttributes(
      this,
      ["role", "button"],
      ["tabindex", "0"],
      ["aria-pressed", "false"],
      ["aria-labelledby", this.findParentId()],
      ["aria-label", `${this.mode} ${this.type}`]
    );
    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.click();
      }
    });
  }
  findParentId = () => {
    let parent = this;
    while (parent.tagName?.toLocaleLowerCase() !== `tail-${this.type}`) {
      parent = parent.parentElement;
    }
    return parent.id;
  };
}

class HeaderDialog extends Dialog {
  static get observedAttributes() {
    return ["data-transition"];
  }
  attributeChangedCallback(_name, oldValue, newValue) {
    if (newValue === "entering" || newValue === "out") {
      if (newValue === "entering" && this.onEntering) this.onEntering();
      const header = document.querySelector("tail-header");
      console.log();
      const overlay = this.querySelector(`${this.type}-overlay`);
      if (overlay && header) {
        const { top } = header.getBoundingClientRect();
        //if (newValue === "out") {
        //  overlay.style.marginTop = "0px";
        //} else {
        //  overlay.style.marginTop = `${-top}px`;
        //}
      }
    }
  }
}
