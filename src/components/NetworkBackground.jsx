import { useEffect, useRef } from "react";

const NODE_COUNT = 40;
const CONNECTION_DISTANCE = 180;
const BEAM_INTERVAL = 600;
const BEAM_SPEED = 8;
const TRACE_FADE = 0.02;
const MOUSE_RADIUS = 150;
const MOUSE_FORCE = 2;

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
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 2.5,
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
            pairs.push([i, j, dist]);
          }
        }
      }

      if (pairs.length === 0) return;
      const [a, b] = pairs[Math.floor(Math.random() * pairs.length)];
      beams.push({ from: a, to: b, progress: 0 });
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

        node.vx *= 0.97;
        node.vy *= 0.97;

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
          opacity: 0.7,
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

      for (const trace of traces) {
        ctx.beginPath();
        ctx.moveTo(trace.x1, trace.y1);
        ctx.lineTo(trace.x2, trace.y2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${trace.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      for (const beam of beams) {
        const from = nodes[beam.from];
        const to = nodes[beam.to];
        const x = from.x + (to.x - from.x) * beam.progress;
        const y = from.y + (to.y - from.y) * beam.progress;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 1)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.fill();
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.fill();
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
