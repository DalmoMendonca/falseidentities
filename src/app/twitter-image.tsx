import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

const logoData = readFileSync(join(process.cwd(), "src", "logo.png")).toString("base64");
const logoSrc = `data:image/png;base64,${logoData}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(135deg, #fff4f6 0%, #f7e3ea 40%, #fdf5ef 100%)",
          color: "#2b1b22",
          fontFamily: "Georgia, serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            padding: "40px 80px",
            borderRadius: 48,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            border: "1px solid rgba(122, 31, 59, 0.2)",
            boxShadow: "0 24px 60px rgba(74, 30, 46, 0.18)",
            textAlign: "center"
          }}
        >
          <img
            src={logoSrc}
            width={160}
            height={160}
            style={{
              borderRadius: 36,
              border: "1px solid rgba(122, 31, 59, 0.2)",
              boxShadow: "0 14px 30px rgba(74, 30, 46, 0.2)"
            }}
          />
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 0.5 }}>
            False Identities
          </div>
          <div style={{ fontSize: 28, color: "#6d5a64", maxWidth: 900 }}>
            A guided identity exercise to uncover false identities and reconnect with your truth.
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
