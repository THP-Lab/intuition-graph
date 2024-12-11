import React, { useEffect, useState, useCallback, useRef } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import { fetchTriples, fetchTriplesForNode } from "./api";
import { transformToGraphData } from "./graphData";
import { NODE_COLORS } from "./nodeColors";
import GraphLegend from "./GraphLegend";
import GraphVR from "./GraphVR";
import NodeDetailsSidebar from "./NodeDetailsSidebar";
import LoadingAnimation from "./LoadingAnimation";
import * as d3 from "d3";

const GraphVisualization = ({ endpoint }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [initialGraphData, setInitialGraphData] = useState(null);
  const [previousGraphData, setPreviousGraphData] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("2D");
  const [selectedTriple, setSelectedTriple] = useState(null);
  const [showCreators, setShowCreators] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fgRef = useRef();
  const [graphHistory, setGraphHistory] = useState([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const triples = await fetchTriples(endpoint);
        let baseGraphData = transformToGraphData(triples);

        // Ajouter les créateurs si le toggle est actif
        if (showCreators) {
          baseGraphData = enhanceGraphDataWithCreators(baseGraphData, triples);
        }

        setGraphData(baseGraphData);
        setInitialGraphData(baseGraphData);
      } catch (error) {
        console.error("Error loading graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showCreators, endpoint]); // Reload when endpoint changes

  const resetGraph = () => {
    setGraphData(initialGraphData);
    setPreviousGraphData(null);
  };

  // Fonction pour ajouter les créateurs au graphe
  const enhanceGraphDataWithCreators = (graphData, triples) => {
    const creatorNodes = [];
    const creatorLinks = [];

    triples.forEach((triple) => {
      const entities = [triple.subject, triple.predicate, triple.object];

      entities.forEach((entity) => {
        if (entity.creatorId) {
          // Ajouter un nœud pour le créateur
          if (
            !creatorNodes.find(
              (node) => node.id === `creator-${entity.creatorId}`
            )
          ) {
            creatorNodes.push({
              id: `creator-${entity.creatorId}`,
              label: `${entity.creatorId}`,
              type: "creator",
              color: NODE_COLORS.CREATOR,
            });
          }

          // Ajouter un lien entre l'entité et son créateur
          creatorLinks.push({
            source: `creator-${entity.creatorId}`,
            target: entity.id,
            label: "created",
          });
        }
      });
    });

    return {
      nodes: [...graphData.nodes, ...creatorNodes],
      links: [...graphData.links, ...creatorLinks],
    };
  };

  const handleNodeClick = useCallback(
    async (node) => {
      if (fgRef.current) {
        try {
          // Sauvegarder la position actuelle du nœud
          const nodePosition = {
            x: node.x,
            y: node.y,
            z: node.z || 0, // En 2D, z sera 0
          };

          // Récupérer les nouveaux triplets
          const filteredTriples = await fetchTriplesForNode(node.id, endpoint);
          const newGraphData = transformToGraphData(filteredTriples);

          // Assigner la position sauvegardée au nœud correspondant dans le nouveau graphe
          const targetNode = newGraphData.nodes.find((n) => n.id === node.id);
          if (targetNode) {
            targetNode.x = nodePosition.x;
            targetNode.y = nodePosition.y;
            if (viewMode === "3D") targetNode.z = nodePosition.z;

            // Fixer le nœud en place pendant l'initialisation du graphe
            targetNode.fx = nodePosition.x;
            targetNode.fy = nodePosition.y;
            if (viewMode === "3D") targetNode.fz = nodePosition.z;
          }

          // Sauvegarder l'état actuel dans l'historique
          setGraphHistory((prevHistory) => {
            const updatedHistory = prevHistory.slice(0, currentHistoryIndex + 1);
            updatedHistory.push({ graphData, selectedTriple }); // Ajouter l'état actuel du graphe et de NodeDetailsSidebar
            return updatedHistory;
          });
          setCurrentHistoryIndex((prevIndex) => prevIndex + 1);


          setGraphData(newGraphData);

          // Attendre que le graphe soit stabilisé
          fgRef.current.d3Force("center", null);
          await new Promise((resolve) => {
            const handleEngineStop = () => {
              // Libérer le nœud une fois le graphe stabilisé
              if (targetNode) {
                targetNode.fx = undefined;
                targetNode.fy = undefined;
                if (viewMode === "3D") targetNode.fz = undefined;
              }

              if (viewMode === "3D") {
                const distance = 40;
                const distRatio =
                  1 +
                  distance /
                    Math.hypot(nodePosition.x, nodePosition.y, nodePosition.z);

                fgRef.current.cameraPosition(
                  {
                    x: nodePosition.x * distRatio,
                    y: nodePosition.y * distRatio,
                    z: nodePosition.z * distRatio,
                  },
                  targetNode,
                  500
                );
              } else  {
                // Pour 2D, on utilise zoomToFit autour du nœud
                const distance = 100;
                fgRef.current.centerAt(nodePosition.x, nodePosition.y, 1000);
                fgRef.current.zoom(8, 1000);
              }
              fgRef.current.d3Force("center", d3.forceCenter());
              fgRef.current.removeEventListener("engineStop", handleEngineStop);
              resolve();
            };

            fgRef.current.addEventListener("engineStop", handleEngineStop);
          });
        } catch (error) {
          console.error("Erreur lors de la récupération des triplets :", error);
        }
      }

      setSelectedTriple(node);
    },
    [viewMode, graphData, currentHistoryIndex]
  );


  // Fit graph to view after initial render
  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);


  // Boutons Précédent et Suivant
const goBack = () => {
  if (currentHistoryIndex > 0) {
    const { graphData, selectedTriple } = graphHistory[currentHistoryIndex - 1];
    setGraphData(graphData);
    setSelectedTriple(selectedTriple); // Récupérer l'état de NodeDetailsSidebar
    setCurrentHistoryIndex((prevIndex) => prevIndex - 1);
  }
};

const goForward = () => {
  if (currentHistoryIndex < graphHistory.length - 1) {
    const { graphData, selectedTriple } = graphHistory[currentHistoryIndex + 1];
    setGraphData(graphData);
    setSelectedTriple(selectedTriple); // Récupérer l'état de NodeDetailsSidebar
    setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
  }
};

  return (
    <div>
      {isLoading && <LoadingAnimation />}
      <button className="navigation-button"
        onClick={resetGraph}
        style={{ position: "absolute", top: "75px", right: "10px", zIndex: 50 }}
      >
        Return to initial graph
      </button>

      <button className="navigation-button"
        onClick={goBack}
        style={{ position: "absolute", top: "110px", right: "83px", width: "70px", zIndex: 50}}
        disabled={currentHistoryIndex <= 0}>
        Previous
      </button>
      <button className="navigation-button"
        onClick={goForward} 
        style={{ position: "absolute", top: "110px", right: "10px", width: "70px", zIndex: 50 }}
        disabled={currentHistoryIndex >= graphHistory.length - 1}>
        Next
      </button>


      {/* Options en haut à gauche */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#444",
          color: "#fff",
          padding: "10px",
          borderRadius: "4px",
        }}
      >
        {/* Toggle pour le mode de vue */}
        <label htmlFor="viewMode" style={{ fontSize: "14px" }}>
          View Mode:
        </label>
        <select
          id="viewMode"
          value={viewMode}
          onChange={(e) => setViewMode(e.target.value)}
          style={{
            padding: "5px",
            borderRadius: "4px",
            border: "none",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          <option value="2D">2D</option>
          <option value="3D">3D</option>
          <option value="VR">VR</option>
        </select>

        {/* Toggle pour afficher les créateurs */}
        <label style={{ fontSize: "14px", marginLeft: "10px" }}>
          Show Creators
          <input
            type="checkbox"
            checked={showCreators}
            onChange={(e) => setShowCreators(e.target.checked)}
            style={{ marginLeft: "8px" }}
          />
        </label>
      </div>

      {/* Graphique 2D */}
      {viewMode === "2D" && (
        <ForceGraph2D
          ref={(el) => (fgRef.current = el)}
          graphData={graphData}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label || "";
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;

            // Measure text width for background
            const textWidth = ctx.measureText(label).width;
            const padding = 10 / globalScale; // Scale padding with zoom
            const radius = 5 / globalScale; // Scale border radius with zoom

            // Draw rounded rectangle backgrwound
            ctx.fillStyle = node.color + "CC";
            const x = node.x - textWidth / 2 - padding;
            const y = node.y - fontSize / 2 - padding;
            const width = textWidth + padding * 2;
            const height = fontSize + padding * 2;

            // Simple rounded rect using arcs (more performant than complex paths)
            ctx.beginPath();
            ctx.arc(x + radius, y + radius, radius, Math.PI, 1.5 * Math.PI);
            ctx.arc(
              x + width - radius,
              y + radius,
              radius,
              1.5 * Math.PI,
              2 * Math.PI
            );
            ctx.arc(
              x + width - radius,
              y + height - radius,
              radius,
              0,
              0.5 * Math.PI
            );
            ctx.arc(
              x + radius,
              y + height - radius,
              radius,
              0.5 * Math.PI,
              Math.PI
            );
            ctx.closePath();
            ctx.fill();

            // Draw text
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          linkColor={() => "#666"}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.02}
          linkDirectionalParticleColor={() => "#fff"}
          nodeAutoColorBy="type"
          onNodeClick={handleNodeClick}
          onEngineStop={handleEngineStop}
        />
      )}

      {/* Graphique 3D */}
      {viewMode === "3D" && (
        <ForceGraph3D
          ref={(el) => (fgRef.current = el)}
          graphData={graphData}
          controlType="fly"
          nodeLabel="label"
          onNodeClick={handleNodeClick}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeAutoColorBy="type"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.label || "");
            sprite.borderRadius = 1;
            sprite.backgroundColor = node.color + "55";
            sprite.padding = 1;
            sprite.color = "#fff";
            sprite.textHeight = 2;
            return sprite;
          }}
          onEngineStop={handleEngineStop}
        />
      )}

      {/* Mode VR */}
      {viewMode === "VR" && (
        <GraphVR 
          graphData={graphData} 
          onNodeClick={handleNodeClick}
          onBack={goBack} 
          onForward={goForward} 
          selectedTriple={selectedTriple} 
        />
      )}

      {/* Graph legend */}
      <GraphLegend showCreators={showCreators} />

      {/* Barre latérale de détails */}
      <NodeDetailsSidebar
        triple={selectedTriple}
        onClose={() => setSelectedTriple(null)}
      />
    </div>
  );
};

export default GraphVisualization;
