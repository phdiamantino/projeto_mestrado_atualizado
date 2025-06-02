const container = d3.select("#top-left");

// Função para obter tamanho do container
function getContainerSize() {
    const node = container.node();
    if (!node) return { width: 400, height: 400 }; // fallback
    return {
        width: node.clientWidth || 400,
        height: node.clientHeight || 400
    };
}

// Limpa container anterior se existir
container.selectAll("*").remove();

// Inicializa o SVG e variáveis globais
let svgSB = container.append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

let svgGroup = svgSB.append("g");


const partition = d3.partition();
let xSB = d3.scaleLinear().range([0, 2 * Math.PI]);
let ySB = d3.scaleSqrt();
let arc;
let currentRoot = null;
let tooltip = null;
let currentData = null;
let isInitialized = false;

// Atualiza as dimensões do arco
function updateArc() {
    const { width, height } = getContainerSize();
    const radius = (Math.min(width, height) / 2.2);

    ySB.range([0, radius]);

    arc = d3.arc()
        .startAngle(d => Math.max(0, Math.min(2 * Math.PI, xSB(d.x0))))
        .endAngle(d => Math.max(0, Math.min(2 * Math.PI, xSB(d.x1))))
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.2)
        .innerRadius(d => Math.max(0, ySB(d.y0)))
        .outerRadius(d => Math.max(0, ySB(d.y1)));
}

// Atualiza a posição central do SVG
function updateSVGPosition() {
    const { width, height } = getContainerSize();
    svgGroup.attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Atualiza posição do tooltip para ficar abaixo do sunburst
    if (tooltip) {
        const radius = (Math.min(width, height) / 2.2);
        tooltip.attr("transform", `translate(0, ${radius + 40})`);
    }
}

// Converte arquivos para estrutura hierárquica
function toTree(files) {
    console.log("Processing files for tree:", files);
    if (!files || files.length === 0) return { children: [] };
    
    const root = {};
    for (const { key, value } of files) {
        if (!key) continue;
        
        // Verifica e limpa o caminho do arquivo
        const cleanKey = key.replace(/^\/+|\/+$/g, ''); // Remove barras no início/fim
        const pathParts = cleanKey.split('/').filter(Boolean);
        
        if (pathParts.length === 0) continue;
        
        pathParts.reduce((acc, folder) => {
            if (!acc.folders) acc.folders = {};
            return acc.folders[folder] || (acc.folders[folder] = { key: folder, value: null });
        }, root).value = value;
    }
    
    (function recurse(node) {
        if (!node.folders) return;
        node.children = Object.values(node.folders);
        node.children.forEach(recurse);
    })(root);
    
    console.log("Generated tree structure:", root);
    return root;
}

// Atualiza os cards de informação
function updateInfoCards(data, selectedRepo) {
    if (!data || data.length === 0) {
        d3.select("#card-versions .value").text("0");
        //d3.select("#card-files .value").text("0");
        d3.select("#card-total .value").text("0");
        return;
    }

    try {
        // Calcula os valores dinamicamente
        const versions = new Set(data.map(d => d.reference).filter(r => r));
        const totalDebts = d3.sum(data, d => (d.debts && Array.isArray(d.debts)) ? d.debts.length : 0);
        
        // Calcula o número de arquivos únicos
        //const filesCount = new Set(data.map(d => d.filename)).size;
        function getFilesCountByGroup(selectedGroup) {
            const group = selectedGroup.trim().toLowerCase();

            if (group === 'junit') {
                return 161;
            } else {
                return 1669;
            }
        }
        const filesCount = getFilesCountByGroup(selectedGroup);


        d3.select("#card-versions .value").text(versions.size);
        d3.select("#card-files .value").text(filesCount);
        d3.select("#card-total .value").text(totalDebts);

    } catch (error) {
        console.error("Error updating info cards:", error);
        d3.select("#card-versions .value").text("Error");
        //d3.select("#card-files .value").text("Error");
        d3.select("#card-total .value").text("Error");
    }
}

// Função principal para criar/atualizar a visualização
function updateVisualization(data) {
    console.log("Data received for visualization:", data);
    if (!data || data.length === 0) {
        console.warn("No data provided for visualization");
        updateInfoCards([]);
        return;
    }

    try {
        const grouped = Array.from(
            d3.group(data, d => d.filename),
            ([key, values]) => ({ 
                key, 
                value: d3.sum(values, d => (d.debts && Array.isArray(d.debts)) ? d.debts.length : 0) 
            })
        ).filter(d => d.key && d.value > 0);

        if (grouped.length === 0) {
            console.log("No valid grouped data");
            updateInfoCards(data);
            return;
        }

        const arqJson = toTree(grouped);
        const root = d3.hierarchy(arqJson)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        if (!root.value) {
            console.log("Root has no value");
            updateInfoCards(data);
            return;
        }

        currentRoot = root;

        updateSVGPosition();
        updateArc();

        xSB.domain([0, 1]);
        ySB.domain([0, 1]);

        if (tooltip) tooltip.remove();

        const { width, height } = getContainerSize();
        const radius = (Math.min(width, height) / 2.2);

        tooltip = svgGroup.append("text")
            .attr("font-size", 12)
            .attr("fill", "#000")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(0, ${radius + 40})`);
            // Cria um tooltip HTML
        tooltip = d3.select("body").append("div")
            .attr("class", "sunburst-tooltip")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .style("padding", "6px 10px")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("color", "#000")
            .style("pointer-events", "none")
            .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)");


        function getAncestors(node) {
            const path = [];
            let current = node;
            while (current.parent) {
                path.unshift(current);
                current = current.parent;
            }
            return path;
        }

        function mouseover(event, d) {
            const sequenceArray = getAncestors(d);
            svgGroup.selectAll("path")
                .style("opacity", 0.3)
                .filter(node => sequenceArray.indexOf(node) >= 0)
                .style("opacity", 1);

            const pathString = sequenceArray.map(n => n.data.key).join("/") || "root";
            const percent = Math.round(((d.value || 0) / (root.value || 1)) * 100) + '%';

            tooltip
                .style("visibility", "visible")
                .html(`<strong>${pathString}</strong><br/>Percent of debts: <strong>${percent}</strong>`)
                .style("top", (event.pageY + 15) + "px")
                .style("left", (event.pageX + 15) + "px");
        }


        function mouseout() {
            tooltip.style("visibility", "hidden");
            svgGroup.selectAll("path").style("opacity", 1);
        }

        function click(event, d) {
            const { width, height } = getContainerSize();
            const radius = (Math.min(width, height) / 2.2);

            svgGroup.transition()
                .duration(500)
                .tween("scale", function() {
                    const xd = d3.interpolate(xSB.domain(), [d.x0, d.x1]);
                    const yd = d3.interpolate(ySB.domain(), [d.y0, 1]);
                    const yr = d3.interpolate(ySB.range(), [d.y0 ? 20 : 0, radius]);
                    return function(t) {
                        xSB.domain(xd(t));
                        ySB.domain(yd(t)).range(yr(t));
                    };
                })
                .selectAll("path")
                .attrTween("d", d => () => arc(d));
        }

        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateYlGnBu, root.height + 2));

        const partitionData = partition(root).descendants();

        svgGroup.selectAll("path")
            .data(partitionData, d => (d.data && d.data.key) ? d.data.key : 'root-' + Math.random())
            .join(
                enter => enter.append("path")
                    .attr("d", arc)
                    .style("fill", d => d.depth < 1 ? "white" : color(d.depth))
                    .style("fill-opacity", 0.9)
                    .attr("stroke", "dimgray")
                    .style("stroke-width", 0.3)
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", click),
                update => update
                    .transition()
                    .duration(750)
                    .attr("d", arc)
                    .style("fill", d => d.depth < 1 ? "white" : color(d.depth)),
                exit => exit
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove()
            );

        updateInfoCards(data);
        console.log(`Visualization updated with ${data.length} items, ${partitionData.length} nodes`);
    } catch (error) {
        console.error("Error in updateVisualization:", error);
        updateInfoCards(data);
    }
}

// Função para atualizar o repositório selecionado
// Função para atualizar o repositório selecionado
function updateRepository(selected) {
    if (!currentData) {
        console.log("No data available");
        return;
    }

    let data;
    if (selected === 'jUnit') {
        data = currentData.slice(0, 754);  // jUnit: primeiros 754 itens
    } else if (selected === 'Apache') {
        data = currentData.slice(755);     // Apache: a partir do item 755
    } else {
        data = currentData;                // Todos os dados
    }

    console.log(`Updating to ${selected} with ${data.length} items`);
    
    // Limpa a visualização anterior
    svgGroup.selectAll("path").remove();
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
    
    // Reinicializa o SVG group
    svgGroup = svgSB.append("g");
    updateSVGPosition();
    
    // Atualiza a visualização com os novos dados
    updateVisualization(data);
    updateInfoCards(data, selected);
}

// Carrega os dados
d3.json("data/rm_technical_debt.json").then(function (dataSB) {
    console.log("Data loaded:", dataSB ? dataSB.length : 0, "items");
    currentData = dataSB;
    isInitialized = true;
    updateRepository('jUnit');

    setTimeout(() => {
        const selectElement = d3.select('#selectRep');
        if (selectElement.node()) {
            selectElement.on("change", function() {
                const selected = this.value;
                d3.select('#selectedRep').text('Selected: ' + selected);
                updateRepository(selected);
            });
            console.log("Event listener attached to selectRep");
        }
    }, 100);
 
    window.updateRepository = updateRepository;
    window.currentSunburstData = currentData;
}).catch(function(error) {
    console.error("Error loading data:", error);
    updateInfoCards([]);
});

window.resizeSunburst = function() {
    if (!currentRoot) return;

    updateSVGPosition();
    updateArc();

    svgGroup.selectAll("path")
        .attr("d", arc);
};
window.updateRepository = updateRepository;
window.currentSunburstData = currentData;
window.addEventListener('resize', () => {
    if (typeof resizeSunburst === 'function') {
        resizeSunburst();
    }
});

