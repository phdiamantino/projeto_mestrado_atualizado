/*deploy
  <script src="pc.js"></script>
  <script src="mp.js"></script>
  <script src="sbb.js"></script>
  <script src="tr.js"></script>
*/

// firebase init
// Select "Hosting: Configure and deploy..."
// Selecionar -> Public N N N N
// final -> firebase deploy


var altura = window.screen.height;
var largura = window.screen.width;
console.log("altura" + altura);
console.log("largura" +largura);

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
























//FLAGSB
const MARGIN2 = {LEFT:10, RIGHT:10, TOP:10, BOTTOM:10}
const WIDTH2 = 620 - MARGIN2.LEFT - MARGIN2.RIGHT
const HEIGHT2 = 330 - MARGIN2.TOP - MARGIN2.BOTTOM

// Àrea do SB
const svgSB = d3.select("#sumburst").append("svg") 
        .attr("viewBox", "0 0 620 320")
        .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
        .attr("transform", `translate(${WIDTH2 /2}, ${HEIGHT2 /2})`)

    const partition = d3.partition();

    radius = (Math.min(WIDTH2, HEIGHT2) / 1.8 -20);

    const xSB = d3.scaleLinear()
        .range([0, 2 * Math.PI])
        //.clamp(true);
    const ySB = d3.scaleSqrt()
        .range([0, radius]);


    arc = d3.arc()
        .startAngle(d=> Math.max(0, Math.min(2 * Math.PI, xSB(d.x0))) )
        .endAngle(d=> Math.max(0, Math.min(2 * Math.PI, xSB(d.x1))) )
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1)
        .innerRadius(d=> Math.max(0, ySB(d.y0)) )
        .outerRadius(d=> Math.max(0, ySB(d.y1)) )


    // cria a hierarquia
    function toTree(files) {
        const root = {};
        // Create structure where folder name is also a key in parent object
        for (const {key, value} of files) {
            key.match(/[^\/]+/g).reduce((acc, folder) => {
                if (!acc.folders) acc.folders = {};
                return acc.folders[folder] || (acc.folders[folder] = { key: folder, value: null }); 
            }, root).value = value;
        }
        // Optional: replace folders object by folders array, recursively
        (function recurse(node) {
            if (!node.folders) return;
            node.children = Object.values(node.folders);
            node.children.forEach(recurse);
        })(root);
        return root;
    }


  
    d3.json("data/rm_technical_debt.json").then(function(dataSB) {

      console.log(dataSB)
    // Seleção do Dataframe
    updateSB("jUnity")
    d3.select('#formSB')
       .on("change",function(){
           var selectedSB = d3.select(".form-select").node().value;//var selectedPC = d3.select(this).property("value")
           console.log(selectedSB)
           svgSB.selectAll("*").remove();
       updateSB(selectedSB)
       })
       

    function updateSB(selected){ 
      //window.updateSB = function(selected){

        if (selected == 'jUnity'){ 
            data = dataSB.slice(0,754) // usa apenas o repositorio jUnit
            console.log(data.length)

          }else {        
            data = dataSB.slice(755,6838) // usa apenas o repositorio jUnit
            console.log(data.length)
          }
        console.log(data)


    window.updateall = function(dataS){ 

      //Transformar arquivo em Modelo Hierárquico
        const arq = d3.nest()
            .key(d=> d.filename)
            .rollup(v=> d3.sum(v, d=> d.debts.length))
            //.rollup(v => v.length)
        .entries(dataS)
        console.log(arq)
        //console.log(arq[0].key.split("/")[0])
        console.log(toTree(arq))
        const arqJson = toTree(arq)

        root = d3.hierarchy(arqJson)
            .sum(d=>+d.value)
            .sort((a, b) => b.value - a.value);
        console.log(root)

      //Clique na MP reflete no Sunburst
      window.highlightsb = function(arqv){
          //Capturar o arquivo
          console.log(arqv)
          var arquivo = arqv.filename
          console.log("Nome arquivo: "+ arquivo)
          //Split para fazer a busca no root principal
          arqsplit = arquivo.split("/");
          console.log(arqsplit)

          selectDepth = [], l=0
          root.descendants().map((d,i) => d.depth == arqsplit.length ? selectDepth.push(d) :l=0)
          console.log(selectDepth)

          //hierarchyOtherNode = root.descendants().find((d,i) => d.data.key == arqsplit[arqsplit.length-1] )
          hierarchyOtherNode2 = selectDepth.find((d,i) => d.data.key == arqsplit[arqsplit.length-1] )
          console.log(hierarchyOtherNode2)

          // Exibição do path
          svgSB.selectAll("path")
            .style("opacity", 0.3);
          svgSB.selectAll("path")
            .filter(function(node) {
              return (hierarchyOtherNode2.ancestors().indexOf(node) >= 0)
            })
            .style("opacity", 1);

            //Nome
          tooltipSB.text(arquivo)
            .transition()
                .attr("fill-opacity", 1);

      }


      
    //Legenda
    tooltipSB = svgSB.append("text")
       .attr("font-size", 14)
       .attr("fill", "#000")
       .attr("fill-opacity", 0)
       .attr("text-anchor", "middle")
       .attr("transform", "translate(" + 0 + "," + (HEIGHT2/2)  +")")
       //.style("pointer-events", "none");


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
      //Mousover Highlight all path
            console.log(d)
          var sequenceArray = getAncestors(d);
          // Fade all the segments
          svgSB.selectAll("path") 
            .style("opacity", 0.3);
          // Then highlight only those that are an ancestor of the current segment
          console.log(sequenceArray)
          svgSB.selectAll("path")
            .filter(function(node) {
              return (sequenceArray.indexOf(node) >= 0);
            })
            .style("opacity", 1);

            //Apresentar path ao mouseover
          function allPath(node) {
            var path = [];
            var current = node;
            console.log(current)
            //Salva o nome de cada pasta
            while (current.parent) {
              path.unshift(current.data.key);
              current = current.parent;
            }
            //Transforma todos os nomes em string
            return path.toString()
          }
          //porcentagem
          let num = (Math.round((d.value / partition(root).value) * 100)).toString() + '%';
          //Exibir ao mouseover
          tooltipSB.text(allPath(d).replace(/,/g,"/") + " -       -  perc. of debts per file: "+ num)
            .style("font-family", "Verdana")//.style("position", "absolute")
            .transition()
              .attr("fill-opacity", 1); 

              //Mouseover no Sunburst reflete na MP
            mouseoversb(d)
        }


    function mouseout(s) {
        var sequenceArray = getAncestors(s);
        tooltipSB.transition()
            .attr("fill-opacity", 0.0);

          // Fade all the segments.
          d3.selectAll("path")
            .style("opacity", 1);
          // Then highlight only those that are an ancestor of the current segment.
          svgSB.selectAll("path")
            .filter(function(node) {
              return (sequenceArray.indexOf(node) >= 0);
            })
            .style("opacity", 1);
        };
    


    color = d3.scaleOrdinal(d3.quantize(d3.interpolateCividis, root.height+1))
    //d3.interpolateLab("steelblue", "brown")  //d3.interpolateViridis  //d3.interpolateMagma
    // d3.interpolateCividis // d3.interpolateCool

    //Visualização
        // Add um arco para cada um dos nós na hierarquia
        //Partition(root) adiciona os valores x0, x1, y0 e y1 a cada nó.
    svgSB.selectAll("path")
        .data(partition(root).descendants()) //.data(partition(root).descendants().filter(d => d.depth))
        .enter(console.log(partition(root).descendants())).append("path")
        .attr("d", d => arc(d))
            // Cor por Sentimento
        //.style('fill', d => color((d.children ? d : d.parent).data.sentiment))
        //.style("fill", function(d) { return colors(d.name); });
            //Cor Por Profundidade
        .style("fill", d=>(d.depth<1) ? "Lavender" :color(d.depth) )
            //Cor Por Pasta Principal
        //.style("fill-opacity", d=> 1.1- (d.depth/15)) <<opacidade
        .attr("stroke", "dimgray")
        .style("stroke-width", 0.3)  
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("click",  click)
      }

    updateall(data) 


    function click(d) {
        svgSB.transition()
            .duration(300)
            .tween("scale", function() {
                var   xd = d3v4.interpolate(xSB.domain(), [d.x0,  d.x1]),
                      yd = d3v4.interpolate(ySB.domain(), [d.y0, 1]),
                      yr = d3v4.interpolate(ySB.range(), [d.y0 ? 20 : 0, radius]);
                return function(t) { xSB.domain(xd(t));
                                     ySB.domain(yd(t)).range(yr(t));};
                                     })
            .selectAll("path")
                .attrTween("d", d => { return () => arc(d)  })

        }

    }

})


































    








    //FLAGTR
    const MARGIN3 = {LEFT:10, RIGHT:40, TOP:20, BOTTOM:30}
    const WIDTH3 = 620 - MARGIN3.LEFT - MARGIN3.RIGHT
    const HEIGHT3 = 250 - MARGIN3.TOP - MARGIN3.BOTTOM
    
    
    // Add SVG
    const svgTR = d3.select("#themeRiver").append("svg")
        .attr("viewBox", "0 -50 710 350")
          .classed("svg-container", true)   
          .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
            .attr("transform", "translate(" + MARGIN3.LEFT + "," + MARGIN3.TOP + ")");
    
    
        var tooltipTR = d3.select("#themeRiver")
          .style("font-family", "Verdana" )
          .append("div").attr("class", "remove")
                .style("position", "absolute")
                .style("z-index", "20")
                .style("opacity", 0)
                .style("font-size", 10)
                .style("visibility", "hidden")
                .style("width", "300px")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px");

        tooltipBarGraph = d3.select("#barGraph")
                .style("visibility", "hidden")
                .append("svg").attr("width", "65px").attr("height", "190px");
          
        divTooltip =  d3.select("#barGraph").append("div").attr("class", "toolTip");

        tooltipTRimg  = d3.select("#themeRiver")
            .append("div").attr("class", "remove")
                .style("position", "absolute")
                .style("font-size", 10)
                .style("opacity", 0)
                .style("visibility", "hidden")
                .style("padding", "12px");
        tooltipTRcloud = d3.select("#wordCloud")
              .append("div").attr("class", "remove")
                .style("position", "absolute")
                .style("opacity", 0)
                .style("visibility", "hidden")
                .style("width", "405px");
    
    
      // Legendas
    var legendTR = d3.select("#legend_tr").append("svg")
      .attr("preserveAspectRatio", "xMidYMid meet")
      .attr("viewBox", "0 0 425 21") 
      .style("background-color", "silver")
      .style("position", "absolute")
      .style("top", "2")
      .style("left", "75")
      .style("border-width", "4px")
      .style("border-radius", "6px")
      .style("padding", "2px")
      .style("border", "1px solid black");
    legendTR.append("text").attr("x", 25 ).attr("y", 15).text("Positive Feeling").style("font-size", "12px").attr("alignment-baseline","top")
    legendTR.append("text").attr("x", 170).attr("y", 15).text("Neutral Feeling").style("font-size", "12px").attr("alignment-baseline","top")
    legendTR.append("text").attr("x", 315).attr("y", 15).text("Negative Feeling").style("font-size", "12px").attr("alignment-baseline","top")
    legendTR.append('image').attr('xlink:href', "https://cdn.shopify.com/s/files/1/1061/1924/products/Smiling_Face_Emoji_large.png?v=1571606036").attr('width', 20).attr('height', 19).attr("x", 3)
    legendTR.append('image').attr('xlink:href', "https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_1024x1024.png?v=1571606037").attr('width', 20).attr('height', 19).attr("x", 148)
    legendTR.append('image').attr('xlink:href', "https://imagepng.org/wp-content/uploads/2017/11/facebook-grr-raiva-icone.png").attr('width', 19).attr('height', 19).attr("x", 293)
            
    var format = d3.timeParse("%Y-%m-%d")    
    var datearray = [];
    
    
    function sentiment(b){if(b==0){
        return 'url("https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_1024x1024.png?v=1571606037")'
      } else if (b>0){
        return 'url("https://cdn.shopify.com/s/files/1/1061/1924/products/Smiling_Face_Emoji_large.png?v=1571606036")'
      } 
        return 'url("https://imagepng.org/wp-content/uploads/2017/11/facebook-grr-raiva-icone.png")'
    }
    

    
  d3.csv("data/excomment_sentiments_completo_quintil.csv",d3.autoType).then(function(dataTR) {
    
    dataTR.forEach(function(d) {
        d.score = +d.score;
        d.value = +d.value;
    });
    console.log(dataTR);  

    updateTR("jUnity")
      d3.select('#formTR')
      .on("change",function(){
            selectedTR = d3.select(".form-select").node().value;//var selectedPC = d3.select(this).property("value")
              console.log(selectedTR)
            svgTR.selectAll("*").remove();
            d3.select(".path").remove(); 
            updateTR(selectedTR)
      })
          

   
      function updateTR(selectedGroup) {
    
        if (selectedGroup == 'jUnity'){ 
          //flag
          dataflag = dataTR.slice(0,1449) // usa apenas o repositorio jUnit
          datasMinMax = [new Date("Tue Jun 01 2004 22:00:00 GMT-0200 (Horário de Verão de Brasília)"),
                        new Date("Tue Feb 20 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)")]
                    
      /*
      "Mon Dec 27 2004 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Mon Apr 13 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Jul 27 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Nov 30 2009 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Sun Aug 21 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Wed Sep 28 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Nov 12 2012 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Wed Dec 03 2014 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Tue Feb 20 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      */


  function version(s) {if (s >(new Date("Tue Jun 01 2004 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Dec 27 2006 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
        return "r3.8.2";
      } else if (s >=(new Date("Wed Dec 27 2006 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Mon Apr 13 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
        return "r4.6"
      } else if (s >=(new Date("Mon Apr 13 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 27 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
        return "r4.7"
      } else if (s >=(new Date("Mon Jul 27 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Nov 30 2009 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
        return "r4.8"
      }else if (s >=(new Date("Mon Nov 30 2009 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Aug 21 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
        return "r4.9"
      }else if (s >=(new Date("Sun Aug 21 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Wed Sep 28 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
        return "r4.10"
      }else if (s >=(new Date("Wed Sep 28 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Nov 12 2012 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
        return "r4.11"
      }else if (s >=(new Date("Mon Nov 12 2012 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Dec 03 2014 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
        return "r4.12"
      }else if (s >=(new Date("Wed Dec 03 2014 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Tue Feb 20 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
        return "master"
  }}

  function ID(s) {if (s >(new Date("Tue Jun 01 2004 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Dec 27 2006 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
      return 0
    } else if (s >=(new Date("Wed Dec 27 2006 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Mon Apr 13 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
      return 1
    } else if (s >=(new Date("Mon Apr 13 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 27 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
      return 2
    } else if (s >=(new Date("Mon Jul 27 2009 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Nov 30 2009 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
      return 3
    }else if (s >=(new Date("Mon Nov 30 2009 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Aug 21 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
      return 4
    }else if (s >=(new Date("Sun Aug 21 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Wed Sep 28 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
      return 5
    }else if (s >=(new Date("Wed Sep 28 2011 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Nov 12 2012 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
      return 6
    }else if (s >=(new Date("Mon Nov 12 2012 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Dec 03 2014 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
      return 7
    }else if (s >=(new Date("Wed Dec 03 2014 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Tue Feb 20 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
      return 8
}}

          //Alterar Escala jUnity/Apache
        // Add Y axis
      yBar = d3.scaleLinear()
        .domain([0, 700])
        .rangeRound([170, 0]);

                    
        
        }else {
          //flag
          dataflag = dataTR.slice(1449,21466) // usa apenas o repositorio Apache
          datasMinMax = ["Mon Jan 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)",
                   "Sat Feb 03 2018 22:00:00 GMT-0200 (Horário Padrão de Brasília)"]
  
  function version(s) {if (s >=(new Date("Mon Jan 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "rel/1.1";
          } else if (s >=(new Date("Tue Jul 18 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Oct 23 2000 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.2";
          } else if (s >=(new Date("Sun Oct 24 2000 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Feb 28 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "rel/1.3";
          } else if (s >=(new Date("Thu Mar 01 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Sun Sep 02 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "rel/1.4";
          }else if (s >=(new Date("Mon Sep 03 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 08 2002 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "rel/1.5";
          }else if (s >=(new Date("Tue Jul 09 2002 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Wed Dec 17 2003 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.6";
          }else if (s >=(new Date("Thu Dec 18 2003 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Oct 28 2007 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.7";
          }else if (s >=(new Date("Mon Oct 29 2007 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Mon Feb 01 2010 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.8";
          }else if (s >=(new Date("Tue Feb 02 2010 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Tue Mar 05 2013 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "rel/1.9";
          }else if (s >=(new Date("Wed Mar 06 2013 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Dec 26 2016 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.10.0";
          }else if (s >=(new Date("Tue Dec 27 2016 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Fri Feb 02 2018 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
            return "rel/1.10.2";
          } else if (s >=(new Date("Sat Feb 03 2018 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Feb 18 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
            return "master";
        }}

    function ID(s) {if (s >=(new Date("Mon Jan 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 0;
        } else if (s >=(new Date("Tue Jul 18 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Oct 23 2000 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 1;
        } else if (s >=(new Date("Sun Oct 24 2000 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Wed Feb 28 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 2;
        } else if (s >=(new Date("Thu Mar 01 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Sun Sep 02 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 3;
        }else if (s >=(new Date("Mon Sep 03 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Jul 08 2002 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 4;
        }else if (s >=(new Date("Tue Jul 09 2002 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Wed Dec 17 2003 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 5;
        }else if (s >=(new Date("Thu Dec 18 2003 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Oct 28 2007 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 6;
        }else if (s >=(new Date("Mon Oct 29 2007 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Mon Feb 01 2010 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 7;
        }else if (s >=(new Date("Tue Feb 02 2010 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Tue Mar 05 2013 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 8;
        }else if (s >=(new Date("Wed Mar 06 2013 21:00:00 GMT-0300 (Horário Padrão de Brasília)")) && (s <(new Date("Mon Dec 26 2016 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 9;
        }else if (s >=(new Date("Tue Dec 27 2016 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Fri Feb 02 2018 22:00:00 GMT-0200 (Horário de Verão de Brasília)")))) {
          return 10;
        } else if (s >=(new Date("Sat Feb 03 2018 22:00:00 GMT-0200 (Horário de Verão de Brasília)")) && (s <(new Date("Sun Feb 18 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)")))) {
          return 11;
      }}
      /*
      "Mon Jul 17 2000 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Oct 23 2000 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Wed Feb 28 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Sun Sep 02 2001 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Jul 08 2002 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Wed Dec 17 2003 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Sun Oct 28 2007 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Mon Feb 01 2010 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Tue Mar 05 2013 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      "Mon Dec 26 2016 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Fri Feb 02 2018 22:00:00 GMT-0200 (Horário de Verão de Brasília)"
      "Sun Feb 18 2018 21:00:00 GMT-0300 (Horário Padrão de Brasília)"
      */
     
        //Alterar Escala jUnity/Apache
      // Add Y axis
      yBar = d3.scaleLinear()
        .domain([0, 7000])
        .rangeRound([170, 0]);
    
      }

        console.log(dataflag)

    //Filter
    d3.select("#barGraph")
    .style("visibility", "hidden")
    window.reDrawTR = function(name_version){
      svgTR.selectAll("*").remove();
      tooltipBarGraph.selectAll("*").remove();
      version_clicked = name_version.key
      console.log(name_version)
      console.log(version_clicked + " OKKKK")
      //console.log(dataflag)
      data_filter = dataflag.filter(function(name_version){return name_version.reference==version_clicked} )
      updateallTR(data_filter)//updateallTR(dataflag)

    d3.select("#barGraph")
      .style("visibility", "visible")


      //STACKED BAR GRAPH
      // Add X axis
      xBar = d3.scaleBand()
      .domain([name_version.key])
      .rangeRound([05, 60])
      //.tickPadding(5)
      tooltipBarGraph.append("g")
        .attr("transform", "translate(-1," + 173 + ")")
        .call(d3.axisBottom(xBar));

      function unique(value, index, self) { 
        return self.indexOf(value) === index;
      }



      if (d3.select("#custom-select-tr").node().value == 'Quintil'){ 
        keysBar = [0,1,2,3,4];
        colorBar = d3.scaleLinear()
          .domain(keysBar)   
          .range(d3.schemeYlOrBr[5]) ;

        keyss = [];
        catchkeys = d3.stack()
          .keys(keysBar).value(d=> keyss.push(d.Quintil))
          (data_filter)
        console.log(keyss.filter(unique))
        
        dataBar = d3.nest()
            .key(d=>d.Quintil)
            .entries(data_filter)
        console.log(dataBar)

        dataset = dataBar.map(function(d,k) {
            return {
                "key": parseInt(d.key),
                "reference": d.values.map(s=>s.reference).filter(unique)[0],
                "score": d3.sum(d.values.map(s=>s.score) )
            }  });
          console.log(dataset)

        testenest = d3.nest()
            .key(d=>d.reference)
            .entries(dataset)
        console.log(testenest)

        dataset2 = testenest.map(function(d) { 
          return {
              "reference": d.key,
              "1": d.values[0] == undefined?0: d.values[0].score,
              "2": d.values[1] == undefined?0: d.values[1].score,
              "3": d.values[2] == undefined?0: d.values[2].score,
              "4": d.values[3] == undefined?0: d.values[3].score,
              "5": d.values[4] == undefined?0: d.values[4].score
           }  });

      
      }else {

        keysBar = [0,1,2,3,4,5,6,7,8,9];
        colorBar = d3.scaleLinear()
          .domain(keysBar)   
          .range(d3.schemeYlOrBr[7]);

        keyss = [];
        catchkeys = d3.stack()
          .keys(keysBar).value(d=> keyss.push(d.Decil))
          (data_filter)
        console.log(keyss.filter(unique))

        dataBar = d3.nest()
            .key(d=>d.Decil)
            .entries(data_filter)
        console.log(dataBar)

        globalThis.dataset = dataBar.map(function(d,k) {
          return {
              "key": parseInt(d.key),
              "reference": d.values.map(s=>s.reference).filter(unique)[0],
              "score": d3.sum(d.values.map(s=>s.score) )
           }  });
        console.log(dataset)

        testenest = d3.nest()
            .key(d=>d.reference)
            .entries(dataset)
        console.log(testenest)

        dataset2 = testenest.map(function(d) { 
          return {
              "reference": d.key,
              "1": d.values[0] == undefined?0: d.values[0].score,
              "2": d.values[1] == undefined?0: d.values[1].score,
              "3": d.values[2] == undefined?0: d.values[2].score,
              "4": d.values[3] == undefined?0: d.values[3].score,
              "5": d.values[4] == undefined?0: d.values[4].score,
              "6": d.values[5] == undefined?0: d.values[5].score,
              "7": d.values[6] == undefined?0: d.values[6].score,
              "8": d.values[7] == undefined?0: d.values[7].score,
              "9": d.values[8] == undefined?0: d.values[8].score,
              "10": d.values[9] == undefined?0: d.values[9].score
           }  });

        }
        console.log(dataset2)
      
        console.log(keysBar)
      //Stack por subgrupo
      stackedBar = d3.stack()
        .keys(keyss.filter(unique).sort())
        (dataset2)
        console.log(stackedBar)
        

      // Show the bars
      window.tooltipBarGraph.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedBar)
        .enter().append("g")
          .attr("fill", d=> colorBar(d.key))
          .selectAll("rect")
          .data(d=> d)
          .enter().append("rect")
          .attr("class","rects")
            .attr("x", d=> xBar(d.data.reference)) //
            .attr("y", d => yBar(d[1]) )       
            .attr("height", d => yBar(d[0]) - yBar(d[1]))
            .attr("width", xBar.bandwidth())

         tooltipBarGraph
            .on("mousemove", function(d){
                divTooltip.style("left", d3.mouse(this)[0] +5+"px"); //d3.mouse(this)[0] + 10+"px"
                divTooltip.style("top", d3.mouse(this)[1] -15+"px");
                divTooltip.style("display", "inline-block");
                //Percentual
                id = stackedBar.length - 1
                all = stackedBar[id][0][1]  //valor total
                var elements = document.querySelectorAll(':hover');
                l = elements.length
                l = l-1
                element = elements[l].__data__
                value = element[1] - element[0]  //Valor inteiro
                percentual = value*100/all //Percentual
                divTooltip.html("<b>"+ percentual.toFixed(2)+"%"+"</b>" +
                                "</br>"+ value.toFixed(2));
                
              })
            .on("mouseout", function(d){divTooltip.style("display", "none")})
          }



          
        window.updateallTR = function(dataS){ 
        
        // Create initial graph
        initialGraph("Quintil")  
          d3.select("#custom-select-tr")
              .on("change",function(d){
                  var selectedQ = d3.select("#custom-select-tr").node().value; // d3.select(this).property("value") 
                  console.log(selectedQ); 
                  svgTR.selectAll("*").remove();
                  d3.select(".path").remove(); 
                  initialGraph(selectedQ)
            })



            console.log(d3.select("#custom-select-tr").node().value)
  
                
              // Function to create the initial graph
              function initialGraph(group){
                console.log(group)
                
                if (group == 'Quintil'){ 

                  var nest = d3.nest()
                  .key(d=> d.date).key(d=>d.Quintil)
                  .entries(dataflag);
                  console.log(nest)
  
                  var keys_score = [0,1,2,3,4];
                  var color= d3.scaleLinear()
                    .domain(keys_score)   
                    .range(d3.schemeYlOrBr[5]) ;

            
                }else {

                  var nest = d3.nest()
                    .key(d=> d.date).key(d=>d.Decil)
                    .entries(dataflag);
                    console.log(nest)
    
                    var keys_score = [0,1,2,3,4,5,6,7,8,9];
                    var color= d3.scaleLinear()
                      .domain(keys_score)   
                      .range(d3.schemeYlOrBr[7]);
                }
          
                console.log(keys_score)

                /*function path(d) {
                  var line = (d.values.map(k=> [k.key, k.values.length])) 
                  var line2 = keys_score.map((p,i)=> (line[p,i]==undefined)
                                                                    ?[p,0]
                                                                    :line[p,i])  
                      }*/


                var stackedData = d3.stack()
                  .keys(keys_score)
                  .order(d3.stackOrderNone)
                  .offset(d3.stackOffsetSilhouette) //.offset(d3.stackOffsetSilhouette//stackOffsetWiggle)
                  .value((d,key)=>  d.values[key] == undefined? 0
                                      : d3.sum(d.values[key].values.map(s=>s.score))  )//console.log(d.values[key]) +"--" +console.log()
                                   (nest) // console.log(d.values[key]) +"--"+ console.log( d.values[key] == undefined? 0
                                          //       : d3.sum(d.values[key].values.map(s=>s.score))  ) )
                 /*.value((d,i)=> console.log(i) +'--'+ console.log(d.values.length < keys_score.length
                                                ?keys_score.map((p,i)=> ((d.values.map(k=>  k.values.length)) [p,i]==undefined)
                                                                        ?0
                                                                        :(d.values.map(k=>k.values.length)) [p(i)]) 
                                                : d.values.map(s=> s.values.length)))(nest)*/
                  //d3.sum(d.values[key].values.map((s)=>s.score)) 
                console.log(stackedData)



                /*var dimensions  =[]
                for (i in byDebts){ dimensions.push(byDebts[i].key) }
                //console.log(dimensions)*/




                  
            // Add X & Y axis      
            // X axis  
              var xScale =  d3.scaleTime()
                    .domain(d3.extent(dataflag, d=> d.date))//.domain([datasMinMax[0], datasMinMax[1]])
                    .range([0, WIDTH3]);
                    svgTR.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + HEIGHT3 + ")")
                    .call(d3.axisBottom(xScale).ticks(15).tickPadding(3).tickSize(4))
                    .select(".domain").remove();
                svgTR.selectAll(".tick line").attr("stroke", "#b8b8b8")
                    //Colocar nome TIME(YEAR)
                svgTR.append("text")
                    .attr("text-anchor", "end")
                    .attr("x", WIDTH3-450)
                    .attr("y", HEIGHT3-15 )
                    .text("Time (Year)")
                    
            // Y axis 
              var yScale = d3.scaleLinear()
                    .domain([d3.min(stackedData, l => d3.min(l, d => d[0])),
                            d3.max(stackedData, l => d3.max(l, d => d[1]))  ])
                    .range([ HEIGHT3, 0 ])
                /*svgTR.append("g")
                    .attr("class", "y axis")
                    .call(d3.axisLeft(yScale).ticks(0).tickSize(3));*/

          // Area
          var area = d3.area()
                  .curve(d3.curveMonotoneX) //curveStep curveMonotoneX
                  .x(d=>  xScale(new Date(d.data.key)))
                  .y0(d=> yScale(d[0]))
                  .y1(d=> yScale(d[1]))
    
                // Elementos de interação
                svgTR.selectAll(".layer")
                    .attr("opacity", 1)
                    .on("mouseover", function(d, i) {
                    svgTR.selectAll(".layer")
                    .transition().duration(250)
                })
    
                // Mouseover
                var mouseover = function(d) {
                  d3.select(this)
                    tooltipTR.style("opacity", 1)
                      d3.selectAll(".myArea").style("opacity", .3)
                      d3.select(this)
                          .style("stroke", "#121212") //black #121212
                          .style("opacity", 1),
                    tooltipTRimg.style("opacity", 1),
                    tooltipTRcloud.style("opacity", 1)
                    vertical.style("opacity", 1);
                    }

                
                //Exibe informações ao passar o mouse
                window.mousemove = function(d,i,s){
                  mousex = d3.mouse(this);
                  mousex = mousex[0];
                  //Capturar posição da versão, ano e ID no eixo X
                  var invertedx = xScale.invert(mousex);
                  /*console.log(year(invertedx))*/
                  id = ID(invertedx)
                  console.log(invertedx)
                  console.log(id)
                  console.log(d)
                  var selected = (d)
                  console.log(new Date(d[id].data.key))
                  dataval = d[id].data.values[0].values
                  console.log(id)
                  vers1 = dataval[0].reference
                  console.log(vers1)
                  //feeling = sentiment(d3.sum(d=> i >= d[id].data.values.length ? d[id].data.values[0].values.map(s=>s.sentiment): d[id].data.values[i].values.map(s=>s.sentiment)))
                  console.log(s)
                  console.log(i)
                  feeling = sentiment(d3.sum(d[id].data.values[i].values.map(s=>s.sentiment)))
                  console.log(feeling)
                  //var feeling = sentiment(d3.sum(d[seq(version(invertedx))].data.values[d.key].values.map(s=>s.sentiment)))
                  //var words = d[seq(version(invertedx))].data.values[d.key].values.map(s=>s.words)
                  var words = d[id].data.values[i].values.map(s=>s['words']) 
                    words_cleaned = words.filter(function(val){if(val)return val}).join(", ").split(",") // remove nulls e une as strings
                  var resultwords = d[id].data.values[i].values.map(s=>s['resultwords']) 
                    result_cleaned = resultwords.filter(function(val){if(val)return val}).join(", ").split(",")

                    function nthMostCommon(str, amount) {
                      const stickyWords =["you","the","i","","in","if","so","an", "a","testrule","+","45","8"];
                      var splitUp = str
                      const wordsArray = splitUp.filter(function(x){
                        return !stickyWords.includes(x) ;
                                });
                        var wordOccurrences = {}
                        for (var i = 0; i < wordsArray.length; i++) {
                            wordOccurrences['_'+wordsArray[i]] = ( wordOccurrences['_'+wordsArray[i]] || 0 ) + 1;
                        }
                        var result = Object.keys(wordOccurrences).reduce(function(acc, currentKey) {
                            for (var i = 0; i < amount; i++) {
                                if (!acc[i]) {
                                    //acc[i] = { word: currentKey.slice(1, currentKey.length), occurences: wordOccurrences[currentKey] };
                                    acc[i] = currentKey.slice(1, currentKey.length);
                                    break;
                                } else if (acc[i].occurences < wordOccurrences[currentKey]) {
                                    //acc.splice(i, 0, { word: currentKey.slice(1, currentKey.length), occurences: wordOccurrences[currentKey] });
                                    acc.splice(i, currentKey.slice(1, currentKey.length));
                                    if (acc.length > amount)
                                        acc.pop();
                                    break;
                                }
                            }  return acc;
                        }, []);
                        return result;
                    }

                  //console.log(resultwords)
                  for (var k = 0; k < selected.length; k++) {
                      datearray[k] = new Date(selected[k].data.key)
                  }
                  d3.select(this)
                      .classed("hover", true)
                      .attr("stroke-width", "0.5px"),
                  tooltipTRimg
                      .style("position", "absolute")
                      .style("visibility", "visible")
                      //.style("background-color", "silver")
                      .style("background-image", feeling)
                      .style('background-size','cover') 
                      .style("top",  (d3.mouse(this)[1]+160) * 0.7 + "px")
                      .style("left", (d3.mouse(this)[0]+40)*0.79+ "px");
                  //sentiment(d3.sum(d[seq(version(invertedx))].data.values[d.key].values.map(s=>s.sentiment)))
                  tooltipTR.html("<b>"+"Version: "+"</b>"+ dataval[0].reference //version(new Date(d[id].data.key))
                                  +"</br>"+"<b>"+"Score: " +"</b>" + (d.key + 1))
                        .style("visibility", "visible")
                        .style("font-size", "13px")
                        .style("top",  (d3.mouse(this)[1]+90) * 0.7 + "px")
                        .style("left",(d3.mouse(this)[0]+30)*0.78 + 7 +"px");
                  tooltipTRcloud.html("<b>"+"Main Words: " +"</b>" +  nthMostCommon(words_cleaned, 7))
                        .style("visibility", "visible")


                        var initialWord = function(w){
                          if (w == 'words'){
                            tooltipTRcloud.html("<i>"+nthMostCommon(words_cleaned, 7) +"</i>" )
                              .style("visibility", "visible")
                              .style("font-size", "13px")
                              .style("top", "50px")
                              .style("left", "140px");
                          } else {
                            tooltipTRcloud.html("<i>"+nthMostCommon(result_cleaned, 7) +"</i>" )
                              .style("visibility", "visible")
                              .style("font-size", "13px")
                              .style("top", "70px")
                              .style("left", "140px");
                          }
                        }
                      
                        var selected  = d3.select('input[name=colorButton]:checked').attr('value');
                        initialWord(selected)
                      
                        d3.selectAll("input").on("change", function(s){
                          initialWord(this.value)  

                    });
                }


              //Retornar o gráfico de volta ao normal
              var mouseleave = function(d,i) {
                  tooltipTR.style("opacity", 0)
                  d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
                      .transition().duration(250)
                      .attr("opacity", "1");
                  d3.select(this)
                      .classed("hover", false)
                      .attr("stroke-width", "0px"), 
                  tooltipTR.style("visibility", "hidden")
                  tooltipTRimg.style("visibility", "hidden")
                  tooltipTRcloud.style("visibility", "hidden")
                  vertical.style("opacity", 0);
                }





        clickTR = function (d){

              tooltipBarGraph.selectAll("*").remove();
                    //Captura a versão
              mousex = d3.mouse(this);
              mousex = mousex[0];
              var invertedx = xScale.invert(mousex);
              id = ID(invertedx)
              dataval = d[id].data.values[0].values
              console.log(dataval)
              versionclick = dataval[0].reference// version(new Date(d[id].data.key)) //dataval[0].reference 
              
              console.log(versionclick)
              //Para fazer a busca da linha ParCoords
              versionclick2 = versionclick.replaceAll(".", "\\"+".").replaceAll("/", "\\"+"/")
              svgPC.selectAll('path')
                  .style("stroke", "grey")
                  .style("stroke-width", 1.7)
                  .style("opacity", 1)
              svgPC.selectAll('path.domain')
                  .style("stroke", "black")
                  
                  
               function unique(value, index, self){ return self.indexOf(value) === index;}

                data_click = dataflag.filter(function(name_version){return name_version.reference==versionclick} )
                //data_click = dataflag.filter(function(name_version){return name_version.reference==versionclick} )
                console.log(dataflag.filter(function(name_version){return name_version} ))
                //updateallTR(data_filter)//updateallTR(dataflag)
                console.log(data_click)

      if (d3.select("#custom-select-tr").node().value == 'Quintil'){ 
                keysBar = [0,1,2,3,4];
                colorBar = d3.scaleLinear().domain(keysBar).range(d3.schemeYlOrBr[5]);
                keyss = [];
                catchkeys = d3.stack().keys(keysBar).value(d=> keyss.push(d.Quintil))(data_click) 
                dataBar = d3.nest().key(d=>d.Quintil).entries(data_click)
                dataset = dataBar.map(function(d,k) { return {
                        "key": parseInt(d.key),
                        "reference": d.values.map(s=>s.reference).filter(unique)[0],
                        "score": d3.sum(d.values.map(s=>s.score)) }  });
                testenest = d3.nest().key(d=>d.reference).entries(dataset)
                dataset2 = testenest.map(function(d) {   return {
                      "reference": d.key,
                      "1": d.values[0] == undefined?0: d.values[0].score, "2": d.values[1] == undefined?0: d.values[1].score, "3": d.values[2] == undefined?0: d.values[2].score, "4": d.values[3] == undefined?0: d.values[3].score,"5": d.values[4] == undefined?0: d.values[4].score
                    }  });

        }else {

                    keysBar = [0,1,2,3,4,5,6,7,8,9];
                    colorBar = d3.scaleLinear()
                      .domain(keysBar)   
                      .range(d3.schemeYlOrBr[7]);
                    keyss = [];
                    catchkeys = d3.stack().keys(keysBar).value(d=> keyss.push(d.Decil))
                      (data_click)
                    dataBar = d3.nest().key(d=>d.Decil).entries(data_click)
                    globalThis.dataset = dataBar.map(function(d,k) {
                      return {
                          "key": parseInt(d.key),
                          "reference": d.values.map(s=>s.reference).filter(unique)[0],
                          "score": d3.sum(d.values.map(s=>s.score) )
                       }  });
                    console.log(dataset)
                    testenest = d3.nest()
                        .key(d=>d.reference)
                        .entries(dataset)
                    console.log(testenest)
                    dataset2 = testenest.map(function(d) { 
                      return {
                          "reference": d.key,"1": d.values[0] == undefined?0: d.values[0].score,"2": d.values[1] == undefined?0: d.values[1].score,"3": d.values[2] == undefined?0: d.values[2].score,"4": d.values[3] == undefined?0: d.values[3].score,"5": d.values[4] == undefined?0: d.values[4].score,
                          "6": d.values[5] == undefined?0: d.values[5].score,"7": d.values[6] == undefined?0: d.values[6].score,"8": d.values[7] == undefined?0: d.values[7].score,"9": d.values[8] == undefined?0: d.values[8].score,"10": d.values[9] == undefined?0: d.values[9].score
                       }  });
                    }





                stackedBar = d3.stack().keys(keyss.filter(unique).sort())
                  (dataset2)
                xBar = d3.scaleBand().domain([versionclick]).rangeRound([05, 60]).padding([0.1])

                tooltipBarGraph.append("g")
                  .attr("transform", "translate(-1," + 173 + ")")
                  .call(d3.axisBottom(xBar));
        
                  window.tooltipBarGraph.append("g")
                  .selectAll("g")
                  // Enter in the stack data = loop key per key = group per group
                  .data(stackedBar)
                  .enter().append("g")
                    .attr("fill", d=> colorBar(d.key))
                    .selectAll("rect")
                    .data(d=> d)
                    .enter().append("rect")
                    .attr("class","rects")
                      .attr("x", d=> xBar(d.data.reference)) //
                      .attr("y", d => yBar(d[1]) )       
                      .attr("height", d => yBar(d[0]) - yBar(d[1]))
                      .attr("width", xBar.bandwidth())

                tooltipBarGraph.on("mousemove", function(d){
                    divTooltip.style("left", d3.mouse(this)[0] +5+"px"); //d3.mouse(this)[0] + 10+"px"
                    divTooltip.style("top", d3.mouse(this)[1] -15+"px");
                    divTooltip.style("display", "inline-block");
                    //Percentual
                    id = stackedBar.length - 1
                    all = stackedBar[id][0][1]  //valor total
                    var elements = document.querySelectorAll(':hover');
                    l = elements.length
                    l = l-1
                    element = elements[l].__data__
                    value = element[1] - element[0]  //Valor inteiro
                    percentual = value*100/all //Percentual
                    divTooltip.html("<b>"+ percentual.toFixed(2)+"%"+"</b>" +
                                    "</br>"+ value.toFixed(2)); })
                .on("mouseout", function(d){divTooltip.style("display", "none")})

                console.log(svgPC.selectAll("path"))
                console.log(svgPC.selectAll("path."+versionclick2))

               svgPC.selectAll("path."+versionclick2)
                      .style("stroke", "green")
                      .style("stroke-width", 2.0)
                      .style("opacity", 1)
                      //.attr("class", "false")

                d3.select("#barGraph")
                  .style("visibility", "visible")

          }




                
    
                // Exbibe a área 
                svgTR.selectAll(".layer")
                      .data(stackedData).enter()
                      .append("path").attr("class", "myArea")
                      .style("stroke-width",0.3)
                      //.style("fill",d=> console.log(d))
                      .style("fill", ((d,i)=> color(i+1)))
                      .attr("d",area)
                      .on("mousemove", mousemove)
                      .on("mouseover", mouseover)
                      .on("mouseleave", mouseleave)
                      .on("click", clickTR)
             }
            }
            updateallTR(dataflag)
         }
  
               
              // Criar linha vertical - mouse
        var vertical = d3.select("#themeRiver")
          .append("path").attr("class", "vertical")
          .style("position", "absolute")
          //.style('opacity', 0)
          //.style("z-index", "19")
          .style("width", "1.65px")
          .style("height", "175px")
          .style("top", "80px")
          .style("bottom", "20px")
          .style("left", "10px")
          .style("right", "180px")
          .style("background", "MediumBlue") //green
             
        d3.select("#themeRiver")
          .on("mousemove", function(){  
                mousex = d3.mouse(this);
                mousex = mousex[0] - 5;
                vertical.style("left", mousex + "px" )})
          .on("mouseover", function(){  
                mousex = d3.mouse(this);
                mousex = mousex[0] - 5; 
                vertical.style("left", mousex+ "px")})
    
    })
    












































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


