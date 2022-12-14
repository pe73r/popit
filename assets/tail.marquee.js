defineCustomElement(
  "tail-marquee",
  class TH extends H {
    connectedCallback() {
      if (this.mount) return;

      const observerContainer = new MutationObserver(() => {
        const content = this.querySelector("marquee-content");
        if (content && content.hasChildNodes()) {
          this.init(content);
          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }

    init = (content) => {
      this.mount = true;
      if (!content) return;
      const { width: containerWidth } = this.getBoundingClientRect();
      const { width: contentWidth } = content.getBoundingClientRect();

      if (contentWidth < 10) return;
      const duplicationCount = Math.round(containerWidth / contentWidth) + 2;
      console.log({ containerWidth, contentWidth, duplicationCount });
      for (let i = 0; i < duplicationCount; i++) {
        this.appendChild(content.cloneNode(true));
      }
    };
  }
);
defineCustomElement("marquee-content", class TH extends H {});
