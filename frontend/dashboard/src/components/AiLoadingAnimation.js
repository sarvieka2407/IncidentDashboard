import React, { useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { Sparkles, Cloud, MessageSquare, Mail, Activity } from "lucide-react";

import githubLogo    from "../assets/github.svg";
import cloudflareLogo from "../assets/cloudflare.svg";
import awsLogo       from "../assets/aws.svg";
import datadogLogo   from "../assets/datadog.svg";
import dropboxLogo   from "../assets/dropbox.svg";
import intercomLogo  from "../assets/intercom.svg";
import shopifyLogo   from "../assets/shopify.svg";
import atlassianLogo from "../assets/atlassian.svg";
import pagerdutyLogo from "../assets/pagerduty.png";

const LOGO_MAP = {
  GitHub:    githubLogo,
  Cloudflare: cloudflareLogo,
  AWS:       awsLogo,
  Datadog:   datadogLogo,
  Dropbox:   dropboxLogo,
  Intercom:  intercomLogo,
  Shopify:   shopifyLogo,
  Atlassian: atlassianLogo,
  PagerDuty: pagerdutyLogo,
};

const FALLBACK_MAP = {
  "Google Cloud": Cloud,
  "Twilio":       MessageSquare,
  "Sendgrid":     Mail,
};

// Picks the best icon/logo to show for a given company
function ProviderIcon({ company, size = 22 }) {
  if (LOGO_MAP[company]) {
    return (
      <img
        src={LOGO_MAP[company]}
        alt={company}
        width={size}
        height={size}
        style={{ objectFit: "contain" }}
      />
    );
  }
  const FallbackIcon = FALLBACK_MAP[company] || Activity;
  return <FallbackIcon size={size} color="#a1a1aa" />;
}

// A single orbiting provider token that animates toward center
function ProviderOrb({ company, angle, delay, radius = 88 }) {
  const rad = (angle * Math.PI) / 180;
  const startX = Math.cos(rad) * radius;
  const startY = Math.sin(rad) * radius;

  return (
    <motion.div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 38,
        height: 38,
        marginTop: -19,
        marginLeft: -19,
        borderRadius: "10px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(4px)",
      }}
      initial={{ x: startX, y: startY, opacity: 0, scale: 0.7 }}
      animate={[
        // Phase 1: fade in at starting position
        { x: startX, y: startY, opacity: 1, scale: 1,   transition: { delay, duration: 0.35, ease: "easeOut" } },
        // Phase 2: drift inward
        { x: startX * 0.55, y: startY * 0.55, opacity: 0.85, scale: 0.92, transition: { delay: delay + 0.35, duration: 0.65, ease: [0.4, 0, 0.2, 1] } },
        // Phase 3: merge into center — fade + scale down
        { x: 0, y: 0, opacity: 0, scale: 0.4, transition: { delay: delay + 1.0, duration: 0.45, ease: [0.4, 0, 1, 1] } },
      ]}
    >
      <ProviderIcon company={company} size={20} />
    </motion.div>
  );
}

export default function AiLoadingAnimation({ company }) {
  // Build the provider list: current card company + a few known ones for visual richness
  const ALL_PROVIDERS = ["GitHub", "Cloudflare", "AWS", "Datadog", "Dropbox", "Atlassian"];
  // Always include the incident's own provider; fill from the list, deduplicate, limit to 5
  const providers = company
    ? [company, ...ALL_PROVIDERS.filter(p => p !== company)].slice(0, 5)
    : ALL_PROVIDERS.slice(0, 5);

  // Spread the orbs evenly around a circle
  const angles = providers.map((_, i) => (i / providers.length) * 360 - 90);

  return (
    <motion.div
      className="ai-loading-wrapper"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Orbit stage */}
      <div className="ai-loading-stage">

        {/* Subtle orbit ring */}
        <motion.div
          className="ai-orbit-ring"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />

        {/* Provider orbs */}
        {providers.map((prov, i) => (
          <ProviderOrb
            key={prov}
            company={prov}
            angle={angles[i]}
            delay={i * 0.18}
            radius={88}
          />
        ))}

        {/* Central AI icon — pulses while loading */}
        <motion.div
          className="ai-center-icon"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{
            scale: [0.6, 1, 1, 1],
            opacity: [0, 1, 1, 1],
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Glow ring */}
          <motion.div
            className="ai-center-glow"
            animate={{
              scale: [1, 1.35, 1],
              opacity: [0.2, 0.08, 0.2],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Icon container */}
          <motion.div
            className="ai-center-core"
            animate={{
              boxShadow: [
                "0 0 0px rgba(168,85,247,0.0)",
                "0 0 18px rgba(168,85,247,0.25)",
                "0 0 0px rgba(168,85,247,0.0)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={20} color="#c084fc" strokeWidth={1.75} />
          </motion.div>
        </motion.div>
      </div>

      {/* Label below */}
      <motion.p
        className="ai-loading-label"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        Analysing incident data
      </motion.p>
    </motion.div>
  );
}
