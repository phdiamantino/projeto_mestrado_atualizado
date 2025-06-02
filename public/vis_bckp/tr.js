const MARGIN3 = {LEFT: 10, RIGHT: 40, TOP: 0, BOTTOM: 5}; 
let WIDTH3, HEIGHT3;
let selectedGroup = 'jUnit';
let gTR; 
let yBar; // Moved to global scope

let currentXScale = null;
let currentYScale = null;
let xAxis = null;

// Add SVG
const svgTR = d3.select("#themeRiver").append("svg")
    .classed("svg-container", true)
    .attr("preserveAspectRatio", "xMinYMin meet");

gTR = svgTR.append("g")
    .attr("transform", `translate(${MARGIN3.LEFT},${MARGIN3.TOP})`);

function updateTRDimensions() {
    const container = document.getElementById("themeRiver");
    if (!container) {
        console.error("Theme River container not found");
        return;
    }
    
    WIDTH3 = Math.max(100, container.clientWidth - MARGIN3.LEFT - MARGIN3.RIGHT);
    HEIGHT3 = Math.max(100, container.clientHeight - MARGIN3.TOP - MARGIN3.BOTTOM);
    
    svgTR
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 30 ${WIDTH3 + MARGIN3.LEFT + MARGIN3.RIGHT+70} ${HEIGHT3 +50+ MARGIN3.TOP + MARGIN3.BOTTOM}`)
        .attr("preserveAspectRatio", "xMidYMin meet");
        
    // Remove existing g element before creating new one
    gTR.remove();
    gTR = svgTR.append("g")
        .attr("transform", `translate(${MARGIN3.LEFT},${MARGIN3.TOP})`);
    
    updateTimeYearPosition();
    
    if (window.currentTRData) {
        updateTR(selectedGroup);
    }
}

function updateTimeYearPosition() {
    const container = document.getElementById("themeRiver");
    if (!container) return;
    
    WIDTH3 = Math.max(100, container.clientWidth - MARGIN3.LEFT - MARGIN3.RIGHT);
    HEIGHT3 = Math.max(100, container.clientHeight - MARGIN3.TOP - MARGIN3.BOTTOM);
    
    d3.select(".time-year-text")
        .attr("x", WIDTH3-450)
        .attr("y", HEIGHT3-10);
}

var tooltipTR = d3.select("#themeRiver")
    .append("div").attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "1000")
    .style("opacity", 0)
    .style("font-size", "13px")
    .style("visibility", "hidden")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

tooltipTR.append("div")
    .attr("class", "tooltip-image")
    .style("display", "inline-block")
    .style("width", "25px")
    .style("height", "25px")
    .style("margin-right", "5px")
    .style("vertical-align", "middle");

tooltipTR.append("div")
    .attr("class", "tooltip-text")
    .style("display", "inline-block")
    .style("vertical-align", "middle");

var tooltipBarGraph = d3.select("#barGraph")
    .style("visibility", "hidden")
    .append("svg").attr("width", "65px").attr("height", "190px");

var divTooltip = d3.select("#barGraph").append("div")
    .attr("class", "toolTip");

var tooltipTRimg = d3.select("#themeRiver")
    .append("div").attr("class", "remove")
    .style("position", "absolute")
    .style("font-size", "10px")
    .style("opacity", 0)
    .style("visibility", "hidden")
    .style("padding", "12px");

var tooltipTRcloud = d3.select("#wordCloud")
    .append("div").attr("class", "remove")
    .style("position", "absolute")
    .style("opacity", 0)
    .style("visibility", "hidden")
    .style("width", "405px");

var legendWidth = 400; 
var legendHeight = 18;

var legendTR = d3.select("#legend_tr").append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
    .style("background-color", "#f5f5f5")
    .style("position", "absolute")
    .style("top", "5px") 
    .style("left", "25%")
    .style("transform", "translateX(-10%)")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("padding", "1px")
    .style("border", "1px solid #ddd");

legendTR.append("text").attr("x", 25).attr("y", 13).text("Positive Sentiment").style("font-size", "10px").attr("alignment-baseline","top");
legendTR.append("text").attr("x", 155).attr("y", 13).text("Neutral Sentiment").style("font-size", "10px").attr("alignment-baseline","top");
legendTR.append("text").attr("x", 280).attr("y", 13).text("Negative Sentiment").style("font-size", "10px").attr("alignment-baseline","top");
legendTR.append('image').attr('xlink:href', "https://cdn.shopify.com/s/files/1/1061/1924/products/Smiling_Face_Emoji_large.png?v=1571606036").attr('width', 16).attr('height', 17).attr("x", 3);
legendTR.append('image').attr('xlink:href', "https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_1024x1024.png?v=1571606037").attr('width', 16).attr('height', 15).attr("x", 135);
legendTR.append('image').attr('xlink:href', "https://imagepng.org/wp-content/uploads/2017/11/facebook-grr-raiva-icone.png").attr('width', 15).attr('height', 15).attr("x", 262);

function sentiment(b) {
    if(b == 0) {
        return 'url("https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_1024x1024.png?v=1571606037")';
    } else if (b > 0) {
        return 'url("https://cdn.shopify.com/s/files/1/1061/1924/products/Smiling_Face_Emoji_large.png?v=1571606036")';
    }
    return 'url("https://imagepng.org/wp-content/uploads/2017/11/facebook-grr-raiva-icone.png")';
}

function nthMostCommon(str, amount) {
    const stickyWords = ["you","the","i","","in","if","so","an", "a","testrule","+","45","8"];
    var splitUp = str;
    const wordsArray = splitUp.filter(function(x) {
        return !stickyWords.includes(x);
    });
    var wordOccurrences = {};
    for (var i = 0; i < wordsArray.length; i++) {
        wordOccurrences['_'+wordsArray[i]] = (wordOccurrences['_'+wordsArray[i]] || 0) + 1;
    }
    var result = Object.keys(wordOccurrences).reduce(function(acc, currentKey) {
        for (var i = 0; i < amount; i++) {
            if (!acc[i]) {
                acc[i] = currentKey.slice(1, currentKey.length);
                break;
            } else if (acc[i].occurences < wordOccurrences[currentKey]) {
                acc.splice(i, currentKey.slice(1, currentKey.length));
                if (acc.length > amount)
                    acc.pop();
                break;
            }
        }
        return acc;
    }, []);
    return result;
}

// Data Loading and Initialization
document.addEventListener('DOMContentLoaded', function() {
    d3.csv("data/excomment_sentiments_completo_quintil.csv", d3.autoType).then(function(dataTR) {
        dataTR.forEach(function(d) {
            d.score = +d.score;
            d.value = +d.value;
        });
        
        window.currentTRData = dataTR;
        updateTRDimensions(); // Inicializa com as dimensões corretas
        
        const selectRep = document.getElementById('selectRep');
        if (selectRep) {
            selectRep.addEventListener('change', function() {
                selectedGroup = this.value;
                updateTR(selectedGroup);
            });
        }
    });
});

// Version ID function
function ID(s) {
    const intervals = selectedGroup == 'jUnit' ?
        [
            ["2004-06-01T22:00:00-03:00", "2006-12-27T22:00:00-02:00"],
            ["2006-12-27T22:00:00-02:00", "2009-04-13T21:00:00-03:00"],
            ["2009-04-13T21:00:00-03:00", "2009-07-27T21:00:00-03:00"],
            ["2009-07-27T21:00:00-03:00", "2009-11-30T22:00:00-02:00"],
            ["2009-11-30T22:00:00-02:00", "2011-08-21T21:00:00-03:00"],
            ["2011-08-21T21:00:00-03:00", "2011-09-28T21:00:00-03:00"],
            ["2011-09-28T21:00:00-03:00", "2012-11-12T22:00:00-02:00"],
            ["2012-11-12T22:00:00-02:00", "2014-12-03T22:00:00-02:00"],
            ["2014-12-03T22:00:00-02:00", "2018-02-20T21:00:00-03:00"]
        ] :
        [
            ["2000-01-17T21:00:00-03:00", "2000-07-17T21:00:00-03:00"],
            ["2000-07-18T21:00:00-03:00", "2000-10-23T22:00:00-02:00"],
            ["2000-10-24T22:00:00-02:00", "2001-02-28T21:00:00-03:00"],
            ["2001-03-01T21:00:00-03:00", "2001-09-02T21:00:00-03:00"],
            ["2001-09-03T21:00:00-03:00", "2002-07-08T21:00:00-03:00"],
            ["2002-07-09T21:00:00-03:00", "2003-12-17T22:00:00-02:00"],
            ["2003-12-18T22:00:00-02:00", "2007-10-28T22:00:00-02:00"],
            ["2007-10-29T22:00:00-02:00", "2010-02-01T22:00:00-02:00"],
            ["2010-02-02T22:00:00-02:00", "2013-03-05T21:00:00-03:00"],
            ["2013-03-06T21:00:00-03:00", "2016-12-26T22:00:00-02:00"],
            ["2016-12-27T22:00:00-02:00", "2018-02-02T22:00:00-02:00"],
            ["2018-02-03T22:00:00-02:00", "2018-02-18T21:00:00-03:00"]
        ];
    
    s = new Date(s);
    for (let i = 0; i < intervals.length; i++) {
        const [start, end] = intervals[i].map(d => new Date(d));
        if (s >= start && s < end) return i;
    }
}


function updateTR(selectedGroup) {
    if (!window.currentTRData) {
        console.log('No data available for Theme River');
        return;
    }

    // 🔧 Normalize o valor para comparação consistente
    const group = selectedGroup.trim().toLowerCase();

    console.log('Updating Theme River for group:', group);

    // Limpa visualização anterior
    gTR.selectAll("*").remove();
    d3.selectAll(".myArea").remove();
    d3.select(".vertical").style("opacity", 0);
    d3.select("#words-display").text("");
    d3.select("#barGraph").style("visibility", "hidden");

    tooltipTR.style("opacity", 0).style("visibility", "hidden");
    tooltipTRimg.style("opacity", 0).style("visibility", "hidden");
    tooltipTRcloud.style("opacity", 0).style("visibility", "hidden");

    if (WIDTH3 <= 0 || HEIGHT3 <= 0) {
        console.warn("Invalid dimensions for Theme River");
        return;
    }

    let dataflag;

    if (group === 'junit') {
        dataflag = window.currentTRData.slice(0, 1449);
        yBar = d3.scaleLinear()
            .domain([0, 700])
            .range([HEIGHT3 * 0.8, 0]);
        console.log('✔️ Selected jUnit data, records:', dataflag.length);
    } else if (group === 'apache') {
        dataflag = window.currentTRData.slice(1449);
        yBar = d3.scaleLinear()
            .domain([0, 7000])
            .range([HEIGHT3 * 0.8, 0]);
        console.log('✔️ Selected Apache data, records:', dataflag.length);
    } else {
        console.warn('Unknown group:', selectedGroup);
        return;
    }

    // Reset custom select (Quintil)
    const customSelect = document.getElementById("custom-select-tr");
    if (customSelect) {
        customSelect.value = 'Quintil';
    }

    // Atualiza a visualização com os dados corretos
    console.log(`Updating visualization with group: ${customSelect.value} data length: ${dataflag.length}`);
    updateallTR(dataflag);

    console.log(`Drawing initial graph for group: ${customSelect.value} with selectedGroup: ${group}`);
}

// Complete Visualization Update
window.updateallTR = function(dataS) {
    const container = document.getElementById("themeRiver");
    if (!container) return;
    
    WIDTH3 = Math.max(100, container.clientWidth - MARGIN3.LEFT - MARGIN3.RIGHT);
    HEIGHT3 = Math.max(100, container.clientHeight - MARGIN3.TOP - MARGIN3.BOTTOM);
    
    const customSelect = document.getElementById("custom-select-tr");
    const group = customSelect ? customSelect.value : 'Quintil';
    
    initialGraph(group);
    
    if (customSelect) {
        d3.select("#custom-select-tr").on("change", function(d) {
            const selectedQ = this.value;
            gTR.selectAll("*").remove();
            d3.select(".path").remove();
            initialGraph(selectedQ);
        });
    }

    function initialGraph(group) {
        gTR.selectAll("*").remove();
        
        // Prepare data based on group (Quintil/Decil)
        var nest, keys_score, color;
        
        if (group == 'Quintil') {
            nest = Array.from(d3.group(dataS, d => d.date, d => d.Quintil), 
                ([key, values]) => ({
                    key: key,
                    values: Array.from(values, ([subKey, subValues]) => ({
                        key: subKey,
                        values: subValues
                    }))
                })
            );
            
            keys_score = [0,1,2,3,4];
            color = d3.scaleLinear()
                .domain(keys_score)
                .range(d3.schemeYlOrBr[5]);
        } else {
            nest = Array.from(d3.group(dataS, d => d.date, d => d.Decil), 
                ([key, values]) => ({
                    key: key,
                    values: Array.from(values, ([subKey, subValues]) => ({
                        key: subKey,
                        values: subValues
                    }))
                })
            );
            
            keys_score = [0,1,2,3,4,5,6,7,8,9];
            color = d3.scaleLinear()
                .domain(keys_score)
                .range(d3.schemeYlOrBr[7]);
        }

        // Stacked data
        var stackedData = d3.stack()
            .keys(keys_score)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetSilhouette)
            .value((d, key) => {
                  const group = d.values.find(v => v.key == key);
                  return group ? d3.sum(group.values.map(s => s.score)) : 0;
              })
            (nest);

        // Scales
        var xScale = d3.scaleTime()
            .domain(d3.extent(dataS, d => d.date))
            .range([0, WIDTH3]);
        
        var yScale = d3.scaleLinear()
            .domain([d3.min(stackedData, l => d3.min(l, d => d[0])),
                    d3.max(stackedData, l => d3.max(l, d => d[1]))])
            .range([HEIGHT3 * 0.85, HEIGHT3 * 0.15]); 
        
        gTR.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${HEIGHT3 * 0.85})`)  
            .call(d3.axisBottom(xScale).ticks(15).tickPadding(3).tickSize(4))
            .select(".domain").remove();

        // Posicionamento "Time (Year)"
        gTR.append("text")
            .attr("class", "time-year-text")
            .attr("text-anchor", "end")
            .attr("x", WIDTH3 -500)
            .attr("y", HEIGHT3 * 0.70 + 15) 
            .style("font-size", "12px")
            .text("Time (Year)");

        var area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(new Date(d.data.key)))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));

        var datearray = [];

        var wordsDisplay = d3.select("#words-display");

        var mouseover = function(event, d) {
            d3.selectAll(".myArea").style("opacity", 0.3);
            d3.select(this)
                .style("stroke", "#121212")
                .style("opacity", 1); 
                        
            tooltipTR.style("opacity", 1);
            tooltipTRimg.style("opacity", 1);
            tooltipTRcloud.style("opacity", 1);
            vertical.style("opacity", 1);
        };
                        
        var mousemove = function(event, d) { 
            const [mousex, mousey] = d3.pointer(event); 
            const invertedx = xScale.invert(mousex);
            const id = ID(invertedx);
            
            if (id === undefined || !d[id]) return;
            
            d3.selectAll(".myArea").style("opacity", 0.3);
            d3.select(this).style("opacity", 1);
            
            const i = 0; 
            var selected = d;
            var dataval = d[id].data.values[0].values;
            
            if (!dataval || dataval.length === 0) return;
            
            var vers1 = dataval[0].reference;
            var feeling = sentiment(d3.sum(d[id].data.values[i].values.map(s => s.sentiment)));
            
            var words = d[id].data.values[i].values.map(s => s['words']);
            var words_cleaned = words.filter(val => val).join(", ").split(",");
            
            var resultwords = d[id].data.values[i].values.map(s => s['resultwords']);
            var result_cleaned = resultwords.filter(val => val).join(", ").split(",");

            // Verifica qual opção está selecionada
            var selectedOption = d3.select('input[name="colorButton"]:checked').node();
            var optionValue = selectedOption ? selectedOption.value : 'words';
            
            if (optionValue === 'words') {
                wordsDisplay.text(nthMostCommon(words_cleaned, 7).join(", "));
            } else {
                wordsDisplay.text(nthMostCommon(result_cleaned, 7).join(", "));
            }
            
            d3.select(this)
                .classed("hover", true)
                .attr("stroke-width", "0.5px");
            
            tooltipTR.select(".tooltip-image")
                .style("background-image", feeling)
                .style('background-size', 'cover');
            
            tooltipTR.select(".tooltip-text")
                .html("<b>Version: </b>" + dataval[0].reference + 
                    "</br><b>Score: </b>" + (d.key + 1));
            
            tooltipTR
                .style("visibility", "visible")
                .style("opacity", 1)
                .style("top", (mousey - 50) + "px")  
                .style("left", (mousex + 10) + "px");
        };

        d3.selectAll('input[name="colorButton"]').on('change', function() {
            var selectedOption = this.value;
            var currentText = wordsDisplay.text();
            
            if (currentText) { 
                var mousex = d3.select(".vertical").style("left");
                var mousey = d3.select(".vertical").style("top");
                
                var event = new MouseEvent('mousemove', {
                    clientX: parseInt(mousex) + 5,
                    clientY: parseInt(mousey)
                });
                
                d3.select("#themeRiver").node().dispatchEvent(event);
            }
        });

        var mouseleave = function(event, d) {
            tooltipTR.style("opacity", 0)
                    .style("visibility", "hidden");

            d3.selectAll(".myArea")
                .style("opacity", 1)
                .style("stroke", "none")
                .transition().duration(250)
                .attr("opacity", "1");
            
            d3.select(this)
                .classed("hover", false)
                .attr("stroke-width", "0px");
            
            vertical.style("opacity", 0);
            
            wordsDisplay.text("");
        };

        svgTR.on("mouseleave", function() {
            wordsDisplay.text("");
            tooltipTR.style("opacity", 0).style("visibility", "hidden");
            vertical.style("opacity", 0);
        });

        var initialWord = function(w) {
            if (w == 'words') {
                tooltipTRcloud.html("<i>" + nthMostCommon(words_cleaned, 7) + "</i>")
                    .style("visibility", "visible")
                    .style("font-size", "13px")
                    .style("top", (mousey + 20) + "px")  
                    .style("left", (mousex + 20) + "px"); 
            } else {
                tooltipTRcloud.html("<i>" + nthMostCommon(result_cleaned, 7) + "</i>")
                    .style("visibility", "visible")
                    .style("font-size", "13px")
                    .style("top", (mousey + 40) + "px")  
                    .style("left", (mousex + 20) + "px"); 
            }
        };

        var clickTR = function(event, d) {
            const [mousex, mousey] = d3.pointer(event);
            var invertedx = xScale.invert(mousex);
            var id = ID(invertedx);
            
            if (id === undefined || !d[id]) return;
            
            var dataval = d[id].data.values[0].values;
            if (!dataval || dataval.length === 0) return;
            
            var versionclick = dataval[0].reference;
            
            // Check if PC is available and properly initialized
            if (window.svgPC && typeof window.svgPC.selectAll === 'function') {
                try {
                    // Reset all paths
                    window.svgPC.selectAll('path.line')
                        .style("stroke", "steelblue")
                        .style("stroke-width", 1.7)
                        .style("opacity", 0.7);
                    
                    var versionclick2 = versionclick.replace(/\./g, "-").replace(/\//g, "-");
                    
                    // Highlight selected path
                    var paths = window.svgPC.selectAll("path.line." + versionclick2);
                    if (!paths.empty()) {
                        paths.style("stroke", "green")
                             .style("stroke-width", 2.5)
                             .style("opacity", 1);
                    } else {
                        console.warn("Version not found in Parallel Coordinates:", versionclick2);
                    }
                } catch (error) {
                    console.warn("Error updating Parallel Coordinates:", error);
                }
            } else {
                console.warn("Parallel Coordinates graph is not available or not properly initialized");
            }
            
            function unique(value, index, self) { return self.indexOf(value) === index; }
            
            var data_click = dataS.filter(name_version => name_version.reference == versionclick);
            
            var keysBar, colorBar, dataBar, dataset, dataset2, stackedBar, xBar;
            
            if (d3.select("#custom-select-tr").node().value == 'Quintil') {
                keysBar = [0,1,2,3,4];
                colorBar = d3.scaleLinear().domain(keysBar).range(d3.schemeYlOrBr[5]);
                
                dataBar = Array.from(d3.group(data_click, d => d.Quintil), 
                    ([key, values]) => ({
                        key: key,
                        values: values
                    })
                );
                
                dataset = dataBar.map(function(d,k) {
                    return {
                        "key": parseInt(d.key),
                        "reference": d.values.map(s => s.reference).filter(unique)[0],
                        "score": d3.sum(d.values.map(s => s.score))
                    };
                });
                
                dataset2 = [{
                    "reference": versionclick,
                    "1": dataset[0]?.score || 0,
                    "2": dataset[1]?.score || 0,
                    "3": dataset[2]?.score || 0,
                    "4": dataset[3]?.score || 0,
                    "5": dataset[4]?.score || 0
                }];
            } else {
                keysBar = [0,1,2,3,4,5,6,7,8,9];
                colorBar = d3.scaleLinear().domain(keysBar).range(d3.schemeYlOrBr[7]);
                
                dataBar = Array.from(d3.group(data_click, d => d.Decil), 
                    ([key, values]) => ({
                        key: key,
                        values: values
                    })
                );
                
                dataset = dataBar.map(function(d,k) {
                    return {
                        "key": parseInt(d.key),
                        "reference": d.values.map(s => s.reference).filter(unique)[0],
                        "score": d3.sum(d.values.map(s => s.score))
                    };
                });
                
                dataset2 = [{
                    "reference": versionclick,
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
            
            stackedBar = d3.stack().keys(Object.keys(dataset2[0]).filter(k => k !== 'reference'))(dataset2);
            xBar = d3.scaleBand().domain([versionclick]).rangeRound([5, 60]).padding([0.1]);
            
            tooltipBarGraph.selectAll("*").remove();
            
            tooltipBarGraph.append("g")
                .attr("transform", "translate(-1," + 173 + ")")
                .call(d3.axisBottom(xBar));
            
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
                
                divTooltip.html(`<b>${percentual.toFixed(2)}%</b><br>${value.toFixed(2)}`);
            })
            .on("mouseout", function() {
                divTooltip.style("display", "none");
            });
            
            d3.select("#barGraph").style("visibility", "visible");
        };

        // Draw areas
        gTR.selectAll(".layer")
            .data(stackedData).enter()
            .append("path").attr("class", "myArea")
            .style("stroke-width", 0.3)
            .style("fill", (d,i) => color(i+1))
            .attr("d", area)
            .on("mousemove", mousemove)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("click", clickTR);
    }
};

var vertical = d3.select("#themeRiver")
    .append("path").attr("class", "vertical")
    .style("position", "absolute")
    .style("width", "1.65px")
    .style("height", "120px")
    .style("top", "0px")
    .style("bottom", "30px")
    .style("left", "10px")
    .style("right", "180px")
    .style("background", "MediumBlue")
    .style("opacity", 0);

d3.select("#themeRiver")
    .on("mousemove", function(event) {
        const [mousex, mousey] = d3.pointer(event);
        vertical.style("left", (mousex - 5) + "px");
    })
    .on("mouseover", function(event) {
        const [mousex, mousey] = d3.pointer(event);
        vertical.style("left", (mousex - 5) + "px");
    });



// Make resize function available globally
window.resizeTR = function() {
    updateTRDimensions();
};

// Initialize dimensions
updateTRDimensions();

