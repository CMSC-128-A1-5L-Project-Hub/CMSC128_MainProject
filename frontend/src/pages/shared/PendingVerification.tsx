import { Link } from "react-router-dom";
import Logo from "../../components/Logo";

export default function PendingVerification() {
  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        background:
          "radial-gradient(ellipse at top left, #6B0F2B 0%, #3D0718 55%, #2A0511 100%)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
          maskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 75%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-180px",
          right: "-120px",
          width: 460,
          height: 460,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(201,151,58,0.22) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-160px",
          left: "-120px",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(181,52,79,0.28) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 460,
          padding: "44px 36px",
          borderRadius: 28,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 24px 64px rgba(26,10,15,0.45)",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Logo color="white" />
        </div>

        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 24px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, rgba(201,151,58,0.25) 0%, rgba(232,195,122,0.15) 100%)",
            border: "1px solid rgba(232,195,122,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#E8C37A",
            boxShadow: "0 0 32px rgba(201,151,58,0.25)",
          }}
        >
          <svg
            width="34"
            height="34"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 99,
            background: "rgba(201,151,58,0.12)",
            border: "1px solid rgba(232,195,122,0.3)",
            color: "#E8C37A",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#E8C37A",
              boxShadow: "0 0 8px #E8C37A",
              animation: "uble-dot-pulse 1.6s ease-in-out infinite",
            }}
          />
          Pending Review
        </div>

        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "clamp(30px, 4.5vw, 40px)",
            letterSpacing: "-0.016em",
            lineHeight: 1.1,
            marginBottom: 14,
            color: "#fff",
          }}
        >
          Account Under Review
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.72)",
            fontSize: 14,
            lineHeight: 1.65,
            marginBottom: 28,
            fontWeight: 300,
          }}
        >
          Thank you for completing your profile. Our admins are verifying your
          enrollment proof and academic details. This usually takes 1–2 business
          days.
        </p>

        <div
          style={{
            padding: "14px 18px",
            borderRadius: 14,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: 28,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "rgba(255,255,255,0.78)",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            We will email you once your account has been approved.
          </p>
        </div>

        <Link to="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              width: "100%",
              padding: "14px 20px",
              borderRadius: 99,
              border: "1px solid rgba(232,195,122,0.4)",
              background:
                "linear-gradient(135deg, #C9973A 0%, #E8C37A 100%)",
              color: "#3D0718",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow:
                "0 12px 32px rgba(201,151,58,0.35), inset 0 1px 0 rgba(255,255,255,0.4)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 16px 40px rgba(201,151,58,0.5), inset 0 1px 0 rgba(255,255,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 12px 32px rgba(201,151,58,0.35), inset 0 1px 0 rgba(255,255,255,0.4)";
            }}
          >
            Return to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
}
