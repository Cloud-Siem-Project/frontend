// minimal stroked line icons, tuned for the HUD aesthetic.
// all inherit currentColor and accept a size prop.

const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export function IconRadar({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 12 L19 7" />
      <path d="M12 3a9 9 0 1 0 9 9" />
      <path d="M12 7a5 5 0 1 0 5 5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconNodes({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="5" r="2.2" />
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="18" r="2.2" />
      <path d="M11 7 L6 16 M13 7 L18 16 M7 18 h10" />
    </svg>
  );
}

export function IconAlert({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 L21 19 H3 Z" />
      <path d="M12 10 v4" />
      <circle cx="12" cy="16.6" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconShield({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 L19 6 V11 C19 16 16 19 12 21 C8 19 5 16 5 11 V6 Z" />
      <path d="M9 12 l2 2 l4 -4" />
    </svg>
  );
}

export function IconGear({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M19 5 l-2 2 M7 17 l-2 2" />
    </svg>
  );
}

export function IconPower({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M12 3 v8" />
      <path d="M7 6 a7 7 0 1 0 10 0" />
    </svg>
  );
}

export function IconPulse({ size = 16 }) {
  return (
    <svg {...base(size)}>
      <path d="M3 12 h4 l2 -6 l3 12 l2 -6 h7" />
    </svg>
  );
}
