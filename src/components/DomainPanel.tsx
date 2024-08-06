import React, { useState } from "react";
import EquationEditor from "./EquationEditor"
import RangeSlider from "./RangeSlider"

interface DomainProps {
    order: Order,
    ranges: ExprRange3,
    rangeScales: [Vec2, Vec2, Vec2],
    setRanges: (ranges: ExprRange3) => void,
    setRangeScales: (rangeScales: [Vec2, Vec2, Vec2]) => void,
};

export default function DomainPanel({order, ranges, rangeScales, setRanges, setRangeScales}: DomainProps) {
    const [exprs, setExprs] = useState<Expression[]>(ranges.flat());
    const rows = order.map((coord, i) => (
        <div className="domainRow" key={coord}>
            <EquationEditor expr={exprs[2*i+0]} onChange={((newExpr: Expression) => handleExprChange(2*i+0, newExpr))}/>
            <RangeSlider values={rangeScales[i]} setValues={(newRangeScale: Vec2) => handleRangeScaleChange(i, newRangeScale)} />
            <EquationEditor expr={exprs[2*i+1]} onChange={((newExpr: Expression) => handleExprChange(2*i+1, newExpr))} left={false}/>
        </div>
    ));

    return (
        <div className="domainList">{rows}</div>
    );

    function handleExprChange(idx: number, newExpr: Expression) {
        setExprs(exprs.map((expr, i) => {
            if (i === idx) {
                return newExpr;
            } else {
                return expr;
            }
        }));
    }

    function handleRangeScaleChange(idx: number, newRangeScale: Vec2) {
        setRangeScales(rangeScales.map((rangeScale, i) => {
            if (i === idx) {
                return newRangeScale;
            } else {
                return rangeScale;
            }
        }) as [Vec2, Vec2, Vec2]);
    }
}