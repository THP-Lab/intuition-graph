import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ForceGraph2D,
  ForceGraph3D,
  ForceGraphVR,
  ForceGraphAR,
} from "react-force-graph";

import * as d3 from "d3";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";
import SpriteText from "three-spritetext";

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [is3D, setIs3D] = useState(false); // Toggle between 2D and 3D
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

  const handleNodeClick = useCallback(
    (node) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        500 // ms transition duration
      );
    },
    [fgRef]
  );

  const nodeCanvasObject = useCallback(
    (node, ctx, globalScale) => {
      const label = node.label;
      const fontSize = is3D ? 8 : 12 / globalScale; // Smaller font for 3D
      const radius = 12;

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff33";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${fontSize}px Sans-Serif`;

      if (is3D) {
        ctx.fillStyle = "#aaa"; // Dimmer text color for 3D mode
      } else {
        ctx.fillStyle = "#fff"; // Bright text for 2D mode
      }

      ctx.fillText(label, node.x, node.y);
    },
    [is3D]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <button
        onClick={() => setIs3D((prev) => !prev)}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          padding: "10px",
          background: "#444",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Toggle {is3D ? "2D" : "3D"}
      </button>
      {is3D ? (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label" // Enable tooltip for 3D
          onNodeClick={handleNodeClick}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(d) => 0.005}
          nodeAutoColorBy="group"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.label);
            sprite.color = node.color;
            sprite.backgroundColor = "#33335580";
            sprite.borderRadius = 1;
            sprite.textAlign = "center";
            sprite.textHeight = 2;
            sprite.padding = 1;
            return sprite;
          }}
          onEngineStop={handleEngineStop}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      ) : (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeCanvasObject={nodeCanvasObject}
          onNodeClick={handleNodeClick}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(d) => 0.02}
          linkColor={() => "#666"}
          backgroundColor="#1a1a1a"
          onEngineStop={handleEngineStop}
          minZoom={0.1}
          maxZoom={8}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}
    </div>
  );
};

export default GraphVisualization;
