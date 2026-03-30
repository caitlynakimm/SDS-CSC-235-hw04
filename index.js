d3.json("adj_noun.json")
    .then(function(data) {
        console.log(data); 
    }); 

// creates graph in force-directed layout
d3.json("adj_noun.json").then(function (data) {
    const width = 700;
    const height = 700;

    var color = d3.scaleOrdinal()
        .domain(["noun", "adjective"])
        .range(["red", "blue"]);

    const svg = d3.select("#networkFrame")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "1px solid #000");

    const simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(80)) //connects edges to nodes, set edge lengths to be 60 pixels
        .force("charge", d3.forceManyBody().strength(-200)) //repels nodes by strength of 100
        .force("center", d3.forceCenter(width/2, height/2)) //positions graph into center of svg
        .force("collision", d3.forceCollide(10)); //makes nodes bump into each other

    const link = svg.append("g")
        .attr("stroke", "#878181ff")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line");

    const node = svg.append("g")
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 8)
        .attr("fill", d => color(d.type))
        .attr("stroke", "#000")
        .call(drag(simulation)) //makes nodes draggable
        .on('click', (event, d) => {
            console.log("Term clicked:", d.id, "\nType:", d.type);

            let nounCount = 0;
            let adjCount = 0;

            const connectedLinks = data.links.filter( link =>
                link.source.id === d.id || link.target.id === d.id
            );

            connectedLinks.forEach(link => {
                const neighbor = link.source.id === d.id ? link.target : link.source;
                neighbor.type === "noun" ? nounCount++ : adjCount++;
            });

            console.log("Noun count:", nounCount,"Adjective count:", adjCount);

            let margin = 50;
            let width = 500;
            let height = 500;

            d3.select("#barChart").html("<h2>Frequency of Related Nouns and Adjectives for Selected Term</h2>");

            const barData = [
                {type: "noun", count: nounCount},
                {type: "adjective", count: adjCount}
            ];

            let barSvg = d3.select("#barChart")
                        .append("svg")
                        .attr("width", (width + margin*2))
                        .attr("height", (height + margin*2))
                        .append("g")
                            .attr("transform", `translate(${margin}, ${margin})`);

            let xAxis = d3.scaleBand()
                            .domain(barData.map(d => d.type))
                            .range([0, width])
                            .padding(0.2);

            barSvg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xAxis));

            barSvg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", width/2)
                .attr("y", height + margin /2 + 10)
                .text("Type of Term");

            let yAxis = d3.scaleLinear()
              .domain([0, d3.max(barData, d => d.count)])
              .range([height, 0]);

            barSvg.append("g")
                .call(d3.axisLeft(yAxis));

            barSvg.append("text")
                .attr("text-anchor", "middle")
                .attr("transform", "rotate(-90)")
                .attr("y", -margin + 20)
                .attr("x", -height / 2)
                .text("Number of Connections");            

            var colorPalette = d3.scaleOrdinal()
                .domain(["noun", "adjective"])
                .range(["red", "blue"]);

            barSvg.append("g")
                .selectAll("rect")
                .data(barData)
                .join("rect")
                    .attr("x", d => { return xAxis(d.type); })
                    .attr("y", d => { return yAxis(d.count); })
                    .attr("width", xAxis.bandwidth()) //.bandwidth() determines what the bars' widths should be
                    .attr("height", d => height - yAxis(d.count))
                    .style("fill", d => colorPalette(d.type));
        });

    const label = svg.append("g")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .text(d => d.id)
        .attr("font-size", 10)
        .attr("dx", -8)
        .attr("dy", -10) //dx and dy - positions label relative to node's center
        .attr("fill", "#000")
        .style("pointer-events", "none"); //interactions on labels are ignored

    simulation.on("tick", () => { //updates positions of links, nodes, and labels for every frame
        link
            .attr("x1", d => d.source.x) //line's starting x
            .attr("y1", d => d.source.y) //line's starting y
            .attr("x2", d => d.target.x) //line's ending x
            .attr("y2", d => d.target.y); //line's ending y
        
        node
            .attr("cx", d => d.x) //node's center x
            .attr("cy", d => d.y); //node's center y

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y);
    });

    function drag(simulation) {
        return d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart(); //controlling simulation's node movement energy
                d.fx = d.x;
                d.fy = d.y; //mouse starts drag, holding onto node, node stays at current position
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y; //node follows mouse's changing position
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null; //node no longer follows mouse's position
            });
    }

});
    
//     let xAxis = d3.
// }
