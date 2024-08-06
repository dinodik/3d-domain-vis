import React from "react";
import { createRoot } from "react-dom/client";
import Panel from "./components/Panel"

import { Canvas } from "@react-three/fiber"


const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <React.StrictMode>
        <div className="canvas-container">
            <Canvas>
            <ambientLight intensity={0.1} />
            <directionalLight color="red" position={[0, 0, 5]} />
            <mesh>
                <sphereGeometry />
                <meshNormalMaterial />
            </mesh>
            </Canvas>
        </div>
        <Panel/>
    </React.StrictMode>
);