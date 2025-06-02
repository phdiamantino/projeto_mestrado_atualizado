//FLAGMP
 const MARGIN4 = {LEFT:10, RIGHT:10, TOP:0, BOTTOM:10}
 const WIDTH4 = 490 - MARGIN4.LEFT - MARGIN4.RIGHT
 const HEIGHT4 = 410 - MARGIN4.TOP - MARGIN4.BOTTOM
 
 svgMP = d3v4.select("#legendmp").append("svg") 
         .attr("viewBox", "-70 0 800 810")
         .attr("preserveAspectRatio", "xMidYMid meet")
            
 updateMP("jUnity") 
   d3.select('#formMP')
          .on("change",function(){
             var selectedMP = d3.select(".form-select").node().value;//var selectedMP = d3.select(this).property("value")
             console.log(selectedMP)
             svgMP.selectAll("*").remove();
             updateMP(selectedMP) 
   })
 
 
 
  function updateMP(selectedGroup) {
 
  if (selectedGroup === 'jUnity'){  //flag
 
 
   // Àrea da TABELA
   const svgMPtable = d3v4.select("#multidimencionalProjectionTable").append("svg") 
 
   var legendsvg = svgMP.append("g")
          .attr("width", 450)
          .attr("height", 50)
   
       //color = d3v4.scaleSequential(d3.interpolateHcl("#fcdc8c", "#5e0f07"))//d3v4.scaleSequential(d3.interpolatePlasma), //interpolatePlasma /interpolateViridis 
   window.colorMP = d3v4.scaleQuantize()
          .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900" ]);
   var xScale = d3v4.scaleLinear() 
              .range([10, WIDTH4])
 
   var x = d3.scaleLinear()
     .domain([-200, 200])
     .range([0, WIDTH4])
             
d3v4.queue()
    .defer(d3v4.text, 'tsne.min.js')
    .defer(d3v4.text, 'worker.js')
    .await(function (err, t, w) {
        const worker = new Worker(window.URL.createObjectURL(new Blob([t + w], {
            type: "text/javascript"
        })));

 
 d3.csv("data/excomment_mp_junit.csv", d3.autoType).then(function(dataaux) { 
           //Legnda 
         l_scale = d3v4.extent(dataaux, d => +d.score);
         l_color = d3v4.scaleQuantize()
            .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900" ]);
         l_color.domain(l_scale);
     
         var lScale = d3v4.scaleLinear()
             .domain([0, d3v4.max(l_scale)])
             .range([WIDTH4/4, WIDTH4 -WIDTH4/4])
     
           //Gráfico de cores
         legendsvg.selectAll("rect")
           .data(pair(lScale.ticks(10)))
           .enter().append("rect")
             .attr("class", "legendRect")
             .attr("y",25)
             .attr("x", d=> 370 + lScale(d[0]))
             .attr("height", 8)
             .attr("width", d=> lScale(d[1]) - lScale(d[0]) )
               .style("fill", d=>  l_color(d[0]))
               
             //Titulo 
         legendsvg.append("text")
             .attr("class", "legendTitle")
             .attr("x",545).attr("y", 15)
             .attr("height", 8).attr("width", 20)
             .text("Comments Score")
               .style("font-weight", "bold")
                 
             // X axis da legenda
          const lAxis = d3v4.axisBottom(lScale)
               .ticks(8).tickSize(10)
               .tickPadding(5)
               .tickFormat(d3v4.format(".0f"))
           legendsvg.append("g")
               .attr("class", "axis") 
               .attr("transform", "translate(" + (370) + "," + (25) + ")")
               .call(lAxis);
           function pair(array) {
                 return array.slice(1).map(function(b, i) {
                   return [array[i], b];
                 });
               }
 
 
     function clicked(d,index) {
 
         circles.attr("class", "non_brushed")
                 .attr("r", d => d.r = 4 + 0.7 * d[4])
                 //.attr('opacity', d => 0.8 + 0.5 * d[2])
                 .attr('opacity', 0.8)
                 .style("fill", d => colorMP(d[3]+1));
 
           if (d3v4.event.defaultPrevented) return;
               console.log(d)
               console.log(index)
               console.log(dataaux[index])
               //console.log(d.heuristic + " /// " +d.score)
           d3.select(this)
                 .attr('r', d => d.r = 2+4 + 0.7 * d[4]) 
                 .transition().duration(600)
                   .attr('r', d => d.r = 1 + 4 + 0.7 * d[4]) 
                   .attr("class", "clicked")
                   .style("fill", "green")
                   //.attr('opacity', d => 0.90 + 0.5 * d[2])
                   .attr('opacity', 0.8)
           
               clearTableRows();
                 //Exibir na tabela
               populateTableRow(dataaux[index])
                 // Comunicação com o hilight 
               highlightsb(dataaux[index]);
               console.log(dataaux[index])
 
               d3.select(this)
                   .attr("class", "non_brushed")
                   .style("fill", d => colorMP(d.score))
                   //.attr('opacity', d => 0.6 + 0.4 * d.heuristic)
                   .attr('opacity', 0.8)
 
         }  hideTableColNames()      
         
 
 
 d3.csv("data/excomment_mp_junit_standard.csv", d3.autoType).then(function(data) {
    data = data.map(d=> [+d.count_reference, +d.patern, +d.heuristic, +d.score,+d.count_debts
                             ,d['r_master'],d['r_r3.8.2'],d['r_r4.10'],d['r_r4.11'],d['r_r4.12'],d['r_r4.6'],d['r_r4.7'],d['r_r4.8'],d['r_r4.9']
                             ,d['d_CODE_DEBT'],d['d_DEFECT_DEBT'],d['d_DESIGN_DEBT'],d['d_TEST_DEBT'],d['d_UNKNOWN_DEBT']
                             ,d['i_CODE_DEBT_I'],d['i_COMMENT_ANALYSIS'],d['i_COMPLEX_METHOD'],d['i_DEFECT_DEBT_I'],d['i_DESIGN_DEBT_I'],d['i_DUPLICATED_CODE'],d['i_FEATURE_ENVY'],d['i_GOD_CLASS'],d['i_TEST_DEBT_I'],d['i_UNKNOWN_DEBT_I']    ])
         
     //console.log(dataProj)
      console.log(dataaux)
      dataProj = data

     window.reDrawMP = function(name_version){
          circles.style("fill", d => colorMP(d[3]+1))
          circles.attr("class", "non_brushed")
           version_clicked = name_version.key
           console.log(name_version)
           console.log(version_clicked + " OKKKK")
           ids = [], k = 0
           dataaux.forEach((d,i)=> d.reference.indexOf(version_clicked) !=-1  ? ids.push(i) : k=0)
           console.log(ids)
           console.log(dataaux.filter(d=> d.reference.indexOf(version_clicked) !=-1))

           data_filter =[]
           const witchElement = data.map(el => {
              if(ids.includes(el.index)) {
                  data_filter.push(el)  }
              })
          console.log(data_filter)
              //Deixar circulos em highlight ao clique na polilinha
           circles.filter((d)=> ids.includes(d['index']))
              .style("fill", "green")
              .attr("class", "brushed")
           //Aparecer na tabela
            var d_brushed =  d3v4.selectAll(".brushed").data();
              clearTableRows();
            d_brushed.forEach(d_row => populateTableRow(dataaux[d_row['index']]))

         }
     console.log(data)
     console.log(data.length)
 
 
   window.updateallMP = function(data){ 
     
     brush = d3v4.brush()
           .extent( [ [0,0], [600,600] ] ) //área do brush
           .on("brush", highlightBrushedCircles)
           .on("end", displayTable)     
     svgMP.append("g")
           .call(brush)
    
      //Domain 
    var d_extent_x = d3v4.extent(data, d => d[1]);
         d_extent_x[0] = d_extent_x[0] 
         d_extent_x[1] = d_extent_x[1] 
         console.log(d_extent_x)
         xScale.domain(d_extent_x);
    var d_extent_color = d3v4.extent(data, d => d[3]);
     colorMP.domain(d_extent_color);
         console.log(d_extent_color)
 
 
     //  Circulos
    circles = svgMP.selectAll('circle')
        .data(data).enter().append('circle').attr("class", "non_brushed")
        .attr("pointer-events", "all")
        .attr('r', d => d.r = 4 + 0.7 * d[4])    //.attr('r', 6) //count_debts
        .style("stroke", "#555")
        .attr('stroke-width', 0.8)
        //.attr('opacity', d => 0.8 + 0.5 * d[2]) //heuristic
        .attr('opacity', 0.8)
        .attr("class", "non_brushed")
        .style("fill", d => colorMP(d[3]+1))         //score
      circles.on("click", clicked)
 
         //  Pan e zoom    
     zoom = d3v4.zoom()
         //.scaleExtent([1, 40])
         .scaleExtent([1, 20])   //0.5
         .extent([[0, 0], [WIDTH4, HEIGHT4]])
         .translateExtent([[-100, -100], [WIDTH4 + 90, HEIGHT4 + 100]])
         .on("zoom", zoomed);
     // PLOTA EIXOS
     var xAxis = d3v4.axisBottom(xScale)
         .ticks((WIDTH4 + 2) / (HEIGHT4 + 2) * 10)
         .tickSize(HEIGHT4)
         .tickPadding(8 - HEIGHT4);
     var yAxis = d3v4.axisRight(xScale)
         .ticks(10)
         .tickSize(WIDTH4)
         .tickPadding(8 - WIDTH4);
     svgMP.call(zoom);
     function zoomed() {
         circles.attr("transform", d3v4.event.transform)
             xAxis.scale(d3v4.event.transform.rescaleX(xScale))
             yAxis.scale(d3v4.event.transform.rescaleY(xScale)) }
     d3v4.select("button")
         .on("click", resetted);
     function resetted() {
         svgMP.transition()
             .duration(750)
             .call(zoom.transform, d3v4.zoomIdentity) }
 
 
         //Mouseover no Sunburst reflete na MP
     window.mouseoversb = function(arqv){
             console.log(arqv)
             function allPath(node) {
                 var path = [];
                 var current = node;
                 console.log(current)
                 while (current.parent) {
                   path.unshift(current.data.key);
                   current = current.parent;
                 }
                 return path.toString()
             }
              
             arquivo = allPath(arqv).replace(/,/g,"/")
             console.log(arquivo) 
 
             selecionado =[]     //busca pelo nome
             idselecionado =[]   //busca pelo id
              j=0

              dataaux.map(d=> arquivo == d.filename 
                                      ? selecionado.push(d.filename)
                                      : j=j)
              dataaux.map((d,i)=> arquivo == d.filename 
                                        ? idselecionado.push(i)
                                        : j=j)
            console.log(selecionado)
            console.log(idselecionado)
            circles
              .style("fill", d => colorMP(d[3]+1))
              //.attr('opacity', d => 0.8 + 0.5 * d[2])
              .attr('opacity', 0.8)
            circles.filter(d=> d.index==idselecionado)
              .style("fill","green")
              //.attr('opacity',1)
         }
 
  // PROJEÇÂO
    cost = svgMP.append('path')
         .attr('fill', '#aaa');            
 
    let pos = data.map(d => [Math.random() - 0.5, Math.random() - 0.5]);
    let costs = [];
 
    let s = 0, c = 1;
 
    forcetsne = d3.forceSimulation(data)
       .alphaDecay(0)
       .alpha(0.1)
       .force('tsne', function(alpha){
           data.forEach((d,i) => {
           d.x += alpha * (150*pos[i][0] - d.x);
           d.y += alpha * (150*pos[i][1] - d.y);
         });
       })
     // orient the results so that reds (dimension 0) are at bottom
     .force('orientation', function(){
       let tx = 0,
           ty = 0;
      data.forEach((d,i) => {
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
       circles.append('g')
         .append('title').text(d => d.filename)
       // debug: show costs graph
       // cost.attr('d', area(costs));
     });

 
  //Função Brush
  function highlightBrushedCircles() {
 
     if (d3v4.event.selection != null) {
         // Preserva/reverte os circulos não selecionados
       circles.attr("class", "non_brushed")
           .attr("r", d => d.r = 4 + 0.7 * d[4])
           //.attr('opacity', d => 0.8 + 0.5 * d[2])
           .attr('opacity', 0.8)
           .style("fill", d => colorMP(d[3]+1))
       
       var brush_coords = d3v4.brushSelection(this);
 
       // style brushed circles 
       circles.filter(function (d,i){
                 var cx = d3v4.select(this).attr("cx"),
                     cy = d3v4.select(this).attr("cy");
                   return isBrushed(brush_coords, cx, cy);
            })
           .attr("r", d => d.r = 4 + 0.7 * d[4])
           //.classed("brushed", (d)=> console.log(d['index']) )
           .attr("class", "brushed")
           //.attr("stroke","red").attr('stroke-width', 0.5)
           .style("fill", "green")
           //.attr('opacity', d => 0.8 + 0.5 * d[2]);
           .attr('opacity', 0.8)
     }
   }
 
   function displayTable() {
        // desconsidera pontos não selecionados 
       if (!d3v4.event.selection) return;

        // limpeza após mouse-up
        d3.select(this).call(brush.move, null);
 
        // limpeza após mouse-up
       var d_brushed =  d3v4.selectAll(".brushed").data();
       // Cria a tabela se um ou mais elementos forem escovados
       if (d_brushed.length > 0) {
           clearTableRows();
           d_brushed.forEach(d_row => populateTableRow(dataaux[d_row['index']]))
       } else {
           clearTableRows();
       }
   }
 
   svgMPtable.append("g")
     .call(brush);
 
 
     function update(){
         d3v4.selectAll(".form-check-input").each(function(d){
         cb = d3.select(this);
         //grp = cb.property("value")
         console.log(cb.property("checked"))
             // Se estiver marcado, a força é aplicada
           if(cb.property("checked")){
              forcetsne.force('collide', d3v4.forceCollide().radius(d => 1 + d.r))
              .alphaDecay(0).alpha(0.1)
              .force('tsne', function(alpha){
                  data.forEach((d,i) => {
                  d.x += alpha * (150*pos[i][0] - d.x);
                  d.y += alpha * (150*pos[i][1] - d.y);
                });
              })
              // Se estiver desmarcado, atua sem a força
             }else{
              forcetsne.force('collide', d3v4.forceCollide().radius(d => 1 + 0))
                .alphaDecay(0).alpha(0.1)
                .force('tsne', function(alpha){
                    data.forEach((d,i) => {
                    d.x += alpha * (150*pos[i][0] - d.x);
                    d.y += alpha * (150*pos[i][1] - d.y);
                  });
                })
 
           }
          })
         }   
         // Quando o botão muda, executa a atualização
       d3v4.selectAll(".form-check-input").on("change",update);
         // Inicializa no começo
       update()   


 
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
      maxIter: 10,//10
      dim: 2,
      perplexity: 30.0,
      metric: 'euclidean',
      data: data
      });//dataset2   
    }//End UpdateallMP
    updateallMP(data)
 
       
   }); //dataset2
 
 }) //dataset1
 
 
     // Função limpeza do brush e tabela
   function clearTableRows() {
         hideTableColNames();
         d3v4.selectAll(".row_data").remove();
     }
 
     //function isBrushed(brush_coords, cx, cy) {
       window.isBrushed = function(brush_coords, cx, cy){
           var x0 = brush_coords[0][0],
               x1 = brush_coords[1][0],
               y0 = brush_coords[0][1],
               y1 = brush_coords[1][1];
           return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
     }
 
       window.hideTableColNames = function(){
       d3v4.select("table").style("visibility", "hidden");    }
 
     //function showTableColNames() {
       window.showTableColNames = function(){
       d3v4.select("table").style("visibility", "visible");   }
 
 
 
     //function populateTableRow(d_row) {
       window.populateTableRow = function(d_row){
         showTableColNames();
 
         d_row_filter = [d_row.filename.substr(0, d_row.filename.length - 5),
                               d_row.reference,
                               Math.round(d_row.patern),//.substr(0, 5),
                               Math.round(d_row.heuristic),//.substr(0, 4),
                               Math.round(d_row.score),//.substr(0, 4), 
                               Math.round(d_row.count_debts),//.substr(0, 1),
                               d_row.debts,
                               d_row.indicators,
                               //d.commit
                             ]; 
           d3v4.select("table").append("tr")
             .attr("class", "row_data")
             .selectAll("td")
             .data(d_row_filter).enter()
             .append("td")
             .attr("align", d => isNaN(d) == true ? "left" : "center") /*colocar numerais no centro*/
             .text(d => d)
             //.style("border", "1px black solid")
 
     }
     
 });
 
 
 
 
 
 
 
 
 
 



 
 
 
 
 
 
   } else {//flag
 
   // Àrea da TABELA
   const svgMPtable = d3v4.select("#multidimencionalProjectionTable").append("svg") 
 
   const legendsvg = svgMP.append("g")
          .attr("width", 450)
          .attr("height", 50)
   
       //color = d3v4.scaleSequential(d3.interpolateHcl("#fcdc8c", "#5e0f07"))//d3v4.scaleSequential(d3.interpolatePlasma), //interpolatePlasma /interpolateViridis 
   colorMP = d3v4.scaleQuantize()
          .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900" ]);
   xScale = d3v4.scaleLinear() 
              .range([10, WIDTH4])
 
   const x = d3.scaleLinear()
     .domain([-200, 200])
     .range([0, WIDTH4])
    /*area = d3.area()
        .x((d,i) => i)
        .y0(WIDTH4+90)
        .y1((d,i) => WIDTH4 + 90 - parseInt(3 * d||0));*/
  
                   
d3v4.queue()
    .defer(d3v4.text, 'tsne.min.js')
    .defer(d3v4.text, 'worker.js')
    .await(function (err, t, w) {
        const worker = new Worker(window.URL.createObjectURL(new Blob([t + w], {
            type: "text/javascript"
        })));
 
 d3.csv("data/excomment_mp_apache.csv", d3.autoType).then(function(dataaux) { 
           //Legnda 
        const l_scale = d3v4.extent(dataaux, d => +d.score);
        const l_color = d3v4.scaleQuantize()
            .range(["#fed98e","#fe9929","#d95f0e","#993404","#590900" ]);
        l_color.domain(l_scale);
     
        const lScale = d3v4.scaleLinear()
              .domain([0, 2600]) //.domain([0, d3v4.max(l_scale)]) // 
              .range([WIDTH4/4, WIDTH4 -WIDTH4/4])
     
           //Gráfico de cores
        legendsvg.selectAll("rect")
           .data(pair(lScale.ticks(10)))
           .enter().append("rect")
             .attr("class", "legendRect")
             .attr("y",25)
             .attr("x", d=> 370 + lScale(d[0]))
             .attr("height", 8)
             .attr("width", d=> lScale(d[1]) - lScale(d[0]) )
               .style("fill", d=>  l_color(d[0]))
               
             //Titulo 
         legendsvg.append("text")
             .attr("class", "legendTitle")
             .attr("x",540).attr("y", 15)
             .attr("height", 8).attr("width", 20)
             .text("Comments Score")
               .style("font-weight", "bold")
                 
             // X axis da legenda
         const lAxis = d3v4.axisBottom(lScale)
               .ticks(9).tickSize(11)
               .tickPadding(5)
               //.tickFormat(d3v4.format(".0f"))
               .tickFormat(d=> (d / 1000) + "K" )
           legendsvg.append("g")
               .attr("class", "axis") 
               .attr("transform", "translate(" + (370) + "," + (25) + ")")
               .call(lAxis);
           function pair(array) {
                 return array.slice(1).map(function(b, i) {
                   return [array[i], b];
                 });
               }
 
 
     function clicked(d,index) {
 
         circles.attr("class", "non_brushed")
                 .attr("r", d => d.r = 4 + 0.7 * d[4])
                 //.attr('opacity', d => 0.8 + 0.5 * d[2])
                 .attr('opacity', 0.8)
                 .style("fill", d => colorMP(d[3]+1));
 
           if (d3v4.event.defaultPrevented) return;
               console.log(d)
               console.log(index)
               console.log(dataaux[index])
               //console.log(d.heuristic + " /// " +d.score)
           d3.select(this)
                 .attr('r', d => d.r = 2+4 + 0.6 * d[4]) 
                 .transition().duration(600)
                   .attr('r', d => d.r = 1 + 4 + 0.7 * d[4]) 
                   .attr("class", "clicked")
                   .style("fill", "green")
                   //.attr('opacity', d => 0.90 + 0.5 * d[2])
                   .attr('opacity', 0.8)
           
               clearTableRows();
                 //Exibir na tabela
               populateTableRow(dataaux[index])
                 // Comunicação com o hilight 
               highlightsb(dataaux[index]);
 
               d3.select(this)
                   .attr("class", "non_brushed")
                   .style("fill", d => colorMP(d.score))
                   //.attr('opacity', d => 0.6 + 0.4 * d.heuristic)
                   .attr('opacity', 0.8)
 
         }  hideTableColNames()      
         
 
 
 d3.csv("data/excomment_mp_apache_standard.csv", d3.autoType).then(function(data) {
    data = data.map(d=> [+d.count_reference, +d.patern, +d.heuristic, +d.score,+d.count_debts
                ,d['r_master'],d['r_rel/1.1'],d['r_rel/1.10.0'],d['r_rel/1.10.2'],d['r_rel/1.2'],d['r_rel/1.3'],d['r_rel/1.4'],d['r_rel/1.5'],d['r_rel/1.6.0'],d['r_rel/1.7.0'],d['r_rel/1.8.0'],d['r_rel/1.9.0']
                ,d['d_BUILD_DEBT'],d['d_CODE_DEBT'],d['d_DEFECT_DEBT'],d['d_DESIGN_DEBT'],d['d_DOCUMENTATION_DEBT'],d['d_TEST_DEBT'],d['d_UNKNOWN_DEBT']
                ,d['i_BRAIN_METHOD'],d['i_BUILD_DEBT_I'],d['i_CODE_DEBT_I'],d['i_COMMENT_ANALYSIS'],d['i_COMPLEX_METHOD'],d['i_DEFECT_DEBT_I'],d['i_DESIGN_DEBT'],d['i_DOCUMENTATION_DEBT_I'],d['i_DUPLICATED_CODE'],d['i_FEATURE_ENVY'],d['i_GOD_CLASS'],d['i_TEST_DEBT_I'],d['i_UNKNOWN_DEBT_I']
            ])
     //console.log(dataProj)
      console.log(dataaux)
      dataProj = data
   
     window.reDrawMP = function(name_version){
          circles.style("fill", d => colorMP(d[3]+1))
          circles.attr("class", "non_brushed")
           version_clicked = name_version.key
           console.log(name_version)
           console.log(version_clicked + " OKKKK")
           ids = [], k = 0
           dataaux.forEach((d,i)=> d.reference.indexOf(version_clicked) !=-1  ? ids.push(i) : k=0)
           console.log(ids)
           console.log(dataaux.filter(d=> d.reference.indexOf(version_clicked) !=-1))

           data_filter =[]
           const witchElement = data.map(el => {
              if(ids.includes(el.index)) {
                  data_filter.push(el)  }
              })
          console.log(data_filter)
              //Deixar circulos em highlight ao clique na polilinha
           circles.filter((d)=> ids.includes(d['index']))
              .style("fill", "green")
              .attr("class", "brushed")
           //Aparecer na tabela
            var d_brushed =  d3v4.selectAll(".brushed").data();
              clearTableRows();
            d_brushed.forEach(d_row => populateTableRow(dataaux[d_row['index']]))
         }

     console.log(data)
     console.log(data.length)
 
 
   window.updateallMP = function(data){ 
     
     var brush = d3v4.brush()
           .extent( [ [0,0], [500,500] ] ) //área do brush
           .on("brush", highlightBrushedCircles)
           .on("end", displayTable)     
     svgMP.append("g")
           .call(brush)
    
      //Domain 
    var d_extent_x = d3v4.extent(data, d => d[1]);
         d_extent_x[0] = d_extent_x[0] 
         d_extent_x[1] = d_extent_x[1] 
         console.log(d_extent_x)
         xScale.domain(d_extent_x);
    var d_extent_color = d3v4.extent(data, d => d[3] );
     colorMP.domain(d_extent_color);
         console.log(d_extent_color)
 
 
     //  Circulos
    circles = svgMP.selectAll('circle')
        .data(data).enter().append('circle').attr("class", "non_brushed")
        .attr("pointer-events", "all")
        .attr('r', d => d.r = 4 + 0.7 * d[4])    //.attr('r', 6) //count_debts
        .style("stroke", "#555")
        .attr('stroke-width', 0.8)
        //.attr('opacity', d => 0.8 + 0.5 * d[2]) //heuristic
        .attr('opacity', 0.8)
        .attr("class", "non_brushed")
        .style("fill", d => colorMP(d[3]+1))         //score
        circles.on("click", clicked)
 
         //  Pan e zoom    
     zoom = d3v4.zoom()
         //.scaleExtent([1, 40])
         .scaleExtent([1, 20])   //0.5
         .extent([[0, 0], [WIDTH4, HEIGHT4]])
         .translateExtent([[-100, -100], [WIDTH4 + 90, HEIGHT4 + 100]])
         .on("zoom", zoomed);
     // PLOTA EIXOS
     var xAxis = d3v4.axisBottom(xScale)
         .ticks((WIDTH4 + 2) / (HEIGHT4 + 2) * 10)
         .tickSize(HEIGHT4)
         .tickPadding(8 - HEIGHT4);
     var yAxis = d3v4.axisRight(xScale)
         .ticks(8).tickSize(WIDTH4)
         .tickPadding(5);
     svgMP.call(zoom);
     function zoomed() {
         circles.attr("transform", d3v4.event.transform)
             xAxis.scale(d3v4.event.transform.rescaleX(xScale))
             yAxis.scale(d3v4.event.transform.rescaleY(xScale)) }
     d3v4.select("button")
         .on("click", resetted);
     function resetted() {
         svgMP.transition()
             .duration(750)
             .call(zoom.transform, d3v4.zoomIdentity) }
 
 
         //Mouseover no Sunburst reflete na MP
     window.mouseoversb = function(arqv){
             console.log(arqv)
             function allPath(node) {
                 var path = [];
                 var current = node;
                 console.log(current)
                 while (current.parent) {
                   path.unshift(current.data.key);
                   current = current.parent;
                 }
                 return path.toString()
             }
              
             arquivo = allPath(arqv).replace(/,/g,"/")
             console.log(arquivo) 
 
             selecionado =[]     //busca pelo nome
             idselecionado =[]   //busca pelo id
              j=0

              dataaux.map(d=> arquivo == d.filename 
                                      ? selecionado.push(d.filename)
                                      : j=j)
              dataaux.map((d,i)=> arquivo == d.filename 
                                        ? idselecionado.push(i)
                                        : j=j)
            console.log(selecionado)
            console.log(idselecionado)
            circles
              .style("fill", d => colorMP(d[3]+1))
              //.attr('opacity', d => 0.8 + 0.5 * d[2])
              .attr('opacity', 0.8)
            circles.filter(d=> d.index==idselecionado)
              .style("fill","green")
              //.attr('opacity',1)
         }
 
  // PROJEÇÂO
    cost = svgMP.append('path')
         .attr('fill', '#aaa');            
 
    let pos = data.map(d => [Math.random() - 0.5, Math.random() - 0.5]);
    let costs = [];
 
    let s = 0, c = 1;
    
 
    forcetsne = d3.forceSimulation(data)
       .alphaDecay(0)
       .alpha(0.1)
       .force('tsne', function(alpha){
           data.forEach((d,i) => {
           d.x += alpha * (320*pos[i][0] - d.x);
           d.y += alpha * (320*pos[i][1] - d.y);
         });
       })
     // orient the results so that reds (dimension 0) are at bottom
     .force('orientation', function(){
       let tx = 0,
           ty = 0;
        data.forEach((d,i) => {
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
       circles.append('g')
         .append('title').text(d => d.filename)
       // debug: show costs graph
       // cost.attr('d', area(costs));
     });

 
  //Função Brush
  function highlightBrushedCircles() {
 
     if (d3v4.event.selection != null) {
         // Preserva/reverte os circulos não selecionados
       circles.attr("class", "non_brushed")
           .attr("r", d => d.r = 4 + 0.7 * d[4])
           //.attr('opacity', d => 0.8 + 0.5 * d[2])
           .attr('opacity', 0.8)
           .style("fill", d => colorMP(d[3]+1))
       
       var brush_coords = d3v4.brushSelection(this);
 
       // style brushed circles 
       circles.filter(function (d,i){
                 var cx = d3v4.select(this).attr("cx"),
                     cy = d3v4.select(this).attr("cy");
                   return isBrushed(brush_coords, cx, cy);
            })
           .attr("r", d => d.r = 4 + 0.7 * d[4])
           //.classed("brushed", (d)=> console.log(d['index']) )
           .attr("class", "brushed")
           //.attr("stroke","red").attr('stroke-width', 0.5)
           .style("fill", "green")
           //.attr('opacity', d => 0.8 + 0.5 * d[2]);
           .attr('opacity', 0.8)
     }
   }
 
   function displayTable() {
        // desconsidera pontos não selecionados 
       if (!d3v4.event.selection) return;
       
        // limpeza após mouse-up
        d3.select(this).call(brush.move, null);
 
        // limpeza após mouse-up
       var d_brushed =  d3v4.selectAll(".brushed").data();
       // Cria a tabela se um ou mais elementos forem escovados
       if (d_brushed.length > 0) {
           clearTableRows();
           d_brushed.forEach(d_row => populateTableRow(dataaux[d_row['index']]))
       } else {
           clearTableRows();
       }
   }
 
   svgMPtable.append("g")
     .call(brush);
 
 
     function update(){
         d3v4.selectAll(".form-check-input").each(function(d){
         cb = d3.select(this);
         grp = cb.property("value")
             // Se estiver marcado, a força é aplicada
           if(cb.property("checked")){
              forcetsne.force('collide', d3v4.forceCollide().radius(d => 1 + d.r))
              .alphaDecay(0).alpha(0.1)
              .force('tsne', function(alpha){
                  data.forEach((d,i) => {
                  d.x += alpha * (150*pos[i][0] - d.x);
                  d.y += alpha * (150*pos[i][1] - d.y);
                });
              })
              // Se estiver desmarcado, atua sem a força
             }else{
              forcetsne.force('collide', d3v4.forceCollide().radius(d => 1 + 0))
                .alphaDecay(0).alpha(0.1)
                .force('tsne', function(alpha){
                    data.forEach((d,i) => {
                    d.x += alpha * (150*pos[i][0] - d.x);
                    d.y += alpha * (150*pos[i][1] - d.y);
                  });
                })
           }
          })
         }   
         // Quando o botão muda, executa a atualização
       d3v4.selectAll(".form-check-input").on("change",update);
         // Inicializa no começo
       update()   
 
  worker.onmessage = function (e) {
      if (e.data.pos) pos = e.data.pos;
      if (e.data.iterations) { 
        costs[e.data.iterations] = e.data.cost;
      }
      if (e.data.stop) { 
        console.log("stopped with message", e.data);
        forcetsne.alphaDecay(0.2);
        worker.terminate();
      }
  };
  worker.postMessage({
      maxIter: 3,//10
      dim: 2,
      perplexity: 30.0,
      metric: 'euclidean',
      data: data
      });//dataset2   
    }//End UpdateallMP
    updateallMP(data)
 
       
   }); //dataset2
 
 }) //dataset1
 
 
     // Função limpeza do brush e tabela
   function clearTableRows() {
         hideTableColNames();
         d3v4.selectAll(".row_data").remove();
     }
 
     //function isBrushed(brush_coords, cx, cy) {
       window.isBrushed = function(brush_coords, cx, cy){
           var x0 = brush_coords[0][0],
               x1 = brush_coords[1][0],
               y0 = brush_coords[0][1],
               y1 = brush_coords[1][1];
           return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
     }
 
       window.hideTableColNames = function(){
       d3v4.select("table").style("visibility", "hidden");    }
 
     //function showTableColNames() {
       window.showTableColNames = function(){
       d3v4.select("table").style("visibility", "visible");   }
 
 
 
     //function populateTableRow(d_row) {
       window.populateTableRow = function(d_row){
         showTableColNames();
 
         d_row_filter = [d_row.filename.substr(0, d_row.filename.length - 5),
                               d_row.reference,
                               Math.round(d_row.patern),//.substr(0, 5),
                               Math.round(d_row.heuristic),//.substr(0, 4),
                               Math.round(d_row.score),//.substr(0, 4), 
                               Math.round(d_row.count_debts),//.substr(0, 1),
                               d_row.debts,
                               d_row.indicators,
                               //d.commit
                             ]; 
           d3v4.select("table").append("tr")
             .attr("class", "row_data")
             .selectAll("td")
             .data(d_row_filter).enter()
             .append("td")
             .attr("align", d => isNaN(d) == true ? "left" : "center") /*colocar numerais no centro*/
             .text(d => d)
             //.style("border", "1px black solid")
 
     }
  });
 
  
  }
 }
 
 
 









































//FLAGSIDEBAR
jQuery.noConflict();
// construindo margens 
const MARGIN5 = {LEFT:15 , RIGHT:20, TOP:10, BOTTOM:20}
const WIDTH5 = 220 - MARGIN5.LEFT - MARGIN5.RIGHT
const HEIGHT5 = 600  - MARGIN5.BOTTOM - MARGIN5.TOP


// criando área para as coord paralelas, já editadas
const svgSidebar = d3.select("#sidebarInfo").append("svg") 
        .attr("width", WIDTH5 + MARGIN5.LEFT + MARGIN5.RIGHT)
        .attr("height",HEIGHT5 + MARGIN5.TOP + MARGIN5.BOTTOM)
    .append("g")
        .attr("transform", "translate(" + MARGIN5.LEFT + "," + MARGIN5.TOP + ")")
        

// Add the path using this helper function
svgSidebar.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', 200)
  .attr('height', 350)
  .attr('stroke', "#384")
  .attr('stroke-width', "7px")
  .attr('fill', '#44')
  .attr("opacity","0");

svgSidebar.append("text")
  .attr("x", 38).attr("y", 22)
  .attr("fill", "rgb(235, 230, 230)")
  .attr("dy", ".35em") //.attr("dy", "0 0.2 -0.1")
  .attr("font-family", "Calisto MT")
  .attr("font-size", "19px")
  .attr("font-weight", "bolder")
  .attr("text-decoration", "underline")
  //.attr("stroke","#443")
  //.attr("stroke-width", "0.2px")
  .text("Versions")
  info1 = svgSidebar.append("rect")
  .attr('x', 5).attr('y', 38)
  .attr('rx', 15).attr('ry', 38)
  .attr('width', 140).attr('height', 35)
  //.attr('stroke', 'black')
  .attr('fill', "rgb(236, 229, 229)")
  .style("border-width", "4px").style("border-radius", "2px").style("padding", "2px")


svgSidebar.append("text")
  .attr("x", 35).attr("y", 122)
  .attr("fill", "rgb(235, 230, 230)")
  .attr("dy", ".35em") //.attr("dy", "0 0.2 -0.1")
  .attr("font-family", "Calisto MT")
  .attr("font-size", "19px")
  .attr("font-weight", "bolder")
  .attr("text-decoration", "underline")
  .text("Archives")
  info2 = svgSidebar.append("rect")
  .attr('x', 5).attr('y', 138)
  .attr('rx', 15).attr('ry', 38)
  .attr('width', 140).attr('height', 35)
  .attr('fill', "rgb(236, 229, 229)")
  .style("border-width", "4px").style("border-radius", "2px").style("padding", "2px")

svgSidebar.append("text")
  .attr("x", 28).attr("y", 222)
  .attr("fill", "rgb(235, 230, 230)")
  .attr("dy", ".35em") //.attr("dy", "0 0.2 -0.1")
  .attr("font-family", "Calisto MT")
  .attr("font-size", "19px")
  .attr("font-weight", "bolder")
  .attr("text-decoration", "underline")
  .text("Total Debts")
  info3 = svgSidebar.append("rect")
  .attr('x', 5).attr('y', 238)
  .attr('rx', 15).attr('ry', 38)
  .attr('width', 140).attr('height', 35)
  .attr('fill', "rgb(236, 229, 229)")
  .style("border-width", "4px").style("border-radius", "2px").style("padding", "2px")

const debtsSB = [];



d3.json("data/rm_technical_debt.json").then(function(data0) {

  update("jUnity")
  d3.select('#selectRep')
    .on("change", function() { 
      var selectedOption = d3.select(this).property("value")//d3.select("#selectRep").node().value; //
      console.log(selectedOption)
      svgSidebar.selectAll("g").remove();
      debtsSB.length=0;
      update(selectedOption) 
      })


  function update(selectedGroup) {
    //var update = function(selectedGroup) {
    var priority_order = ["CODE_DEBT", "UNKNOWN_DEBT", "DEFECT_DEBT", 
    "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"];

  
      if (selectedGroup == 'jUnity'){ 
        data1 = data0.slice(0,754) // usa apenas o repositorio jUnit
      }else {
        data1 = data0.slice(755,6838) // usa apenas o repositorio jUnit
      }

        var tm = data1.length  //tamanho do db
        console.log(tm)
  
      // Quantidade e tipos de dts contidos
      for (let i=0; i<tm; i++){
          for (let j=0; j< data1[i].debts.length; j++){
              for (let dt in data1[i].debts[j]){
              }
              debtsSB.push(data1[i].debts[j].name)
          }
      }console.log(debtsSB.length)  //Array total de dividas
  
      const byVersionSB = d3.nest()
          .key(d=> d.reference)
          .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
          .entries(data1)
        console.log(byVersionSB.length) //Array total de Versoes
  
  
      quantVersions = svgSidebar.append("g").append("text")
        .attr("x", 65).attr("y", 62)
        .attr("fill", "#444")
        .attr("font-family", "Lucida Bright")
        .attr("font-size", "18px")
        .attr("font-weight", "bolder")
        .text(byVersionSB.length);

        console.log(byVersionSB)
  
    svgSidebar.append("g").append("text")
        .attr("x", 55).attr("y", 262)
        .attr("fill", "#444")
        .attr("font-family", "Lucida Bright")
        .attr("font-size", "18px")
        .attr("font-weight", "bolder")
        .text(debtsSB.length);
      } 

})



d3v4.csv("data/excomment_mp_completo.csv", function (data2) {  

  updateSidebar2("jUnity")  
  d3.select('#formSide')
     .on("change",function(){
         var selectedSide = d3.select("#selectRep").node().value;//var selectedPC = d3.select(this).property("value")
         console.log(selectedSide)
         //svgSidebar.selectAll("g").remove();
         updateSidebar2(selectedSide)
     })


  function updateSidebar2(selectedSide) {

    if (selectedSide == 'jUnity'){ 
      data = data2.slice(0,160) // usa apenas o repositorio jUnit
    }else {
      data = data2.slice(161,1830) // usa apenas o repositorio jUnit
    }

    const arqLength = data.length  //tamanho do db
    console.log(arqLength)

    svgSidebar.append("g")
      .attr("class", "arqLength").append("text")
      .attr("x", 60).attr("y", 162)
      .attr("fill", "#444")
      .attr("font-family", "Lucida Bright")
      .attr("font-size", "18px")
      .attr("font-weight", "bolder")
      .text(arqLength + 1);

  }
  

});


