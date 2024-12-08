// src/graphData.js
export const transformToGraphData = (triples) => {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  // Helper to determine node color based on its roles
  const getNodeColor = (role) => {
    if (role === "predicate") return "#FF7300"; // Orange for predicates
    if (role === "subject") return "#4361EE"; // Vibrant blue for subjects
    if (role === "object") return "#9D4EDD"; // Rich purple for objects
    return "#666666"; // Default gray
  };

  // Process triples to create nodes and links
  triples.forEach(({ subject, predicate, object }) => {
    // Create or update subject node
    if (!nodeMap.has(subject.id)) {
      const subjectNode = {
        id: subject.id,
        label: subject.label,
        isTriple: false,
        color: getNodeColor("subject"),
        role: "subject",
      };
      nodeMap.set(subject.id, subjectNode);
      nodes.push(subjectNode);
    }

    // Create or update predicate node
    if (!nodeMap.has(predicate.id)) {
      const predicateNode = {
        id: predicate.id,
        label: predicate.label,
        isTriple: false,
        color: getNodeColor("predicate"),
        role: "predicate",
      };
      nodeMap.set(predicate.id, predicateNode);
      nodes.push(predicateNode);
    }

    // Create or update object node
    if (!nodeMap.has(object.id)) {
      const objectNode = {
        id: object.id,
        label: object.label,
        isTriple: false,
        color: getNodeColor("object"),
        role: "object",
      };
      nodeMap.set(object.id, objectNode);
      nodes.push(objectNode);
    }

    // Create links
    links.push({
      source: subject.id,
      target: predicate.id,
      type: "subject-to-predicate",
    });
    links.push({
      source: predicate.id,
      target: object.id,
      type: "predicate-to-object",
    });
  });

  return { nodes, links };
};
