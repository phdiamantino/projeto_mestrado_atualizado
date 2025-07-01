//FLAGMP
const MARGIN4 = {LEFT: 10, RIGHT: 10, TOP: 50, BOTTOM: 50};
let WIDTH4, HEIGHT4;
let svgMP, svgMPtable, colorMP, xScale, yScale, x, y, circles, forcetsne;
let currentMPData = null;
let currentDataaux = null;
let isProjectionComputed = false;
let isForceActive = false;
let zoomBehavior = null;
let mainGroup = null;
let worker = null;
let isPlotReady = false;
let tsnePositions = null; 
let originalPositions = null; 
let fixedPathMP = null; // Track the currently clicked/fixed point

function initializeMP() {
    const container = document.getElementById('legendmp');
    if (!container) return;

    container.innerHTML = '';
    
    const controlsDiv = d3.select("#legendmp")
        .append("div")
        .style("position", "absolute")
        .style("top", "5px")
        .style("left", "5px")
        .style("z-index", "1000")
        .style("display", "flex")
        .style("gap", "10px");
        
    
    // Add force toggle button
     controlsDiv.append("button")
        .attr("id", "forceToggle")
        .style("padding", "5px 10px")
        .style("background", "#59A5EB")
        .style("color", "white")
        .style("border", "none")
        .style("border-radius", "3px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .text("Start Force")
        .on("click", toggleForce);
    
    // Add zoom reset button
    controlsDiv.append("button")
        .attr("id", "zoomReset")
        .style("padding", "5px 10px")
        .style("background", "#28a745")
        .style("color", "white")
        .style("border", "none")
        .style("border-radius", "3px")
        .style("cursor", "pointer")
        .style("font-size", "12px")
        .text("Reset Zoom")
        .on("click", resetZoom);
    
    svgMP = d3.select("#legendmp").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("display", "block")
        .style("position", "relative");

    colorMP = d3.scaleQuantize()
        .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900"]);
    
    xScale = d3.scaleLinear()
        .range([10, WIDTH4]);

    // Initialize table container
    const tableContainer = document.getElementById('multidimencionalProjectionTable');
    if (tableContainer) {
        tableContainer.innerHTML = '';
        
        // Create table structure
        const table = d3.select("#multidimencionalProjectionTable")
            .append("table")
            .style("width", "100%")
            .style("border-collapse", "collapse")
            .style("visibility", "hidden");
        
        // Add header
        const header = table.append("thead").append("tr");
        const columns = ["File", "Reference", "Pattern", "Heuristic", "Score", "Count Debts", "Debts", "Indicators"];
        
        header.selectAll("th")
            .data(columns)
            .enter()
            .append("th")
            .style("padding", " 0 8px")
            .style("text-align", "left")
            .style("border-bottom", "2px solid #ddd")
            .style("background-color", "#E5E3EB")
            .style("position", "sticky")
            .style("top", "-20px")
            .text(d => d);
        
        table.append("tbody");
    }

    Promise.all([
        d3.text('tsne.min.js'),
        d3.text('worker.js')
    ]).then(([t, w]) => {
        worker = new Worker(
            window.URL.createObjectURL(
                new Blob([t + w], { type: "text/javascript" })
            )
        );
        initializeTSNEWorker();
    }).catch(err => {
        console.error("Error loading scripts:", err);
    });
}

window.reDrawMP = function(name_version) {
    if (!name_version || !name_version.key) return;
    
    const version_clicked = name_version.key;
    console.log("Version clicked for MP:", version_clicked);
    
    const data_filter = currentDataPC.filter(function(item) {
        return item.reference === version_clicked;
    });
    
    if (data_filter.length === 0) {
        console.log("No data found for version:", version_clicked);
        return;
    }
    currentDataaux = data_filter;
    
    if (typeof circles !== 'undefined' && circles) {
        circles.attr("class", "non_brushed")
            .attr("r", d => d.r = 4 + 0.7 * (d[4] || 1))
            .attr('opacity', 0.8)
            .style("fill", d => typeof colorMP === 'function' ? colorMP(d[3] + 1) : 'steelblue');
    }
    
    // Limpar tabela
    if (typeof clearMPTableRows === 'function') {
        clearMPTableRows();
    }
    
    console.log("MP updated for version:", version_clicked, "with", data_filter.length, "items");
};

function initializeTSNEWorker() {
    if (!worker) {
        console.error("Worker not initialized");
        return;
    }
    
    worker.onmessage = function(e) {
        if (e.data.pos) {
            tsnePositions = e.data.pos.map(pos => [...pos]); 
            
            if (circles && currentMPData) {
                currentMPData.forEach((d, i) => {
                    if (tsnePositions[i]) {
                        d.tsne_x = tsnePositions[i][0] * 150;
                        d.tsne_y = tsnePositions[i][1] * 150;
                        if (!isForceActive) {
                            d.x = d.tsne_x;
                            d.y = d.tsne_y;
                        }
                    }
                });
                if (!isForceActive) {
                    circles
                        .attr('cx', d => x(d.x))
                        .attr('cy', d => y(d.y));
                }
            }
        }
        if (e.data.stop) {
            console.log("t-SNE completed");
            isPlotReady = true;
            if (forcetsne) {
                forcetsne.alpha(0); 
            }
        }
        if (e.data.error) {
            console.error("t-SNE error:", e.data.error);
        }
    };
}

function updateMPDimensions() {
    const container = document.getElementById('legendmp');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    WIDTH4 = Math.max(400, rect.width - MARGIN4.LEFT - MARGIN4.RIGHT);
    HEIGHT4 = Math.max(300, rect.height - MARGIN4.TOP - MARGIN4.BOTTOM);
    
    if (svgMP) {
        svgMP.attr("viewBox", `0 0 ${WIDTH4 + MARGIN4.LEFT + MARGIN4.RIGHT} ${HEIGHT4 + MARGIN4.TOP + MARGIN4.BOTTOM}`);
    }
}

function toggleForce() {
    if (!isPlotReady) {
        console.log("Plot not ready yet");
        return;
    }
    
    isForceActive = !isForceActive;
    const button = d3.select("#forceToggle");
    
    if (isForceActive) {
        button.text("Stop Force")
            .style("background", "#dc3545");
        
        if (forcetsne) {
            if (currentMPData) {
                originalPositions = currentMPData.map(d => ({x: d.x, y: d.y}));
            }
            
            forcetsne.force('collide', d3.forceCollide().radius(d => (d.r || 4) + 2).strength(0.7))
                     .alpha(0.3)
                     .alphaTarget(0.1)
                     .restart();
        }
    } else {
        button.text("Start Force")
            .style("background", "#59A5EB");
        
        if (forcetsne) {
            if (currentMPData && tsnePositions) {
                currentMPData.forEach((d, i) => {
                    if (d.tsne_x !== undefined && d.tsne_y !== undefined) {
                        d.x = d.tsne_x;
                        d.y = d.tsne_y;
                    }
                });
                circles
                    .transition()
                    .duration(500)
                    .attr('cx', d => x(d.x))
                    .attr('cy', d => y(d.y));
            }
            forcetsne.force('collide', null)
                     .alpha(0)
                     .alphaTarget(0);
        }
    }
}

function resetZoom() {
    if (svgMP && zoomBehavior && mainGroup) {
        svgMP.transition()
            .duration(750)
            .call(zoomBehavior.transform, d3.zoomIdentity);
    }
}

function updateMP(selectedGroup) {
    isProjectionComputed = false;
    tsnePositions = null;
    originalPositions = null; 
    fixedPathMP = null; // Clear fixed path when repository changes
    
    if (!document.getElementById('legendmp')) return;
    
    updateMPDimensions();
    
    if (svgMP) {
        svgMP.selectAll("g").remove();
    }
    
    clearMPTable();
    
    if (selectedGroup === 'jUnit') {
        loadMPData('junit');
    } else {
        loadMPData('apache');
    }
}

function loadMPData(repo) {
    let csvFile, csvAuxFile;
    
    if (repo === 'junit') {
        csvFile = 'data/excomment_mp_junit_standard.csv';
        csvAuxFile = 'data/excomment_mp_junit.csv';
    } else {
        csvFile = 'data/excomment_mp_apache_standard.csv';
        csvAuxFile = 'data/excomment_mp_apache.csv';
    }
    
    Promise.all([
        d3.csv(csvFile, d3.autoType),
        d3.csv(csvAuxFile, d3.autoType)
    ]).then(function([standardData, auxData]) {
        let processedData;
        
        if (repo === 'junit') {
            processedData = standardData.map((d, index) => [
                +d.count_reference, +d.patern, +d.heuristic, +d.score, +d.count_debts,
                d['r_master'], d['r_r3.8.2'], d['r_r4.10'], d['r_r4.11'], d['r_r4.12'], 
                d['r_r4.6'], d['r_r4.7'], d['r_r4.8'], d['r_r4.9'],
                d['d_CODE_DEBT'], d['d_DEFECT_DEBT'], d['d_DESIGN_DEBT'], d['d_TEST_DEBT'], d['d_UNKNOWN_DEBT'],
                d['i_CODE_DEBT_I'], d['i_COMMENT_ANALYSIS'], d['i_COMPLEX_METHOD'], d['i_DEFECT_DEBT_I'], 
                d['i_DESIGN_DEBT_I'], d['i_DUPLICATED_CODE'], d['i_FEATURE_ENVY'], d['i_GOD_CLASS'], 
                d['i_TEST_DEBT_I'], d['i_UNKNOWN_DEBT_I'],
                index 
            ]);
        } else {
            processedData = standardData.map((d, index) => [
                +d.count_reference, +d.patern, +d.heuristic, +d.score, +d.count_debts,
                d['r_master'], d['r_rel/1.1'], d['r_rel/1.10.0'], d['r_rel/1.10.2'], d['r_rel/1.2'], 
                d['r_rel/1.3'], d['r_rel/1.4'], d['r_rel/1.5'], d['r_rel/1.6.0'], d['r_rel/1.7.0'], 
                d['r_rel/1.8.0'], d['r_rel/1.9.0'],
                d['d_BUILD_DEBT'], d['d_CODE_DEBT'], d['d_DEFECT_DEBT'], d['d_DESIGN_DEBT'], 
                d['d_DOCUMENTATION_DEBT'], d['d_TEST_DEBT'], d['d_UNKNOWN_DEBT'],
                d['i_BRAIN_METHOD'], d['i_BUILD_DEBT_I'], d['i_CODE_DEBT_I'], d['i_COMMENT_ANALYSIS'], 
                d['i_COMPLEX_METHOD'], d['i_DEFECT_DEBT_I'], d['i_DESIGN_DEBT'], d['i_DOCUMENTATION_DEBT_I'], 
                d['i_DUPLICATED_CODE'], d['i_FEATURE_ENVY'], d['i_GOD_CLASS'], d['i_TEST_DEBT_I'], d['i_UNKNOWN_DEBT_I'],
                index 
            ]);
        }
        currentMPData = processedData;
        currentDataaux = auxData;
        
        createMPLegend(auxData);
        updateallMP(processedData);
        isProjectionComputed = true;
    })
}

function createMPLegend(dataaux) {
    if (!svgMP || !dataaux || dataaux.length === 0) return;
    
    // Legend setup
    const scores = dataaux.map(d => +d.score);
    const l_scale = d3.extent(scores);
    const l_color = d3.scaleQuantize()
        .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900"]);
    l_color.domain(l_scale);
    
    const maxScore = d3.max(l_scale);
    const lScale = d3.scaleLinear()
        .domain([0, maxScore])
        .range([WIDTH4/4, WIDTH4 - WIDTH4/4]);
    
    svgMP.selectAll(".legend").remove();
    
    const legend = svgMP.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${MARGIN4.LEFT},${HEIGHT4 + MARGIN4.TOP + 10})`);
    
    // Legendas
    const legendData = pair(lScale.ticks(10));
    legend.selectAll("rect")
        .data(legendData)
        .enter().append("rect")
        .attr("x", d => lScale(d[0]))
        .attr("width", d => Math.max(1, lScale(d[1]) - lScale(d[0])))
        .attr("height", 15)
        .style("fill", d => l_color(d[0]));
    
    // Legend title
    legend.append("text")
        .attr("x", WIDTH4/2)
        .attr("y", -5)
        .attr("text-anchor", "middle")
        .text("Comments Score")
        .style("font-weight", "bold")
        .style("font-size", "12px");
    
    // Legend axis
    const lAxis = d3.axisBottom(lScale)
        .ticks(5)
        .tickSize(15)
        .tickFormat(maxScore > 1000 ? d => (d / 1000) + "K" : d3.format(".0f"));
    
    legend.append("g")
        .attr("class", "axis")
        .style("font-size", "10px")
        .call(lAxis);
    
    function pair(array) {
        return array.slice(1).map(function(b, i) {
            return [array[i], b];
        });
    }
}

window.updateallMP = function(data) {
    if (!svgMP || !data) return;
    
    svgMP.selectAll("g.main-group").remove();
    
    mainGroup = svgMP.append("g")
        .attr("class", "main-group")
        .attr("transform", `translate(${MARGIN4.LEFT},${MARGIN4.TOP})`);
    
    // zoom 
    zoomBehavior = d3.zoom()
        .scaleExtent([0.3, 15])
        .extent([[0, 0], [WIDTH4, HEIGHT4]])
        .on("zoom", function(event) {
            mainGroup.attr("transform", `translate(${MARGIN4.LEFT},${MARGIN4.TOP})` + event.transform);
        });
    
    svgMP.call(zoomBehavior);
    
    // brush
    let isBrushing = false;

    const brush = d3.brush()
        .extent([[0, 0], [WIDTH4, HEIGHT4]])
        .on("start", () => {
            isBrushing = true;
            svgMP.on('.zoom', null);
            // On brush start, clear any fixed highlight
            clearFixedHighlight(); 
        })
        .on("brush", function(event) {
            highlightBrushedCircles(event);
        })
        .on("end", function(event) {
            displayMPTable(event);
            isBrushing = false;
            svgMP.call(zoomBehavior);
        });

    mainGroup.append("g")
        .attr("class", "brush")
        .call(brush);
    
    const d_extent_x = d3.extent(data, d => d[1]);
    xScale.domain(d_extent_x);
    
    const d_extent_color = d3.extent(data, d => d[3]);
    colorMP.domain(d_extent_color);
    
    // Projection scales
    x = d3.scaleLinear()
        .domain([-200, 200])
        .range([0, WIDTH4]);
        
    y = d3.scaleLinear()
        .domain([-200, 200]) 
        .range([HEIGHT4, 0]);
    
    data.forEach(d => {
        d.x = (Math.random() - 0.5) * 100;
        d.y = (Math.random() - 0.5) * 100;
        d.tsne_x = undefined;
        d.tsne_y = undefined;
    });
    
    // Create circles
    circles = mainGroup.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr("class", "non_brushed")
        .attr("pointer-events", "all")
        .attr('r', d => {
            d.r = 4 + 0.7 * (d[4] || 1);
            return d.r;
        })
        .style("stroke", "#555")
        .attr('stroke-width', 0.8)
        .attr('opacity', 0.8)
        .style("fill", d => colorMP(d[3] + 1))
        .attr('cx', d => x(d.x))
        .attr('cy', d => y(d.y))
        .on("mouseover", function(event, d) {
            d3.selectAll(".toolTip").remove(); // Ensure previous tooltips are removed
        })
        .on("mouseout", function(event, d) {
            d3.selectAll(".toolTip").remove(); // Always remove tooltip on mouseout
        })
        .on("click", function(event, d) {
            event.stopPropagation(); // Prevent event from bubbling up
            
            // Clear previous fixed highlight on MP points
            circles.classed("clicked-fixed", false)
                   .style("fill", c => colorMP(c[3] + 1)); // Restore original color for all points

            // Set current clicked circle as fixed and apply green color
            d3.select(this).classed("clicked-fixed", true)
                           .style("fill", "green"); // Green color for fixed point

            const index = data.indexOf(d);
            fixedPathMP = currentDataaux[index]?.filename; // Store the filename of the clicked point
            
            // Highlight the corresponding path in Sunburst
            if (typeof window.highlightSunburstPath === 'function' && fixedPathMP) {
                window.highlightSunburstPath(fixedPathMP);
            }
            
            // Update the table for the clicked item
            clearMPTableRows();
            showMPTableColNames();
            const dataIndex = d[d.length - 1] !== undefined ? d[d.length - 1] : index;
            if (currentDataaux[dataIndex]) {
                populateMPTableRow(currentDataaux[dataIndex]);
            }
        })
        .on("dblclick", function(event, d) {
            event.stopPropagation(); // Prevent event from bubbling up
            
            // Restore all points to original color
            circles.classed("clicked-fixed", false)
                   .style("fill", c => colorMP(c[3] + 1));
            
            // Clear the fixedPathMP variable
            fixedPathMP = null;

            // Clear the highlight in Sunburst
            if (typeof window.clearSunburstHighlight === 'function') {
                window.clearSunburstHighlight();
            }

            // Clear the table
            clearMPTableRows();
            hideMPTableColNames();
        });
    
    // Handle click on SVG background to clear selection
    svgMP.on("click", function(event) {
        if (event.target === this) { // Only if clicking directly on SVG background
            // Restore all points to original color
            circles.classed("clicked-fixed", false)
                   .style("fill", c => colorMP(c[3] + 1));
            
            // Clear the fixedPathMP variable
            fixedPathMP = null;

            // Clear the highlight in Sunburst
            if (typeof window.clearSunburstHighlight === 'function') {
                window.clearSunburstHighlight();
            }

            // Clear the table
            clearMPTableRows();
            hideMPTableColNames();
        }
    });
    
    // FORCE
    forcetsne = d3.forceSimulation(data)
        .alphaDecay(0.005) 
        .alpha(0)
        .velocityDecay(0.4) 
        .force('tsne', function(alpha) {
            data.forEach((d, i) => {
                if (tsnePositions && tsnePositions[i]) {
                    const targetX = tsnePositions[i][0] * 150;
                    const targetY = tsnePositions[i][1] * 150;
                    d.vx = (d.vx || 0) + alpha * (targetX - d.x) * 0.1;
                    d.vy = (d.vy || 0) + alpha * (targetY - d.y) * 0.1;
                }
            });
        })
        .on('tick', function() {
            if (circles) {
                circles
                    .attr('cx', d => x(d.x))
                    .attr('cy', d => y(d.y));
            }
        })
        .on('end', function() {
            isPlotReady = true;
            console.log("Plot ready - force can be activated");
        });

    // Iniciar t-SNE
    if (worker) {
        const tsneData = data.map(d => {
            const features = [];
            for (let i = 5; i < d.length - 1; i++) {
                if (typeof d[i] === 'number') {
                    features.push(d[i]);
                }
            }
            return features;
        });
        
        worker.postMessage({
            maxIter: 500,
            dim: 2,
            perplexity: Math.min(30.0, Math.floor(data.length / 3)),
            metric: 'euclidean',
            data: tsneData
        });
    }
};

function clickedMP(event, d, index) {
    // This function is no longer directly used for click events,
    // as the logic has been moved to the .on("click") listener directly above.
    // Keeping it for reference or if it's called elsewhere.
}

// Brush
function highlightBrushedCircles(event) {
    if (!event.selection) {
        circles.style("fill", d => colorMP(d[3] + 1))
               .attr("class", "non_brushed");
        return;
    }
    
    const [[x0, y0], [x1, y1]] = event.selection;
    
    circles.classed("brushed", function(d) {
        const cx = d3.select(this).attr("cx");
        const cy = d3.select(this).attr("cy");
        return isBrushedMP([x0, y0, x1, y1], cx, cy);
    })
    .attr("r", function(d) {
        return this.classList.contains("brushed") ? 
            4 + 0.7 * (d[4] || 1) : 
            4 + 0.7 * (d[4] || 1);
    })
    .style("fill", function(d) {
        return this.classList.contains("brushed") ? "green" : colorMP(d[3] + 1);
    })
    .attr('opacity', function() {
        return this.classList.contains("brushed") ? 0.8 : 0.8;
    });
}

function displayMPTable(event) {
    if (!event.selection) {
        clearMPTableRows();
        // Clear any fixed highlight when brush ends with no selection
        clearFixedHighlight(); 
        return;
    }
    
    const brushedCircles = mainGroup.selectAll(".brushed");
    if (brushedCircles.empty()) {
        clearMPTableRows();
        return;
    }
    
    const brushedData = brushedCircles.data();
    clearMPTableRows();
    
    brushedData.forEach((d, i) => {
        const index = d[d.length - 1] !== undefined ? d[d.length - 1] : i;
        if (currentDataaux[index]) {
            populateMPTableRow(currentDataaux[index]);
        }
    });
    
    // Reset brush
    d3.select(event.currentTarget).call(d3.brush().move, null);
}

window.reDrawMP = function(name_version) {
    if (!circles || !currentDataaux) return;
    
    circles.style("fill", d => colorMP(d[3] + 1))
           .attr("class", "non_brushed")
           .classed("clicked-fixed", false); // Ensure no fixed highlights when redrawing
    fixedPathMP = null; // Clear fixed path

    const version_clicked = name_version.key;
    const ids = [];
    
    currentDataaux.forEach((d, i) => {
        if (d.reference.indexOf(version_clicked) !== -1) {
            ids.push(i);
        }
    });
    
    // Highlight circles
    circles.filter(d => ids.includes(d[d.length - 1]))
           .style("fill", "green")
           .attr("class", "brushed");
    
    // Update table
    const d_brushed = d3.selectAll(".brushed").data();
    clearMPTableRows();
    d_brushed.forEach(d_row => {
        const index = d_row[d_row.length - 1];
        if (currentDataaux[index]) {
            populateMPTableRow(currentDataaux[index]);
        }
    });
};

window.mouseoversb = function(arqv) {
    // This function is no longer needed as Sunburst no longer highlights from MP interaction
    // It is effectively an empty function now.
};

// Table functions
function clearMPTableRows() {
    hideMPTableColNames();
    d3.selectAll(".row_data").remove();
}

function clearMPTable() {
    const tableContainer = document.getElementById('multidimencionalProjectionTable');
    if (tableContainer) {
        d3.select(tableContainer).select("table").style("visibility", "hidden");
        d3.selectAll(".row_data").remove();
    }
}

window.isBrushedMP = function(brush_coords, cx, cy) {
    const [x0, y0, x1, y1] = brush_coords;
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
};

window.isBrushed = window.isBrushedMP;

window.hideMPTableColNames = function() {
    const table = d3.select("#multidimencionalProjectionTable table");
    if (!table.empty()) {
        table.style("visibility", "hidden");
    }
};

window.hideTableColNames = window.hideMPTableColNames;

window.showMPTableColNames = function() {
    const table = d3.select("#multidimencionalProjectionTable table");
    if (!table.empty()) {
        table.style("visibility", "visible");
    }
};

window.showTableColNames = window.showMPTableColNames;

window.populateMPTableRow = function(d_row) {
    if (!d_row) return;
    
    showMPTableColNames();
    
    const d_row_filter = [
        (d_row.filename || 'N/A').substr(0, Math.min((d_row.filename || 'N/A').length, 30)),
        d_row.reference || 'N/A',
        Math.round(d_row.patern || 0),
        Math.round(d_row.heuristic || 0),
        Math.round(d_row.score || 0),
        Math.round(d_row.count_debts || 0),
        d_row.debts || 'N/A',
        d_row.indicators || 'N/A'
    ];
    
    const tbody = d3.select("#multidimencionalProjectionTable table tbody");
    tbody.append("tr")
        .attr("class", "row_data")
        .selectAll("td")
        .data(d_row_filter).enter()
        .append("td")
        .style("padding", "8px")
        .style("border-bottom", "1px solid #ddd")
        .attr("align", d => isNaN(d) ? "left" : "center")
        .text(d => d);
};

window.populateTableRow = window.populateMPTableRow;

window.resizeMP = function () {
    updateMPDimensions();

    if (forcetsne && WIDTH4 && HEIGHT4) {
        forcetsne.force('center', d3.forceCenter(WIDTH4 / 2, HEIGHT4 / 2));
    }

    if (!isProjectionComputed && currentMPData && currentDataaux) {
        createMPLegend(currentDataaux);
        updateallMP(currentMPData);
        isProjectionComputed = true;
    } else if (currentDataaux) {
        createMPLegend(currentDataaux);
    }
};

// This function now primarily manages MP's own fixed highlight and also clears brush.
window.clearFixedHighlight = function() {
    if (circles) {
        circles.classed("clicked-fixed", false)
               .style("fill", d => colorMP(d[3] + 1)); // Restore original color
    }
    fixedPathMP = null; // Clear the fixed path variable for MP
    
    // Also clear Sunburst highlight
    if (typeof window.clearSunburstHighlight === 'function') {
        window.clearSunburstHighlight();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeMP();
        updateMP("jUnit");
    }, 100);
});

document.addEventListener('DOMContentLoaded', function() {
    const selectRep = document.getElementById('selectRep');
    if (selectRep) {
        selectRep.addEventListener('change', function() {
            const selectedRep = this.value;
            updateMP(selectedRep);
        });
    }
});

window.updateMP = updateMP;
window.initializeMP = initializeMP;