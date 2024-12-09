import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

export const useCameraControls = (fgRef, viewMode) => {
  const [isFreeLookEnabled, setIsFreeLookEnabled] = useState(false);
  const camera = useRef(null);
  const isInitialized = useRef(false);
  const animationFrameId = useRef(null);

  // Initialize our own camera
  const initCamera = useCallback(() => {
    if (!fgRef.current || viewMode !== "3D" || isInitialized.current) return;

    const graph = fgRef.current;

    // Create our custom camera
    camera.current = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.current.position.z = 150;
    camera.current.position.y = 50;

    // Replace the graph's camera and disable default controls
    if (graph.controls()) {
      graph.controls().dispose();
    }
    graph._camera = camera.current;
    isInitialized.current = true;

    // Handle window resize
    const handleResize = () => {
      camera.current.aspect = window.innerWidth / window.innerHeight;
      camera.current.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Set up WASD movement
    const moveSpeed = 1;
    const keyState = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() in keyState) {
        event.preventDefault();
        keyState[event.key.toLowerCase()] = true;
      }
    };

    const handleKeyUp = (event) => {
      if (event.key.toLowerCase() in keyState) {
        keyState[event.key.toLowerCase()] = false;
      }
    };

    const updatePosition = () => {
      if (!camera.current) return;

      const moveDirection = new THREE.Vector3();

      // Get camera's view direction
      const viewDirection = new THREE.Vector3(0, 0, -1);
      viewDirection.applyQuaternion(camera.current.quaternion);

      // Calculate forward and right vectors
      const forward = viewDirection.clone();
      forward.y = 0; // Keep movement horizontal
      forward.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(new THREE.Vector3(0, 1, 0), forward);
      right.normalize();

      // Apply movement based on key states
      if (keyState.w) moveDirection.add(forward);
      if (keyState.s) moveDirection.sub(forward);
      if (keyState.a) moveDirection.sub(right);
      if (keyState.d) moveDirection.add(right);

      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        camera.current.position.add(moveDirection.multiplyScalar(moveSpeed));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Set up continuous rendering loop
    const animate = () => {
      if (camera.current && graph.renderer() && graph.scene()) {
        updatePosition();
        camera.current.updateProjectionMatrix();
        graph.renderer().render(graph.scene(), camera.current);
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      isInitialized.current = false;
    };
  }, [fgRef, viewMode]);

  // Initialize camera when component mounts or viewMode changes
  useEffect(() => {
    const cleanup = initCamera();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initCamera, viewMode]);

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

  // Handle mouse movement
  useEffect(() => {
    if (!camera.current || viewMode !== "3D") return;

    const handleMouseMove = (event) => {
      if (!isFreeLookEnabled && !event.buttons) return;

      const { movementX, movementY } = event;
      const rotationSpeed = 0.002;

      // Update camera rotation using quaternions
      const rotationX = new THREE.Quaternion();
      rotationX.setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        -movementY * rotationSpeed
      );

      const rotationY = new THREE.Quaternion();
      rotationY.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        -movementX * rotationSpeed
      );

      // Apply rotations in the correct order
      camera.current.quaternion.multiplyQuaternions(
        rotationY,
        camera.current.quaternion
      );
      camera.current.quaternion.multiplyQuaternions(
        rotationX,
        camera.current.quaternion
      );

      // Clamp vertical rotation
      const euler = new THREE.Euler().setFromQuaternion(
        camera.current.quaternion
      );
      euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
      camera.current.quaternion.setFromEuler(euler);

      camera.current.updateProjectionMatrix();
    };

    const container = fgRef.current.renderer().domElement;
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [fgRef, viewMode, isFreeLookEnabled]);

  // Function to move camera to a node
  const moveToNode = useCallback(
    async (node) => {
      if (!camera.current || viewMode !== "3D") return;

      const distance = 40;
      const distRatio =
        1 + distance / Math.hypot(node.x || 1, node.y || 1, node.z || 1);
      const targetPos = new THREE.Vector3(
        node.x * distRatio,
        node.y * distRatio,
        node.z * distRatio
      );

      // Smoothly move camera to target
      const startPos = camera.current.position.clone();
      const duration = 500;
      const startTime = Date.now();

      return new Promise((resolve) => {
        const animate = () => {
          const now = Date.now();
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease function
          const t =
            progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;

          camera.current.position.lerpVectors(startPos, targetPos, t);
          camera.current.updateProjectionMatrix();

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            resolve();
          }
        };
        animate();
      });
    },
    [viewMode]
  );

  return {
    isFreeLookEnabled,
    moveToNode,
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
