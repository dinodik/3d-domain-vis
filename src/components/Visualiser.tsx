import React, { useEffect, useMemo, useRef } from "react"
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as utils from "../utils";
import { BufferAttribute, BufferGeometry, DoubleSide, FrontSide, BackSide, Group, Mesh, MeshStandardMaterial, Matrix4, MeshNormalMaterial } from "three";

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
    order: Order,
}

const bases: Record<XYZ, number[]> = {
    x: [1, 0, 0, 0],
    y: [0, 0, -1, 0],
    z: [0, 1, 0, 0],
}

const renderOrder: Order = ['y', 'z', 'x'];

export const Visualiser: React.FC<VisualiserProps> = ({
    domain,
    ranges,
    order,
}) => {
    const volumeGeometry = useMemo<BufferGeometry[]>(
        () => {
            const idomain = utils.interpolateDomain(domain, ranges);
            return utils.createVolume(idomain).map(info => {
                const geometry = new BufferGeometry();
                geometry.setIndex(info.indices);
                geometry.setAttribute("position", new BufferAttribute(info.vertices, 3));
                geometry.setAttribute("normal", new BufferAttribute(info.vertices, 3));
                return geometry;
            });
        },
        [domain, ranges],
    );

    const matrix: Matrix4 = useMemo<Matrix4>(
        () => {
            const a: number[] = [];
            a.push(...bases[order[2]]);
            a.push(...bases[order[0]]);
            a.push(...bases[order[1]]);
            a.push(...[0, 0, 0, 1]);
            return (new Matrix4()).fromArray(a);
        },
        [order],
    );

    return (
        // TODO use useThree() for width and height
        <Canvas orthographic camera={{zoom: 50, position: [0, 3, 15]}}>
            <ambientLight intensity={1} />
            <pointLight intensity={100} position={[5, 10, 5]} />
            {volumeGeometry.map((geometry, i) => 
                <mesh key={i} geometry={geometry} matrix={matrix} matrixAutoUpdate={false}>
                    {/* <meshStandardMaterial /> */}
                    <meshNormalMaterial />
                    {/* <meshBasicMaterial wireframe /> */}
                </mesh>
            )}
            <OrbitControls />
        </Canvas>
    );
};