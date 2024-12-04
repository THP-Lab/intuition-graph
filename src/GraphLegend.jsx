import React from "react";

const GraphLegend = ({ colors }) => {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "60px",
        right: "10px",
        zIndex: 10,
        background: "#222",
        color: "#fff",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        fontSize: "14px",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Graph Legend</h4>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {Object.entries(colors).map(([role, color]) => (
          <li
            key={role}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <span
              style={{
                width: "15px",
                height: "15px",
                backgroundColor: color,
                borderRadius: "50%",
                display: "inline-block",
                marginRight: "10px",
              }}
            ></span>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GraphLegend;
