// js doc for a function that accepet one paramater of type array of strings

/**
 * @param {String[]} selectors
 * @param {(elements:HTMLElement[])=>void} callback
 */
function waitForDom(selectors, callback) {
  const observerContainer = new MutationObserver(() => {
    const elements = selectors.map((selector) => document.querySelector(selector));
    if (elements.every((element) => !!element) && elements.length === selectors.length) {
      observerContainer.disconnect();
      callback(elements);
    }
  });
  observerContainer.observe(this, { childList: true });
}

/**
 * @param {Boolean} loading
 * @param {String} buttonSelector
 */
function toggleLoading(loading, buttonSelector) {
  this.setAttribute("data-loading", String(loading));
  const button = this.querySelector("button");
  if (!this.buttonContent) {
    this.buttonContent = this.querySelector(buttonSelector);
  }
  if (loading) {
    this.buttonContent = button.innerHTML;
    const { height } = button.getBoundingClientRect();
    const padding = window.getComputedStyle(button, null).getPropertyValue("padding-top");
    button.innerHTML = spinnerHtml(height - Number(padding.replace("px", "")) * 2);
  } else {
    button.innerHTML = this.buttonContent;
  }
}

defineCustomElement(
  "recover-password",
  class RecoverPassWord extends HTMLElement {
    constructor() {
      super();
    }

    waitForDom = waitForDom.bind(this);
    toggleLoading = (loading) => toggleLoading.bind(this, loading, "[data-recover-password-button]");

    connectedCallback() {
      this.waitForDom(["[data-recover-password-button]"], ([button]) => {
        console.log(button);
        button.addEventListener("click", this.onRecoverPasswordClicked);
      });
    }
    onRecoverPasswordClicked = async (event) => {
      this.toggleLoading(true);
      this.querySelector("[data-error]").style.display = "none";
      this.querySelector("[data-success]").style.display = "none";
      event.preventDefault();
      const email = this.querySelector("[data-email]").value;
      const formData = new FormData();
      formData.append("email", email);
      formData.append("form_type", "recover_customer_password");
      const response = await fetch("/account/recover", {
        method: "POST",
        body: formData
      });
      console.log({ response });
      if (response.ok) {
        this.querySelector("[data-success]").style.display = "block";
      } else {
        this.querySelector("[data-error]").style.display = "block";
      }
      this.querySelector("[data-success]").style.display = "block";
      this.toggleLoading(false);
    };
  }
);

defineCustomElement(
  "reset-password",
  class ResetPassWord extends HTMLElement {
    constructor() {
      super();
    }
    waitForDom = waitForDom.bind(this);
    connectedCallback() {
      this.waitForDom(["[reset_customer_password_button]"], ([button]) => {
        console.log({ button });
        this.init();
        this.form = this.querySelector("form");
      });
    }

    init = () => {
      // set window url to the reset_password_url url in the url
      const url = new URL(window.location.href);
      const reset_password_url = decodeURIComponent(url.searchParams.get("reset_password_url"));
      console.log({ reset_password_url });
      if (reset_password_url && reset_password_url !== "null") {
        window.location.href = reset_password_url;
      }
      // window.location.p = decodeURIComponent(url.searchParams.get("reset_password_url"));
      return;
      // this.form.addEventListener("submit", () => {
      //   window.location.reload();
      // });
      // const url = new URL(window.location.href);
      // const reset_password_url = decodeURIComponent(url.searchParams.get("reset_password_url")).split("/").reverse();
      // const [token, id] = reset_password_url;

      // console.log({ token, id });

      // ["token", "id"].forEach((name, i) => {
      //   const input = document.createElement("input");
      //   input.type = "hidden";
      //   input.name = name;
      //   input.value = reset_password_url[i];
      //   this.form.appendChild(input);
      // });
    };
  }
);
