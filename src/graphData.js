// src/graphData.js
export const transformToGraphData = (triples) => {
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  triples.forEach(({ subject, predicate, object }) => {
    const [subLabel, predLabel, objLabel] = [
      subject.label,
      predicate.label,
      object.label,
    ];

    // Ensure unique nodes
    [subLabel, predLabel, objLabel].forEach((label) => {
      if (!nodeMap.has(label)) {
        const node = { id: label, label, isTriple: false };
        nodeMap.set(label, node);
        nodes.push(node);
      }
    });

    // Add a triple as a "composite" node
    const tripleId = `${subLabel}-${predLabel}-${objLabel}`;
    const tripleNode = { id: tripleId, label: predLabel, isTriple: true };
    nodes.push(tripleNode);

    // Create directed links representing the triple relationship
    // subject -> predicate -> object
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
