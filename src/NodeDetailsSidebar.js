import React, { useEffect, useState } from "react";
import { fetchTriples } from "./api"; // Assurer que l'API fournit les détails supplémentaires

const NodeDetailsSidebar = ({ triple, onClose }) => {
  const [additionalData, setAdditionalData] = useState(null); // State pour les données supplémentaires
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Si un triple est sélectionné, on lance l'appel API
  useEffect(() => {
    if (triple) {
      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          // Appel de l'API avec l'ID du triple
          const response = await fetchTriples(triple.id); 
          setAdditionalData(response);
        } catch (err) {
          setError("Failed to fetch additional data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [triple]);

  if (!triple) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        right: "20px",
        transform: "translateY(-50%)",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "20px",
        width: "300px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
        zIndex: 1000,
        color: "#fff",
        overflowY: "auto",
        maxHeight: "80vh",
      }}
    >
      <h2 style={{ color: "#f4f4f4", marginBottom: "10px" }}>
        {triple.label || "No Label"} Details
      </h2>

      {/* Affichage des données supplémentaires, si elles existent */}
      {loading && <p>Loading additional data...</p>}
      {error && <p>{error}</p>}
      {additionalData && (
        <div>
          <h4>Informations:</h4>
          {/* Adapter l'affichage des données supplémentaires selon ce qui est retourné */}
          <pre>{JSON.stringify(additionalData, null, 2)}</pre>
        </div>
      )}

      <button
        onClick={onClose}
        style={{
          backgroundColor: "#333",
          color: "#fff",
          border: "none",
          padding: "8px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          marginTop: "10px",
          width: "100%",
        }}
      >
        Close
      </button>
    </div>
  );
};

export default NodeDetailsSidebar;
