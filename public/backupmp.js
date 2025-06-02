const MARGIN4 = {LEFT:10, RIGHT:10, TOP:0, BOTTOM:10}
const WIDTH4 = 490 - MARGIN4.LEFT - MARGIN4.RIGHT
const HEIGHT4 = 410 - MARGIN4.TOP - MARGIN4.BOTTOM

svgMP = d3v4.select("#legendmp").append("svg") 
        .attr("viewBox", "-70 0 700 710")
        .attr("preserveAspectRatio", "xMidYMid meet")
        /*const svgMP = d3.select('#legendmp').append('svg')
            .attr('width', 900 )
            .attr('height', 500 );*/

const x = d3.scaleLinear()
    .domain([-200, 200])
    .range([0, WIDTH4]),
    area = d3.area()
       .x((d,i) => i)
       .y0(WIDTH4+90)
       .y1((d,i) => WIDTH4 + 90 - parseInt(3 * d||0));


d3v4.queue()
    .defer(d3v4.text, 'tsne.min.js')
    .defer(d3v4.text, 'worker.js')
    .await(function (err, t, w) {

        const worker = new Worker(window.URL.createObjectURL(new Blob([t + w], {
            type: "text/javascript"
        })));


d3.csv("data/excomment_mp_junit.csv", d3.autoType).then(function(data) {

        dataProj = data.map(d=> [+d.score/80,+d.patern/80,+d.heuristic/80,+d.count_reference/80,+d.count_debts/80,])
        
     //dataProj = d3.range(300).map(d => [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()]);


console.log(dataProj)

const circles = svgMP.selectAll('circle')
    .data(dataProj).enter()
    .append('circle')
    .attr('r', d => d.r = 3 + 8 * d[4] * d[4])
    .attr('stroke-width', 0.3)
    .attr('fill', d => d3.rgb(d[0] * 256, d[1] * 256, d[2] * 256))
    .attr('stroke', d => d3.rgb(d[0] * 256, d[1] * 256, d[2] * 256))
    .attr('opacity', d => 0.3 + 0.7 * d[3]);

const cost = svgMP.append('path')
    .attr('fill', '#aaa');            

let pos = dataProj.map(d => [Math.random() - 0.5, Math.random() - 0.5]);
let costs = [];

let s = 0, c = 1;

const forcetsne = d3.forceSimulation(dataProj)
.alphaDecay(0)
.alpha(0.1)
.force('tsne', function(alpha){
    dataProj.forEach((d,i) => {
    d.x += alpha * (150*pos[i][0] - d.x);
    d.y += alpha * (150*pos[i][1] - d.y);
  });
})
// orient the results so that reds (dimension 0) are at bottom
.force('orientation', function(){
  let tx = 0,
      ty = 0;
dataProj.forEach((d,i) => {
    tx += d.x * d[0];
    ty += d.y * d[0];
  });
  let angle = Math.atan2(ty,tx);
  s = Math.sin(angle);
  c = Math.cos(angle);
})
.force('collide', d3.forceCollide().radius(d => 1 + d.r))
.on('tick', function () {
  circles
    .attr('cx', d => x(d.x*s - d.y*c))
    .attr('cy', d => x(d.x*c + d.y*s));
  // debug: show costs graph
  // cost.attr('d', area(costs));
});


worker.onmessage = function (e) {
    if (e.data.pos) pos = e.data.pos;
    if (e.data.iterations) { 
      costs[e.data.iterations] = e.data.cost;
    }
    if (e.data.stop) { 
      console.log("stopped with message", e.data);
      forcetsne.alphaDecay(0.02);
      worker.terminate();
    }
};
worker.postMessage({
    maxIter: 10,
    dim: 2,
    perplexity: 80.0,
    data: dataProj
});
    
    
    
    
    
    
    
    })




        /*
     worker.postMessage({
      maxIter: 10000,
      dim: 1,
      perplexity: 80.0,
      data: data }); */

      /*   nIter: maxIter,
            // dim: 2,
            perplexity: 20.0,
            // earlyExaggeration: 4.0,
            // learningRate: 100.0,
            metric: 'manhattan', //'euclidean',
            data: data */

    });