import { useEffect, useRef } from "react";

const NODE_COUNT = 40;
const CONNECTION_DISTANCE = 180;
const BEAM_INTERVAL = 1200;
const BEAM_SPEED = 4;

function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    let nodes = [];
    let beams = [];
    let lastBeamTime = 0;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initNodes() {
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1.5,
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
      beams.push({
        from: a,
        to: b,
        progress: 0,
      });
    }

    function update(time) {
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      }

      spawnBeam(time);

      for (const beam of beams) {
        beam.progress += BEAM_SPEED / 100;
      }
      beams = beams.filter((b) => b.progress <= 1);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DISTANCE) {
            const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const beam of beams) {
        const from = nodes[beam.from];
        const to = nodes[beam.to];
        const x = from.x + (to.x - from.x) * beam.progress;
        const y = from.y + (to.y - from.y) * beam.progress;

        const tailProgress = Math.max(0, beam.progress - 0.15);
        const tailX = from.x + (to.x - from.x) * tailProgress;
        const tailY = from.y + (to.y - from.y) * tailProgress;

        const gradient = ctx.createLinearGradient(tailX, tailY, x, y);
        gradient.addColorStop(0, "rgba(56, 189, 248, 0)");
        gradient.addColorStop(1, "rgba(56, 189, 248, 0.8)");

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56, 189, 248, 0.2)";
        ctx.fill();
      }

      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
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

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
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
