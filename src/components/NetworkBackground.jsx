import { useEffect, useRef } from "react";

const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 200;
const BEAM_INTERVAL = 300;
const BEAM_SPEED = 6;
const TRACE_FADE = 0.015;
const MOUSE_RADIUS = 120;
const MOUSE_FORCE = 0.3;
const BASE_SPEED = 0.3;

const ICONS = ["server", "cloud", "switch", "router", "client"];

function drawIcon(ctx, type, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.lineWidth = 1.2;
  const s = size;

  switch (type) {
    case "server":
      ctx.strokeRect(-s * 0.4, -s * 0.6, s * 0.8, s * 0.35);
      ctx.strokeRect(-s * 0.4, -s * 0.15, s * 0.8, s * 0.35);
      ctx.strokeRect(-s * 0.4, s * 0.3, s * 0.8, s * 0.35);
      ctx.beginPath();
      ctx.arc(-s * 0.2, -s * 0.43, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-s * 0.2, s * 0.03, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-s * 0.2, s * 0.48, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "cloud":
      ctx.beginPath();
      ctx.arc(-s * 0.15, 0, s * 0.35, 0, Math.PI * 2);
      ctx.arc(s * 0.2, -s * 0.05, s * 0.3, 0, Math.PI * 2);
      ctx.arc(s * 0.05, -s * 0.25, s * 0.25, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "switch":
      ctx.strokeRect(-s * 0.5, -s * 0.2, s, s * 0.4);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.18, -s * 0.2);
        ctx.lineTo(i * s * 0.18, -s * 0.35);
        ctx.stroke();
      }
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * s * 0.18, s * 0.2);
        ctx.lineTo(i * s * 0.18, s * 0.35);
        ctx.stroke();
      }
      break;
    case "router":
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.15);
      ctx.lineTo(s * 0.12, s * 0.1);
      ctx.lineTo(-s * 0.12, s * 0.1);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.35);
      ctx.lineTo(0, -s * 0.55);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(s * 0.35, 0);
      ctx.lineTo(s * 0.55, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.35, 0);
      ctx.lineTo(-s * 0.55, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s * 0.35);
      ctx.lineTo(0, s * 0.55);
      ctx.stroke();
      break;
    case "client":
      ctx.strokeRect(-s * 0.35, -s * 0.4, s * 0.7, s * 0.5);
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, s * 0.2);
      ctx.lineTo(s * 0.2, s * 0.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, s * 0.2);
      ctx.lineTo(0, s * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-s * 0.2, s * 0.4);
      ctx.lineTo(s * 0.2, s * 0.4);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let nodes = [];
    let beams = [];
    let traces = [];
    let lastBeamTime = 0;
    let mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function handleMouseMove(e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }

    function handleMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: Math.cos(angle) * BASE_SPEED,
          vy: Math.sin(angle) * BASE_SPEED,
          icon: ICONS[Math.floor(Math.random() * ICONS.length)],
          size: Math.random() * 4 + 10,
        });
      }
    }

    function spawnBeam(time) {
      if (time - lastBeamTime < BEAM_INTERVAL) return;
      lastBeamTime = time;

      const pairs = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE && dist > 40) {
            pairs.push([i, j]);
          }
        }
      }

      if (pairs.length === 0) return;
      const count = Math.min(2, pairs.length);
      for (let n = 0; n < count; n++) {
        const idx = Math.floor(Math.random() * pairs.length);
        const [a, b] = pairs[idx];
        beams.push({ from: a, to: b, progress: 0 });
        pairs.splice(idx, 1);
      }
    }

    function update(time) {
      for (const node of nodes) {
        const dx = node.x - mouse.x;
        const dy = node.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          node.vx += (dx / dist) * force;
          node.vy += (dy / dist) * force;
        }

        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed > BASE_SPEED * 3) {
          node.vx = (node.vx / speed) * BASE_SPEED * 3;
          node.vy = (node.vy / speed) * BASE_SPEED * 3;
        }
        if (speed > BASE_SPEED) {
          node.vx *= 0.995;
          node.vy *= 0.995;
        }
        if (speed < BASE_SPEED * 0.8) {
          const angle = Math.atan2(node.vy, node.vx);
          node.vx = Math.cos(angle) * BASE_SPEED;
          node.vy = Math.sin(angle) * BASE_SPEED;
        }

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));
      }

      spawnBeam(time);

      for (const beam of beams) {
        const from = nodes[beam.from];
        const to = nodes[beam.to];
        const prevProgress = beam.progress;
        beam.progress += BEAM_SPEED / 100;

        traces.push({
          x1: from.x + (to.x - from.x) * prevProgress,
          y1: from.y + (to.y - from.y) * prevProgress,
          x2: from.x + (to.x - from.x) * Math.min(beam.progress, 1),
          y2: from.y + (to.y - from.y) * Math.min(beam.progress, 1),
          opacity: 0.8,
        });
      }
      beams = beams.filter((b) => b.progress <= 1);

      for (const trace of traces) {
        trace.opacity -= TRACE_FADE;
      }
      traces = traces.filter((t) => t.opacity > 0);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.4;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(200, 210, 220, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      for (const trace of traces) {
        const mx = (trace.x1 + trace.x2) / 2;
        const my = (trace.y1 + trace.y2) / 2;
        const bit = Math.random() > 0.5 ? "1" : "0";
        ctx.fillStyle = `rgba(190, 196, 204, ${trace.opacity})`;
        ctx.fillText(bit, mx, my);
      }

      for (const beam of beams) {
        const from = nodes[beam.from];
        const to = nodes[beam.to];
        const x = from.x + (to.x - from.x) * beam.progress;
        const y = from.y + (to.y - from.y) * beam.progress;

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(214, 219, 226, 0.95)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(190, 196, 204, 0.18)";
        ctx.fill();
      }

      for (const node of nodes) {
        drawIcon(ctx, node.icon, node.x, node.y, node.size);
      }
    }

    function loop(time) {
      update(time);
      draw();
      animId = requestAnimationFrame(loop);
    }

    resize();
    initNodes();
    animId = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

export default NetworkBackground;
