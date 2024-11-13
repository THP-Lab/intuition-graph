// src/GraphVisualization.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [graphApi, setGraphApi] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const fgRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const triples = await fetchTriples();
        const data = transformToGraphData(triples);
        setGraphApi(data);
        setGraphData({
          nodes: data.nodes,
          links: data.links,
        });
      } catch (error) {
        console.error("Error loading graph data:", error);
      }
    };
    loadData();
  }, []);

  const handleNodeClick = useCallback(
    (node) => {
      if (!graphApi || !node.type === "triple") return;

      const newData = graphApi.toggleTripleExpansion(node);
      setGraphData({
        nodes: newData.nodes,
        links: newData.links,
      });

      // Center view on clicked node and zoom
      if (fgRef.current) {
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(2, 1000);
        fgRef.current.d3ReheatSimulation();
      }
    },
    [graphApi]
  );

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const label = node.label;
      const fontSize =
        node.type === "triple" ? 14 / globalScale : 12 / globalScale;

      // Calculate node size based on connections
      const linkedNodes = graphData.links.filter(
        (link) => link.source.id === node.id || link.target.id === node.id
      ).length;
      const baseRadius = node.type === "triple" ? 15 : 8;
      const radius = baseRadius + Math.sqrt(linkedNodes) * 2;

      // Draw node shadow
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fill();

      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw label
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px Sans-Serif`;
      ctx.fillStyle = "#fff";
      ctx.fillText(label, node.x, node.y);

      // Draw expansion indicator for triples
      if (node.type === "triple") {
        const symbol = node.collapsed ? "+" : "-";
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${16 / globalScale}px Sans-Serif`;
        ctx.fillText(symbol, node.x, node.y - radius - 4);
      }
    },
    [graphData.links]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      fgRef.current.zoomToFit(400);
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
          const linkedNodes = graphData.links.filter(
            (link) => link.source.id === node.id || link.target.id === node.id
          ).length;
          const baseRadius = node.type === "triple" ? 15 : 8;
          const radius = baseRadius + Math.sqrt(linkedNodes) * 2;

          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }}
        onNodeClick={handleNodeClick}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkColor={() => "#666"}
        backgroundColor="#1a1a1a"
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.08}
        cooldownTicks={100}
        linkWidth={1.5}
        nodeRelSize={6}
        d3Force={(forceName, force) => {
          if (forceName === "link") {
            force.distance(100).strength(0.2);
          }
          if (forceName === "charge") {
            force.strength(-120);
          }
        }}
        onEngineStop={handleEngineStop}
      />
    </div>
  );
};

export default GraphVisualization;
