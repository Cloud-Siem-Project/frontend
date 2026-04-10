import SummaryCard from "../components/SummaryCard";

function Dashboard() {
    return (
        <div style={summaryCardsWrapperStyle}>
            <SummaryCard title="Total Nodes" value={12} />
            <SummaryCard title="Online Nodes" value={10} color="#16a34a" />
            <SummaryCard title="Offline Nodes" value={2} color="#dc2626" />
            <SummaryCard title="Active Alerts" value={3} color="#d97706" />
        </div>
    );
}

const summaryCardsWrapperStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
};

export default Dashboard;