import React, { useEffect, useState, useCallback, useRef } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";
import GraphLegend from "./GraphLegend";
import GraphVR from "./GraphVR";
import NodeDetailsSidebar from "./NodeDetailsSidebar";

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("2D");
  const [selectedTriple, setSelectedTriple] = useState(null);
  const [showCreators, setShowCreators] = useState(false);
  const fgRef = useRef();

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      try {
        const triples = await fetchTriples();
        let baseGraphData = transformToGraphData(triples);

        // Ajouter les créateurs si le toggle est actif
        if (showCreators) {
          baseGraphData = enhanceGraphDataWithCreators(baseGraphData, triples);
        }

        setGraphData(baseGraphData);
      } catch (error) {
        console.error("Error loading graph data:", error);
      }
    };

    loadData();
  }, [showCreators]); // Recharger les données si le toggle `showCreators` change

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
              color: "green",
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
      if (viewMode === "3D" && fgRef.current) {
        const distance = 40;
        const distRatio =
          1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
        fgRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          500
        );
      }

      setSelectedTriple(node);
    },
    [viewMode]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  const colorMapping = {
    subject: "#4361EE",
    predicate: "#FF9800",
    object: "#9D4EDD",
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Options en haut à gauche */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
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
            ctx.fillStyle = node.color || "#000";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.02}
          nodeAutoColorBy="type"
          onNodeClick={handleNodeClick}
          onEngineStop={handleEngineStop}
        />
      )}

      {/* Graphique 3D */}
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
          sprite.color = node.color || colorMapping[node.type] || "#666";
          sprite.textHeight = 2;
          return sprite;
        }}
        onEngineStop={handleEngineStop}
      />

      {/* Mode VR */}
      {viewMode === "VR" && (
        <GraphVR graphData={graphData} onNodeClick={handleNodeClick} />
      )}

      {/* Graph legend */}
      <GraphLegend colors={colorMapping} />

      {/* Barre latérale de détails */}
      <NodeDetailsSidebar
        triple={selectedTriple}
        onClose={() => setSelectedTriple(null)}
      />
    </div>
  );
};

export default GraphVisualization;
