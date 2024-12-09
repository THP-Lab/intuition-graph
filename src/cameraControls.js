import { useEffect, useRef, useState } from "react";

export const useCameraControls = (fgRef, viewMode) => {
  const [isFreeLookEnabled, setIsFreeLookEnabled] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });

  // Handle spacebar toggle
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.code === "Space") {
        event.preventDefault();
        setIsFreeLookEnabled((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Handle camera controls
  useEffect(() => {
    if (!fgRef.current || viewMode !== "3D") return;

    const graph = fgRef.current;
    const camera = graph.camera();
    const container = graph.renderer().domElement;

    const handleMouseMove = (event) => {
      if (!isFreeLookEnabled) return;

      const { clientX, clientY } = event;
      const deltaX = clientX - mousePos.current.x;
      const deltaY = clientY - mousePos.current.y;

      const rotationSpeed = 0.002;
      camera.rotation.y -= deltaX * rotationSpeed;
      camera.rotation.x -= deltaY * rotationSpeed;
      camera.updateProjectionMatrix();

      mousePos.current = { x: clientX, y: clientY };
    };

    const handleMouseEnter = (event) => {
      mousePos.current = { x: event.clientX, y: event.clientY };
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [fgRef, viewMode, isFreeLookEnabled]);

  // Reset camera controls after node click
  const resetCameraControls = () => {
    if (!fgRef.current || viewMode !== "3D") return;

    const controls = fgRef.current.controls();
    if (!controls) return;

    if (isFreeLookEnabled) {
      controls.enabled = true;
      controls.enableRotate = true;
      controls.enablePan = false;
      controls.enableZoom = false;
    } else {
      controls.enabled = true;
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.enableZoom = true;
    }
  };

  return {
    isFreeLookEnabled,
    resetCameraControls,
    FreeLookIndicator: () =>
      viewMode === "3D" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "10px",
            padding: "4px 8px",
            borderRadius: "4px",
            background: isFreeLookEnabled ? "#4CAF50" : "#f44336",
            transition: "background-color 0.3s",
          }}
        >
          <span style={{ fontSize: "14px" }}>
            Free Look: {isFreeLookEnabled ? "ON" : "OFF"}
          </span>
          <span style={{ fontSize: "12px", opacity: 0.8 }}>(Press Space)</span>
        </div>
      ),
  };
};
