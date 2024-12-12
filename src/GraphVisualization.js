import React, { useEffect, useState, useCallback, useRef } from "react";
import { ForceGraph2D, ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";
import { fetchTriples } from "./api";
import { transformToGraphData } from "./graphData";
import { NODE_COLORS } from "./nodeColors";
import GraphLegend from "./GraphLegend";
import GraphVR from "./GraphVR";
import NodeDetailsSidebar from "./NodeDetailsSidebar";
import LoadingAnimation from "./LoadingAnimation";

const GraphVisualization = ({ endpoint }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [filteredData, setFilteredData] = useState({ nodes: [], links: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [viewMode, setViewMode] = useState("2D");
  const [selectedTriple, setSelectedTriple] = useState(null);
  const [showCreators, setShowCreators] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fgRef = useRef();

  // Filtres
  const [subjectFilter, setSubjectFilter] = useState("");
  const [predicateFilter, setPredicateFilter] = useState("");
  const [objectFilter, setObjectFilter] = useState("");

  // Charger les données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const triples = await fetchTriples(endpoint);
        let baseGraphData = transformToGraphData(triples);

        // Ajouter les créateurs si le toggle est actif
        if (showCreators) {
          baseGraphData = enhanceGraphDataWithCreators(baseGraphData, triples);
        }

        setGraphData(baseGraphData);
        setFilteredData(baseGraphData); // Afficher tout initialement
      } catch (error) {
        console.error("Error loading graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [showCreators, endpoint]);

  const enhanceGraphDataWithCreators = (graphData, triples) => {
    const creatorNodes = [];
    const creatorLinks = [];

    triples.forEach((triple) => {
      const entities = [triple.subject, triple.predicate, triple.object];

      entities.forEach((entity) => {
        if (entity.creatorId) {
          if (
            !creatorNodes.find(
              (node) => node.id === `creator-${entity.creatorId}`
            )
          ) {
            creatorNodes.push({
              id: `creator-${entity.creatorId}`,
              label: `${entity.creatorId}`,
              type: "creator",
              color: NODE_COLORS.CREATOR,
            });
          }

          creatorLinks.push({
            source: `creator-${entity.creatorId}`,
            target: entity.id,
            label: "created",
          });
        }
      });
    });

    return {
      nodes: [...graphData.nodes, ...creatorNodes],
      links: [...graphData.links, ...creatorLinks],
    };
  };

  // Fonction pour appliquer les filtres
const applyFilters = () => {
  console.log("Applying filters...");
  console.log("Subject Filter:", subjectFilter);
  console.log("Predicate Filter:", predicateFilter);
  console.log("Object Filter:", objectFilter);

  // Vérification des liens pour déboguer
  console.log("Links before filtering:", graphData.links);

  const filteredLinks = graphData.links.filter((link) => {
    const subjectMatches =
      !subjectFilter ||
      (typeof link.source === "string"
        ? link.source.toLowerCase().includes(subjectFilter.toLowerCase())
        : link.source?.label
            ?.toLowerCase()
            .includes(subjectFilter.toLowerCase()));

    const predicateMatches =
      !predicateFilter ||
      (typeof link.label === "string"
        ? link.label.toLowerCase().includes(predicateFilter.toLowerCase())
        : false) ||  // Filtrage sur le prédicat
      (typeof link.source === "string"
        ? link.source.toLowerCase().includes(predicateFilter.toLowerCase())
        : link.source?.label
            ?.toLowerCase()
            .includes(predicateFilter.toLowerCase())) ||  // Filtrage aussi sur le sujet (source)
      (typeof link.target === "string"
        ? link.target.toLowerCase().includes(predicateFilter.toLowerCase())
        : link.target?.label
            ?.toLowerCase()
            .includes(predicateFilter.toLowerCase()));  // Filtrage aussi sur l'objet (target)

    const objectMatches =
      !objectFilter ||
      (typeof link.target === "string"
        ? link.target.toLowerCase().includes(objectFilter.toLowerCase())
        : link.target?.label
            ?.toLowerCase()
            .includes(objectFilter.toLowerCase()));

    return subjectMatches && predicateMatches && objectMatches;
  });

  // Déboguer les liens filtrés
  console.log("Filtered Links:", filteredLinks);

  // Identifiez les nœuds impliqués dans les liens filtrés
  const filteredNodeIds = new Set(
    filteredLinks.flatMap((link) => [
      typeof link.source === "string" ? link.source : link.source?.id,
      typeof link.target === "string" ? link.target : link.target?.id,
    ])
  );

  // Filtrer les nœuds pour ne garder que ceux qui sont impliqués dans les liens filtrés
  const filteredNodes = graphData.nodes.filter((node) =>
    filteredNodeIds.has(node.id)
  );

  // Déboguer les nœuds filtrés
  console.log("Filtered Nodes:", filteredNodes);

  // Mettre à jour l'état avec les données filtrées
  setFilteredData({ nodes: filteredNodes, links: filteredLinks });
};


  const handleNodeClick = useCallback(
    async (node) => {
      if (viewMode === "3D" && fgRef.current) {
        const distance = 40;
        const distRatio =
          1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
        fgRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          500
        );
      }

      setSelectedTriple(node);
    },
    [viewMode]
  );

  const handleEngineStop = useCallback(() => {
    if (isInitialLoad && fgRef.current) {
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  return (
    <div>
      {isLoading && <LoadingAnimation />}

      {/* Barre de navigation horizontale */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "#444",
          color: "#fff",
          padding: "10px",
          borderRadius: "4px",
          width: "auto",
        }}
      >
        {/* View mode toggle */}
        <label htmlFor="viewMode" style={{ fontSize: "14px" }}>
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

        {/* Show creators toggle */}
        <label style={{ fontSize: "14px" }}>
          Show Creators
          <input
            type="checkbox"
            checked={showCreators}
            onChange={(e) => setShowCreators(e.target.checked)}
            style={{ marginLeft: "8px" }}
          />
        </label>

        {/* Filtres alignés horizontalement sous l'endpoint */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={subjectFilter}
            onChange={(e) => {
              setSubjectFilter(e.target.value);
              applyFilters();
            }}
            placeholder="Subject"
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "100px",
            }}
          />
          <input
            type="text"
            value={predicateFilter}
            onChange={(e) => {
              setPredicateFilter(e.target.value);
              applyFilters();
            }}
            placeholder="Predicate"
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "100px",
            }}
          />
          <input
            type="text"
            value={objectFilter}
            onChange={(e) => {
              setObjectFilter(e.target.value);
              applyFilters();
            }}
            placeholder="Object"
            style={{
              padding: "5px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "14px",
              width: "100px",
            }}
          />
        </div>
      </div>

      {/* Graphique 2D */}
      {viewMode === "2D" && (
        <ForceGraph2D
          ref={(el) => (fgRef.current = el)}
          graphData={filteredData}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label || "";
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.fillStyle = node.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, node.x, node.y);
          }}
          linkColor={() => "#666"}
          linkDirectionalParticles={1}
          linkDirectionalParticleSpeed={0.02}
          linkDirectionalParticleColor={() => "#fff"}
          nodeAutoColorBy="type"
          onNodeClick={handleNodeClick}
          onEngineStop={handleEngineStop}
        />
      )}

      {/* Graphique 3D */}
      {viewMode === "3D" && (
        <ForceGraph3D
          ref={(el) => (fgRef.current = el)}
          graphData={filteredData}
          controlType="fly"
          nodeLabel="label"
          onNodeClick={handleNodeClick}
          linkColor={() => "#666"}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={0.005}
          nodeAutoColorBy="type"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.label || "");
            sprite.borderRadius = 1;
            sprite.backgroundColor = node.color + "55";
            sprite.padding = 1;
            sprite.color = "#fff";
            sprite.textHeight = 2;
            return sprite;
          }}
          onEngineStop={handleEngineStop}
        />
      )}

      {/* Mode VR */}
      {viewMode === "VR" && (
        <GraphVR graphData={filteredData} onNodeClick={handleNodeClick} />
      )}

      {/* Graph legend */}
      <GraphLegend showCreators={showCreators} />

      {/* Barre latérale de détails */}
      <NodeDetailsSidebar
        triple={selectedTriple}
        onClose={() => setSelectedTriple(null)}
      />
    </div>
  );
};

export default GraphVisualization;
