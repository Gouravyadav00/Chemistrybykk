import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ChemistryByKK — Chemistry Simplified for Class 9–12";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #eaf2ff 0%, #c9deff 50%, #9bbcff 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative blobs */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #4F8EF7 0%, #3563d3 100%)",
            opacity: 0.45,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: 180,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #f6c4e7 0%, #d6a4ff 100%)",
            opacity: 0.5,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 220,
            right: 120,
            width: 110,
            height: 110,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #ffd485 0%, #ff9c5b 100%)",
            opacity: 0.55,
            display: "flex",
          }}
        />

        {/* Pill — brand label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "white",
            color: "#3563d3",
            padding: "12px 22px",
            borderRadius: 999,
            fontSize: 26,
            fontWeight: 700,
            boxShadow: "0 8px 24px rgba(53, 99, 211, 0.18)",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              background:
                "linear-gradient(135deg, #4F8EF7 0%, #3563d3 100%)",
              display: "flex",
            }}
          />
          ChemistryByKK
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: "#1a2a4d",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Chemistry</span>
          <span style={{ color: "#3563d3" }}>Simplified</span>
        </div>

        {/* Subline */}
        <div
          style={{
            marginTop: 22,
            fontSize: 32,
            fontWeight: 500,
            color: "#3c4d77",
            lineHeight: 1.3,
            maxWidth: 760,
            display: "flex",
          }}
        >
          NCERT notes, cheatsheets, past papers &amp; MCQ quizzes for
          Class 9 – 12.
        </div>

        {/* Footer row */}
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#3c4d77",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                background: "#3563d3",
                display: "flex",
              }}
            />
            <span style={{ fontWeight: 700 }}>Khyati Kaushik</span>
            <span style={{ opacity: 0.7 }}>· M.Sc. Chemistry, PGT</span>
          </div>
          <div style={{ fontWeight: 700, color: "#1a2a4d", display: "flex" }}>
            chemistrybykk.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
