import React, { useEffect, useRef } from "react";
import ForceGraphVR from "3d-force-graph-vr";

const GraphVR = ({ graphData, onNodeClick }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (graphRef.current) {
      // Initialize VR Graph
      const graph = ForceGraphVR()(graphRef.current);

      // Set graph data
      graph.graphData(graphData);

      // Add labels to nodes
      graph
        .nodeLabel((node) => node.name || node.id) // Use the `name` property or fallback to `id`
        .nodeAutoColorBy("group"); // Optional: Automatically color nodes by a property

      // Attach click handler if provided
      if (onNodeClick) {
        graph.onNodeClick(onNodeClick);
      }

      // Debugging
      console.log("Graph data loaded with labels:", graphData);
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
