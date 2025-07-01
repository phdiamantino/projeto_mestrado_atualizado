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
let currentRepository = 'jUnit'; // Variável para armazenar o repositório atual
let fixedPath = null; // Global variable to store fixed path from MP click
let highlightedFromMP = false; // Flag to track if highlight came from MP

// Função para limpar highlight - DEFINIDA PRIMEIRO
function clearSunburstHighlight() {
    console.log("Clearing Sunburst highlight");
    
    highlightedFromMP = false;
    fixedPath = null;
    
    if (svgGroup) {
        svgGroup.selectAll("path")
            .style("opacity", 0.9)
            .style("stroke", "dimgray")
            .style("stroke-width", 0.3);
    }
    
    if (tooltip) {
        tooltip.style("visibility", "hidden");
    }
}

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
}

// Converte arquivos para estrutura hierárquica
function toTree(files) {
    console.log("Processing files for tree:", files);
    if (!files || files.length === 0) return { name: "root", children: [] }; 

    const root = { name: "root", children: [] };
    const nodes = { "root": root };

    for (const { key, value } of files) {
        if (!key) continue;
        
        const cleanKey = key.replace(/^\/+|\/+$/g, '');
        const pathParts = cleanKey.split('/').filter(Boolean);
        
        if (pathParts.length === 0) continue;
        
        let currentPath = "root";
        let currentNode = root;

        for (let i = 0; i < pathParts.length; i++) {
            const part = pathParts[i];
            const nextPath = currentPath + "/" + part;

            if (!nodes[nextPath]) {
                const newNode = { name: part, children: [] };
                if (!currentNode.children) {
                    currentNode.children = [];
                }
                currentNode.children.push(newNode);
                nodes[nextPath] = newNode;
            }
            currentNode = nodes[nextPath];
            currentPath = nextPath;
        }
        currentNode.value = +value; 
    }
    
    (function cleanEmptyChildren(node) {
        if (node.children && node.children.length === 0 && node.value === undefined) {
            delete node.children;
        } else if (node.children) {
            node.children.forEach(cleanEmptyChildren);
        }
    })(root);

    (function filterEmptyChildren(node) {
        if (node.children) {
            node.children = node.children.filter(child => {
                filterEmptyChildren(child);
                return child.children && child.children.length > 0 || child.value !== undefined;
            });
            if (node.children.length === 0 && node.value === undefined) {
                delete node.children;
            }
        }
    })(root);

    console.log("Generated tree structure:", root);
    return root;
}

// Atualiza os cards de informação
function updateInfoCards(data, selectedRepo, isFiltered = false) {
    if (!data || data.length === 0) {
        d3.select("#card-versions .value").text("0");
        d3.select("#card-files .value").text("0");
        d3.select("#card-total .value").text("0");
        return;
    }

    try {
        const staticValues = {
            'jUnit': {
                versions: 9,
                files: 161,
                totalDebts: 1222
            },
            'Apache': {
                versions: 12,
                files: 1669,
                totalDebts: 13149
            }
        };

        if (!isFiltered) {
            const repoValues = staticValues[selectedRepo] || staticValues['jUnit'];
            d3.select("#card-versions .value").text(repoValues.versions);
            d3.select("#card-files .value").text(repoValues.files);
            d3.select("#card-total .value").text(repoValues.totalDebts);
            return;
        }

        const versions = new Set(data.map(d => d.reference).filter(r => r));
        const totalDebts = d3.sum(data, d => (d.debts && Array.isArray(d.debts)) ? d.debts.length : 0);
        const filesCount = new Set(data.map(d => d.filename)).size;

        d3.select("#card-versions .value").text(versions.size);
        d3.select("#card-files .value").text(filesCount);
        d3.select("#card-total .value").text(totalDebts);

    } catch (error) {
        console.error("Error updating info cards:", error);
        d3.select("#card-versions .value").text("Error");
        d3.select("#card-files .value").text("Error");
        d3.select("#card-total .value").text("Error");
    }
}

// Função para encontrar nó por caminho de arquivo
function findNodeByPath(root, filepath) {
    if (!root || !filepath) return null;
    
    // Remove barras iniciais/finais e divide o caminho
    const cleanPath = filepath.replace(/^\/+|\/+$/g, '');
    const pathParts = cleanPath.split('/').filter(Boolean);
    
    if (pathParts.length === 0) return null;
    
    let currentNode = root;
    
    // Navega pela árvore seguindo o caminho
    for (const part of pathParts) {
        if (!currentNode.children) return null;
        
        const nextNode = currentNode.children.find(child => child.data.name === part);
        if (!nextNode) return null;
        
        currentNode = nextNode;
    }
    
    return currentNode;
}

// Função para obter ancestrais de um nó
function getAncestors(node) {
    const path = [];
    let current = node;
    while (current.parent) {
        path.unshift(current);
        current = current.parent;
    }
    return path;
}

// Função para calcular posição do centroide de um arco
function getArcCentroid(d) {
    const angle = (xSB(d.x0) + xSB(d.x1)) / 2;
    const radius = (ySB(d.y0) + ySB(d.y1)) / 2;
    
    // Converte coordenadas polares para cartesianas
    const x = Math.cos(angle - Math.PI / 2) * radius;
    const y = Math.sin(angle - Math.PI / 2) * radius;
    
    return [x, y];
}

// Função para obter posição absoluta do tooltip no Sunburst
function getSunburstTooltipPosition(d) {
    const { width, height } = getContainerSize();
    const containerRect = container.node().getBoundingClientRect();
    
    // Obtém o centroide do arco em coordenadas locais
    const [localX, localY] = getArcCentroid(d);
    
    // Converte para coordenadas absolutas da página
    const absoluteX = containerRect.left + (width / 2) + localX;
    const absoluteY = containerRect.top + (height / 2) + localY;
    
    return {
        x: absoluteX + 10, // Pequeno offset para não sobrepor
        y: absoluteY - 10
    };
}

// Função para highlight de caminho - INTERFACE PRINCIPAL PARA MP
function highlightSunburstPath(filepath) {
    if (!currentRoot || !filepath) {
        console.warn("Cannot highlight: no root or filepath provided");
        return;
    }
    
    console.log("Highlighting Sunburst path:", filepath);
    
    // Limpa highlight anterior
    clearSunburstHighlight();
    
    // Encontra o nó correspondente ao arquivo
    const targetNode = findNodeByPath(currentRoot, filepath);
    
    if (!targetNode) {
        console.warn("Path not found in Sunburst:", filepath);
        return;
    }
    
    // Marca que o highlight veio do MP
    highlightedFromMP = true;
    fixedPath = filepath;
    
    // Destaca o caminho com highlight mais sutil - apenas muda a opacidade
    const sequenceArray = getAncestors(targetNode);
    svgGroup.selectAll("path")
        .style("opacity", 0.3) // Diminui opacidade dos outros elementos
        .filter(node => sequenceArray.indexOf(node) >= 0)
        .style("opacity", 1); // Mantém opacidade total para o caminho selecionado
    
    // Calcula posição do tooltip próximo ao elemento destacado
    const tooltipPos = getSunburstTooltipPosition(targetNode);
    
    // Mostra tooltip na posição calculada
    const pathString = sequenceArray.map(n => n.data.name).join("/");
    const percent = Math.round(((targetNode.value || 0) / (currentRoot.value || 1)) * 100) + '%';
    
    if (tooltip) {
        tooltip
            .style("visibility", "visible")
            .html(`<strong>Selected from MP:</strong><br/>${pathString}<br/>Percent of debts: <strong>${percent}</strong>`)
            .style("top", tooltipPos.y + "px")
            .style("left", tooltipPos.x + "px");
    }
    
    console.log("Sunburst path highlighted successfully");
}

// Função principal para criar/atualizar a visualização
function updateVisualization(data, isFiltered = false) {
    console.log("Data received for visualization:", data);
    if (!data || data.length === 0) {
        console.warn("No data provided for visualization");
        updateInfoCards([], currentRepository);
        svgGroup.selectAll("*").remove();
        if (tooltip) tooltip.style("visibility", "hidden");
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
            console.log("No valid grouped data after filtering and summation");
            updateInfoCards(data, currentRepository, isFiltered);
            svgGroup.selectAll("*").remove();
            if (tooltip) tooltip.style("visibility", "hidden");
            return;
        }

        const arqJson = toTree(grouped);
        
        if (!arqJson || !arqJson.children || arqJson.children.length === 0) {
            console.log("Root of tree has no children or is invalid");
            updateInfoCards(data, currentRepository, isFiltered);
            svgGroup.selectAll("*").remove();
            if (tooltip) tooltip.style("visibility", "hidden");
            return;
        }

        const root = d3.hierarchy(arqJson)
            .sum(d => d.value || 0)
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        if (!root.value && (!root.children || root.children.length === 0)) {
            console.log("Root has no value and no children, likely empty data");
            updateInfoCards(data, currentRepository, isFiltered);
            svgGroup.selectAll("*").remove();
            if (tooltip) tooltip.style("visibility", "hidden");
            return;
        }

        currentRoot = root;

        updateSVGPosition();
        updateArc();

        // Cria tooltip se não existir
        if (!tooltip || tooltip.empty()) {
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
        }

        // Funções de interação do mouse
        function mouseover(event, d) {
            // Não interfere se há highlight fixo do MP
            if (highlightedFromMP) return;

            const sequenceArray = getAncestors(d);
            svgGroup.selectAll("path")
                .style("opacity", 0.3)
                .filter(node => sequenceArray.indexOf(node) >= 0)
                .style("opacity", 1);

            const pathString = sequenceArray.map(n => n.data.name).join("/");
            const percent = Math.round(((d.value || 0) / (root.value || 1)) * 100) + '%';

            // Usa posição calculada próxima ao elemento
            const tooltipPos = getSunburstTooltipPosition(d);

            tooltip
                .style("visibility", "visible")
                .html(`<strong>${pathString}</strong><br/>Percent of debts: <strong>${percent}</strong>`)
                .style("top", tooltipPos.y + "px")
                .style("left", tooltipPos.x + "px");
        }

        function mouseout() {
            // Não interfere se há highlight fixo do MP
            if (highlightedFromMP) return;
            
            svgGroup.selectAll("path")
                .style("opacity", 0.9);
            
            if (tooltip) {
                tooltip.style("visibility", "hidden");
            }
        }

        function click(event, d) {
            // Limpa qualquer highlight do MP ao clicar no Sunburst
            if (typeof window.clearFixedHighlight === 'function') {
                window.clearFixedHighlight();
            }
            
            highlightedFromMP = false;
            fixedPath = null;

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
                
            updateInfoCards(data, currentRepository, true);

            // Mostra tooltip do zoom na posição calculada
            const sequenceArray = getAncestors(d);
            const pathString = sequenceArray.map(n => n.data.name).join("/");
            const percent = Math.round(((d.value || 0) / (root.value || 1)) * 100) + '%';
            
            const tooltipPos = getSunburstTooltipPosition(d);
            
            tooltip
                .style("visibility", "visible")
                .html(`<strong>Zoomed to:</strong><br/>${pathString}<br/>Percent of debts: <strong>${percent}</strong>`)
                .style("top", tooltipPos.y + "px")
                .style("left", tooltipPos.x + "px");
        }

        const color = d3.scaleOrdinal(d3.quantize(d3.interpolateYlGnBu, root.height + 2));

        const partitionData = partition(root).descendants();

        svgGroup.selectAll("path")
            .data(partitionData, d => d.data.name)
            .join(
                enter => enter.append("path")
                    .attr("d", arc)
                    .style("fill", d => d.depth < 1 ? "white" : color(d.depth))
                    .style("fill-opacity", 0.9)
                    .attr("stroke", "dimgray")
                    .style("stroke-width", 0.3)
                    .style("opacity", 0.9)
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout)
                    .on("click", click),
                update => update
                    .transition()
                    .duration(750)
                    .attr("d", arc)
                    .style("fill", d => d.depth < 1 ? "white" : color(d.depth))
                    .style("opacity", 0.9),
                exit => exit
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .remove()
            );

        updateInfoCards(data, currentRepository, isFiltered);
        console.log(`Visualization updated with ${data.length} items, ${partitionData.length} nodes`);
        
    } catch (error) {
        console.error("Error in updateVisualization:", error);
        updateInfoCards(data, currentRepository, isFiltered);
    }
}

// Função para atualizar o repositório selecionado
function updateRepository(selected) {
    if (!currentData) {
        console.log("No data available");
        return;
    }

    currentRepository = selected;
    
    // Limpa qualquer highlight ao trocar de repositório
    clearSunburstHighlight();
    
    let data;
    if (selected === 'jUnit') {
        data = currentData.slice(0, 754);  
    } else if (selected === 'Apache') {
        data = currentData.slice(755);     
    } else {
        data = currentData;                
    }

    console.log(`Updating to ${selected} with ${data.length} items`);
    
    svgGroup.selectAll("*").remove();
    if (tooltip) {
        tooltip.remove();
        tooltip = null;
    }
    
    svgGroup = svgSB.append("g");
    updateSVGPosition();
    
    updateVisualization(data, false);
}

// Função de redimensionamento
function resizeSunburst() {
    if (!currentRoot) return;

    updateSVGPosition();
    updateArc();

    svgGroup.selectAll("path")
        .attr("d", arc);
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
 
    // Expõe funções globais após carregar os dados
    window.updateRepository = updateRepository;
    window.currentSunburstData = currentData;
    window.highlightSunburstPath = highlightSunburstPath;
    window.clearSunburstHighlight = clearSunburstHighlight;
    window.resizeSunburst = resizeSunburst;
    
}).catch(function(error) {
    console.error("Error loading data:", error);
    updateInfoCards([]);
});

// Event listener para redimensionamento
window.addEventListener('resize', () => {
    if (typeof resizeSunburst === 'function') {
        resizeSunburst();
    }
});