// src/graphData.js
export const transformToGraphData = (triples) => {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();
  const nodeRoles = new Map(); // Track if node is used as subject, predicate, or object

  // First pass: identify roles for each node
  triples.forEach(({ subject, predicate, object }) => {
    const [subLabel, predLabel, objLabel] = [
      subject.label,
      predicate.label,
      object.label,
    ];

    // Track roles (nodes can have multiple roles)
    if (!nodeRoles.has(subLabel)) nodeRoles.set(subLabel, new Set());
    if (!nodeRoles.has(predLabel)) nodeRoles.set(predLabel, new Set());
    if (!nodeRoles.has(objLabel)) nodeRoles.set(objLabel, new Set());

    nodeRoles.get(subLabel).add("subject");
    nodeRoles.get(predLabel).add("predicate");
    nodeRoles.get(objLabel).add("object");
  });

  // Helper to determine node color based on its roles
  const getNodeColor = (roles) => {
    if (roles.has("predicate")) return "#ff0000"; // Warm yellow for predicates
    if (roles.has("subject")) return "#4361EE"; // Vibrant blue for subjects
    if (roles.has("object")) return "#9D4EDD"; // Rich purple for objects
    return "#666666"; // Default gray
  };

  // Second pass: create nodes and links
  triples.forEach(({ subject, predicate, object }) => {
    const [subLabel, predLabel, objLabel] = [
      subject.label,
      predicate.label,
      object.label,
    ];

    // Create nodes if they don't exist
    [subLabel, predLabel, objLabel].forEach((label) => {
      if (!nodeMap.has(label)) {
        const roles = nodeRoles.get(label);
        const node = {
          id: label,
          label,
          isTriple: false,
          color: getNodeColor(roles),
          role: Array.from(roles)[0], // Store primary role for reference
        };
        nodeMap.set(label, node);
        nodes.push(node);
      }
    });

    // Add triple node
    const tripleId = `${subLabel}-${predLabel}-${objLabel}`;
    const tripleNode = {
      id: tripleId,
      label: predLabel,
      isTriple: true,
      color: "#FF5733", // Same as predicate color
      role: "predicate",
    };
    nodes.push(tripleNode);

    // Create directed links
    links.push({
      source: subLabel,
      target: tripleId,
      type: "subject-to-predicate",
    });
    links.push({
      source: tripleId,
      target: objLabel,
      type: "predicate-to-object",
    });
  });

  return { nodes, links };
};
