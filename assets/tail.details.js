defineCustomElement(
  "tail-details",
  class TH extends H {
    currentPart = 0;
    connectedCallback() {
      if (this.mount) return;

      const observerContainer = new MutationObserver(() => {
        this.seeMore = this.querySelector("see-more");
        this.seeLess = this.querySelector("see-less");
        const part = this.querySelector("details-part");
        if (part && part.hasChildNodes() && this.seeMore) {
          this.seeLess = this.querySelector("see-less");
          this.init();
          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }

    initSeeLess = () => {
      if (!this.seeLess) {
        this.seeLess = this.querySelector("see-less");

        if (this.seeLess) {
          this.seeLess.classList.add("hidden");
          this.seeLess.addEventListener("click", this.showLess);
        }
      }
    };
    show = (delta) => {
      this.initSeeLess();
      this.currentPart = this.currentPart + delta;
      const targettedPart =
        this.parts[delta === -1 ? this.currentPart + 1 : this.currentPart];
      const hasMore = this.currentPart < this.parts.length - delta;
      console.log({ hasMore, targettedPart });
      if (!hasMore) {
        this.seeMore.classList.add("hidden");
      } else {
        this.seeMore.classList.remove("hidden");
      }
      if (this.currentPart === 0) {
        this.seeLess.classList.add("hidden");
      } else {
        this.seeLess.classList.remove("hidden");
      }
      if (targettedPart) {
        console.log("hello");
        targettedPart.setAttribute(
          "aria-hidden",
          delta === -1 ? "true" : "false"
        );
      }
    };

    showMore = () => {
      this.show(1);
    };

    showLess = () => {
      this.show(-1);
    };

    init = () => {
      this.parts = Array.from(this.querySelectorAll("details-part"));
      this.parts
        .slice(1, this.parts.length)
        .forEach((part) => part.setAttribute("aria-hidden", "true"));
      this.seeMore.addEventListener("click", this.showMore);
      if (this.parts.length === 1) {
        this.seeMore.classList.add("hidden");
      }
      this.mount = true;
    };
  }
);
defineCustomElement("details-part", class TH extends H {});
defineCustomElement("see-more", class TH extends Btn {});
defineCustomElement("see-less", class TH extends Btn {});
