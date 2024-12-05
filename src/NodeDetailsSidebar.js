import React, { useEffect, useState } from "react";
import { fetchTriples, fetchAtomDetails } from "./api";
import "./NodeDetailsSidebar.css"; // Importation du fichier CSS

const NodeDetailsSidebar = ({ triple, onClose }) => {
  const [additionalData, setAdditionalData] = useState(null); // Données supplémentaires des triples
  const [atomDetails, setAtomDetails] = useState(null); // Détails spécifiques de l'atome
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chargement des données supplémentaires (triples associés)
  useEffect(() => {
    if (triple) {
      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          // Appel API pour récupérer tous les triples
          const response = await fetchTriples();

          // Filtrer les données associées au triple sélectionné
          const filteredData = response.filter(
            (item) =>
              item.id === triple.id ||
              item.subject.id === triple.id ||
              item.predicate.id === triple.id ||
              item.object.id === triple.id
          );

          setAdditionalData(filteredData);

          // Appel API pour récupérer les détails spécifiques de l'atome
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

  if (!triple) return null;

  return (
    <div className="node-details-sidebar">
      <h2>{triple.label || "No Label"} Details</h2>

      {loading && <p>Loading data...</p>}
      {error && <p>{error}</p>}

      {/* Affichage des données supplémentaires */}
      {additionalData && additionalData.length > 0 ? (
        <div className="scrollable-content">
          <h4>Related Data:</h4>
          <pre>{JSON.stringify(additionalData, null, 2)}</pre>
        </div>
      ) : (
        !loading && <p>No additional related data found.</p>
      )}

      {/* Affichage complet des détails de l'atome */}
      {atomDetails ? (
        <div className="scrollable-content">
          <h4>Atom Details:</h4>
          <p><strong>ID:</strong> {atomDetails.id}</p>
          <p><strong>Vault Shares:</strong> {atomDetails.vault?.totalShares || "N/A"}</p>
          <pre>{JSON.stringify(atomDetails.data, null, 2)}</pre>
        </div>
      ) : (
        !loading && <p>No atom details available.</p>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default NodeDetailsSidebar;
