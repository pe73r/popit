defineCustomElement(
  "tail-tabs",
  class Popup extends H {
    activeTab;
    activeTabIndex = 0;

    static get observedAttributes() {
      return ["displayed"];
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "displayed" && newValue === "true") {
        this.init(this.querySelectorAll("tabs-buttons"), this.querySelectorAll("tabs-panels"));
      }
    }

    connectedCallback() {
      if (this.mount) return;
      if (!this.id) {
        this.id = makeId("tab");
      }
      const observerContainer = new MutationObserver(() => {
        this.content = document.querySelector(`#${this.id}> tabs-panels`);
        this.buttons = document.querySelector(`#${this.id}> tabs-buttons`);

        if (
          this.content &&
          this.buttons &&
          this.buttons.hasChildNodes() &&
          this.content.hasChildNodes() &&
          this.content.children.length === this.buttons.children.length
        ) {
          this.init(this.buttons, this.content);
          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }

    showActiveTab = () => {
      this.activeTab.classList.add("hidden");
      const newActiveTab = this.querySelector(
        `tabs-panels > [data-tab-index="${this.activeTabIndex}"][data-tab-id="${this.id}"]`
      );
      const newActiveTabButton = this.buttons.querySelector(
        `[data-tab-index="${this.activeTabIndex}"][data-tab-id="${this.id}"]`
      );

      if (!newActiveTab || !newActiveTabButton) return;
      newActiveTab.classList.remove("hidden");
      this.activeTab = newActiveTab;

      this.activeTabButton.removeAttribute("aria-selected");
      this.activeTabButton = newActiveTabButton;
      newActiveTabButton.setAttribute("aria-selected", "true");
    };

    init = (buttons, content) => {
      Array.from(buttons.children).forEach((tab, i) => {
        if (i === 0) {
          this.activeTabButton = tab;
          tab.setAttribute("aria-selected", "true");
        }
        tab.setAttribute("data-tab-index", `${i}`);
        tab.setAttribute("data-tab-id", `${this.id}`);
      });
      Array.from(content.children).forEach((tab, i) => {
        if (i === 0) {
          this.activeTab = tab;
        } else {
          tab.classList.add("hidden");
        }
        tab.setAttribute("data-tab-index", `${i}`);
        tab.setAttribute("data-tab-id", `${this.id}`);
      });

      buttons.addEventListener("click", this.onClick, { capture: true });
    };
    /**
     * @param {MouseEvent} e
     */
    onClick = (e) => {
      const butonTarget = e
        .composedPath()
        .find((element) => element.hasAttribute && element.hasAttribute("data-tab-index"));
      if (!butonTarget) {
        return;
      }

      this.activeTabIndex = Number(butonTarget.getAttribute("data-tab-index"));
      this.showActiveTab();
    };
  }
);
defineCustomElement("tabs-buttons", class Popup extends H {});

defineCustomElement("tabs-panels", class Popup extends H {});
