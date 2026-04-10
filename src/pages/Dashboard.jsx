const cardStyle = {
    background: "white",
    padding: "0px 10px",
    borderRadius: "10px",
    width: "200px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const cardNumber = {
    fontSize: "28px",
    fontWeight: "bold",
    marginTop: "10px",
};

function Dashboard() {
    return (
        <div>
            <h1 style={{ marginBottom: "20px" }}>Overview</h1>

            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

                <div style={cardStyle}>
                    <h3>Total Nodes</h3>
                    <p style={cardNumber}>12</p>
                </div>

                <div style={cardStyle}>
                    <h3>Online Nodes</h3>
                    <p style={cardNumber}>10</p>
                </div>

                <div style={cardStyle}>
                    <h3>Offline Nodes</h3>
                    <p style={cardNumber}>2</p>
                </div>

                <div style={cardStyle}>
                    <h3>Active Alerts</h3>
                    <p style={cardNumber}>3</p>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;