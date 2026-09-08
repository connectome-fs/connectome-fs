import { upgradeThemedSvgImages } from "https://cdn.jsdelivr.net/npm/@dev-centr/themed-svg@0.1.1/browser/themed-svg-element.js"

const upgrade = () =>
  upgradeThemedSvgImages(document, {
    selector: ".image.themed-svg img",
  })

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", upgrade, { once: true })
} else {
  upgrade()
}
