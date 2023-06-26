export const getScrollTopPos = () => {
  if (window) {
    window.addEventListener("scroll", function () {
      const wh = window.innerHeight;
      if (window.scrollY > 96) {
        document.body.classList.add("scrolled-down");
        if (window.scrollY > wh / 2) {
          document.body.classList.add("half-down");
          if (window.scrollY > wh) {
            document.body.classList.add("full-down");
          } else {
            document.body.classList.remove("full-down");
          }
        } else {
          document.body.classList.remove("half-down");
        }
      } else {
        document.body.classList.remove(
          "scrolled-down",
          "half-down",
          "full-down"
        );
      }
    });
  }
};
