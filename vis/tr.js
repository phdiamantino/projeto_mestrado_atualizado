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
                              .style("top", "35px")
                              .style("left", "140px");
                          } else {
                            tooltipTRcloud.html("<i>"+nthMostCommon(result_cleaned, 7) +"</i>" )
                              .style("visibility", "visible")
                              .style("font-size", "13px")
                              .style("top", "56px")
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
    




































 