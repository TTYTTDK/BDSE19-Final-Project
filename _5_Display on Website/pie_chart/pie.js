var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 600 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;


d3.csv('iron_adj.csv').then(data => {
    // 時間轉換
    data.forEach(d => {
        d.stockid = d.stockid;
        d.close = +d.close;
    });
    
    console.log(data)
    

    
    //colors=["#00A5E3","#FF96C5","#00CDAC","#FFA23A","#74737A"] 
    var svg = d3.select("body").append('svg')
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", "0 0 600 600")
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",`translate(${margin.left},${margin.top})`);

    var chart=svg.append('g')
                // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .attr('width', width)
                .attr('height', height)

    var pie=d3.pie() 
                .value(d => d.close)
    
    var color_scale=d3.scaleOrdinal(d3.schemeCategory10)
                    .domain(data.map(d=>d.stockid))
                    //.range(colors)

    let arc=d3.arc()
                .outerRadius(200)
                .innerRadius(100)

    var p_chart=chart.selectAll("pie")
                    .data(pie(data))
                    .enter()
                    .append("g")
                    .attr('transform', 'translate(200,200)') 

    p_chart.append("path")
            .attr("d",arc) 
            .attr("fill",d=>{
                return color_scale(d.data.stockid);
            }) 

        
});

