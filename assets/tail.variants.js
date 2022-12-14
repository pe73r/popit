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
      this.atc = document.querySelector(`add-to-cart[data-product="${this.getAttribute("data-product")}"]`);
      this.variants = JSON.parse(this.querySelector("#product-variants").innerHTML);

      console.log(this.variants, this.atc);
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
        console.log({ value, position, newState });
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
        const variantImg = variant.featured_image.src.split("v=")[1];
        document.querySelectorAll("carousel-dot").forEach((element) => {
          const img = element.querySelector("img");
          if (!img) {
            return;
          }

          if (String(img.src).includes(variantImg)) {
            element.click();
          }
        });
        console.log({ variant });
        this.atc.setAttribute("data-variant", String(variant.id));
      }
    };

    onClick = () => {
      if (!this.isInit) {
        this.init();
      }
    };
  }
);
