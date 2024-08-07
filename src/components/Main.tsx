import React, { useState } from "react"
import Panel from "./Panel"
import { Visualiser } from "./Visualiser"

export const Main: React.FC = () => {
    const [domain, setDomain] = useState<Domain>({
        y: [
            (x, z) => -2,
            (x, z) => Math.cos(Math.sqrt(x**2 + z**2)) + 2,
        ],
        z: [
            (x) => 0.1*x**2 - 4,
            (x) => Math.sin(x) + 4,
        ],
        x: [
            () => -5,
            () => 5,
        ]
    });

    const [ranges, setRanges] = useState<Ranges>({
        y: [0, 1],
        z: [0, 1],
        x: [0, 1],
    });

    return (
        <div className="main">
            <Visualiser domain={domain} ranges={ranges}/>
            <Panel/>
        </div>
    )
}
