import React, { useState } from "react";
import OrderPanel from "./OrderPanel"
import DomainPanel from "./DomainPanel"
import IntegratorPanel from "./IntegratorPanel"

export default function Panel() {
    const [order, setOrder]  = useState<Order>(['z', 'y', 'x']);
    const position: Vec3 = [0.5, 1, 0];
    const [latexRanges, setLatexRanges] = useState<ExprRange3>(
        [
            ["\\sin{x}", "4"],
            ["0", "2"],
            ["-1", "1"]
        ],
    );
    const [rangeScales, setRangeScales] = useState<[Vec2, Vec2, Vec2]>(
        [
            [0.2, 0.7],
            [0.4, 0.5],
            [0.1, 0.3],
        ],
    );
    return (
        <div className="panel">
            <OrderPanel order={order} setOrder={setOrder}/>
            <DomainPanel
                order={order}
                ranges={latexRanges}
                rangeScales={rangeScales}
                setRanges={setLatexRanges}
                setRangeScales={setRangeScales}
            />
            <IntegratorPanel/>
        </div>
    );
}