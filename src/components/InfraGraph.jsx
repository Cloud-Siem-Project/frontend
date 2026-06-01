import { useEffect, useRef } from "react";
import CytoscapeComponent from "react-cytoscapejs";

const TYPE_STYLES = {
  ec2:         { color: "#f97316", label: "EC2" },
  lambda:      { color: "#a855f7", label: "Lambda" },
  s3:          { color: "#22c55e", label: "S3" },
  cloudfront:  { color: "#3b82f6", label: "CloudFront" },
  eventbridge: { color: "#eab308", label: "EventBridge" },
  dynamodb:    { color: "#06b6d4", label: "DynamoDB" },
  master:      { color: "#ef4444", label: "Master" },
};

const STYLESHEET = [
  {
    selector: "node",
    style: {
      label: "data(label)",
      "text-valign": "bottom",
      "text-halign": "center",
      "text-margin-y": 8,
      "font-size": "11px",
      "font-family": "'Ubuntu', sans-serif",
      color: "#94a3b8",
      "background-color": "data(color)",
      width: 36,
      height: 36,
      "border-width": 2,
      "border-color": "#1e293b",
      "text-outline-color": "#0a0f1a",
      "text-outline-width": 2,
    },
  },
  {
    selector: "node[status = 'DOWN']",
    style: {
      "border-width": 3,
      "border-color": "#ef4444",
      opacity: 0.6,
    },
  },
  {
    selector: "node[type = 'master']",
    style: {
      width: 48,
      height: 48,
      "font-size": "12px",
      "font-weight": "bold",
    },
  },
  {
    selector: "edge",
    style: {
      width: 1.5,
      "line-color": "rgba(56, 189, 248, 0.25)",
      "target-arrow-color": "rgba(56, 189, 248, 0.4)",
      "target-arrow-shape": "triangle",
      "arrow-scale": 0.8,
      "curve-style": "bezier",
    },
  },
  {
    selector: "edge[type = 'heartbeat']",
    style: {
      "line-style": "dashed",
      "line-dash-pattern": [6, 3],
      "line-color": "rgba(249, 115, 22, 0.25)",
      "target-arrow-color": "rgba(249, 115, 22, 0.4)",
    },
  },
  {
    selector: "edge[type = 'pipeline']",
    style: {
      "line-color": "rgba(168, 85, 247, 0.3)",
      "target-arrow-color": "rgba(168, 85, 247, 0.5)",
    },
  },
];

const LAYOUT = {
  name: "cose",
  animate: false,
  nodeRepulsion: 12000,
  idealEdgeLength: 120,
  edgeElasticity: 80,
  gravity: 0.3,
  numIter: 500,
  padding: 40,
};

function buildElements(nodes) {
  const elements = [];

  elements.push({
    data: { id: "master", label: "Master EC2", type: "master", color: TYPE_STYLES.master.color, status: "UP" },
  });

  if (nodes && nodes.length > 0) {
    for (const node of nodes) {
      elements.push({
        data: {
          id: node.node_id,
          label: `${node.node_id}\n${node.ip || ""}`,
          type: "ec2",
          color: TYPE_STYLES.ec2.color,
          status: node.status || "UP",
        },
      });
      elements.push({
        data: { source: node.node_id, target: "master", type: "heartbeat" },
      });
    }
  }

  const pipeline = [
    { id: "eventbridge", label: "EventBridge", type: "eventbridge" },
    { id: "lambda-dns", label: "DNS Detector\nLambda", type: "lambda" },
    { id: "lambda-persist", label: "Persist\nLambda", type: "lambda" },
    { id: "dynamodb", label: "DynamoDB\nEvents", type: "dynamodb" },
    { id: "s3-raw", label: "S3 Raw\nArchive", type: "s3" },
    { id: "cloudfront", label: "CloudFront\nDistribution", type: "cloudfront" },
    { id: "s3-dashboard", label: "S3 Dashboard\nBucket", type: "s3" },
  ];

  for (const p of pipeline) {
    elements.push({
      data: { id: p.id, label: p.label, type: p.type, color: TYPE_STYLES[p.type].color, status: "UP" },
    });
  }

  const edges = [
    { source: "master", target: "eventbridge", type: "pipeline" },
    { source: "eventbridge", target: "lambda-dns", type: "pipeline" },
    { source: "eventbridge", target: "s3-raw", type: "pipeline" },
    { source: "lambda-dns", target: "lambda-persist", type: "pipeline" },
    { source: "lambda-persist", target: "dynamodb", type: "pipeline" },
    { source: "cloudfront", target: "s3-dashboard", type: "default" },
    { source: "cloudfront", target: "master", type: "default" },
  ];

  for (const e of edges) {
    elements.push({ data: e });
  }

  return elements;
}

function InfraGraph({ nodes }) {
  const cyRef = useRef(null);

  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    const existingNodeIds = new Set(cy.nodes().map((n) => n.id()));
    const newElements = buildElements(nodes);
    const newNodeIds = new Set(newElements.filter((e) => !e.data.source).map((e) => e.data.id));

    existingNodeIds.forEach((id) => {
      if (!newNodeIds.has(id)) {
        cy.getElementById(id).remove();
      }
    });

    for (const el of newElements) {
      if (el.data.source) continue;
      const existing = cy.getElementById(el.data.id);
      if (existing.length > 0) {
        existing.data(el.data);
      } else {
        cy.add(el);
      }
    }

    cy.edges().remove();
    for (const el of newElements) {
      if (el.data.source) {
        cy.add(el);
      }
    }
  }, [nodes]);

  const elements = buildElements(nodes);

  return (
    <div style={{ position: "relative", width: "100%", height: "500px", background: "#0a0f1a", borderRadius: "12px", overflow: "hidden" }}>
      <CytoscapeComponent
        elements={elements}
        stylesheet={STYLESHEET}
        layout={LAYOUT}
        style={{ width: "100%", height: "100%" }}
        cy={(cy) => { cyRef.current = cy; }}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        boxSelectionEnabled={false}
      />
      <div style={{ position: "absolute", bottom: "12px", left: "12px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {Object.entries(TYPE_STYLES).map(([key, { color, label }]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: "10px", right: "12px" }}>
        <span style={{ fontSize: "10px", color: "#475569" }}>scroll to zoom / drag to pan</span>
      </div>
    </div>
  );
}

export default InfraGraph;
