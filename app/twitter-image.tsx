import { createSocialPreview } from "./social-preview";

export const alt = "Artemis II social preview";
export const size = {
  width: 1200,
  height: 675,
};
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function TwitterImage() {
  return createSocialPreview(size);
}
