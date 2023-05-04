defineCustomElement(
  "add-to-cart",
  class TailAtc extends HTMLElement {
    connectedCallback() {
      this.addEventListener("click", this.onAddToCart);
    }

    static get observedAttributes() {
      return ["data-quantity", "data-price-stroke"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "data-quantity") {
        const price = this.getAttribute("data-price").replace("€", "").trim();
        const priceElement = this.querySelector("[data-price]");
        const priceStrokeElement = this.querySelector("[data-price-stroke]");
        if (price && priceElement) {
          const newPrice = Number(newValue) * Number(price);
          priceElement.textContent = `${newPrice}€`;
        }
        if (priceStrokeElement) {
          const priceStroke = this.getAttribute("data-price-stroke").replace("€", "").trim();
          const newPriceStroke = Number(newValue) * Number(priceStroke);
          priceStrokeElement.textContent = `${newPriceStroke}€`;
        }
      }
      if (name === "data-price-stroke") {
        const priceStrokeElement = this.querySelector("[data-price-stroke]");
        if (priceStrokeElement) {
          const priceStroke = newValue.replace("€", "").replace(",", ".").trim();
          const quantity = this.getAttribute("data-quantity") || "1";
          const newPriceStroke = Number(quantity) * Number(priceStroke);
          console.log({ priceStroke, quantity, newPriceStroke, newValue, q: Number(quantity), p: Number(priceStroke) });
          if (priceStroke > 0) {
            priceStrokeElement.textContent = `${newPriceStroke}€`;
          } else {
            priceStrokeElement.textContent = "";
          }
        }
      }
    }

    reRenderBundleProduct = () => {
      let bundle_price = document.querySelector('side-cart [data-bb-selector="bb-price"]')

      console.log('ok')
      if(bundle_price) {
        let bundle_number = parseInt(document.querySelector('side-cart [data-bb-selector="bb-title"]').innerText.match(/\d+/)[0]);
            cart_total_price = document.querySelector('[data-cart-indicator]').innerText.replace(",", ".").replace(/.$/, "");

        document.querySelector('[data-cart-indicator]').innerText = `${(cart_total_price - (16.98 * bundle_number) + bundle_price.innerText.replace(",", ".").replace(/.$/, "")).replace('.', ',')}€`;
      }
    }

    toggleLoading = (loading) => {
      this.setAttribute("data-loading", String(loading));
      const button = this.querySelector("button");
      if (loading) {
        this.buttonContent = button.innerHTML;
        const { height } = button.getBoundingClientRect();
        const padding = window.getComputedStyle(button, null).getPropertyValue("padding-top");
        button.innerHTML = spinnerHtml(height - Number(padding.replace("px", "")) * 2);
      } else {
        button.innerHTML = this.buttonContent;
      }
    };

    /**
     *
     * @param {MouseEvent} e
     */
    onAddToCart = async (e) => {
      e.preventDefault();
      const lightReRender = this.getAttribute("data-lightReRender") === "true";

      this.toggleLoading(true);
      const response = await await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          items: [
            {
              id: Number(this.getAttribute("data-variant")),
              quantity: Number(this.getAttribute("data-quantity") || 1)
            }
          ],
          sections: ["side-cart"],
          sections_url: window.location.pathname
        })
      })
        .then((r) => r.json())
        .catch((e) => {
          return { sections: [] };
        });

      const quantity = document.querySelector(`product-quantity[data-product="${this.getAttribute("data-product")}"]`);

      if (quantity) {
        quantity.quantity = 1;
        quantity.querySelector("input").value = 1;
      }

      if (Number(this.getAttribute("data-max-quantity") > 1)) {
        this.parentElement.setAttribute("aria-selected", "true");
      } else {
        const button = this.querySelector("button");
        button.disabled = true;
      }

      if (lightReRender) {
        reRenderCartIndicators(response.sections);
        reRenderLineItems(response.sections);
      } else {
        reRenderSections(["side-cart"], response.sections);
        setTimeout(() => {
          openSideCart();
        }, 1);
      }
      
      reRenderBundleProduct();
      this.toggleLoading(false);
    };
  }
);

/**
 *
 * @param {HTMLElement} element
 */
const getAddToCart = (element) => {
  const productId = element.getAttribute("data-product");
  const addToCart = element.closest(`add-to-cart[data-product="${productId}"]`);
  return addToCart;
};

defineCustomElement(
  "product-variants",
  class TailAtc extends HTMLElement {
    connectedCallback() {
      this.addToCart = getAddToCart(this);
      const input = this.querySelector("input");
      input.addEventListener("change", this.onVariantChange);
    }
    /**
     *
     * @param {InputEvent} e
     */
    onVariantChange = (e) => {
      this.addToCart.setAttribute("data-variant", e.target.value);
    };
  }
);

defineCustomElement(
  "product-quantity",
  class TailAtc extends HTMLElement {
    quantity = 1;
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
      this.maxQuantity = Number(this.getAttribute("data-max-quantity"));

      buttons.forEach((button) => button.addEventListener("click", this.onButtonClick));
    };

    onInputBlur = (e) => {
      let newQuantity = Number(e.target.value);

      if (this.quantity !== newQuantity) {
        if (newQuantity <= 0 || newQuantity > this.maxQuantity) {
          newQuantity = 1;
        }
        this.quantity = newQuantity;
        this.updateQuantity();
      }
    };
    onInputChange = (e) => {
      if (e.key === "Enter") {
        this.input.blur();
      }
    };
    onButtonClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.getAttribute("data-disabled") == "true") {
        return;
      }
      const { currentTarget } = e;
      if (this.quantity !== this.input.value) {
        this.quantity = Number(this.input.value);
      }

      const isMinus = currentTarget.getAttribute("name") === "minus";
      const atc_button = document.querySelector("#buy-buttons add-to-cart button");
      if (isMinus) {
        if (this.quantity > 1) {
          this.quantity--;
          // this.GTM_ATC(
          //   "remove_to_cart",
          //   this.quantity,
          //   atc_button.parentElement.dataset.price,
          //   atc_button.parentElement.dataset.discount,
          //   atc_button.parentElement.dataset.id,
          //   atc_button.parentElement.dataset.title,
          //   atc_button.parentElement.dataset.currency,
          //   atc_button.parentElement.dataset.collection
          // );
        } else {
          return;
        }
      } else {
        if (this.quantity + 1 > this.maxQuantity) {
          return;
        }
        // this.GTM_ATC(
        //   "add_to_cart",
        //   this.quantity,
        //   atc_button.parentElement.dataset.price,
        //   atc_button.parentElement.dataset.discount,
        //   atc_button.parentElement.dataset.id,
        //   atc_button.parentElement.dataset.title,
        //   atc_button.parentElement.dataset.currency,
        //   atc_button.parentElement.dataset.collection
        // );
        this.quantity++;
      }
      this.updateQuantity();
    };

    GTM_ATC = (event, quantity, price, discount, title, id, currency, collection) => {
      console.log("ok");
      dataLayer.push({
        event: event,
        ecommerce: {
          currency: collection,
          value: price * quantity,
          discount: discount * quantity,
          items: [
            {
              item_id: id,
              item_name: title,
              quantity: quantity,
              item_category: collection,
              price: price,
              item_discount: discount
            }
          ]
        }
      });
    };

    updateQuantity = () => {
      this.input.value = this.quantity;

      document
        .querySelectorAll(`product-quantity[data-product="${this.getAttribute("data-product")}"] input`)
        .forEach((input) => {
          input.value = this.quantity;
        });

      document
        .querySelectorAll(`add-to-cart[data-product="${this.getAttribute("data-product")}"]`)
        .forEach((element) => {
          element.setAttribute("data-quantity", String(this.quantity));
        });
    };
  }
);
