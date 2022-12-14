defineCustomElement(
  "tail-header",
  class TH extends H {
    lastScrollY;
    details = {};
    connectedCallback() {
      const observerContainer = new MutationObserver(() => {
        this.header = this.querySelector("header");
        if (this.header) {
          const isActive = this.header.dataset.dynamic === "true";
          this.showAnnouncement = this.header.getAttribute("showAnnouncement") === "true";
          console.log({ isActive });
          if (isActive) {
            this.announcementHeight = document.querySelector("#shopify-section-announcement-bar")?.clientHeight || 0;
            this.lastScrollY = window.scrollY;
            this.classList.add("transition-all");
            this.onScroll();
            document.addEventListener(
              "scroll",
              () => throttle.bind(this)(this.onScroll, window.scrollY <= this.clientHeight * 2 ? 10 : 200),
              {
                passive: true,
                capture: false
              }
            );
          }
          observerContainer.disconnect();
        }
      });
      observerContainer.observe(this, { childList: true });
    }
    onScroll = () => {
      var scrollY = Math.round(window.scrollY);
      this.details.scrollY = scrollY;
      this.details.lastScrollY = this.lastScrollY;
      this.details.direction = scrollY > this.lastScrollY ? "down" : "up";
      this.details.top = scrollY <= this.clientHeight;
      this.update(this.details);
      this.lastScrollY = scrollY;
    };

    update = (details) => {
      if (details.top || details.direction === "up") {
        this.style.transform = `translateY(${
          this.header.dataset.showannouncement === "true" || details.top ? 0 : -this.announcementHeight
        }px)`;
      } else if (details.direction === "down") {
        this.style.transform = `translateY(-100%)`;
      }
    };
  }
);
