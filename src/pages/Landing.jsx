import { Link } from "react-router-dom";
import NetworkBackground from "../components/NetworkBackground";
import { useAuth } from "../hooks/useAuth";
import centinelLogo from "../assets/centinel.svg";
import {
  IconRadar,
  IconShield,
  IconAlert,
  IconNodes,
  IconPulse,
  IconGear,
} from "../components/icons";

const FEATURES = [
  {
    icon: <IconRadar size={20} />,
    title: "DNS threat scoring",
    body: "Every resolver query is scored on Shannon entropy, label length and TLD reputation — surfacing DGA domains and DNS tunneling that signature tools miss.",
  },
  {
    icon: <IconShield size={20} />,
    title: "Threat-intel blacklist",
    body: "An open-source IP feed (abuse.ch) is matched against live VPC flow logs, flagging the moment any node talks to a known-bad host.",
  },
  {
    icon: <IconPulse size={20} />,
    title: "Event-driven pipeline",
    body: "EventBridge → Lambda → Step Functions. Fully serverless, scores and reacts to a fresh query end-to-end in under 90 seconds.",
  },
  {
    icon: <IconAlert size={20} />,
    title: "Automated response",
    body: "High-severity hits fan out in parallel: an SNS alert goes out and the offending IP is pushed straight into a WAF block-list.",
  },
  {
    icon: <IconNodes size={20} />,
    title: "Live console",
    body: "Watch your fleet, scored alerts and event volume in real time — a calm, readable view of everything the pipeline sees.",
  },
  {
    icon: <IconGear size={20} />,
    title: "AWS-native, free-tier",
    body: "Built entirely on managed AWS services and provisioned with Terraform — reproducible, and light enough to run on the free tier.",
  },
];

const STEPS = [
  { n: "01", title: "Capture", body: "Route 53 resolver query logs + VPC flow logs stream into CloudWatch." },
  { n: "02", title: "Score", body: "Lambda detectors score each query and match flows against the blacklist." },
  { n: "03", title: "Decide", body: "Step Functions branches on severity, persisting every event to DynamoDB." },
  { n: "04", title: "Respond", body: "High-severity events trigger SNS alerts and WAF IP blocking — then render here." },
];

const STATS = [
  { v: "<90s", l: "detect → respond" },
  { v: "7", l: "detection signals" },
  { v: "100%", l: "serverless" },
  { v: "0", l: "agents to install" },
];

function Landing() {
  const { isAuthenticated } = useAuth();
  const cta = isAuthenticated
    ? { to: "/dashboard", label: "Open console" }
    : { to: "/login", label: "Login" };

  return (
    <div className="lp">
      {/* nav */}
      <header className="lp-nav">
        <Link to="/" className="lp-navbrand">
          <img src={centinelLogo} alt="Centinel" />
        </Link>
        <nav className="lp-navlinks">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <Link to={cta.to} className="btn btn-accent">{cta.label}</Link>
        </nav>
      </header>

      {/* hero */}
      <section className="lp-hero">
        <NetworkBackground />
        <div className="lp-hero-scrim" />
        <div className="lp-hero-inner">
          <div className="eyebrow reveal d1">DNS threat monitoring for AWS</div>
          <h1 className="lp-title reveal d2">
            Catch threats in your DNS<br />before they catch you.
          </h1>
          <p className="lp-sub reveal d3">
            Centinel is an event-driven cloud SIEM that scores every DNS query, matches traffic
            against live threat intel, and blocks bad actors automatically — your eyes on the cloud.
          </p>
          <div className="lp-cta reveal d4">
            <Link to={cta.to} className="btn btn-accent lp-cta-primary">{cta.label}</Link>
            <a href="#how" className="btn lp-cta-secondary">See how it works</a>
          </div>
        </div>
        <div className="lp-hero-fade" />
      </section>

      {/* stats */}
      <section className="lp-stats">
        {STATS.map((s) => (
          <div className="lp-stat" key={s.l}>
            <div className="lp-stat-v">{s.v}</div>
            <div className="lp-stat-l">{s.l}</div>
          </div>
        ))}
      </section>

      {/* features */}
      <section className="lp-section" id="features">
        <div className="lp-sec-head">
          <div className="eyebrow">Capabilities</div>
          <h2 className="lp-h2">Detection, intel and response in one pipeline</h2>
        </div>
        <div className="lp-grid">
          {FEATURES.map((f) => (
            <div className="panel lp-card" key={f.title}>
              <div className="lp-card-icon">{f.icon}</div>
              <h3 className="lp-card-title">{f.title}</h3>
              <p className="lp-card-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="lp-section lp-how" id="how">
        <div className="lp-sec-head">
          <div className="eyebrow">How it works</div>
          <h2 className="lp-h2">From query to response in four steps</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s) => (
            <div className="lp-step" key={s.n}>
              <div className="lp-step-n mono">{s.n}</div>
              <h3 className="lp-step-title">{s.title}</h3>
              <p className="lp-step-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* closing cta */}
      <section className="lp-final">
        <h2 className="lp-h2">Ready to watch your cloud?</h2>
        <p className="lp-sub" style={{ margin: "12px auto 24px" }}>
          Sign in to the live console and see the pipeline in action.
        </p>
        <Link to={cta.to} className="btn btn-accent lp-cta-primary">{cta.label}</Link>
      </section>

      <footer className="lp-footer">
        <img src={centinelLogo} alt="Centinel" />
        <span className="mono">your eyes on the cloud</span>
      </footer>
    </div>
  );
}

export default Landing;
