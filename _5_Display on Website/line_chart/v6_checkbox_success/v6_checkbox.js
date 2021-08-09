// 選單
let boxLSTM = d3.select("body").append('div').attr("id","LSTM").style("display","inline").style("width","100%");
d3.select("body").append("br")
let boxGRU = d3.select("body").append('div').attr("id","GRU").style("display","inline").style("width","100%");

// start chart
const svgSize = {width: 1100, height: 600};
const margin = {top: 50, right: 80, bottom: 40, left:50};
var width = svgSize.width - margin.left - margin.right,
    height = svgSize.height - margin.top - margin.bottom;


// define chart margins
let svg = d3.select("body")
            .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${svgSize.width} ${svgSize.height}`)
            .attr("width",svgSize.width)
            .attr("height",svgSize.height),
    g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// define time format
var parseTime = d3.timeParse("%Y-%m-%d");

// color scale
let	z = d3.scaleOrdinal(d3.schemeCategory10);

// load data
d3.csv('1301.TW.csv',type).then( data => {

    // parse data
    var stocks = data.columns.slice(1).map(id => {
        return {
            id: id,
            values: data.map(d => {
                return {
                    date: d.date,
                    price: d[id]

                };
            })
        };
    });


    // define x axis scale

    var x = d3.scaleTime()
              .range([0, width])
              .domain(d3.extent(data, d => d.date));

    // define y axis scale
    var y = d3.scaleLinear()
              .range([height, 0])
              .domain([
                    d3.min(stocks, c => d3.min(c.values, d => d.price)),
                    d3.max(stocks, c => d3.max(c.values, d => d.price))
                ]);

    // define line
    var line = d3.line()
                .curve(d3.curveBasis)
                .x(d => x(d.date))
                .y(d => y(d.price));

    // append x axis
    g.append("g")
        .attr("class", "axis axis-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(12)) //改日期呈現方式
        .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", width)
        .attr("dy", "1.5em")
        .attr("fill", "#000")
        .text("Date")
        .style("font-weight","bold") //字體加粗

    // append y axis
    g.append("g")
        .attr("class", "axis axis-y")
        .call(d3.axisLeft(y))
        .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", -20)
        //.attr('text-anchor','end')
        //.attr("x", -65)
        .attr("dy", "1.5em")
        .attr("fill", "#000")
        .text("Price ($)")
        .style("font-weight","bold"); //字體加粗

    // append chart name
    g.append("g")
        .append('text')
        .html('1301 Stock Price')
        .attr('x',width/2-30)
        .attr('y','-10')
        .style("font-weight","bold") //字體加粗
        .style('font-size','14px');

    // append stock data to svg
    let stock = g.selectAll(".stock")
                .data(stocks)
                .enter()
                .append("g")
                .attr("class", "stock")
    // 			d3.selectAll(".myCheckbox").on("change",update);
    // update();

    // append stock path to svg
    stock.append("path")
        .attr("class", "line")
        .attr("id", d => `line-${d.id}`)
        .attr("d", d => line(d.values))
        .style("stroke", (d,i) => i==0 ? d="#AAAAAA" : d=z(d.id))
        .style("fill", "none")
        .style("stroke-width", "1.5px")
        //.style("stroke-linejoin", "round")
        //.style("stroke-linecap", "round")
        .attr("opacity", (d,i) => i==0 ? d=1 : d=0);


    // append stock labels to svg
    stock.append("text")
        .datum(d => { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", d => { return `translate(${x(d.value.date)}, ${y(d.value.price)} )`; })
        .attr("x", 3)
        .attr('id', d => `text-${d.id}`)
        //.attr("dy", "0.15em")
        .style("font", "11px sans-serif")
        .attr("opacity", (d,i) => i==0 ? d=1 : d=0)
        .text(d => d.id);
        
    // 選單

    let boxLSTM = d3.select("body").append('div').attr("id","LSTM").style("display","inline").style("width","100%");
    d3.select("body").append("br")
    let boxGRU = d3.select("body").append('div').attr("id","GRU").style("display","inline").style("width","100%");
    
    for (let i = 1; i < stocks.length; i++) {
        var tick = document.createElement('input');
        tick.type = 'checkbox';
        tick.id = 'myCheckbox';
        tick.name = stocks[i].id;
        tick.value = stocks[i].id;

        var label = document.createElement('label');
        label.for = stocks[i].id
        label.appendChild(document.createTextNode(stocks[i].id));

        if ((i%2) !== 0){
            var divcheck = document.createElement('div');
            divcheck.id="model";
            // tick.appendChild(document.createTextNode(countries[i].id));
            divcheck.appendChild(tick);
            divcheck.appendChild(label);
            document.getElementById("LSTM").appendChild(divcheck);
        } else{
            var divcheck = document.createElement('div');
            divcheck.id="model";
            // tick.appendChild(document.createTextNode(countries[i].id));
            divcheck.appendChild(tick);
            divcheck.appendChild(label);
            document.getElementById("GRU").appendChild(divcheck);
        };

        tick.addEventListener("click", function() {

            var lineSelected = this.value;
            var svgline = d3.select(`#line-${lineSelected}`);
            var textline = d3.select(`#text-${lineSelected}`);
            // console.log(svgline);
            // console.log(textline);

            if(svgline.attr('opacity') === '0') {
                // console.log('making it visible');
                svgline.attr('opacity', 1);
            } else {
                svgline.attr('opacity', 0);
            }

            if(textline.attr('opacity') === '0') {
                // console.log('making it visible');
                textline.attr('opacity', 1);
            } else {
                textline.attr('opacity', 0);
            }
            this.style.background = '#555';
            this.style.color = 'white';

        });
    }



});

//bind with multiseries data
function type(d, _, columns) {
    d.date = parseTime(d.date);
    //iterate through each column
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];

    //bind column data to date
    return d;
}


