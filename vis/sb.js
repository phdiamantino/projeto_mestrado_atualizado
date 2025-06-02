//FLAGSB
const MARGIN2 = {LEFT: 0, RIGHT: 0, TOP: 0, BOTTOM: 0};
const WIDTH2 = 600 - MARGIN2.LEFT - MARGIN2.RIGHT;  // diminui largura
const HEIGHT2 = 300 - MARGIN2.TOP - MARGIN2.BOTTOM; // diminui altura

// Área do SB
const svgSB = d3.select("#sumburst").append("svg") 
    .attr("viewBox", "0 0 600 350")  // viewBox ajustado para nova largura/altura
    .attr("preserveAspectRatio", "xMidYMid meet")
  .append("g")
    .attr("transform", `translate(${WIDTH2 / 2}, ${HEIGHT2 / 2})`);

const partition = d3.partition();

const radius = (Math.min(WIDTH2, HEIGHT2) / 1.8 - 20); // radius ajustado conforme tamanho

const xSB = d3.scaleLinear().range([0, 2 * Math.PI]);
const ySB = d3.scaleSqrt().range([0, radius]);
const arc = d3.arc()
    .startAngle(d => Math.max(0, Math.min(2 * Math.PI, xSB(d.x0))))
    .endAngle(d => Math.max(0, Math.min(2 * Math.PI, xSB(d.x1))))
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.2)
    .innerRadius(d => Math.max(0, ySB(d.y0)))
    .outerRadius(d => Math.max(0, ySB(d.y1)));
    
// cria a hierarquia
function toTree(files) {
    const root = {};
    for (const {key, value} of files) {
        key.match(/[^\/]+/g).reduce((acc, folder) => {
            if (!acc.folders) acc.folders = {};
            return acc.folders[folder] || (acc.folders[folder] = { key: folder, value: null }); 
        }, root).value = value;
    }
    (function recurse(node) {
        if (!node.folders) return;
        node.children = Object.values(node.folders);
        node.children.forEach(recurse);
    })(root);
    return root;
}

d3.json("data/rm_technical_debt.json").then(function(dataSB) {

  updateSB("jUnity");
  d3.select('#formSB').on("change", function(){
    var selectedSB = d3.select(".form-select").node().value;
    svgSB.selectAll("*").remove();
    updateSB(selectedSB);
  });

  function updateSB(selected){ 
    let data;
    if (selected == 'jUnity'){ 
      data = dataSB.slice(0,754);
    } else {        
      data = dataSB.slice(755,6838);
    }

    window.updateall = function(dataS){ 

      const arq = d3.nest()
          .key(d => d.filename)
          .rollup(v => d3.sum(v, d => d.debts.length))
          .entries(dataS);

      const arqJson = toTree(arq);

      const root = d3.hierarchy(arqJson)
          .sum(d => +d.value)
          .sort((a, b) => b.value - a.value);

      // Tooltip fixo, com path na primeira linha e percentual na linha de baixo
      const tooltipSB = svgSB.append("text")
         .attr("font-size", 12)
         .attr("fill", "#000")
         .attr("fill-opacity", 1)
         .attr("text-anchor", "middle")
         .attr("transform", `translate(0, ${HEIGHT2 / 2 })`);  // subiu para dar espaço ao texto

      const tooltipPercent = svgSB.append("text")
         .attr("font-size", 10)
         .attr("fill", "#000")
         .attr("fill-opacity", 1)
         .attr("text-anchor", "middle")
         .attr("transform", `translate(0, ${HEIGHT2 / 2 })`);  // subiu para alinhamento

      function getAncestors(node) {
        var path = [];
        var current = node;
        while (current.parent) {
          path.unshift(current);
          current = current.parent;
        }
        return path;
      }

      function mouseover(d) {
        var sequenceArray = getAncestors(d);

        svgSB.selectAll("path").style("opacity", 0.3);
        svgSB.selectAll("path")
          .filter(node => sequenceArray.indexOf(node) >= 0)
          .style("opacity", 1);

        // Exibir path do arquivo na primeira linha (sem negrito)
        function allPath(node) {
          var path = [];
          var current = node;
          while (current.parent) {
            path.unshift(current.data.key);
            current = current.parent;
          }
          return path.join("/");
        }

        let num = (Math.round((d.value / root.value) * 100)) + '%';

        tooltipSB.html(""); // limpa antes
        tooltipSB.selectAll("tspan").remove();

        tooltipSB.append("tspan")
            .attr("x", 0)
            .attr("dy", "-0.2em")
            .text(allPath(d).replace(/,/g, "/"));

        tooltipSB.append("tspan")
            .attr("x", 0)
            .attr("dy", "1.2em")
            .text("percent of debts: " + num);

        tooltipSB.style("font-weight", "normal");
      }

      function mouseout() {
        tooltipSB.text("");
        tooltipPercent.text("");
        svgSB.selectAll("path").style("opacity", 1);
      }

      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateYlGnBu, root.height + 2))
          .domain([80, 400]);

      svgSB.selectAll("path")
          .data(partition(root).descendants())
          .enter().append("path")
          .attr("d", d => arc(d))
          .style("fill", d => d.depth < 1 ? "Lavender" : color(d.depth))
          .style("fill-opacity", 0.9)
          .attr("stroke", "dimgray")
          .style("stroke-width", 0.3)
          .on("mouseover", mouseover)
          .on("mouseout", mouseout)
          .on("click", click);
    }

    updateall(data);

    function click(d) {
      svgSB.transition()
        .duration(300)
        .tween("scale", function() {
          var xd = d3.interpolate(xSB.domain(), [d.x0, d.x1]),
              yd = d3.interpolate(ySB.domain(), [d.y0, 1]),
              yr = d3.interpolate(ySB.range(), [d.y0 ? 20 : 0, radius]);
          return function(t) {
            xSB.domain(xd(t));
            ySB.domain(yd(t)).range(yr(t));
          };
        })
        .selectAll("path")
        .attrTween("d", d => () => arc(d));
    }
  }
});
