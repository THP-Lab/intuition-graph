import React, { useEffect, useRef } from 'react';
import ForceGraphVR from '3d-force-graph-vr';

const GraphVR = ({ graphData, onNodeClick }) => {
  const graphRef = useRef();

  useEffect(() => {
    if (graphRef.current) {
      // Initialize VR Graph
      const graph = ForceGraphVR()(graphRef.current);

      // Check and apply default coordinates if missing
      const updatedNodes = graphData.nodes.map((node) => ({
        ...node,
        x: node.x ?? Math.random() * 100,
        y: node.y ?? Math.random() * 100,
        z: node.z ?? Math.random() * 100,
      }));
      const updatedGraphData = { ...graphData, nodes: updatedNodes };

      // Set graph data
      graph.graphData(updatedGraphData);

      // Attach click handler
      if (onNodeClick) {
        graph.onNodeClick(onNodeClick);
      }

      // Debugging
      console.log("Graph data loaded for VR:", updatedGraphData);
    }
  }, [graphData, onNodeClick]);

  return (
    <div
      ref={graphRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    />
  );
};

export default GraphVR;
