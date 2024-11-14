// src/GraphVisualization.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const fgRef = useRef();

  const groupNodeWidth = 60;
  const groupNodeHeight = 30;
  const groupNodeRadius = 10;

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

  const handleNodeClick = useCallback((node) => {
    // Center view on clicked node and zoom
    if (fgRef.current) {
      const fg = fgRef.current;
      const currentZoom = fg.zoom();
      fg.centerAt(node.x, node.y, 1000);
      fg.zoom(Math.max(currentZoom, 2), 1000);
    }
  }, []);

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      if (!node.x || !node.y) return; // Skip rendering if coordinates are invalid

      const label = node.label;
      const fontSize = 12 / globalScale;
      const radius = 12; // Fixed size for regular nodes

      if (node.isGroup) {
        // Draw group node rounded rectangle
        ctx.beginPath();
        ctx.roundRect(
          node.x - groupNodeWidth / 2,
          node.y - groupNodeHeight / 2,
          groupNodeWidth,
          groupNodeHeight,
          groupNodeRadius
        );
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Extract predicate and object nodes from the group node
        const predNode = graphData.nodes.find(
          (n) => n.id === node.id.split("-")[0]
        );
        const objNode = graphData.nodes.find(
          (n) => n.id === node.id.split("-")[1]
        );

        // Draw predicate and object nodes inside the rounded rectangle
        const predX = node.x - groupNodeWidth / 4;
        const predY = node.y;
        const objX = node.x + groupNodeWidth / 4;
        const objY = node.y;

        // Draw predicate node
        ctx.beginPath();
        ctx.arc(predX, predY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = predNode.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw object node
        ctx.beginPath();
        ctx.arc(objX, objY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = objNode.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw predicate and object labels inside the nodes
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.fillStyle = "#fff";
        ctx.fillText(predNode.label, predX, predY);
        ctx.fillText(objNode.label, objX, objY);
      } else {
        // Draw node shadow
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        // Draw node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Set up text properties
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${fontSize}px Sans-Serif`;

        // Measure text width
        const textWidth = ctx.measureText(label).width;

        // Only draw label if it fits within the node diameter (with padding)
        if (textWidth < radius * 1.8) {
          ctx.fillStyle = "#fff";
          ctx.fillText(label, node.x, node.y);
        }
      }
    },
    [graphData.nodes]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      // Add padding to ensure all nodes are visible
      fgRef.current.zoomToFit(400, 100);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={(node, color, ctx) => {
          if (!node.x || !node.y) return;
          const radius = node.isGroup ? groupNodeWidth / 2 : 12; // Adjust for group nodes

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={(d) => 0.02}
        linkDirectionalParticleWidth={5}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkColor={() => "#666"}
        backgroundColor="#1a1a1a"
        d3AlphaDecay={0.005} // Slower decay for better stabilization
        d3VelocityDecay={0.1}
        cooldownTicks={200}
        linkWidth={1.5}
        nodeRelSize={6}
        warmupTicks={200}
        d3Force={(forceName, force) => {
          if (forceName === "link") {
            // Much larger distance between connected nodes
            force.distance(150).strength(0.5);
          }
          if (forceName === "charge") {
            // Much stronger repulsion
            force.strength(-1000).distanceMax(500);
          }
          if (forceName === "center") {
            // Moderate center force
            force.strength(0.5);
          }
          if (forceName === "collide") {
            // Extremely strong collision with large radius
            force.radius(80).strength(5).iterations(10);
          }
        }}
        onEngineStop={handleEngineStop}
        minZoom={0.1}
        maxZoom={8}
        width={window.innerWidth}
        height={window.innerHeight}
      />
    </div>
  );
};

export default GraphVisualization;
