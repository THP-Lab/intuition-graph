// src/graphData.js
export const transformToGraphData = (triples) => {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();
  const nodeRoles = new Map(); // Track if node is used as subject, predicate, or object
  const groupNodes = new Map(); // Track predicates/objects with multiple subjects

  // First pass: identify roles for each node and group nodes
  triples.forEach(({ subject, predicate, object }) => {
    // Track roles (nodes can have multiple roles)
    if (!nodeRoles.has(subject.id)) nodeRoles.set(subject.id, new Set());
    if (!nodeRoles.has(predicate.id)) nodeRoles.set(predicate.id, new Set());
    if (!nodeRoles.has(object.id)) nodeRoles.set(object.id, new Set());

    nodeRoles.get(subject.id).add("subject");
    nodeRoles.get(predicate.id).add("predicate");
    nodeRoles.get(object.id).add("object");

    // Track group nodes for predicates/objects with multiple subjects
    const predObjId = `${predicate.id}-${object.id}`;
    if (!groupNodes.has(predObjId)) {
      groupNodes.set(predObjId, {
        id: predObjId,
        label: `${predicate.label} / ${object.label}`,
        isGroup: true,
        color: "#FF9800", // Orange for group nodes
        role: "group",
      });
    }
  });

  // Helper to determine node color based on its roles
  const getNodeColor = (roles) => {
    if (roles.has("predicate")) return "#ff0000"; // Warm yellow for predicates
    if (roles.has("subject")) return "#4361EE"; // Vibrant blue for subjects
    if (roles.has("object")) return "#9D4EDD"; // Rich purple for objects
    if (roles.has("group")) return "#FF9800"; // Orange for group nodes
    return "#666666"; // Default gray
  };

  // Second pass: create nodes and links
  triples.forEach(({ subject, predicate, object }) => {
    // Create nodes if they don't exist
    [
      { id: subject.id, label: subject.label },
      { id: predicate.id, label: predicate.label },
      { id: object.id, label: object.label },
    ].forEach(({ id, label }) => {
      if (!nodeMap.has(id)) {
        const roles = nodeRoles.get(id);
        const node = {
          id,
          label,
          isTriple: false,
          color: getNodeColor(roles),
          role: Array.from(roles)[0], // Store primary role for reference
        };
        nodeMap.set(id, node);
        nodes.push(node);
      }
    });

    // Add group node if it doesn't exist
    const predObjId = `${predicate.id}-${object.id}`;
    if (!nodeMap.has(predObjId)) {
      const groupNode = groupNodes.get(predObjId);
      nodeMap.set(predObjId, groupNode);
      nodes.push(groupNode);
    }

    // Create directed links
    links.push({
      source: subject.id,
      target: predObjId,
      type: "subject-to-group",
    });
    links.push({
      source: predObjId,
      target: predicate.id,
      type: "group-to-predicate",
    });
    links.push({
      source: predObjId,
      target: object.id,
      type: "group-to-object",
    });
  });

  return { nodes, links };
};
