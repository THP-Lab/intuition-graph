import React, { useEffect, useState, useCallback, useRef } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";
import SpriteText from "three-spritetext";
import GraphLegend from "./GraphLegend";
import GraphVR from "./GraphVR";
import NodeDetailsSidebar from "./NodeDetailsSidebar"; // Import du composant Sidebar

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("2D");
  const [selectedTriple, setSelectedTriple] = useState(null); // State pour le triple sélectionné
  const fgRef = useRef();

  // Fetch and transform graph data
  useEffect(() => {
    const loadData = async () => {
      try {
        const triples = await fetchTriples();
        const data = transformToGraphData(triples);
        setGraphData(data);
      } catch (error) {
        console.error("Error loading graph data:", error);
      }
    };
    loadData();
  }, []);

  const handleNodeClick = useCallback(
  async (node) => {
    if (viewMode === "3D" && fgRef.current) {
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1); // Fallback pour éviter NaN
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

    // Mettre à jour l'état du triple sélectionné
    setSelectedTriple(node); // On passe le triple (node) sélectionné
  },
  [viewMode]
);


  // Fit graph to view after initial render
  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  // Update graph size on window resize
  useEffect(() => {
    const handleResize = () => {
      if (fgRef.current) {
        fgRef.current.width = window.innerWidth;
        fgRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Color mapping for graph legend
  const colorMapping = {
    subject: "#4361EE",
    predicate: "#FF9800",
    object: "#9D4EDD",
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* View mode selector */}
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
      </div>

      {/* Graph rendering based on view mode */}
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
          nodeAutoColorBy="group"
          onEngineStop={handleEngineStop}
          onNodeClick={handleNodeClick} // Ajout de l'événement de clic sur le nœud
        />
      )}

      {viewMode === "3D" && (
        <ForceGraph3D
          ref={(el) => (fgRef.current = el)}
          graphData={graphData}
          nodeLabel="label"
          onNodeClick={handleNodeClick} // Ajout de l'événement de clic sur le nœud
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeAutoColorBy="group"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.label || "");
            sprite.color = node.color || "#000";
            sprite.textHeight = 2;
            return sprite;
          }}
          onEngineStop={handleEngineStop}
        />
      )}

      {viewMode === "VR" && (
        <>
          <GraphVR graphData={graphData} onNodeClick={handleNodeClick} />
        </>
      )}

      {/* Graph legend */}
      <GraphLegend colors={colorMapping} />

      {/* Node Details Sidebar */}
      {selectedTriple && (
        <NodeDetailsSidebar triple={selectedTriple} onClose={() => setSelectedTriple(null)} />
      )}
    </div>
  );
};

export default GraphVisualization;
