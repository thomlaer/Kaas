import { ImageResponse } from "next/og";
import { CheeseLogo } from "@/components/CheeseLogo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1f3f7a",
        }}
      >
        <CheeseLogo size={144} />
      </div>
    ),
    size,
  );
}
