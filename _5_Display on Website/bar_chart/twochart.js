{
// set the dimensions and margins of the graph
const margin = {top: 10, right: 10, bottom: 120, left: 60},
      width = 550 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg1 = d3.select("#twochartOfbar")
               .append("svg")
               .attr("preserveAspectRatio", "xMidYMid meet")
               .attr("viewBox", "0 0 550 600")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom)
               .append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip1 = d3.select('#twochartOfbar')
                  .append('div')
                  .attr('class', 'd3-tooltip')
                  .style('position', 'absolute')
                  .style('z-index', '50')
                  .style('visibility', 'hidden')
                  .style('padding', '10px')
                  .style('top', '15px')
                  .style('left', '125px')
                  .style('background', 'rgba(0,0,0,0.6)')
                  .style('border-radius', '4px')
                  .style('color', '#fff')
                  .style("font-weight", "bold")
                  .text('a simple tooltip');

const svg2 = d3.select("#twochartOfline")
               .append("svg")
               .attr("preserveAspectRatio", "xMidYMid meet")
               .attr("viewBox", "0 0 550 600")
               .attr("width", width + margin.left + margin.right)
               .attr("height", height + margin.top + margin.bottom)
               .append("g")
               .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip2 = d3.select('#twochartOfline')
               .append('div')
               .attr('class', 'd3-tooltip')
               .style('position', 'absolute')
               .style('z-index', '50')
               .style('visibility', 'hidden')
               .style('padding', '10px')
               .style('top', '15px')
               .style('left', '125px')
               .style('background', 'rgba(0,0,0,0.6)')
               .style('border-radius', '4px')
               .style('color', '#fff')
               .style("font-weight", "bold")
               .text('a simple tooltip');

// Parse the Data
d3.csv("data/Metrics_Score_rmse_5609TWO.csv").then( function(data) {

   // X axis
   let x1 = d3.scaleBand()
               .range([ 0, width])
               .domain(data.map(d => d.model))
               .padding(0.2);
   svg1.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x1))
      .selectAll("text")
      .style("font-size","16px")
      .style("font-weight", "bold")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

   // Add Y axis
   let y1 = d3.scaleLinear()
               .domain([0, 75]).nice()
               .range([ height, 0]);
   svg1.append("g")
      .call(d3.axisLeft(y1))
      .style("font-size","16px")
      .style("font-weight", "bold")
      .append("g")
      .append("text")
      .attr("transform", "rotate(-270)")
      .attr("y", -40)
      // .attr('text-anchor','end')
      .attr("x", 50)
      .attr("dy", "1.5em")
      .attr("fill", "#000")
      .text("RMSE");

   // Bars
   svg1.selectAll("mybar")
      .data(data)
      .join("rect")
      .attr("x", d => x1(d.model))
      .attr("y", d => y1(d.rmsevalue))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y1(d.rmsevalue))
      .attr("id", d => `bar-${d.model}`)  
      .attr("fill", "steelblue")
      .style("opacity", 0.2)
      .on("mouseover", function (e, d, i){
         //  bar itself
         tooltip1.html(
            `<div>Model: ${d.model}</div><div>RMSE: ${round2(d.rmsevalue)}</div>`
         )
         .style('visibility', 'visible');

         d3.select(this).style("opacity", 1);

         // interactive with line 
         let tempid = this.id.split("-");
         d3.select(`#line-${tempid[1]}`).attr("opacity", 1);

         tooltip2.html(
            `<div>Model: ${tempid[1]}<br>Prediction Price</div>`
         )
         .style('visibility', 'visible');

      })
      .on("mouseout", function(d){
         //  bar itself
         tooltip1.html(``).style('visibility', 'hidden');

         d3.select(this).style("opacity", 0.2);
      
         // interactive with line
         let tempid = this.id.split("-");
         d3.select(`#line-${tempid[1]}`).attr("opacity", 0.1);

         tooltip2.html(``).style('visibility', 'hidden');
      
      });
})

// *****************************************************************************************
// multi-line interactive chart

//define time format
var parseTime = d3.timeParse("%Y-%m-%d");

//bind with multiseries data
function type(d, _, columns) {
   d.date = parseTime(d.date);
   //iterate through each column
   for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];

   //bind column data to date
   return d;
}

//load data
d3.csv('data/5609.TWO.csv',type).then( data => {

   //parse data
   var stocks = data.columns.slice(1).map(function(id) {
      return {
         id: id,
         values: data.map(function(d) {
            return {
               date: d.date,
               price: d[id]
            };
         })
      };
   });

   console.log(stocks)

   //define x axis scale
   var x = d3.scaleTime()
               .range([0, width])
               .domain(d3.extent(data, function(d) {
                  return d.date;
               }));

   //define y axis scale
   var y = d3.scaleLinear()
               .range([height, 0])
               .domain([
                  d3.min(stocks, function(c) {
                     return d3.min(c.values, function(d) {
                        return d.price;
                     });
                  }),
                  d3.max(stocks, function(c) {
                     return d3.max(c.values, function(d) {
                        return d.price;
                     });
                  })
               ]).nice();

   //define line
   var line = d3.line()
               .curve(d3.curveBasis)
               .x(function(d) {
                  return x(d.date);
               })
               .y(function(d) {
                  return y(d.price);
               });

   //color scale
   let z = d3.scaleOrdinal(d3.schemeCategory10);

   //define color scale
   z.domain(stocks.map(function(c) {
      return c.id;
   }));

   //append x axis
   svg2.append("g")
         .attr("class", "axis axis-x")
         .attr("transform", `translate(0,${height})`)
         .call(d3.axisBottom(x).ticks(12)) //改日期呈現方式
         .selectAll("text")
         .style("font-size","18px")
         .style("font-weight", "bold")
         

   //append y axis
   svg2.append("g")
         .attr("class", "axis axis-y")
         .call(d3.axisLeft(y))
         .style("font-size","16px")
         .style("font-weight", "bold")
         .append("g")
         .append("text")
         .attr("transform", "rotate(-270)")
         .attr("y", -40)
         // .attr('text-anchor','end')
         .attr("x", 70)
         .attr("dy", "1.5em")
         .attr("fill", "#000")
         .text("Price ($)")



         
         // .style("font-weight",700); //字體加粗

   // //append chart name
   // svg2.append("g")
   //       .append('text')
   //       .html('1301 Stock Price')
   //       .attr('x',width/2)
   //       .attr('y','-10')
   //       .style("font-weight",700) //字體加粗
   //       .style('font-size','14px');



   //append stock data to svg
   let stock = svg2.selectAll(".stock")
                     .data(stocks)
                     .enter()
                     .append("g")
                     .attr("class", "stock")
   // 			d3.selectAll(".myCheckbox").on("change",update);
   // update();

   // append stock path to svg
   stock.append("path")
         .attr("class", "line")
         .attr("id", d =>`line-${d.id}`)
         .attr("d", d => line(d.values))
         .style("stroke", (d,i) => i==0 ? d='#000000' : d="steelblue")
         .style("fill", "none")
         .style("stroke-width", "3px")
         .style("stroke-linejoin", "round")
         .style("stroke-linecap", "round")
         .attr("opacity", (d,i) => i==0 ? d=1 : d=0.1)
         .on("mouseover", function(d){

            let tempid = this.id.split("-")

            // line itself
            d3.select(this).attr("opacity", 1);

            if (this.id != "line-Historical") {

               tooltip2.html(
                  `<div>Model: ${tempid[1]}<br>Prediction Price</div>`
               )
               .style('visibility', 'visible');

            } else {
               tooltip2.html(
                  `<div>Historical Price</div>`
               )
               .style('visibility', 'visible');
            }
         
            // interactive with bar
            
            d3.select(`#bar-${tempid[1]}`).style("opacity", 1);

            if (this.id != "line-Historical") {
               tooltip1.html(
                  `<div>Model: ${tempid[1]}</div>`
               )
               .style('visibility', 'visible');
            }
         })
         .on("mouseout", function(d){

            // line itself
            if (this.id != "line-Historical") {
               d3.select(this).attr("opacity", 0.1);
            } 

            tooltip2.html(``).style('visibility', 'hidden');
            
            // interactive with bar
            let tempid = this.id.split("-")
            d3.select(`#bar-${tempid[1]}`).style("opacity", 0.2);

            tooltip1.html(``).style('visibility', 'hidden');
         })

   

})

} 