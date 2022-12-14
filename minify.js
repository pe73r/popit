const fs = require("fs");
const bundlePath = "./assets/bundle.js";

const js = [
  "./tail.js",
  "./tail.modal.js",
  "./tail.popup.js",
  "./tail.accordion.js",
  "./tail.carousel.js",
  "./tail.cart.js",
  "./tail.drawer.js",
  "./tail.tabs.js",
  "./tail.details.js",
  "./tail.marquee.js",
  "./tail.atc.js",
  "./tail.megamenu.js",
  "./tail.filters.js",
  "./tail.variants.js",
]
  .map((path) => fs.readFileSync("./assets/" + path).toString())
  .join("\n");
fs.writeFileSync(bundlePath, js);

require("esbuild").buildSync({
  entryPoints: [bundlePath],
  outfile: "./assets/components.min.js",
  target: ["chrome58"],
  bundle: true,
  minifySyntax: true,
  minifyIdentifiers: true,
  minifyWhitespace: true,
  minify: true,
  write: true,
});

const tailwind = fs.readFileSync("./assets/tailwind.min.css");
const tailwindApply = fs.readFileSync("./assets/tailwind.apply.min.css");
const components = fs.readFileSync("./assets/components.min.js");
const custom = fs.readFileSync("./assets/custom.css");

const style = `<style>
${tailwind}
${tailwindApply}
${custom}
</style>`;

const javascript = `<script>
${components}
</script>`;
fs.writeFileSync("./snippets/styles.liquid", style);
fs.writeFileSync("./snippets/scripts.liquid", javascript);

fs.rmSync(bundlePath);
