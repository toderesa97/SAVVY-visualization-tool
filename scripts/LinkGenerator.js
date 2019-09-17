function create_link(link) {
    let newLink = create_link_object(link);
    create_link_text(newLink);
    create_link_line(newLink);
    create_link_line_highlighter(newLink);

    return newLink;
}

function create_link_object(link) {
    return link.enter()
        .append("g")
        .attr("class", "edgeg")
        .attr("id", function (d) {
            return "g-" + d.id;
        });
}

function create_link_line(newLink) {
    newLink.append("line")
        .attr("data-source", function(d) {
            return d.source;
        })
        .attr("data-target", function(d) {
            return d.target;
        })
        .attr("class", function(d) {
            return "link "+d.labeled.toLowerCase();
        })
        .attr("id", function(d) {
            return "le-"+d.id;
        })
        .attr("marker-end", "url(#arrow_e)")
        .attr("marker-start", function(d) {
            if (d.viceversa !== undefined && d.viceversa === "yes") {
                return "url(#arrow_s)";
            }
        });
}

function create_link_text(newLink) {
    newLink.append("text")
        .text(function (d) {
            return d.labeled;
        })
        .attr("text-anchor", "middle")
        .attr("class", function (d) {
            return "edgetext " + d.labeled.toLowerCase();
        })
        .attr("id", function (d) {
            return "et-" + d.id;
        });
}

function create_link_line_highlighter(newLink) {
    newLink.append("line")
        .attr("data-source", function(d) {
            return d.id.split("-")[0];
        })
        .attr("data-target", function(d) {
            return d.id.split("-")[1];
        })
        .attr("class", function(d) {
            return "highlighter-link_container "+d.labeled.toLowerCase();
        })
        .attr("id", function(d) {
            return "hl-"+d.id;
        })
        .style("stroke", "rgb(150,150,150)")
        .style("stroke-width", "20px")
        .style("opacity", 0);
}