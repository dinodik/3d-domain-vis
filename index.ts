
// document.addEventListener("DOMContentLoaded", (event) => {
//     // const canvas = document.getElementById("canvas") as HTMLCanvasElement;
//     // if (canvas === null) {
//     //     throw new Error("Couldn't find element with id `canvas`");
//     // }
//     // canvas.width = 400;
//     // canvas.height = 400;
//     // const ctx = canvas.getContext("2d");


//     function setFunction(ele: HTMLElement) {
//         if (event.key === 'Enter')
//     }
// });

function onlyOne(checkbox: any): void {
    let checkboxes = Array.from(document.getElementsByClassName(checkbox.className)) as HTMLInputElement[];
    checkboxes.forEach((item) => {
        if (item !== checkbox) item.checked = false;
    });
}

const functionInputEles = Array.from(document.getElementsByClassName("functionInput")) as HTMLElement[];
functionInputEles.forEach(ele => {
    ele.addEventListener("keydown", (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;
        if (event.key === "Enter") {
            const input = target.value;
            calc.setExpression({ id: ele.id, latex: ele.id+'='+input, hidden: true})
        }
    });
});

const sliderInputEles = Array.from(document.getElementsByClassName("scaleSlider")) as HTMLElement[];
sliderInputEles.forEach(ele => {
    ele.addEventListener("input", (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        if (value) {
            calc.setExpression({ id: ele.id, latex: ele.id+'='+value});
        }
    });
});

const ele = document.getElementById('calculator');
if (!ele)
    throw new Error("Couldn't find element with id `calculator`");

let options: Desmos.GraphConfiguration = {
    "expressions": false,
    "settingsMenu": false,
}
let calc = Desmos.GraphingCalculator(ele, options);
setup();


function setup(): void {
    calc.setExpression({ id: "g_2(x)", latex: "g_2(x)=2-0.5*x^2", hidden: true});
    calc.setExpression({ id: "g_1(x)", latex: "g_1(x)=0.5*x^2 - 2", hidden: true});
    calc.setExpression({ id: "f_2", latex: "f_2=2", hidden: true});
    calc.setExpression({ id: "f_1", latex: "f_1=-2", hidden: true});

    calc.setExpression({ id: "top", latex: "y=g_2(x)"});
    calc.setExpression({ id: "bot", latex: "y=g_1(x)"});
    calc.setExpression({ id: "right", latex: "x=f_2"});
    calc.setExpression({ id: "left", latex: "x=f_1"});

    calc.setExpression({ latex: "p_1=0", sliderBounds: {min: "x_1", max: "x_2", step: 0.01}});
    calc.setExpression({ latex: "p_2=0", sliderBounds: {min: "y_1(p_1)", max: "y_2(p_1)", step: 0.01}});
    calc.setExpression({ id: "point", latex: "p = (p_1, p_2)"});

    calc.setExpression({ id: "dx", latex: "d_x=0.15", hidden: true});
    calc.setExpression({ id: "dy", latex: "d_y=0.15", hidden: true});
    calc.setExpression({ id: "b_{x1}", latex: "b_{x1}=0.9", hidden: true});
    calc.setExpression({ id: "b_{x2}", latex: "b_{x2}=0.9", hidden: true});
    calc.setExpression({ id: "b_{y1}", latex: "b_{y1}=0.5", hidden: true});
    calc.setExpression({ id: "b_{y2}", latex: "b_{y2}=0.5", hidden: true});
    calc.setExpression({ id: "x_1", latex: "x_1=(f_1+f_2)/2 + b_{x1}*(f_1-f_2)/2", hidden: true});
    calc.setExpression({ id: "x_2", latex: "x_2=(f_1+f_2)/2 - b_{x2}*(f_1-f_2)/2", hidden: true});
    calc.setExpression({ id: "y_1", latex: "y_1(x)=(g_1(x)+g_2(x))/2 + b_{y1}*(g_1(x)-g_2(x))/2", hidden: true});
    calc.setExpression({ id: "y_2", latex: "y_2(x)=(g_1(x)+g_2(x))/2 - b_{y2}*(g_1(x)-g_2(x))/2", hidden: true});

    slice();
}

function clearExtra(): void {
    calc.getExpressions().forEach(function (exp: Desmos.ExpressionState) {
        let id = exp.id;
        if (id && id[0] === '_')
            calc.removeExpression({ id: id });
    })
}

function segment(): void {
    clearExtra();
    calc.setExpression({ id: "b_{x1}", latex: "b_{x1}=1"});
    calc.setExpression({ id: "b_{x2}", latex: "b_{x2}=1"});
    // calc.setExpression({ id: "b_y1", latex: "b_{y1}=0.1"});
    // calc.setExpression({ id: "b_y2", latex: "b_{y2}=0.1"});
    calc.setExpression({ id: "_segment", latex: "x=p_1 \\{p_2-d_y < y < p_2+d_y\\}"});
}

function line(): void {
    clearExtra();
    calc.setExpression({ id: "_line", latex: "x=p_1 \\{y_1(p_1) <= y <= y_2(p_1)\\}" })
}

function slice(): void {
    clearExtra();
    calc.setExpression({ id: "_slice", latex: "y_1(x) <= y <= y_2(x) \\{p_1-d_x <= x <= p_1+d_x\\}" })
}

function area(): void {
    clearExtra();
    calc.setExpression({ id: "_areaPos", latex: "y_1(x) <= y <= y_2(x) \\{x_1 <= x <= x_2\\}"});
    calc.setExpression({ id: "_areaNeg", latex: "y_2(x) <= y <= y_1(x) \\{x_1 <= x <= x_2\\}"});
}
