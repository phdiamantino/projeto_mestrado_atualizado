//FLAGPC
function getContainerDimensions() {
    const container = document.getElementById("parallelCordinates");
    const rect = container.getBoundingClientRect();
    return {
        width: Math.max(300, rect.width - 20), 
        height: Math.max(200, rect.height - 20) 
    };
}
// Construindo margens dinâmicas
const MARGIN = {LEFT: 50, RIGHT: 10, TOP: 50, BOTTOM: 20};
let containerDims = getContainerDimensions();
let WIDTH = containerDims.width - MARGIN.LEFT - MARGIN.RIGHT;
let HEIGHT = containerDims.height - MARGIN.TOP - MARGIN.BOTTOM;

// SVG responsivo
const svgPC = d3.select("#parallelCordinates").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("display", "block")
    .append("g")
    .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

const debts = []; 

var tooltipPC = d3.select("#parallelCordinates")
    .style("font-family", "Verdana")
    .append("div").attr("class", "remove")
    .style("position", "absolute")
    .style("background-color", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("visibility", "hidden")
    .style("z-index", "1000");

let dataPC = [];
let currentDataPC = [];
let xPC, yPC = {}, g, foreground, dragging = {};
let dimensions = [];
let dataset = [];

window.resizePC = function() {
    const newDims = getContainerDimensions();
    WIDTH = newDims.width - MARGIN.LEFT - MARGIN.RIGHT;
    HEIGHT = newDims.height - MARGIN.TOP - MARGIN.BOTTOM;

    svgPC.selectAll("*").remove();

    const selectedPC = d3.select("#selectRep").node().value || "jUnit";
    updatePC(selectedPC);
};
window.addEventListener("resize", resizePC);
    if (xPC && dimensions.length > 0) {
        xPC.range([0, WIDTH]);
        // Atualizar escalas Y
        dimensions.forEach(function(d) {
            if (yPC[d]) {
                yPC[d].range([HEIGHT, 0]);
            }
        });
        if (g) {
            g.attr("transform", d => "translate(" + xPC(d) + ")");
            
            g.selectAll(".axis")
                .each(function(d) { 
                    d3.select(this).call(d3.axisLeft().scale(yPC[d])); 
                });
        }

        if (foreground && dataset.length > 0) {
            foreground.attr("d", path);
        }
    }


d3.json("data/rm_technical_debt.json").then(function(data) {
    dataPC = data;
    updatePC("jUnit");

    // Atualização dinâmica via dropdown
    d3.select('.form-group')
        .on("change", function(){
            var selectedPC = d3.select("#selectRep").node().value;
            console.log(selectedPC);
            svgPC.selectAll("*").remove();
            updatePC(selectedPC);
        });
});

function updatePC(selectedPC) {
    console.log("Updating to repository:", selectedPC);
    // Atualizar dimensões antes de desenhar
    const newDims = getContainerDimensions();
    WIDTH = newDims.width - MARGIN.LEFT - MARGIN.RIGHT;
    HEIGHT = newDims.height - MARGIN.TOP - MARGIN.BOTTOM;

    // Limpar variáveis globais
    dragging = {};
    dimensions = [];
    dataset = [];

    if (selectedPC == 'jUnit'){ 
        const data = dataPC.slice(0,754);
        currentDataPC = data;
        const tm = data.length;

        // Limpar array de debts
        debts.length = 0;
        for (let i=0; i<tm; i++){
            for (let j=0; j< data[i].debts.length; j++){
                debts.push(data[i].debts[j].name);
            }
        }

        var priority_order = ["CODE_DEBT", "UNKNOWN_DEBT", "DEFECT_DEBT", 
        "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"];

        // Substituição do d3.nest por d3.group
        const byVersion = Array.from(d3.group(data, d => d.reference, d => d.debts[d.debts.length -1].name));
        
        const byVersionFormatted = Array.from(byVersion, ([key, values]) => {
            const grouped = Array.from(values, ([subKey, subValues]) => ({
                key: subKey,
                values: subValues
            }));
            
            // Ordenar pelos priority_order
            grouped.sort((a, b) => priority_order.indexOf(a.key) - priority_order.indexOf(b.key));
            
            return {
                key: key,
                values: grouped
            };
        });

        // PRE PROCESSAMENTO
        dataset = new Array();
        for (let version_pc in byVersionFormatted){
            dataset[version_pc] = {key: byVersionFormatted[version_pc].key, values:{}};
            let len = byVersionFormatted[version_pc].values.length;
            let keys = byVersionFormatted[version_pc].values.map(d=>(d.key));
            dataset[version_pc].values = new Array();
            for (let dt in priority_order){
                dataset[version_pc].values[dt] = {key:priority_order[dt], values:function(){}};
            }
        }
        
        for (let version_pc in dataset){
            let len = dataset[version_pc].values.length;
            let keys = byVersionFormatted[version_pc].values.map(d=>(d.key));
            let values = byVersionFormatted[version_pc].values.map(d=>(d.values));
            let t=0;
            while (t<len){
                dataset[version_pc].values[t] = {key:priority_order[t],
                    values: keys.indexOf(dataset[version_pc].values[t].key) == -1? ""
                            :values[t] == undefined?values[t-1] :values[t]                                  
                };
                t++;
            }
        }

        const byDebts = Array.from(d3.rollup(data, 
            v => v.length, 
            d => d.debts[d.debts.length -1].name,
            d => d.reference
        ));

        const byDebtsFormatted = Array.from(byDebts, ([key, values]) => {
            const subValues = Array.from(values, ([subKey, subValue]) => ({
                key: subKey,
                value: subValue
            }));
            
            subValues.sort((a, b) => priority_order.indexOf(a.key) - priority_order.indexOf(b.key));
            
            return {
                key: key,
                values: subValues
            };
        });

        dimensions = [];
        for (let i in byDebtsFormatted){ dimensions.push(byDebtsFormatted[i].key); }

        var versoes = [];
        for (let i in byVersionFormatted){ versoes.push(byVersionFormatted[i].key); }
        versoes = versoes.sort();
        versoes.push(versoes.splice(0,1)[0]);

        const dts = new Array();
        for (let version_pc in byDebtsFormatted){
            dts[version_pc] = {key: byDebtsFormatted[version_pc].key, values:{}};
            let len = byDebtsFormatted[version_pc].values.length;
            let keys = byDebtsFormatted[version_pc].values.map(d=>(d.key));
            dts[version_pc].values = new Array();
            for (let v in versoes){
                dts[version_pc].values[v] = {key:versoes[v], values:function(){}};
            }
        }
        
        for (let dt in dts){
            let len = dts[dt].values.length;
            let keys = byDebtsFormatted[dt].values.map(d=>(d.key));
            let values = byDebtsFormatted[dt].values.map(d=>(d.value));
            let t=0;
            while (t<len){
                dts[dt].values[t] = {key:versoes[t],
                    values: keys.indexOf(dts[dt].values[t].key) == -1? 0
                            :values[t] == undefined?values[keys.indexOf(dts[dt].values[t].key)] :values[t]                                  
                };
                t++;
            }
        }

        xPC = d3.scalePoint()
            .domain(dimensions)
            .range([0, WIDTH])
            .padding(0.2);

        yPC = {};
        dimensions.forEach(function(d,i) { 
            yPC[d] = d3.scaleLinear()
                .domain([(byDebtsFormatted[i]["values"].length >=byVersionFormatted.length)? d3.min(byDebtsFormatted[i]["values"], d => d.value): 0,
                        d3.max(byDebtsFormatted[i]["values"], d => d.value)])
                .range([HEIGHT, 0]);
        });

        function path(d) {
            let valuesMap = {};
            
            d.values.forEach(item => {
                if (item && item.values && item.values.length !== undefined) {
                    valuesMap[item.key] = item.values.length;
                } else {
                    valuesMap[item.key] = 0; 
                }
            });

            return d3.line()(dimensions.map(dimension => {
                const value = valuesMap[dimension] || 0; 
                return [position(dimension), yPC[dimension](value)];
            }));
        }
        function position(d) {
            var v = dragging[d];
            return v == null ? xPC(d) : v;
        }

        function transition(g) {
            return g.transition().duration(500);    
        }

        g = svgPC.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", d => "translate(" + xPC(d) + ")")
            .call(d3.drag()
                .on("start", function(event, d) {
                    dragging[d] = xPC(d);
                })
                .on("drag", function(event, d) {
                    dragging[d] = Math.min(WIDTH, Math.max(0, event.x));
                    foreground.attr("d", path);
                    dimensions.sort((a,b) => position(a) - position(b));
                    xPC.domain(dimensions);
                    g.attr("transform", d => "translate(" + position(d) + ")");
                })
                .on("end", function(event, d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + xPC(d) + ")");
                    transition(foreground).attr("d", path);
                }));

        // Add eixos
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yPC[d])); });
            
        g.append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .text(d => d.replace("_", " "))  
            .style("font-size", "11px")
            .attr("transform", "rotate(-15)");

        foreground = svgPC.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(dataset)
            .enter().append("path")
            .attr("d", path)
            .attr("class", d => d.key)
            .style("fill", "none")
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("stroke-opacity", "0.7");

        
foreground
    .on("click", function(event, d) {
        foreground
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("opacity", "0.7");
        d3.select(this)
            .style("stroke", "green")
            .style("stroke-width", "2.5px")
            .style("opacity", "1");
        
        if (typeof reDraw === 'function') {
            reDraw(d);
        }
        if (typeof reDrawTR === 'function') {
            reDrawTR(d);
        }
        if (typeof reDrawMP === 'function') {
            reDrawMP(d);
        }
    })
    .on("dblclick", function(event, d) {
        // Resetar todas as linhas para o estado original
        foreground
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("opacity", "0.7");
        // Resetar o Sunburst
        if (typeof svgSB !== 'undefined') {
            svgSB.selectAll("*").remove();
            svgGroup = svgSB.append("g");
            
            if (typeof updateVisualization === 'function' && currentDataPC) {
                updateVisualization(currentDataPC);
            }
        }
        
        // Correção: Reset completo da projeção multidimensional
        if (typeof circles !== 'undefined') {
            circles.style("fill", d => typeof colorMP === 'function' ? colorMP(d[3]+1) : 'steelblue');
            circles.attr("class", "non_brushed");
        }
        
        // Restaurar dados originais da MP
        if (typeof currentDataPC !== 'undefined') {
            window.currentDataaux = currentDataPC; // Garantir que currentDataaux seja restaurado
        }
        
        // Resetar zoom da MP
        if (typeof svgMP !== 'undefined' && typeof zoom !== 'undefined') {
            svgMP.call(zoom);
        }
        
        // Limpar tooltip do bar graph
        if (typeof tooltipBarGraph !== 'undefined') {
            tooltipBarGraph.selectAll("*").remove();
        }
        
        // Limpar tabela da MP
        if (typeof clearMPTableRows === 'function') {
            clearMPTableRows();
        }
        if (typeof restoreMPHighlight === 'function') {
            restoreMPHighlight();
        } else {
            // Fallback: recriar eventos de highlight se a função não existir
            if (typeof circles !== 'undefined' && typeof reDrawMP === 'function') {
                // Reativar eventos de click nos círculos da MP
                circles.on("click", function(event, datum) {
                    const correspondingVersion = dataset.find(version => {
                        return version.key === datum.reference; 
                    });
                    if (correspondingVersion) {
                        reDrawMP(correspondingVersion);
                    }
                });
            }
        }
        
        if (typeof resetTR === 'function') {
            resetTR();
        }
    })
            .on("mouseover", function(event, d) {
                const [mouseX, mouseY] = d3.pointer(event, document.getElementById("parallelCordinates"));
                tooltipPC.html("Version " + "<b>" + d.key + "</b>" + "<br>" + " Total debts in this version: " 
                                + "<b>" + d3.sum(d.values, j => j.values.length) + "</b>")
                    .style("visibility", "visible")
                    .style("left", (mouseX + 10) + "px")
                    .style("top", (mouseY - 10) + "px");
                d3.select(this)
                    .style("stroke", "orange")
                    .style("stroke-width", "3px");
            })
            .on("mouseout", function() {
                tooltipPC.style("visibility", "hidden");
                d3.select(this)
                    .style("stroke", "steelblue")
                    .style("stroke-width", "1.5px");
            });

        window.reDraw = function(name_version){
            if (typeof svgSB !== 'undefined') {
                svgSB.selectAll("*").remove();
                let version_clicked = name_version.key;
                console.log("Version clicked:", version_clicked);

                let data_filter = currentDataPC.filter(function(item){
                    return item.reference === version_clicked;
                });

                svgGroup = svgSB.append("g");
                updateSVGPosition();

                if (typeof updateVisualization === 'function') {
                    updateVisualization(data_filter);
                }
            }
        }; 

window.reDrawTR = function(name_version) {
    if (tooltipBarGraph) {
        tooltipBarGraph.selectAll("*").remove();
    }
    
    // Obtém a versão clicada
    const version_clicked = name_version.key;
    console.log("Version clicked for Theme River:", version_clicked);
    
    const data_filter = window.currentTRData.filter(function(d) { 
        return d.reference === version_clicked; 
    });
    
    if (typeof highlightTR === 'function') {
        highlightTR(version_clicked);
    }
    
    d3.select("#barGraph").style("visibility", "visible");
    
    const xBar = d3.scaleBand()
        .domain([version_clicked])
        .rangeRound([5, 60]);
    
    tooltipBarGraph.append("g")
        .attr("transform", "translate(-1," + 173 + ")")
        .call(d3.axisBottom(xBar));

    function unique(value, index, self) { 
        return self.indexOf(value) === index;
    }

    let keysBar, colorBar, dataset2;
    const group = d3.select("#custom-select-tr").node().value;
    
    if (group === 'Quintil') { 
        keysBar = [0,1,2,3,4];
        colorBar = d3.scaleLinear()
            .domain(keysBar)   
            .range(d3.schemeYlOrBr[5]);
        
 const dataBar = Array.from(
    d3.group(data_filter, d => d.Quintil),
    ([key, values]) => ({ key, values })
);

        const dataset = dataBar.map(function(d,k) {
            return {
                "key": parseInt(d.key),
                "reference": d.values.map(s => s.reference).filter(unique)[0],
                "score": d3.sum(d.values.map(s => s.score))
            };
        });
        
        dataset2 = [{
            "reference": version_clicked,
            "1": dataset[0]?.score || 0,
            "2": dataset[1]?.score || 0,
            "3": dataset[2]?.score || 0,
            "4": dataset[3]?.score || 0,
            "5": dataset[4]?.score || 0
        }];
    } else {
        keysBar = [0,1,2,3,4,5,6,7,8,9];
        colorBar = d3.scaleLinear()
            .domain(keysBar)   
            .range(d3.schemeYlOrBr[7]);

const dataBar = Array.from(
    d3.group(data_filter, d => d.Decil), 
    ([key, values]) => ({
        key: key,
        values: values
    })
);
        
        const dataset = dataBar.map(function(d,k) {
            return {
                "key": parseInt(d.key),
                "reference": d.values.map(s => s.reference).filter(unique)[0],
                "score": d3.sum(d.values.map(s => s.score))
            };
        });
        
        dataset2 = [{
            "reference": version_clicked,
            "1": dataset[0]?.score || 0,
            "2": dataset[1]?.score || 0,
            "3": dataset[2]?.score || 0,
            "4": dataset[3]?.score || 0,
            "5": dataset[4]?.score || 0,
            "6": dataset[5]?.score || 0,
            "7": dataset[6]?.score || 0,
            "8": dataset[7]?.score || 0,
            "9": dataset[8]?.score || 0,
            "10": dataset[9]?.score || 0
        }];
    }
    
    const stackedBar = d3.stack()
        .keys(Object.keys(dataset2[0]).filter(k => k !== 'reference'))
        (dataset2);
        
            tooltipBarGraph.append("g")
                .selectAll("g")
                .data(stackedBar)
                .enter().append("g")
                .attr("fill", d => colorBar(d.key))
                .selectAll("rect")
                .data(d => d)
                .enter().append("rect")
                .attr("class","rects")
                .attr("x", d => xBar(d.data.reference))
                .attr("y", d => yBar(d[1]))
                .attr("height", d => yBar(d[0]) - yBar(d[1]))
                .attr("width", xBar.bandwidth());
                    
        tooltipBarGraph
            .on("mousemove", function(event) {
                const [x, y] = d3.pointer(event);
                
                // Posicionamento relativo ao container #barGraph
                divTooltip
                    .style("left", (x) + "px")
                    .style("top", (y - 15) + "px")
                    .style("display", "block");
                
                // Cálculo dos valores
                var id = stackedBar.length - 1;
                var all = stackedBar[id][0][1];
                var elements = document.querySelectorAll(':hover');
                var element = elements[elements.length - 1].__data__;
                var value = element[1] - element[0];
                var percentual = value * 100 / all;
                
                // Conteúdo formatado
                divTooltip.html(`<b>${percentual.toFixed(2)}%</b><br>${value.toFixed(2)}`);
            })
            .on("mouseout", function() {
                divTooltip.style("display", "none");
            });
};
            
    } else {
        // Código para Apache
        const data = dataPC.slice(755,6838);
        currentDataPC = data;
        const tm = data.length;
        
        debts.length = 0;
        for (let i=0; i<tm; i++){
            for (let j=0; j< data[i].debts.length; j++){
                debts.push(data[i].debts[j].name);
            }
        }

        var priority_order =["BUILD_DEBT", "DOCUMENTATION_DEBT", "CODE_DEBT", "UNKNOWN_DEBT", 
        "DEFECT_DEBT", "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"];

        const byVersion = Array.from(d3.group(data, d => d.reference, d => d.debts[d.debts.length -1].name));
        
        const byVersionFormatted = Array.from(byVersion, ([key, values]) => {
            const grouped = Array.from(values, ([subKey, subValues]) => ({
                key: subKey,
                values: subValues
            }));
            
            grouped.sort((a, b) => priority_order.indexOf(a.key) - priority_order.indexOf(b.key));
            
            return {
                key: key,
                values: grouped
            };
        });

        // PRE PROCESSAMENTO
        dataset = new Array();
        for (let version_pc in byVersionFormatted){
            dataset[version_pc] = {key: byVersionFormatted[version_pc].key, values:{}};
            let len = byVersionFormatted[version_pc].values.length;
            let keys = byVersionFormatted[version_pc].values.map(d=>(d.key));
            dataset[version_pc].values = new Array();
            for (let dt in priority_order){
                dataset[version_pc].values[dt] = {key:priority_order[dt], values:function(){}};
            }
        }
        
        for (let version_pc in dataset){
            let len = dataset[version_pc].values.length;
            let keys = byVersionFormatted[version_pc].values.map(d=>(d.key));
            let values = byVersionFormatted[version_pc].values.map(d=>(d.values));
            let t=0;
            while (t<len){
                dataset[version_pc].values[t] = {key:priority_order[t],
                    values: keys.indexOf(dataset[version_pc].values[t].key) == -1? ""
                            :values[t] == undefined?values[t-1] :values[t]                                  
                };
                t++;
            }
        }

        const byDebts = Array.from(d3.rollup(data, 
            v => v.length, 
            d => d.debts[d.debts.length -1].name,
            d => d.reference
        ));
        const byDebtsFormatted = Array.from(byDebts, ([key, values]) => {
            const subValues = Array.from(values, ([subKey, subValue]) => ({
                key: subKey,
                value: subValue
            }));
            
            subValues.sort((a, b) => priority_order.indexOf(a.key) - priority_order.indexOf(b.key));
            
            return {
                key: key,
                values: subValues
            };
        });
            
        dimensions = [];
        for (let i in byDebtsFormatted){ dimensions.push(byDebtsFormatted[i].key); }

        var versoes = [];
        for (let i in byVersionFormatted){ versoes.push(byVersionFormatted[i].key); }
        versoes = versoes.sort();
        versoes.push(versoes.splice(0,1)[0]);

        const dts = new Array();
        for (let version_pc in byDebtsFormatted){
            dts[version_pc] = {key: byDebtsFormatted[version_pc].key, values:{}};
            let len = byDebtsFormatted[version_pc].values.length;
            let keys = byDebtsFormatted[version_pc].values.map(d=>(d.key));
            dts[version_pc].values = new Array();
            for (let v in versoes){
                dts[version_pc].values[v] = {key:versoes[v], values:function(){}};
            }
        }
        
        for (let dt in dts){
            let len = dts[dt].values.length;
            let keys = byDebtsFormatted[dt].values.map(d=>(d.key));
            let values = byDebtsFormatted[dt].values.map(d=>(d.value));
            let t=0;
            while (t<len){
                dts[dt].values[t] = {key:versoes[t],
                    values: keys.indexOf(dts[dt].values[t].key) == -1? 0
                            :values[t] == undefined?values[keys.indexOf(dts[dt].values[t].key)] :values[t]                                  
                };
                t++;
            }
        }
        xPC = d3.scalePoint()
            .domain(dimensions)
            .range([0, WIDTH])
            .padding(0.2);

        yPC = {};
        dimensions.forEach(function(d,i) { 
            yPC[d] = d3.scaleLinear()
                .domain([(byDebtsFormatted[i]["values"].length >=byVersionFormatted.length)? d3.min(byDebtsFormatted[i]["values"], d => d.value): 0,
                        d3.max(byDebtsFormatted[i]["values"], d => d.value)])
                .range([HEIGHT, 0]);
        });

        function path(d,i) {
            let list = new Object(); 
            let list2 = new Object();
            var line = (d.values.map((k,i)=> [k.key, k.values==undefined?24 :k.values.length]));
            var line2 = dimensions.map((p,i)=> line[p,i]);
            dimensions.map((p,i)=> list[p] = line2[p,i][1]);

            let lista = Object.keys(list);
            let lista2 = [];
            const build = lista.indexOf('BUILD_DEBT');   if (build !== -1) { lista2[build] = 0; }
            const doc = lista.indexOf('DOCUMENTATION_DEBT');   if (doc !== -1) { lista2[doc] = 1; }
            const code = lista.indexOf('CODE_DEBT');   if (code !== -1) { lista2[code] = 2; }
            const unk = lista.indexOf('UNKNOWN_DEBT');   if (unk !== -1) { lista2[unk] = 3; }
            const defect = lista.indexOf('DEFECT_DEBT');   if (defect !== -1) { lista2[defect] = 4; }
            const req = lista.indexOf('REQUIREMENT_DEBT');   if (req !== -1) { lista2[req] = 5; }
            const test = lista.indexOf('TEST_DEBT');   if (test !== -1) { lista2[test] = 6; }
            const design = lista.indexOf('DESIGN_DEBT');   if (design !== -1) { lista2[design] = 7; }

            lista.map((p)=> list2[p]);

            return d3.line()(dimensions.map((p,s)=>
                        [position(p), yPC[p](line2[lista2[s]][1])]));
        }

        function position(d) {
            var v = dragging[d];
            return v == null ? xPC(d) : v;
        }

        function transition(g) {
            return g.transition().duration(500);    
        }

        g = svgPC.selectAll(".dimension")
            .data(dimensions)
            .enter().append("g")
            .attr("class", "dimension")
            .attr("transform", d => "translate(" + xPC(d) + ")")
            .call(d3.drag()
                .on("start", function(event, d) {
                    dragging[d] = xPC(d);
                })
                .on("drag", function(event, d) {
                    dragging[d] = Math.min(WIDTH, Math.max(0, event.x));
                    foreground.attr("d", path);
                    dimensions.sort((a,b) => position(a) - position(b));
                    xPC.domain(dimensions);
                    g.attr("transform", d => "translate(" + position(d) + ")");
                })
                .on("end", function(event, d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + xPC(d) + ")");
                    transition(foreground).attr("d", path);
                }));

        // Adicionando os eixos
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yPC[d])); });
            
        g.append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .text(d => d.replace("_", " ").replace("DOCUMENTATION", "DOC.").replace("REQUIREMENT", "REQUIR..")) 
            .style("font-size", "11px")
            .attr("transform", "rotate(-15)");
        // Desenhando as polilinhas depois dos eixos
        foreground = svgPC.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(dataset)
            .enter().append("path")
            .attr("d", path)
            .attr("class", d => d.key)
            .style("fill", "none")
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("stroke-opacity", "0.7");

foreground
    .on("click", function(event, d) {
        foreground
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("opacity", "0.7");
        d3.select(this)
            .style("stroke", "green")
            .style("stroke-width", "2.5px")
            .style("opacity", "1");
        
        if (typeof reDraw === 'function') {
            reDraw(d);
        }
        if (typeof reDrawTR === 'function') {
            reDrawTR(d);
        }
        if (typeof reDrawMP === 'function') {
            reDrawMP(d);
        }
    })
    .on("dblclick", function(event, d) {
        foreground
            .style("stroke", "steelblue")
            .style("stroke-width", "1.5px")
            .style("opacity", "0.7");
        // Resetar o Sunburst
        if (typeof svgSB !== 'undefined') {
            svgSB.selectAll("*").remove();
            svgGroup = svgSB.append("g");
            
            if (typeof updateVisualization === 'function' && currentDataPC) {
                updateVisualization(currentDataPC);
            }
        }
        if (typeof circles !== 'undefined') {
            circles.style("fill", d => typeof colorMP === 'function' ? colorMP(d[3]+1) : 'steelblue');
            circles.attr("class", "non_brushed");
        }
        if (typeof currentDataPC !== 'undefined') {
            window.currentDataaux = currentDataPC;
        }
        if (typeof svgMP !== 'undefined' && typeof zoom !== 'undefined') {
            svgMP.call(zoom);
        }
        if (typeof tooltipBarGraph !== 'undefined') {
            tooltipBarGraph.selectAll("*").remove();
        }
        if (typeof clearMPTableRows === 'function') {
            clearMPTableRows();
        }
        if (typeof restoreMPHighlight === 'function') {
            restoreMPHighlight();
        } else {
            if (typeof circles !== 'undefined' && typeof reDrawMP === 'function') {
                circles.on("click", function(event, datum) {
                    const correspondingVersion = dataset.find(version => {
                        return version.key === datum.reference; 
                    });
                    if (correspondingVersion) {
                        reDrawMP(correspondingVersion);
                    }
                });
            }
        }
    
        if (typeof resetTR === 'function') {
            resetTR();
        }
    })
            .on("mouseover", function(event, d) {
                const [mouseX, mouseY] = d3.pointer(event, document.getElementById("parallelCordinates"));
                tooltipPC.html("Version " + "<b>" + d.key + "</b>" + "<br>" + " Total debts in this version: " 
                                + "<b>" + d3.sum(d.values, j => j.values.length) + "</b>")
                    .style("visibility", "visible")
                    .style("left", (mouseX + 10) + "px")
                    .style("top", (mouseY - 10) + "px");
                d3.select(this)
                    .style("stroke", "orange")
                    .style("stroke-width", "3px");
            })
            .on("mouseout", function() {
                tooltipPC.style("visibility", "hidden");
                d3.select(this)
                    .style("stroke", "steelblue")
                    .style("stroke-width", "1.5px");
            });


        window.reDraw = function(name_version){
            if (typeof svgSB !== 'undefined') {
                svgSB.selectAll("*").remove();
                let version_clicked = name_version.key;
                console.log("Version clicked:", version_clicked);
                
                let data_filter = currentDataPC.filter(function(item){
                    return item.reference === version_clicked;
                });
                console.log("Filtered data:", data_filter);
                svgGroup = svgSB.append("g");
                updateSVGPosition();
                
                if (typeof updateVisualization === 'function') {
                    updateVisualization(data_filter);
                }
            }
        }; 
    }
}