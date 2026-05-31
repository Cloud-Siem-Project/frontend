import { useEffect, useRef, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const AWS_REGIONS = {
  "eu-central-1": { name: "Frankfurt", coords: [8.6821, 50.1109] },
  "us-east-1": { name: "N. Virginia", coords: [-77.4728, 38.7223] },
  "us-west-2": { name: "Oregon", coords: [-120.5542, 43.8041] },
  "ap-southeast-1": { name: "Singapore", coords: [103.8198, 1.3521] },
};

const RESOURCE_TYPES = {
  ec2: { color: "#f97316", label: "EC2" },
  lambda: { color: "#a855f7", label: "Lambda" },
  s3: { color: "#22c55e", label: "S3" },
  cloudfront: { color: "#3b82f6", label: "CloudFront" },
  eventbridge: { color: "#eab308", label: "EventBridge" },
  dynamodb: { color: "#06b6d4", label: "DynamoDB" },
};

function WorldMap({ resources, connections }) {
  const mapRef = useRef(null);
  const [beams, setBeams] = useState([]);
  const beamIdRef = useRef(0);

  useEffect(() => {
    if (!connections || connections.length === 0) return;

    const interval = setInterval(() => {
      const conn = connections[Math.floor(Math.random() * connections.length)];
      beamIdRef.current += 1;
      setBeams((prev) => [
        ...prev,
        { id: beamIdRef.current, from: conn.from, to: conn.to, progress: 0 },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, [connections]);

  useEffect(() => {
    if (beams.length === 0) return;

    const anim = setInterval(() => {
      setBeams((prev) =>
        prev
          .map((b) => ({ ...b, progress: b.progress + 0.03 }))
          .filter((b) => b.progress <= 1)
      );
    }, 30);

    return () => clearInterval(anim);
  }, [beams.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={mapRef} style={{ position: "relative", width: "100%", background: "#0a0f1a", borderRadius: "12px", overflow: "hidden" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [20, 30] }}
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rpiops?.name || geo.id}
                geography={geo}
                fill="#1a2332"
                stroke="#2a3a4a"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none", fill: "#1f2d3d" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {connections.map((conn, i) => {
          const from = resources.find((r) => r.id === conn.from);
          const to = resources.find((r) => r.id === conn.to);
          if (!from || !to) return null;
          return (
            <Line
              key={i}
              from={from.coords}
              to={to.coords}
              stroke="rgba(56, 189, 248, 0.1)"
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}

        {beams.map((beam) => {
          const from = resources.find((r) => r.id === beam.from);
          const to = resources.find((r) => r.id === beam.to);
          if (!from || !to) return null;

          const x = from.coords[0] + (to.coords[0] - from.coords[0]) * beam.progress;
          const y = from.coords[1] + (to.coords[1] - from.coords[1]) * beam.progress;

          return (
            <Marker key={beam.id} coordinates={[x, y]}>
              <circle r={3} fill="rgba(56, 189, 248, 0.9)" />
              <circle r={6} fill="rgba(56, 189, 248, 0.3)" />
            </Marker>
          );
        })}

        {resources.map((resource) => (
          <Marker key={resource.id} coordinates={resource.coords}>
            <circle
              r={6}
              fill={RESOURCE_TYPES[resource.type]?.color || "#fff"}
              stroke="#0a0f1a"
              strokeWidth={2}
            />
            <circle
              r={10}
              fill="none"
              stroke={RESOURCE_TYPES[resource.type]?.color || "#fff"}
              strokeWidth={0.5}
              opacity={0.5}
            />
            <text
              textAnchor="middle"
              y={-14}
              style={{
                fontFamily: "'Ubuntu', sans-serif",
                fontSize: "8px",
                fill: "#94a3b8",
              }}
            >
              {resource.label}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.entries(RESOURCE_TYPES).map(([key, { color, label }]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorldMap;
export { AWS_REGIONS, RESOURCE_TYPES };
