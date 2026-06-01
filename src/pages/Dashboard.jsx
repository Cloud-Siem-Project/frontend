import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import { fetchNodes, fetchEvents } from "../api";

function Dashboard() {
  const [nodes, setNodes] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await fetchNodes();
        const list = typeof data === "object" && !Array.isArray(data)
          ? Object.values(data)
          : Array.isArray(data) ? data : [];
        if (mounted) setNodes(list);
      } catch { /* API may be unreachable */ }
      try {
        const evts = await fetchEvents();
        if (mounted) setEvents(evts);
      } catch { /* API may be unreachable */ }
    }

    load();
    const interval = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const totalNodes = nodes.length;
  const onlineNodes = nodes.filter((n) => n.status === "UP").length;
  const offlineNodes = totalNodes - onlineNodes;
  const activeAlerts = events.filter((e) => e.severity === "CRITICAL" || e.severity === "HIGH").length;

  return (
    <div style={summaryCardsWrapperStyle}>
      <SummaryCard title="Total Nodes" value={totalNodes} />
      <SummaryCard title="Online Nodes" value={onlineNodes} color="#16a34a" />
      <SummaryCard title="Offline Nodes" value={offlineNodes} color="#dc2626" />
      <SummaryCard title="Active Alerts" value={activeAlerts} color="#d97706" />
    </div>
  );
}

const summaryCardsWrapperStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
};

export default Dashboard;
