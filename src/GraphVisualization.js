import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ForceGraph2D,
  ForceGraph3D,
  ForceGraphVR,
} from "react-force-graph";
import * as d3 from "d3";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";
import SpriteText from "three-spritetext";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GraphLegend from "./GraphLegend";

const GraphVisualization = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("2D"); // Default to 2D view
  const [isSceneReady, setIsSceneReady] = useState(false); // Define the state for VR scene readiness
  const fgRef = useRef();
  const controlsRef = useRef(); // Reference for OrbitControls

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

  const colorMapping = {
    subject: "#4361EE",
    predicate: "#FF9800",
    object: "#9D4EDD",
  };

  useEffect(() => {
    if (viewMode === "VR" && fgRef.current) {
      const { camera, renderer } = fgRef.current;

      if (!controlsRef.current) {
        controlsRef.current = new OrbitControls(camera, renderer.domElement);
        controlsRef.current.enableDamping = true;
        controlsRef.current.dampingFactor = 0.25;
        controlsRef.current.screenSpacePanning = false;
        controlsRef.current.maxDistance = 100;
        controlsRef.current.minDistance = 10;
      }

      controlsRef.current.update();

      return () => {
        if (controlsRef.current) {
          controlsRef.current.dispose();
        }
      };
    }
  }, [viewMode]);

  const handleNodeClick = useCallback(
    (node) => {
      if (viewMode === "3D") {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node,
          500
        );
      }
    },
    [viewMode]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (viewMode === "2D" && fgRef.current) {
      const canvas = fgRef.current.canvas;
      const context = d3.select(canvas);

      const zoomHandler = d3
        .zoom()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          const transform = event.transform;
          context
            .attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
        });

      context.call(zoomHandler);

      return () => {
        context.on(".zoom", null); // Cleanup zoom listener
      };
    }
  }, [viewMode]);

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
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
        <label htmlFor="viewMode" style={{ fontSize: "14px", marginRight: "5px" }}>
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

      {viewMode === "3D" && (
        <ForceGraph3D
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label"
          onNodeClick={handleNodeClick}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(d) => 0.005}
          nodeAutoColorBy="group"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.label);
            sprite.color = node.color;
            sprite.textHeight = 2;
            return sprite;
          }}
          onEngineStop={handleEngineStop}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      {viewMode === "2D" && (
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = node.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          onNodeClick={handleNodeClick}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={(d) => 0.02}
          nodeAutoColorBy="group"
          onEngineStop={handleEngineStop}
          width={window.innerWidth}
          height={window.innerHeight}
        />
      )}

      {viewMode === "VR" && (
        <ForceGraphVR
          ref={fgRef}
          graphData={graphData}
          nodeLabel="label"
          onNodeClick={handleNodeClick}
          width={window.innerWidth}
          height={window.innerHeight}
          onSceneReady={() => setIsSceneReady(true)} // Example callback
        />
      )}
      <GraphLegend colors={colorMapping} />
    </div>
  );
};

export default GraphVisualization;
