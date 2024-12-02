import React, { useEffect, useRef } from "react";
import ForceGraphVR from "3d-force-graph-vr";

const GraphVR = ({ graphData, onNodeClick }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (graphRef.current) {
      // Initialize VR Graph
      const graph = ForceGraphVR()(graphRef.current);

      // Pass graph data directly without assigning random coordinates
      graph.graphData(graphData);

      // Attach click handler if provided
      if (onNodeClick) {
        graph.onNodeClick(onNodeClick);
      }

      // Debugging
      console.log("Graph data loaded for VR:", graphData);
    }
  }, [graphData, onNodeClick]);

  return (
    <div
      ref={graphRef}
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
    />
  );
};

export default GraphVR;
