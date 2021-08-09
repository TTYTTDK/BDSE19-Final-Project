var margin = {top: 10, right: 30, bottom: 20, left: 50};
    //width = 1000 - margin.left - margin.right,
    //height = 550 - margin.top - margin.bottom;*/ 

    
var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = Math.min(width, height) / 2;
    //.attr("preserveAspectRatio", "xMidYMid meet")
    //.attr("viewBox", "0 0 600 600")
    //.attr('width', width + margin.right + margin.left)
    //.attr('height', height + margin.top + margin.bottom)
    //.append("g")
    
    svg.attr("transform",`translate(${margin.left},${margin.top})`);
var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    
var color=d3.scaleOrdinal(["#00A5E3","#FF96C5","#00CDAC","#FFA23A","#74737A"]);
/*var chart=svg.append('g')
    // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .attr('width', width)
    .attr('height', height) */
    
var pie=d3.pie().value(function(d) { 
    return d.close; 
});

    
var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(50);
    
var label = d3.arc()
    .outerRadius(radius)
    .innerRadius(radius - 80);
    
    
d3.csv('iron_adj.csv').then(data => {
        // 時間轉換
        data.forEach(d => {
            d.stockid = d.stockid;
            d.close = +d.close;
        });
        
        console.log(data)

    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");
    
    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) { return color(d.data.stockid); });    
    
    console.log(arc)
    
    
    arc.append("text")
               .attr("transform", function(d) { 
                        return "translate(" + label.centroid(d) + ")"; 
                })
               .text(function(d) { return d.data.stockid; });
            });
    
    
    svg.append("g")
       .attr("transform", "translate(" + (width / 2 - 120) + "," + 20 + ")")
       .append("text")
       .text("stock pie - iron")
       .attr("class", "title");

