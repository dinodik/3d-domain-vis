import React, { useState } from "react";
import { EditableMathField } from "react-mathquill";

interface EquationEditorProps {
    expr: Expression,
    onChange: (expr: Expression) => void,
    left?: boolean,
}

export default function EquationEditor({expr, onChange, left=true}: EquationEditorProps) {
    return (
        <EditableMathField
            style={left ? {textAlign: "right"} : {}}
            className="equationEditor"
            latex={latexFromExpr(expr)}
            onChange={(field) => {
                onChange(exprFromLatex(field.latex()));
            }}
        />
    );

    // TODO
    function latexFromExpr(expr: Expression): TeX {
        return expr as TeX;
    }

    // TODO
    function exprFromLatex(latex: TeX): Expression {
        return latex as Expression;
    }
}