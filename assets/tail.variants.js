defineCustomElement(
  "tail-variants",
  class Variants extends HTMLElement {
    isInit = false;
    constructor() {
      super();
      this.addEventListener("click", this.onClick);
    }

    getSelectedOptions = () => {};
    init = () => {
      const selects = Array.from(this.querySelectorAll("select"));
      const inputs = Array.from(this.querySelectorAll("input"));
      this.atc = document.querySelectorAll(`add-to-cart[data-product="${this.getAttribute("data-product")}"]`);
      this.variants = JSON.parse(this.querySelector("#product-variants").innerHTML);

      selects.concat(inputs).forEach((element) => {
        element.addEventListener("change", this.onChange);
      });
      this.isInit = true;
    };

    /**
     * @param {ChangeEvent} e
     */
    onChange = (e) => {
      const value = e.target.value;
      if (this.atc) {
        const position = e.target.getAttribute("data-position");
        const newState = Array.from(this.querySelectorAll("input:checked")).reduce((acc, input) => {
          const inputPosition = input.getAttribute("data-position");
          acc[Number(inputPosition) - 1] = position === inputPosition ? value : input.value;
          return acc;
        }, []);

        const inputs = Array.from(document.querySelectorAll(`[value="${e.target.value}"]`));
        document.querySelectorAll("tail-variants input").forEach((input) => {
          input.classList.remove("checked");
        });
        inputs.forEach((input) => {
          input.classList.add("checked");
        });

        const variant = this.variants.find((variant) => {
          return JSON.stringify(variant.options) === JSON.stringify(newState);
        });

        const price = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR"
        });

        document.querySelectorAll("[data-dynamic-price]").forEach(
          (element) =>
            (element.textContent =
              price
                .format(variant.price / 100)
                .replace("€", "")
                .trim() + "€")
        );

        //cdn.shopify.com/s/files/1/0681/5494/9926/products/Biotine-zinc-selenium-beaute-de-la-peau-ongles-cheveux-gelules-pack-de-3.png?v=1680689697&width=1445
        const hasPriceStroke = variant.price !== variant.compare_at_price;

        document.querySelectorAll("add-to-cart").forEach((element) => {
          element.setAttribute(
            "data-price-stroke",
            price
              .format(variant.compare_at_price / 100)
              .replace("€", "")
              .trim() + "€"
          );
        });
        if (variant.featured_image) {
          console.log({ variant });
          const imageId = variant.featured_media.id;
          document.querySelectorAll(`[data-media-id="${imageId}"]`).forEach((element) => {
            element.click();
          });
        }

        this.atc.forEach((atc) => {
          atc.setAttribute("data-variant", String(variant.id));
        });
      }
    };

    onClick = () => {
      if (!this.isInit) {
        this.init();
      }
    };
  }
);
