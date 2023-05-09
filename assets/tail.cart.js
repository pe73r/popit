const updateCartProgress = async () => {
  const isGiftCard = (item) => {
    return (
      (item.title.toLowerCase().includes("carte") && item.title.toLowerCase().includes("cadeau")) ||
      item.properties?.is === "free"
    );
  };
  const { items } = await (await fetch("/cart.js")).json();

  const giftCardsPrice = items.reduce((acc, item) => (acc += !isGiftCard(item) ? 0 : item.final_line_price), 0);
  const total_price = getCartPrice() * 100 - giftCardsPrice;

  console.log({ giftCardsPrice, total_price });

  const isOnlyGift = items.every((item) => {
    return isGiftCard(item);
  });

  // const steps = [
  //   [40379966455878, 6900]
  //   // [40167046512710, 10000],
  // ];

  /**
   * @typedef {Object} QuantityRule
   * @property {number} min
   * @property {?number} max
   * @property {number} increment
   */

  /**
   * @typedef {Object} Variant
   * @property {number} id
   * @property {string} title
   * @property {string} option1
   * @property {?string} option2
   * @property {?string} option3
   * @property {string} sku
   * @property {boolean} requires_shipping
   * @property {boolean} taxable
   * @property {?Object} featured_image
   * @property {boolean} available
   * @property {string} name
   * @property {?string} public_title
   * @property {string[]} options
   * @property {number} price
   * @property {number} weight
   * @property {?number} compare_at_price
   * @property {string} inventory_management
   * @property {string} barcode
   * @property {QuantityRule} quantity_rule
   */

  /**
   * @typedef {Object} Step
   * @property {number} amount
   * @property {string} product_title
   * @property {?Variant[]} variants
   * @property {string} textBefore
   * @property {string} textAfter
   */

  /**
   * @typedef {Object} CartConfig
   * @property {Step[]} steps
   * @property {number} firstStep
   * @property {number} lastStep
   * @property {number} stepWidth
   */

  /** @type {CartConfig} */
  const { steps } = JSON.parse(document.getElementById("cart-progress").textContent);
  console.log({ steps });

  const hasFreeItem = (id) => {
    return items.some((item) => item.variant_id === id && item.properties.is === "free");
  };
  const f = async (mode, data) => {
    return (
      await fetch(`/cart/${mode}.js`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          [mode === "add" ? "items" : "updates"]: data,
          sections: ["side-cart"],
          sections_url: window.location.pathname
        })
      })
    ).json();
  };

  let add = [];
  let remove = {};
  console.log({ steps });
  let text;
  let percentage;

  [...steps].forEach(({ amount, product_title, variants, textBefore, textAfter }) => {
    const [{ id }] = variants || [{ id: "auto" }];
    if (id === "auto") return;
    if (total_price <= amount || isOnlyGift) {
      if (hasFreeItem(id)) {
        Object.assign(remove, { [id]: 0 });
      }
    } else {
      if (!hasFreeItem(id) && !isOnlyGift) {
        add.push({ id, properties: { is: "free" } });
      }
    }
  });
  let previousAmount = 0;

  steps.forEach(({ amount, product_title, variants, textBefore, textAfter }, i) => {
    const isLast = i === steps.length - 1;
    console.log({ amount, product_title, variants, textBefore, textAfter, previousAmount, total_price });
    if ((total_price >= previousAmount && total_price <= amount) || (!text && isLast)) {
      if (total_price <= amount) {
        const restRounded = Math.ceil((amount - total_price) / 100);
        text = textBefore.replace("((rest))", restRounded + "€");
      } else {
        text = textAfter.replace("((rest))", (amount - total_price) / 100 + "€");
      }
      percentage = Math.round((total_price / amount) * 100);
      if (percentage > 100) {
        percentage = 100;
      }
    }
    previousAmount = amount;
  });

  console.log({
    text,
    percentage
  });
  let fetchers = [];

  if (Object.keys(remove).length > 0) {
    fetchers.push(f("update", remove));
  }
  if (add.length > 0) {
    fetchers.push(f("add", add));
  }
  if (fetchers.length) {
    const [{ sections }] = await Promise.all(fetchers);
    reRenderCartIndicators(sections);
  }

  reRenderBundleProduct();

  const bar = document.querySelector("[data-side-cart-progression-bar]");
  const barCart = document.querySelector("[data-side-cart-progression-cart]");
  const barText = document.querySelector("[data-side-cart-progression-text]");

  bar.style.transform = `scaleX(${percentage}%)`;
  barCart.style.left = `${percentage - 5}%`;
  barText.textContent = text;
  return "ok";
};

window.fetch = new Proxy(window.fetch, {
  async apply(fetch, that, args) {
    const result = fetch.apply(that, args);
    result.then(async (response) => {
      const [endpoint, { body } = {}] = args;
      const isUpdate = endpoint.endsWith("/cart/update.js");
      const isChange = endpoint.endsWith("/cart/change.js");
      const isAdd = endpoint.endsWith("/cart/add.js");
      const isRemove = endpoint.endsWith("/cart/remove.js");

      if (isUpdate || isAdd || isRemove || isChange) {
        await updateCartProgress();
      }
    });

    return result;
  }
});
window.updateCartProgress = updateCartProgress;
updateCartProgress().then(() => {
  console.log("cart updated");
});

const spinnerHtml = (height) => /*HTML */ `
<svg height=${height} class="animate-[spin_1.4s_linear_infinite] mx-auto w-10" aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
    <circle  class="animate-dash origin-[center_center]" fill="none" stroke="currentColor" stroke-width="6" cx="33" cy="33" r="30" stroke-dasharray="280" stroke-dashoffset="0" ></circle>
</svg>
`;

const reRenderSections = (sections, newSections) => {
  if (!newSections || (newSections && !Object.keys(newSections).length)) {
    return;
  }
  sections.forEach((section) => {
    const newDom = new DOMParser().parseFromString(newSections[section], "text/html");
    if (section === "side-cart") {
      const isEmpty = document.querySelector(".empty-card") !== null;

      console.log({ isEmpty });
      const selectors = ["side-cart-trigger", "side-cart-header", "side-cart-footer", "#cart-progress"];

      if (isEmpty) {
        selectors.push("side-cart-content");
      } else {
        selectors.push("#line-items");
      }

      selectors.forEach((selector) => {
        const element = document.querySelector(`${selector}`);
        const newElement = newDom.querySelector(selector);
        console.log(selector, element, newElement);
        if (element && newElement) {
          document.querySelector(`${selector}`).innerHTML = newElement.innerHTML;
        }
      });

      const reRenderEnd = new CustomEvent("reRenderEnd");
      document.dispatchEvent(reRenderEnd);
    }
  });
};

const reRenderLineItems = (newSections) => {
  if (!newSections || (newSections && !Object.keys(newSections).length)) {
    return;
  }
  const newDom = new DOMParser().parseFromString(newSections["side-cart"], "text/html");
  const lineItems = document.getElementById("line-items");

  lineItems.innerHTML = newDom.getElementById("line-items").innerHTML;
  return newDom;
};

const reRenderCartIndicators = (newSections) => {
  if (!newSections || (newSections && !Object.keys(newSections).length)) {
    return;
  }
  const newDom = new DOMParser().parseFromString(newSections["side-cart"], "text/html");
  const indicators = Array.from(document.querySelectorAll("[data-cart-indicator]"));
  const newIndicators = Array.from(newDom.querySelectorAll("[data-cart-indicator]"));
  indicators.forEach((indicator, i) => {
    indicator.innerHTML = newIndicators[i].innerHTML;
  });

  const ShippingText = Array.from(document.querySelectorAll("[data-sidecart-footer-text]"));
  const newShippingText = Array.from(newDom.querySelectorAll("[data-sidecart-footer-text]"));
  ShippingText.forEach((indicator, i) => {
    indicator.innerHTML = newShippingText[i].innerHTML;
  });

  return newDom;
};

// const openSideCart = () => {
//   const event = new CustomEvent("openSideCart");
//   console.log("hello");
//   document.dispatchEvent(event);
// };
const clearCart = () => {
  const updates = {};
  window.cart.items.forEach((item) => {
    Object.assign(updates, { [item.variant_id]: 0 });
  });
  updateCart(updates, 0);
};

const getCart = async () => {
  return (await fetch("/cart.js")).json();
};

const getCartPrice = () => {
  let bundle_price = document.querySelector('tail-side-cart [data-bb-selector="bb-price"]');
  const { total } = JSON.parse(document.querySelector("#cart-progress").innerHTML);
  if (bundle_price) {
    let bundle_number = parseInt(
      document.querySelector('tail-side-cart [data-bb-selector="bb-title"]').innerText.match(/\d+/)[0]
    );

    const cart_price = total / 100;

    const cart_total_price = parseFloat(
      cart_price -
        16.98 * bundle_number +
        parseFloat(bundle_price.innerText.replace("€", "").replace(",", ".").trim(), 2),
      2
    ).toFixed(2);

    return cart_total_price;
  } else {
    return total / 100;
  }
};
const reRenderBundleProduct = () => {
  setTimeout(() => {
    const price = getCartPrice();
    if (price) {
      document.querySelector("side-cart-footer [data-cart-indicator]").innerText = `${price
        .toString()
        .replace(".", ",")}€`;
    }
  }, 10);
};

/**
 *
 * @param {Record<string, number>} updates
 * @param {number} newPrice
 * @param {string[]} sections
 */

const updateCart = async (updates, priceDelta, sections = ["side-cart"]) => {
  Object.entries(updates).forEach(([id, quantity]) => {
    const inCart = window.cart.items.find(({ variant_id }) => variant_id == id);
    if (inCart && quantity > 0) {
      updates[id] = inCart.quantity + quantity;
    }
    if (inCart && quantity < 0) {
      updates[id] = inCart.quantity - quantity;
    }
  });

  const response = await (
    await fetch("/cart/update.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        updates,
        sections,
        sections_url: window.location.pathname
      })
    })
  ).json();

  reRenderSections(sections, response.sections);
  reRenderBundleProduct();

  return response;
};

defineCustomElement(
  "tail-side-cart",
  class TailDrawer extends HeaderDialog {
    lockScroll = true;
    constructor() {
      super("side-cart", true);
      document.addEventListener("openSideCart", () => {
        if (!this.isOpen) {
          this.open();
        }
      });
      document.addEventListener("closeSideCart", () => {
        if (this.isOpen) {
          this.close();
        }
      });
    }
    onEntering() {
      const overlay = this.select("overlay");
      // const header = document.querySelector("tail-header header");
      // if (overlay && [header.dataset.dynamic, header.dataset.sticky].includes("true")) {
      //   overlay.style.right = `-${this.scrollerWidth}px`;
      // }
    }
  }
);

defineCustomElement(
  "side-cart-content",
  class DrawerContent extends H {
    connectedCallback() {
      setAttributes(
        this,
        ["aria-hidden", "true"],
        ["aria-modal", "true"],
        ["aria-labelledby", "side-cart"],
        ["role", "dialog"]
      );
      this.classList.add(
        "group-entering:block",
        "group-entering:translate-x-full",
        "group-in:translate-x-0",
        "group-in:opacity-100",
        "group-exiting:d-block",
        "group-exiting:translate-x-full",
        "group-exiting:opacity-0",
        "group-out:opacity-0",
        "group-out:hidden"
      );
    }
  }
);

defineCustomElement(
  "side-cart-overlay",
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
      this.style.minHeight = window.innerHeight + "px";
      this.style.height = window.innerHeight + "px";
      this.style.maxHeight = window.innerHeight + "px";
    };
  }
);

defineCustomElement(
  "side-cart-header",
  class DrawerHeader extends H {
    connectedCallback() {}
  }
);

defineCustomElement("side-cart-inner", class DrawerInner extends H {});
defineCustomElement("side-cart-footer", class DrawerFooter extends H {});
defineCustomElement(
  "side-cart-trigger",
  class DrawerTrigger extends Trigger {
    type = "side-cart";
    mode = "Open";
  }
);
defineCustomElement(
  "side-cart-close",
  class DrawerClose extends Trigger {
    type = "side-cart";
    mode = "Close";
  }
);

window.customElements.define(
  "cart-progress",
  class TPB extends HTMLElement {
    constructor() {
      super();
      console.log("mounted");
    }
    connectedCallback() {
      console.log(JSON.parse(this.dataset.steps));
    }
  }
);
window.customElements.define("progress-step", class PS extends HTMLElement {});
window.customElements.define("progress-indicator", class PS extends HTMLElement {});

defineCustomElement(
  "cart-item-quantity",
  class DrawerHeader extends HTMLElement {
    connectedCallback() {
      const buttons = Array.from(this.querySelectorAll("button"));
      if (buttons.length === 2) {
        return this.init(buttons);
      }
      const observerContainer = new MutationObserver(() => {
        const buttons = Array.from(this.querySelectorAll("button"));
        if (buttons.length === 2) {
          this.init(buttons);
          observerContainer.disconnect();
        }
      });

      observerContainer.observe(this, { childList: true });
    }

    init = (buttons) => {
      this.isInit = true;
      this.plus = this.querySelector('button[name="plus"]');
      this.minus = this.querySelector('button[name="minus"]');
      this.input = this.querySelector("input");

      this.productCard = this.getAttribute("data-product-card") === "true";
      this.variant = this.getAttribute("data-variant");
      this.quantity = Number(this.getAttribute("data-quantity"));
      this.maxQuantity = Number(this.getAttribute("data-max-quantity"));

      buttons.forEach((button) => button.addEventListener("click", this.onButtonClick));
      this.input.addEventListener("keydown", this.onInputChange);
      this.input.addEventListener("blur", this.onInputBlur);
      this.classList.add("group");
      this.handlePlusButton();
    };

    onInputBlur = (e) => {
      const newQuantity = Number(e.target.value);
      if (this.quantity !== newQuantity) {
        this.quantity = newQuantity;

        this.updateQuantity();
      }
    };

    /**
     *
     * @param {KeyboardEvent} e
     */
    onInputChange = (e) => {
      if (e.key === "Enter") {
        this.input.blur();
      }
    };

    /**
     *
     * @param {MouseEvent} e
     */
    onButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const { currentTarget } = e;
      if (this.quantity !== this.input.value) {
        this.quantity = this.input.value;
      }

      const isMinus = currentTarget.getAttribute("name") === "minus";
      if (isMinus) {
        this.quantity--;
      } else {
        if (Number(this.quantity) + 1 > this.maxQuantity) {
          return;
        }
        this.quantity++;
      }
      console.log(this.quantity);
      this.updateQuantity();
    };

    toggleLoading = (loading) => {
      if (loading) {
        if (this.spinner) {
          this.spinner.remove();
        }
        this.input.style.opacity = 0;
        const { height } = this.input.getBoundingClientRect();
        const padding = window.getComputedStyle(this.input, null).getPropertyValue("padding-top");
        this.spinner = document.createElement("div");
        this.spinner.classList.add("absolute", "top-0", "z-2", "flex", "justify-center", "items-center");
        this.spinner.innerHTML = spinnerHtml(height - Number(padding.replace("px", "")) * 2);
        this.spinner.style.height = `${height}px`;
        this.spinner.style.top = `${0}px`;
        this.spinner.style.bottom = `${0}px`;
        this.spinner.style.right = `${0}px`;
        this.spinner.style.left = `${0}px`;
        this.spinner.style.color = `gray`;
        this.spinner.style.margin = `auto`;
        this.appendChild(this.spinner);
      } else {
        this.input.style.opacity = 1;
        if (this.spinner) {
          this.spinner.remove();
        }
      }
    };

    handlePlusButton = () => {
      if (Number(this.quantity) === this.maxQuantity) {
        this.plus.setAttribute("disabled", "true");
      } else {
        this.plus.removeAttribute("disabled");
      }
    };

    updateQuantity = async () => {
      console.log("this.quantity", this.quantity);
      this.toggleLoading(true);
      const response = await (
        await fetch("/cart/change.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            id: String(this.variant),
            quantity: Number(this.quantity),
            sections: ["side-cart"],
            sections_url: window.location.pathname
          })
        })
      ).json();

      if (this.quantity === 0) {
        if (this.productCard) {
          this.parentElement.setAttribute("aria-selected", "false");
        } else {
          document.querySelector(`[data-line-item-variant="${this.variant}"]`).remove();
        }
      } else {
        if (this.productCard) {
          this.handlePlusButton();
        }
        this.input.value = this.quantity || 1;
      }

      const hasItemInCart = document.querySelectorAll("[data-line-item-variant]").length > 0;
      if ((!hasItemInCart && this.quantity === 0) || this.productCard) {
        reRenderSections(["side-cart"], response.sections);
      } else {
        console.log({ response });
        reRenderCartIndicators(response.sections);

        const newDom = new DOMParser().parseFromString(response.sections["side-cart"], "text/html");
        const selector = `[data-cart-price="${this.variant}"]`;
        const price = document.querySelector(selector);

        if (price) {
          price.innerHTML = newDom.querySelector(selector).innerHTML;
        }
      }

      document
        .querySelectorAll(`cart-item-quantity[data-variant="${this.variant}"][data-product-card="true"] input`)
        .forEach((element) => {
          element.value = this.quantity || 1;
          if (this.quantity === 0) {
            element.parentElement.parentElement.setAttribute("aria-selected", "false");
          }
        });

      reRenderBundleProduct();

      this.toggleLoading(false);
    };
  }
);

const reRenderPrices = (section) => {};

defineCustomElement(
  "cart-item-remove",
  class CartItemRemove extends HTMLElement {
    connectedCallback() {
      setButtonElement(this);
      this.addEventListener("click", this.onDelete);
    }

    onDelete = async () => {
      const variant = this.getAttribute("data-variant");
      const lineItem = document.querySelector(`[data-line-item-variant="${variant}"]`);
      lineItem.classList.add("animate-pulse", "pointer-events-none", "transition-all", "overflow-hidden", "origin-top");

      const response = await (
        await fetch("/cart/update.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify({
            updates: { [variant]: 0 },
            sections: ["side-cart"],
            sections_url: window.location.pathname
          })
        })
      ).json();

      if (response.item_count > 0) {
        reRenderCartIndicators(response.sections);
      } else {
        reRenderSections(["side-cart"], response.sections);
      }

      reRenderBundleProduct();
      lineItem.remove();
    };
  }
);

defineCustomElement(
  "tail-gift",
  class TailGift extends HTMLElement {
    connectedCallback() {
      const observerContainer = new MutationObserver(() => {
        this.input = this.querySelector('input[name="name"]');
        this.textarea = this.querySelector("textarea");
        this.label = this.querySelector("label");
        if (this.input && this.textarea && this.label) {
          this.init([this.input, this.textarea], this.label);
          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }

    init = (inputs) => {
      this.label.addEventListener("mousedown", this.onClick);
      const note = this.getAttribute("data-cart-note") || "";
      const [content = "", name = ""] = note.split(" ----- ");
      inputs.forEach((input) => {
        if (input.name === "message") {
          input.value = content;
        }
        if (input.name === "name") {
          input.value = name;
        }
        input.addEventListener("input", this.onChange);
      });
    };
    save = debounce(async () => {
      await fetch("/cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          note: `${this.message || ""} ----- ${this.name || ""} `,
          sections: ["side-cart"],
          sections_url: window.location.pathname
        })
      });
    }, 2000).bind(this);

    onChange = (e) => {
      const { name, value } = e.currentTarget;
      if (name === "message") {
        this.message = value || "";
      }
      if (name === "name") {
        this.name = value || "";
      }
      this.save();
    };

    addKdoToCart = async (add) => {
      const res = await fetch("/cart/update.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          updates: {
            ["44584120910070"]: add ? 1 : 0
          },
          ...(add ? {} : { note: "" }),
          sections: ["side-cart"],
          sections_url: window.location.pathname
        })
      });
      if (!add) {
        this.input.value = "";
        this.textarea.value = "";
      }
      const data = await res.json();
      reRenderCartIndicators(data.sections);
      return reRenderLineItems(data.sections);
    };
    /**
     * @param {MouseEvent} e
     */
    onClick = async () => {
      const selected = this.label.getAttribute("aria-selected") === "true";
      this.label.setAttribute("aria-selected", String(!selected));
      this.setAttribute("loading", "true");
      await this.addKdoToCart(!selected);
      this.setAttribute("loading", "false");
    };
  }
);
