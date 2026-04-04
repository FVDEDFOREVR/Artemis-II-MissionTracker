import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

type SocialPreviewSize = {
  width: number;
  height: number;
};

const WORDMARK_WIDTH = 2400;
const WORDMARK_HEIGHT = 601;
const WORDMARK_FILE = ["artemis", "ii", "wordmark"].join("-") + ".png";

let wordmarkDataUrlPromise: Promise<string> | undefined;

async function getWordmarkDataUrl() {
  wordmarkDataUrlPromise ??= readFile(
    join(process.cwd(), "public", WORDMARK_FILE),
  ).then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`);

  return wordmarkDataUrlPromise;
}

export async function createSocialPreview(size: SocialPreviewSize) {
  const logoWidth = Math.round(size.width * 0.56);
  const logoHeight = Math.round((logoWidth * WORDMARK_HEIGHT) / WORDMARK_WIDTH);
  const wordmarkSrc = await getWordmarkDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <img
          alt="Artemis II"
          src={wordmarkSrc}
          width={logoWidth}
          height={logoHeight}
          style={{
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>
    ),
    size,
  );
}
