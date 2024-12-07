import React, { useEffect, useState } from "react";
import { fetchTriples, fetchAtomDetails } from "./api";
import "./NodeDetailsSidebar.css";

const NodeDetailsSidebar = ({ triple, onClose }) => {
  const [additionalData, setAdditionalData] = useState(null);
  const [atomDetails, setAtomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (triple) {
      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          const response = await fetchTriples();
          const filteredData = response.filter(
            (item) =>
              item.id === triple.id ||
              item.subject.id === triple.id ||
              item.predicate.id === triple.id ||
              item.object.id === triple.id
          );
          setAdditionalData(filteredData);

          if (triple.id) {
            const atomData = await fetchAtomDetails(triple.id);
            setAtomDetails(atomData);
          }
        } catch (err) {
          setError("Failed to fetch data");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [triple]);

  const formatShares = (shares) => `${(shares / 1e18).toFixed(4)} ETH`;

  if (!triple) return null;

  return (
    <div className="node-details-sidebar">
      <h2>{triple.label || "No Label"} Details</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {atomDetails && (
        <>
          <h4>Atom Info</h4>
          <p>
            <strong>ID:</strong> {atomDetails.id}
          </p>
          <p>
            <strong>Label:</strong> {atomDetails.label}
          </p>
          <p>
            <strong>Type:</strong> {atomDetails.type}
          </p>
          <p>
            <strong>Emoji:</strong> {atomDetails.emoji || "N/A"}
          </p>
          <p>
            <strong>Creator:</strong> {atomDetails.creator?.label || "Unknown"}
          </p>
          <p>
            <strong>Vault Shares:</strong>{" "}
            {formatShares(atomDetails.vault?.totalShares || 0)}
          </p>
        </>
      )}

      {additionalData && additionalData.length > 0 ? (
        <div className="related-triples">
          <h4>Related Data:</h4>
          <ul>
            {additionalData.map((item) => (
              <li key={item.id}>
                <strong>Subject:</strong> {item.subject.label} |{" "}
                <strong>Predicate:</strong> {item.predicate.label} |{" "}
                <strong>Object:</strong> {item.object.label}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p>No additional related data found.</p>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NodeDetailsSidebar;
