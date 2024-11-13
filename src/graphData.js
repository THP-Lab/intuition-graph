// src/graphData.js
export const transformToGraphData = (triples) => {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  // Helper function to create or get node
  const getOrCreateNode = (id, label, type = "atom", meta = {}) => {
    if (!nodeMap.has(id)) {
      const node = {
        id,
        label,
        type,
        ...meta,
        collapsed: type === "triple",
        radius: type === "triple" ? 15 : 8,
        color: type === "triple" ? "#ff9900" : "#1f77b4",
      };
      nodeMap.set(id, node);
      nodes.push(node);
    }
    return nodeMap.get(id);
  };

  // Process triples and create nested structure
  triples.forEach(({ subject, predicate, object }) => {
    const subNode = getOrCreateNode(subject.label, subject.label);
    const predNode = getOrCreateNode(predicate.label, predicate.label);
    const objNode = getOrCreateNode(object.label, object.label);

    // Create triple node
    const tripleId = `${subject.label}-${predicate.label}-${object.label}`;
    const tripleNode = getOrCreateNode(tripleId, predicate.label, "triple", {
      components: {
        subject: subject.label,
        predicate: predicate.label,
        object: object.label,
      },
    });

    // Add permanent links between triple and its components
    links.push({
      source: tripleNode.id,
      target: subNode.id,
      type: "triple-component",
    });
    links.push({
      source: tripleNode.id,
      target: objNode.id,
      type: "triple-component",
    });
  });

  // Function to toggle triple expansion
  const toggleTripleExpansion = (tripleNode) => {
    tripleNode.collapsed = !tripleNode.collapsed;
    return { nodes: [...nodes], links: [...links] };
  };

  return {
    nodes,
    links,
    toggleTripleExpansion,
  };
};
