import React, { useMemo, useState } from "react";
import { ExpressionBox } from "./ExpressionBox"
import RangeSlider from "./RangeSlider"
import { isSymbolNode, MathNode, parse, SymbolNode } from "mathjs";

const renderOrder: Order = ['y', 'z', 'x'];


interface DomainPanelProps {
    order: Order,
    ranges: Ranges,
    setRanges: (ranges: Ranges) => void,
    onCodeChange: (axis: XYZ, isUpper: boolean, tex: string) => void,
    initTex: Record<XYZ, string[]>,
};

export const DomainPanel: React.FC<DomainPanelProps> = ({
    order,
    ranges, setRanges,
    onCodeChange,
    initTex,
}) => {
    const handleRanges = (axis: XYZ, newRange: [number, number]) => {
        setRanges({...ranges, [renderOrder[order.indexOf(axis)]]: newRange} as Ranges);
    };

    const rows = order.map((axis, i) => (
        <div className="domainRow" key={axis}>
            <ExpressionBox
                initialTex={initTex[axis][0]}
                onChange={((newTex: string) => onCodeChange(axis, false, newTex))}
                rightAlign={true} />
            <RangeSlider values={ranges[renderOrder[i]]} setValues={(newRange: [number, number]) => handleRanges(axis, newRange)} />
            <ExpressionBox
                initialTex={initTex[axis][1]}
                onChange={((newTex: string) => onCodeChange(axis, true, newTex))}
            />
        </div>
    ));

    return (
        <div className="domainList">{rows}</div>
    );
}