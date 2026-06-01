import { HoaxClaim } from "@shared/types";

interface HoaxCheckerBannerProps {
  claim: HoaxClaim;
  className?: string;
}

export function HoaxCheckerBanner({ claim, className }: HoaxCheckerBannerProps) {
  const statusConfig: Record<
    string,
    {
      label: string;
      color: string;
      bgColor: string;
      borderColor: string;
    }
  > = {
    hoax: {
      label: "HOAX/DISINFORMASI",
      color: "#dc2626",
      bgColor: "rgba(220, 38, 38, 0.1)",
      borderColor: "#dc2626",
    },
    misinformation: {
      label: "DISINFORMASI",
      color: "#ea580c",
      bgColor: "rgba(234, 88, 12, 0.1)",
      borderColor: "#ea580c",
    },
    partially_true: {
      label: "SEBAGIAN BENAR",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.1)",
      borderColor: "#f59e0b",
    },
    true: {
      label: "FAKTA",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.1)",
      borderColor: "#10b981",
    },
  };

  const config = statusConfig[claim.status];

  return (
    <section className={`hoax-checker-banner ${className || ""}`}>
      <div className="hoax-checker-container">
        {/* Hoax Section */}
        <div className="hoax-section">
          <div className="hoax-content">
            {claim.hoax_claim_image_url && (
              <div className="hoax-image-container">
                <img src={claim.hoax_claim_image_url} alt="Klaim hoax" />
                <div className="hoax-stamp" style={{ color: config.color }}>
                  {config.label}
                </div>
              </div>
            )}
            <div className="hoax-text">
              <h3>Klaim yang Beredar:</h3>
              <p className="hoax-title">{claim.hoax_claim_title}</p>
              {claim.hoax_claim_source && (
                <p className="hoax-source">
                  <strong>Sumber:</strong> {claim.hoax_claim_source}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="divider-section">
          <div className="divider-line"></div>
          <div className="divider-text">VS</div>
          <div className="divider-line"></div>
        </div>

        {/* Fact Check Section */}
        <div className="fact-section">
          <div className="fact-badge" style={{ backgroundColor: config.bgColor, borderColor: config.borderColor }}>
            <span style={{ color: config.color }}>{config.label}</span>
          </div>
          <h3>{claim.fact_check_title}</h3>
          <div className="fact-body">{claim.fact_check_body}</div>
        </div>
      </div>

      <style>{`
        .hoax-checker-banner {
          margin: 2rem 0;
          padding: 0;
        }

        .hoax-checker-container {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 1.5rem;
          align-items: start;
          background: #fafafa;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }

        .hoax-section {
          display: flex;
          flex-direction: column;
        }

        .hoax-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hoax-image-container {
          position: relative;
          overflow: hidden;
          border-radius: 0.25rem;
          background: #fff;
        }

        .hoax-image-container img {
          width: 100%;
          height: auto;
          display: block;
          max-height: 300px;
          object-fit: cover;
        }

        .hoax-stamp {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 2rem;
          font-weight: 900;
          text-transform: uppercase;
          opacity: 0.85;
          text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
          letter-spacing: 2px;
          pointer-events: none;
          white-space: nowrap;
        }

        .hoax-text h3 {
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin: 0 0 0.5rem 0;
        }

        .hoax-title {
          font-size: 1rem;
          font-weight: 600;
          color: #111;
          margin: 0 0 0.75rem 0;
          line-height: 1.5;
        }

        .hoax-source {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        .divider-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 200px;
        }

        .divider-line {
          width: 2px;
          height: 2rem;
          background: #d1d5db;
        }

        .divider-text {
          font-weight: 700;
          color: #9ca3af;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .fact-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .fact-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          border: 2px solid;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: fit-content;
        }

        .fact-section h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #111;
          margin: 0;
          line-height: 1.4;
        }

        .fact-body {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #374151;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        @media (max-width: 1024px) {
          .hoax-checker-container {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .divider-section {
            flex-direction: row;
            min-height: auto;
            gap: 1rem;
            margin: 1rem 0;
          }

          .divider-line {
            width: 2rem;
            height: 2px;
          }
        }

        @media (max-width: 640px) {
          .hoax-checker-container {
            padding: 1rem;
            gap: 0.75rem;
          }

          .hoax-stamp {
            font-size: 1.5rem;
          }

          .hoax-title {
            font-size: 0.95rem;
          }

          .fact-section h3 {
            font-size: 1rem;
          }

          .fact-body {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </section>
  );
}
