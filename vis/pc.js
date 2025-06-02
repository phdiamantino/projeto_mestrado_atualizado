//FLAGPC
// construindo margens 
const MARGIN = {LEFT:50 , RIGHT:10, TOP:50, BOTTOM:20}
const WIDTH = 550 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 200  - MARGIN.BOTTOM



// criando área para as coord paralelas, já editadas
const svgPC = d3.select("#parallelCordinates").append("svg") 
        .attr("viewBox", "0 0 580 250")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("top", "-70px")
    .append("g")
        .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

const debts = []; 

var tooltipPC = d3.select("#parallelCordinates")
    .style("font-family", "Verdana" )
    .append("div").attr("class", "remove")
    .style("position", "relative")
    .attr("viewBox", "50 50 400 50")
    .attr("preserveAspectRatio", "xMidYMid meet")



d3.json("data/rm_technical_debt.json").then(function(dataPC) {

        // Create initial graph
     updatePC("jUnity") 
     d3.select('.form-group')
        .on("change",function(){
            var selectedPC = d3.select("#selectRep").node().value;//var selectedPC = d3.select(this).property("value")
            console.log(selectedPC)
            svgPC.selectAll("*").remove();
        updatePC(selectedPC)
        })

    
    // Function to create the initial graph
    function updatePC(selectedPC){ 
    //var updatePC = function (selectedPC){

    // var filterData={"r3.8.2":false,"r3.9.5":false,"r4.6":false,"r4.7":false,"r4.8":false,"r4.9":false,"r4.10":false,"r4.11":false,"master":false,"r4.12":false};

    if (selectedPC == 'jUnity'){ 

    data = dataPC.slice(0,754) // usa apenas o repositorio jUnit, comentar se quiser testar todo repositório
    const tm = data.length  //tamanho do db

    

    // Quantidade e tipos de dts contidos
    for (let i=0; i<tm; i++){
        for (let j=0; j< data[i].debts.length; j++){
            for (let dt in data[i].debts[j]){
                //console.log(data[i].debts[j].name)  mostra as dividas contidas
            }
            debts.push(data[i].debts[j].name)
        }
    }
    //console.log(debts.length)  //Array total de dividas

    //Transformação dos dados
    //Dados com versões como chave
    var priority_order = ["CODE_DEBT", "UNKNOWN_DEBT", "DEFECT_DEBT", 
    "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"];

    const byVersion = d3.nest()
        .key(d=> d.reference)
        .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
        .entries(data)


        // PRE PROCESSAMENTO
        //Construção do dataset p/ eixos corretos
        const dataset = new Array();
        for (version_pc in byVersion){
            dataset[version_pc] = {key: byVersion[version_pc].key, values:{}}//dataset[version_pc] = {key: byVersion[version_pc].key,  values:{key:"debts",values:"score"}}
            len = byVersion[version_pc].values.length;
            keys = byVersion[version_pc].values.map(d=>(d.key))  //campo para analise
            dataset[version_pc].values = new Array();
            for (dt in priority_order){
                dataset[version_pc].values[dt] = {key:priority_order[dt], values:function(){}}
            }
        }
        i=[];
        for (version_pc in dataset){
            len = dataset[version_pc].values.length;
            keys = byVersion[version_pc].values.map(d=>(d.key))
            values = byVersion[version_pc].values.map(d=>(d.values))
            //console.log(values)
            t=0
            while (t<len){
                dataset[version_pc].values[t] = {key:priority_order[t],
                    values: keys.indexOf(dataset[version_pc].values[t].key) == -1? ""
                            :values[t] == undefined?values[t-1] :values[t]                                  
                    }
                t++
            }
        }   console.log(dataset)

 
    //Dados com dividas como chave  
    const byDebts = d3.nest()
        .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
        .key(d=> d.reference)
        .rollup(v => v.length, d => d.debts[d.debts.length -1].name)
        //.rollup(v=> d3.sum(v, d=> d.debts.length))
        .entries(data)

            //dimensões
        var dimensions  =[]
            for (i in byDebts){ dimensions.push(byDebts[i].key) }
            //console.log(dimensions)

        var versoes  =[]
            for (i in byVersion){ versoes.push(byVersion[i].key) }
            versoes = versoes.sort()                 // ordenar
            versoes.push(versoes.splice(0,1)[0])     // ordenar
            //console.log(versoes)

                //Construção do dataset BYDEBTS p/ eixos corretos
            const dts = new Array();
            for (version_pc in byDebts){
                dts[version_pc] = {key: byDebts[version_pc].key, values:{}}//dataset[version] = {key: byVersion[version].key,  values:{key:"debts",values:"score"}}
                len = byDebts[version_pc].values.length;
                keys = byDebts[version_pc].values.map(d=>(d.key))  //campo para analise
                dts[version_pc].values = new Array();
                for (v in versoes){
                    dts[version_pc].values[v] = {key:versoes[v], values:function(){}}
                    }
              }
            i=[];
            for (dt in dts){
                len = dts[dt].values.length;
                keys = byDebts[dt].values.map(d=>(d.key))
                //console.log(keys)
                values = byDebts[dt].values.map(d=>(d.value))
                //console.log(values)
                t=0
                while (t<len){
                    dts[dt].values[t] = {key:versoes[t],
                        values: keys.indexOf(dts[dt].values[t].key) == -1? 0
                                :values[t] == undefined?values[keys.indexOf(dts[dt].values[t].key)] :values[t]                                  
                        }
                    t++
                }
            }   console.log(dts)

            console.log(dts)


  // Construindo os eixos 
  var xPC = d3.scalePoint()
          .domain(dimensions)
          .range([0, WIDTH],1).padding(0.2);
          //.rangeRound([0, WIDTH],1).padding(0.2);


  
  console.log(dimensions)
  /*var yPC = {}
  for (i in dimensions) {
    var name = dimensions[i];
    yPC[name] = d3.scaleLinear()
        .domain([(byDebts[i]["values"].length >=byVersion.length)? d3.min(byDebts[i]["values"], d => d.value): 0,
                d3.max(byDebts[i]["values"], d => d.value)])
        .range([HEIGHT, 0])
  }*/


    console.log(byDebts)

    yPC={}
    dimensions.forEach(function(d,i) { 
      yPC[d] = d3.scaleLinear()
      //.domain([0, d3.max(byDebts[i]["values"], d => d.value)])
      .domain([(byDebts[i]["values"].length >=byVersion.length)? d3.min(byDebts[i]["values"], d => d.value): 0,
               d3.max(byDebts[i]["values"], d => d.value)])
      .range([HEIGHT, 0])
    })
  
// A função path pega uma linha como entrada e retorna as coordenadas xey da linha a ser desenhada
function path(d) {
    list= new Object(); list2= new Object();
    var line = (d.values.map((k,i)=> [k.key, k.values.length])) 
    var line2 = dimensions.map((p,i)=> (line[p,i]==undefined)
                                                ?[p,0]
                                                :line[p,i])  

  //console.log("Linha" + i)
  dimensions.map((p,i)=>   list[p] = line2[p,i][1])
  
  lista = Object.keys(list) // sequencia de nome das dimensões
  lista2 = [] //sequencia numerica das dimensões
    const code = lista.indexOf('CODE_DEBT');   if (code !== -1) { lista2[code] = 0; };
    const unk = lista.indexOf('UNKNOWN_DEBT');   if (unk !== -1) { lista2[unk] = 1; };
    const defect = lista.indexOf('DEFECT_DEBT');   if (defect !== -1) { lista2[defect] = 2; };
    const req = lista.indexOf('REQUIREMENT_DEBT');   if (req !== -1) { lista2[req] = 3; };
    const test = lista.indexOf('TEST_DEBT');   if (test !== -1) { lista2[test] = 4; };
    const design = lista.indexOf('DESIGN_DEBT');   if (design !== -1) { lista2[design] = 5; };

  lista.map((p,i)=> list2[p] ) //list2[p] = Object.keys(list)[i] 

    return d3.line()(dimensions.map((p,s)=>     // console.log(d.values[lista2[s]].values.length) +
                     [position(p), yPC[p](d.values[lista2[s]].values.length)]  ))
  }

console.log(dataset)
console.log(dataset[0].key)
console.log(dataset[0].values.length)


// Desenhando os eixos
g = svgPC.selectAll(".dimension")
// Para cada dimensão, adiciono um elemento 'g':
  .data(dimensions).enter().append("g")
  .attr("class", "dimension")
  .attr("transform", d=> "translate(" + xPC(d) + ")")
  .call(d3.drag()
    .on("start", function(d) {
        dragging[d] = xPC(d) //+console.log(d) + console.log(xPC(d)) 
        })
    .on("drag", function(d) {
        dragging[d] = Math.min(WIDTH, Math.max(0, d3.event.x));
        foreground.attr("d", path);
        dimensions.sort((a,b) => position(a) - position(b));
        xPC.domain(dimensions);
        g.attr("transform", d=> "translate(" + position(d) + ")")
      })
    .on("end", function(d) {
        delete dragging[d];
        transition(d3.select(this)).attr("transform", "translate(" + xPC(d) + ")");
        foreground.append("path").attr("d", path);
        transition(foreground).attr("d", path);
      }))

    
 //Funções e variáveis p/ arrastar
function position(d) {
      var v = dragging[d];
      return v == undefined ? xPC(d) : v;
    }

function transition(g) {
      return g.transition().duration(500);    
    }
var dragging = {}
 
var foreground = svgPC.append("g")
    .attr("class", "foreground")
    .selectAll("path")
    .data(dataset)
    .enter().append("path")
    .attr("d", path)
    .attr("class", d=> d.key)

        //Filter
    svgPC.selectAll("path")
        .on("click", function(d) {
            reDraw(d)  
            reDrawTR(d)
            reDrawMP(d)

            foreground 
              .style("stroke", "grey")
              .style("stroke-width", 1.7)  

            d3.select(this)
              .style("stroke", "green")
              .style("stroke-width", 2.0)
              .style("opacity", 1)
        })
        .on("dblclick", function(d) {
          foreground.style("stroke", "grey").style("stroke-width", 1.7)
          //Clean SB
            svgSB.selectAll("*").remove()
            updateall(data)
          //Clean MP
          circles.style("fill", d => colorMP(d[3]+1))
          circles.attr("class", "non_brushed")
            svgMP.call(zoom);
            window.hideTableColNames = function(){
              d3v4.select("table").style("visibility", "hidden");    }
            window.showTableColNames = function(){
              d3v4.select("table").style("visibility", "visible");   }
            //Clean TR
            tooltipBarGraph.selectAll("*").remove();
            })
            /*.on("mousemove",d=>{
              d3.select(d)
              .style("stroke", "red")
              .style("stroke-width", 4.7)   })*/


   


    window.reDraw = function(name_version){
            svgSB.selectAll("*").remove();
            version_clicked = name_version.key
            console.log(version_clicked + " OKKKK")
            data_filter = data.filter( function(name_version){return name_version.reference==version_clicked} )
            updateall(data_filter)
            console.log(data_filter)     
          }


    // informação adicional ao mouseover
  svgPC.selectAll("path")
    .on("mouseover",d=>{
        d3.select("#versions")
        tooltipPC.html("Version "+"<b>"+ d.key + "</b>"+"<br>" +" Total debts in this version: " 
                                      + "<b>"+ d3.sum(d.values, j=> j.values.length))
        /*tooltipPC.html("Version "+ d.key + "<br>" + 
                      d3.sum(d.values, j=> j.values.length) +" debts in this version.")*/
        .style("visibility", "visible") 
        .style("font-size", "14px")
        .style("width", "400px")
        .style("height", "50px")
        .style("top", "-15px")
        .style("left", "50px")
    })
    .append("title")
    .text(d=> "Version: "+ d.key)


        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yPC[d])); })
        g.append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .text(function(d) { return d; })
            .text(d => d.replace("_", " "))  // retira o _Debt dos nomes
            .style("font-size", "11px")
            .attr("transform", "rotate(-15)" );//rotaçao no nome
    
            
      }else {
          
        data = dataPC.slice(755,6838) // usa apenas o repositorio jUnit, comentar se quiser testar todo repositório
        const tm = data.length  //tamanho do db
        //console.log(tm)
        // Quantidade e tipos de dts contidos
        for (let i=0; i<tm; i++){
            for (let j=0; j< data[i].debts.length; j++){
                for (let dt in data[i].debts[j]){
                    //console.log(data[i].debts[j].name)  mostra as dividas contidas
                }
                debts.push(data[i].debts[j].name)
            }
        }
        console.log(debts.length)  //Array total de dividas
    
        //Transformação dos dados
        //Dados com versões como chave
        var priority_order =["BUILD_DEBT", "DOCUMENTATION_DEBT", "CODE_DEBT", "UNKNOWN_DEBT", 
        "DEFECT_DEBT", "REQUIREMENT_DEBT", "TEST_DEBT", "DESIGN_DEBT"]
    
        const byVersion = d3.nest()
            .key(d=> d.reference)
            .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
            .entries(data)
        console.log(byVersion)
    
            // PRE PROCESSAMENTO
            //Construção do dataset p/ eixos corretos
            const dataset = new Array();
            for (version_pc in byVersion){
                dataset[version_pc] = {key: byVersion[version_pc].key, values:{}}//dataset[version_pc] = {key: byVersion[version_pc].key,  values:{key:"debts",values:"score"}}
                len = byVersion[version_pc].values.length;
                keys = byVersion[version_pc].values.map(d=>(d.key))  //campo para analise
                dataset[version_pc].values = new Array();
                for (dt in priority_order){
                    dataset[version_pc].values[dt] = {key:priority_order[dt], values:function(){}}
                }
            }
            i=[];
            for (version_pc in dataset){
                len = dataset[version_pc].values.length;
                keys = byVersion[version_pc].values.map(d=>(d.key))
                values = byVersion[version_pc].values.map(d=>(d.values))
                //console.log(keys)
                t=0
                while (t<len){
                    dataset[version_pc].values[t] = {key:priority_order[t],
                        values: keys.indexOf(dataset[version_pc].values[t].key) == -1? ""
                                :values[t] == undefined?values[t-1] :values[t]                                  
                        }
                    t++
                }
            }   console.log(dataset)
    
     
        //Dados com dividas como chave  
        const byDebts = d3.nest()
            .key(d=> d.debts[d.debts.length -1].name).sortKeys((a,b) =>priority_order.indexOf(a) - priority_order.indexOf(b))
            .key(d=> d.reference)
            .rollup(v => v.length, d => d.debts[d.debts.length -1].name)
            //.rollup(v=> d3.sum(v, d=> d.debts.length))
            .entries(data)
                //dimensões
            var dimensions  =[]
                for (i in byDebts){ dimensions.push(byDebts[i].key) }
                //console.log(dimensions)
    
            var versoes  =[]
                for (i in byVersion){ versoes.push(byVersion[i].key) }
                versoes = versoes.sort()                 // ordenar
                versoes.push(versoes.splice(0,1)[0])     // ordenar
                //console.log(versoes)
    
                    //Construção do dataset BYDEBTS p/ eixos corretos
                const dts = new Array();
                for (version_pc in byDebts){
                    dts[version_pc] = {key: byDebts[version_pc].key, values:{}}//dataset[version] = {key: byVersion[version].key,  values:{key:"debts",values:"score"}}
                    len = byDebts[version_pc].values.length;
                    keys = byDebts[version_pc].values.map(d=>(d.key))  //campo para analise
                    dts[version_pc].values = new Array();
                    for (v in versoes){
                        dts[version_pc].values[v] = {key:versoes[v], values:function(){}}
                        }
                  }
                i=[];
                for (dt in dts){
                    len = dts[dt].values.length;
                    keys = byDebts[dt].values.map(d=>(d.key))
                    //console.log(keys)
                    values = byDebts[dt].values.map(d=>(d.value))
                    //console.log(values)
                    t=0
                    while (t<len){
                        dts[dt].values[t] = {key:versoes[t],
                            values: keys.indexOf(dts[dt].values[t].key) == -1? 0
                                    :values[t] == undefined?values[keys.indexOf(dts[dt].values[t].key)] :values[t]                                  
                            }
                        t++
                    }
                }  
    
    
      // Construindo os eixos 

      var xPC = d3.scalePoint()
            .domain(dimensions)
            .range([0, WIDTH],1).padding(0.2);

    yPC={}
    dimensions.forEach(function(d,i) { 
      yPC[d] = d3.scaleLinear()
      //.domain([0, d3.max(byDebts[i]["values"], d => d.value)])
      .domain([(byDebts[i]["values"].length >=byVersion.length)? d3.min(byDebts[i]["values"], d => d.value): 0,
               d3.max(byDebts[i]["values"], d => d.value)])
      .range([HEIGHT, 0])
    })
        //console.log(byDebts)
          
    // A função path pega uma linha como entrada e retorna as coordenadas xey da linha a ser desenhada
    function path(d,i) {
      console.log(d)
      list= new Object(); list2= new Object();
      var line = (d.values.map((k,i)=> [k.key, k.values==undefined?24 :k.values.length])) 
      var line2 = dimensions.map((p,i)=> line[p,i]) 
      dimensions.map((p,i)=>   list[p] = line2[p,i][1])

      /*var line = (d.values.map((k,i)=> [k.key, k.values.length])) 
      var line2 = dimensions.map((p,i)=> (line[p,i]==undefined)
                                                  ?[p,0]
                                                  :line[p,i])  */

    
    lista = Object.keys(list) // sequencia de nome das dimensões
    lista2 = [] //sequencia numerica das dimensões
      const build = lista.indexOf('BUILD_DEBT');   if (build !== -1) { lista2[build] = 0; };
      const doc = lista.indexOf('DOCUMENTATION_DEBT');   if (doc !== -1) { lista2[doc] = 1; };
      const code = lista.indexOf('CODE_DEBT');   if (code !== -1) { lista2[code] = 2; };
      const unk = lista.indexOf('UNKNOWN_DEBT');   if (unk !== -1) { lista2[unk] = 3; };
      const defect = lista.indexOf('DEFECT_DEBT');   if (defect !== -1) { lista2[defect] = 4; };
      const req = lista.indexOf('REQUIREMENT_DEBT');   if (req !== -1) { lista2[req] = 5; };
      const test = lista.indexOf('TEST_DEBT');   if (test !== -1) { lista2[test] = 6; };
      const design = lista.indexOf('DESIGN_DEBT');   if (design !== -1) { lista2[design] = 7; };

    lista.map((p)=> list2[p] ) //list2[p] = Object.keys(list)[i] 
    console.log(line)
    console.log(line2)
    console.log(lista)
    console.log(lista2)
      //d.values[lista2[s]].values.length)
      return d3.line()(dimensions.map((p,s)=>  //console.log(line2[s][1]) +
                       [position(p), yPC[p](line2[lista2[s]][1]) ]  ))

                   
    }
    
     
    
     //Funções p/ arrastar
    function position(d) {
            var v = dragging[d];
            return v == null ? xPC(d) : v;
        }
    function transition(g) {
            return g.transition().duration(500);    
        }
    
    var dragging = {},    
        
    foreground = svgPC.append("g")
      .attr("class", "foreground")
      .selectAll("path")
      .data(dataset)
      .enter().append("path")
      .attr("d", path)
      .attr("class", d=> d.key)
    
                    
// Desenhando os eixos
g = svgPC.selectAll(".dimension")
// Para cada dimensão, adiciono um elemento 'g':
  .data(dimensions).enter().append("g")
  .attr("class", "dimension")
  .attr("transform", d=> "translate(" + xPC(d) + ")")
  .call(d3.drag()
    .on("start", function(d) {
        dragging[d] = xPC(d) //+console.log(d) + console.log(xPC(d)) 
        })
    .on("drag", function(d) {
        dragging[d] = Math.min(WIDTH, Math.max(0, d3.event.x));
        foreground.attr("d", path);
        dimensions.sort((a,b) => position(a) - position(b));
        xPC.domain(dimensions);
        g.attr("transform", d=> "translate(" + position(d) + ")")
      })
    .on("end", function(d) {
        delete dragging[d];
        transition(d3.select(this)).attr("transform", "translate(" + xPC(d) + ")");
        foreground.append("path").attr("d", path);
        transition(foreground).attr("d", path);
      }))

    svgPC.selectAll("path")
        .on("click", function(d) {
            reDraw(d)  
            reDrawTR(d)
            reDrawMP(d)

            foreground 
              .style("stroke", "grey")
              .style("stroke-width", 1.7)  

            d3.select(this)
              .style("stroke", "green")
              .style("stroke-width", 2.0)
              .style("opacity", 1)
        })
        .on("dblclick", function(d) {
          foreground.style("stroke", "grey").style("stroke-width", 1.7)
          //Clean SB
            svgSB.selectAll("*").remove()
            updateall(data)
          //Clean MP
          circles.style("fill", d => colorMP(d[3]+1))
          circles.attr("class", "non_brushed")
            svgMP.call(zoom);
            window.hideTableColNames = function(){
              d3v4.select("table").style("visibility", "hidden");    }
            window.showTableColNames = function(){
              d3v4.select("table").style("visibility", "visible");   }
            //Clean TR
            tooltipBarGraph.selectAll("*").remove();
            })

    window.reDraw = function(name_version){
            svgSB.selectAll("*").remove();
            version_clicked = name_version.key
            console.log(version_clicked + " OKKKK")
            data_filter = data.filter( function(name_version){return name_version.reference==version_clicked} )
            updateall(data_filter)
            console.log(data_filter)
            
    }
    
    
        // informação adicional ao mouseover
    svgPC.selectAll("path")
        .on("mouseover",d=>{
            console.log(d.key) +
            d3.select("#versions")
            tooltipPC.html("Version "+ d.key + "<br>" +" Total debts in this version: " + d3.sum(d.values, j=> j.values.length))
            .style("visibility", "visible")
            .style("width", "400px")
            .style("height", "50px")
            .style("top", "-15px")
            .style("left", "50px")
        })
        .append("title")
        .text(d=> "Version: "+ d.key)
    
    
        g.append("g")
            .attr("class", "axis")
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(yPC[d])); })
        g.append("text")
            .style("text-anchor", "middle")
            .attr("y", -20)
            .text(function(d) { return d; })
            .text(d => d.replace("_", " ").replace("DOCUMENTATION", "DOC.").replace("REQUIREMENT", "REQUIR.."))  // retira o _Debt dos nomes
            .style("font-size", "11px")
            .attr("transform", "rotate(-15)" );//rotaçao no nome

      }
      
    }
    
})