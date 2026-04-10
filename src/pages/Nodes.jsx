import SummaryCard from "../components/SummaryCard";

function Nodes() {
    const nodes = [
        {
            id: 1,
            name: "web-server-01",
            ip: "192.168.1.10",
            status: "Up",
            criticalRisks: 2,
            securityScore: 85,
            lastSeen: "2 minutes ago",
            os: "Ubuntu 22.04",
        },
        {
            id: 2,
            name: "db-server-01",
            ip: "192.168.1.20",
            status: "Up",
            criticalRisks: 0,
            securityScore: 95,
            lastSeen: "1 minute ago",
            os: "CentOS 8",
        },
        {
            id: 3,
            name: "app-server-01",
            ip: "192.168.1.30",
            status: "Up",
            criticalRisks: 5,
            securityScore: 68,
            lastSeen: "5 minutes ago",
            os: "Ubuntu 20.04",
        },
        {
            id: 4,
            name: "backup-server-01",
            ip: "192.168.1.40",
            status: "Down",
            criticalRisks: 0,
            securityScore: 78,
            lastSeen: "2 hours ago",
            os: "Debian 11",
        },
        {
            id: 5,
            name: "mail-server-01",
            ip: "192.168.1.50",
            status: "Up",
            criticalRisks: 1,
            securityScore: 91,
            lastSeen: "3 minutes ago",
            os: "Ubuntu 22.04",
        },
    ];

    const totalNodes = nodes.length;
    const onlineNodes = nodes.filter((node) => node.status === "Up").length;
    const totalCriticalRisks = nodes.reduce(
        (sum, node) => sum + node.criticalRisks,
        0
    );

    return (
        <div>
            <h1 style={{ marginBottom: "24px" }}>Nodes</h1>

            <div style={tableCardStyle}>
                <div style={headerRowStyle}>
                    <div>Node</div>
                    <div>Status</div>
                    <div>Critical Risks</div>
                    <div>Security Score</div>
                    <div>Last Seen</div>
                    <div>OS</div>
                </div>

                {nodes.map((node) => (
                    <div key={node.id} style={dataRowStyle}>
                        <div>
                            <div style={{ fontWeight: "600" }}>{node.name}</div>
                            <div style={{ color: "#64748b", marginTop: "4px" }}>{node.ip}</div>
                        </div>

                        <div
                            style={{
                                color: node.status === "Up" ? "#16a34a" : "#dc2626",
                                fontWeight: "500",
                            }}
                        >
                            {node.status}
                        </div>

                        <div
                            style={{
                                color: node.criticalRisks > 0 ? "#dc2626" : "#64748b",
                                fontWeight: "500",
                            }}
                        >
                            {node.criticalRisks}
                        </div>

                        <div>
                            <div style={scoreBarContainerStyle}>
                                <div
                                    style={{
                                        ...scoreBarFillStyle,
                                        width: `${node.securityScore}%`,
                                        background:
                                            node.securityScore >= 90
                                                ? "#16a34a"
                                                : node.securityScore >= 75
                                                    ? "#d97706"
                                                    : "#dc2626",
                                    }}
                                />
                            </div>

                            <div
                                style={{
                                    ...scoreBadgeStyle,
                                    background:
                                        node.securityScore >= 90
                                            ? "#dcfce7"
                                            : node.securityScore >= 75
                                                ? "#fef3c7"
                                                : "#fee2e2",
                                    color:
                                        node.securityScore >= 90
                                            ? "#16a34a"
                                            : node.securityScore >= 75
                                                ? "#d97706"
                                                : "#dc2626",
                                }}
                            >
                                {node.securityScore}
                            </div>
                        </div>

                        <div style={{ color: "#64748b" }}>{node.lastSeen}</div>
                        <div style={{ color: "#64748b" }}>{node.os}</div>
                    </div>
                ))}
            </div>

            <div style={summaryCardsWrapperStyle}>
                <SummaryCard title="Total Nodes" value={totalNodes} />
                <SummaryCard title="Nodes Online" value={onlineNodes} color="#16a34a" />
                <SummaryCard title="Critical Risks" value={totalCriticalRisks} color="#dc2626" />
            </div>
        </div>
    );
}

const tableCardStyle = {
    background: "white",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    marginBottom: "24px",
};

const headerRowStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1.2fr 1.8fr 1.4fr 1.4fr",
    padding: "20px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    fontWeight: "700",
};

const dataRowStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1.2fr 1.8fr 1.4fr 1.4fr",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
    alignItems: "center",
};

const scoreBarContainerStyle = {
    width: "120px",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px",
};

const scoreBarFillStyle = {
    height: "100%",
    borderRadius: "999px",
};

const scoreBadgeStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "14px",
};

const summaryCardsWrapperStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
};

export default Nodes;