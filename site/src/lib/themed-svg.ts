import { upgradeThemedSvgImages } from "@dev-centr/themed-svg/runtime";

/** Progressively replace adaptive AsciiDoc images with sanitized host SVGs. */
export function bootThemedSvg(root: ParentNode = document) {
  return upgradeThemedSvgImages(root, {
    selector: ".imageblock.themed-svg img",
  });
}
