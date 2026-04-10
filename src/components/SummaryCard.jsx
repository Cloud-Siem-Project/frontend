function SummaryCard({ title, value, color = "#0f172a" }) {
    return (
        <div style={cardStyle}>
            <div style={titleStyle}>{title}</div>

            <div style={{ ...valueStyle, color }}>
                {value}
            </div>
        </div>
    );
}

const cardStyle = {
    background: "white",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
};

const titleStyle = {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "500",
};

const valueStyle = {
    fontSize: "28px",
    fontWeight: "700",
};

export default SummaryCard;