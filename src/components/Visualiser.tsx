import React, { useEffect, useMemo } from "react"
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as utils from "../utils";
import { DoubleSide } from "three";

// run on init
const domainConfig: DomainConfig = {
    y: [{ transparent: false, hidden: false }, { transparent: false, hidden: false }],
    z: [{ transparent: false, hidden: false }, { transparent: false, hidden: false }],
    x: [{ transparent: false, hidden: false }, { transparent: false, hidden: false }],
}

const config = {
    extendTo3D: false,
    domainConfig: domainConfig,
};

interface VisualiserProps {
    domain: Domain,
    ranges: Ranges,
}

export const Visualiser: React.FC<VisualiserProps> = ({
    domain,
    ranges
}) => {
    const volume = useMemo<MeshInfo[]>(
        () => {
            const idomain = utils.interpolateDomain(domain, ranges);
            return utils.createVolume(idomain);
        },
        [domain, ranges],
    );

    return (
        <Canvas orthographic camera={{zoom: 50, position: [0, 3, 15]}}>
            <ambientLight intensity={1} />
            <pointLight intensity={100} position={[5, 10, 5]} />
            <group>
                {volume.map((mesh, i) => 
                    <mesh key={i}>
                        <bufferGeometry>
                            <bufferAttribute
                                attach="attributes-position"
                                array={mesh.vertices}
                                count={mesh.vertices.length / 3}
                                itemSize={3}
                            />
                            <bufferAttribute
                                attach="attributes-normal"
                                array={mesh.normals}
                                count={mesh.normals.length / 3}
                                itemSize={3}
                            />
                            <bufferAttribute
                                attach="index"
                                array={new Uint16Array(mesh.indices)}
                                count={mesh.indices.length}
                                itemSize={1}
                            />
                        </bufferGeometry>
                        <meshStandardMaterial side={DoubleSide} />
                        {/* <meshBasicMaterial wireframe /> */}
                    </mesh>
                )}
            </group>
            <OrbitControls />
        </Canvas>
    );
};