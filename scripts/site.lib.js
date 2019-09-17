let highlight_sug, expansion_prop_sug, search_node_sug, search_node_burger;

let toggle = document.getElementById('toggle-section');
let toggleContainer = document.getElementById('toggle-container');
let toggleNumber;
set_deexpansion_method("slight");
toggle.addEventListener('click', function() {
    toggleNumber = !toggleNumber;
    if (toggleNumber) {
        toggleContainer.style.clipPath = 'inset(0 0 0 50%)';
        toggleContainer.style.backgroundColor = 'dodgerblue';
        set_deexpansion_method("rough");
    } else {
        toggleContainer.style.clipPath = 'inset(0 50% 0 0)';
        toggleContainer.style.backgroundColor = 'dodgerblue';
        set_deexpansion_method("slight");
    }
    console.log(toggleNumber)
});

// build the legend
let fill_color_icon_box = function() {
    let types = graphManager.getGraph().getDistinctTypes();
    let html = '<div class="detected-types-class container">' +
        '<div class="row">'+
        '<div class="col-md-3"></div>'+
        '<div class="col-md-2">COLOR</div>'+
        '<div class="col-md-1"></div>'+
        '<div class="col-md-6">ICON</div></div>';
    types.forEach(function (type) {
        html += '<div class="row">' +
            '<div class="col-md-3"><p class="text">' + type + '</p> </div>' +
            '<div class="col-md-1">' +
            '<input data-type="'+type+'" id="cp-'+type+'" class="color-picker" value="'+default_color.substring(1)+'"></div>' +
            '<div class="col-md-2"></div>' +
            '<div class="col-md-6">' +
            '<input type="file" class="load-icon" data-type="'+type+'" name="file" />' +
            '</div>' +
            '</div> ';
    })
    return html+"</div>";
};

// function that adds the event for changing the color dynamically
// and updates the legend accordingly
let on_color_change = function() {
    $(".color-picker")
        .spectrum({
            showPalette : true,
            showInput: true,
            preferredFormat: "hex",
            move : function(color) {
                let type = $(this).attr("data-type");
                color = "#"+color.toHex();
                if (color.toLowerCase() === default_color.toLowerCase()) {
                    node_properties[type]['color'] = undefined;
                    d3.selectAll(".type.type-"+type+" .node").style("fill", color);
                    $("#legend").html(write_legend()).after(add_legend_events());
                    return;
                }
                d3.selectAll(".type.type-"+type+" .node").style("fill", color);
                if (node_properties[type] === undefined) {
                    node_properties[type] = { color : color };
                } else {
                    node_properties[type]['color'] = color;
                }
                $("#legend").html(write_legend()).after(add_legend_events());
            }
        });
};

// todo: to upload files a web server is needed
let on_icon_file_upload_change = function() {
    // todo: recode this to handle uploaded files
    // currently this function takes the name of the uploaded
    // file. This assumes that such file is within icons/ folder
    $(".load-icon").change(function(evt) {
        let rder = new FileReader();
        let type = $(this).attr("data-type");
        rder.onloadend = function(evt) {
            if (evt.target.readyState === FileReader.DONE) {
                let fileName = evt.target.fileName;
                console.log(type);
                if (node_properties[type] === undefined) {
                    node_properties[type] = {icon : "icons/"+fileName};
                } else {
                    node_properties[type]['icon'] = "icons/"+fileName;
                }
                fill_current_nodes();
            }
        };
        rder.fileName = evt.target.files[0].name;
        rder.readAsBinaryString(evt.target.files[0]);
    });
}

let write_legend = function() {
    let types = graphManager.getGraph().getDistinctTypes();
    let legend_html = "";
    for (let i = 0; i < types.length; i++) {
        if (node_properties[types[i]] === undefined) continue;
        if (node_properties[types[i]]['color'] === undefined) continue;
        legend_html += '<div class="legend-item" id="'+types[i]+'" style="height: 50px; background-color: transparent; z-index: 3;">' +
            '<div style="padding: 8px; height: 50px; display: flex; z-index: 2;justify-content: space-between;' +
            'align-content: center; align-items: center;background-color: '+node_properties[types[i]]['color']+';"> ';
        if (node_properties[types[i]]['icon'] !== undefined) {
            legend_html += '<image width="40" height="40" src="'+node_properties[types[i]]['icon']+'"></image>'
        }
        legend_html += '<p style="margin: 0; font-weight: bold; text-transform: uppercase;"> '+types[i]+' </p>' +
            '</div></div>';
    }
    legend_html += '<div style="padding: 5px; height: 50px; display: flex; align-content: center; align-items: center;background-color: '+default_color+'"> ' +
        '<p style="margin: 0; font-weight: bold; text-transform: uppercase;"> --default-- </p>' +
        '</div>';
    return legend_html;
};

function center_screen_to_searched_node(svg, node) {
    let translate_coordinates = d3.select("#g-" + node).attr("transform").replace("translate(", "").replace(")", "").split(",");
    let center = {
        x: translate_coordinates[0] + 50 / 2,
        y: translate_coordinates[1] + 50 / 2
    };
    let screenInfo = getScreenInfo();
    let scaleFactor = 1.05;
    if (screenInfo.width < 950) {
        scaleFactor = 1.15;
    }
    let transform = to_bounding_box(screenInfo.width, screenInfo.height, center, 50, 50, screenInfo.height / scaleFactor);
    svg.transition().duration(2000).call(zoom.transform, transform);
}

$(document).ready(function(){

    let editor_settings = {
        'texteffects':false,
        'aligneffects':false,
        'textformats':false,
        'fonteffects':false,
        'actions' : false,
        'insertoptions' : false,
        'extraeffects' : false,
        'advancedoptions' : false,
        'screeneffects':false,
        'bold': false,
        'italics': false,
        'underline':false,
        'ol':false,
        'ul':false,
        'undo':true,
        'redo':true,
        'l_align':false,
        'r_align':false,
        'c_align':false,
        'justify':false,
        'insert_link':false,
        'unlink':false,
        'insert_img':false,
        'hr_line':false,
        'block_quote':false,
        'source':false,
        'strikeout':false,
        'indent':false,
        'outdent':false,
        'fonts':false,
        'styles':false,
        'print':false,
        'rm_format':true,
        'status_bar':true,
        'font_size':false,
        'color':false,
        'splchars':false,
        'insert_table':false,
        'select_all':true,
        'togglescreen':true
    };
    let editor = $("#triples").Editor(editor_settings);


    /************************************* SUGGESTORS ********************************************/
    search_node_sug = new InteractiveSuggestor("suggestions-search-node" ,
        "input-text-search-node", input_css,
        "div-search-node", div_css,
         xcss, "searchn_");

    search_node_sug.setData(graphManager.getGraph().getDistinctNodeNames());
    search_node_sug.init();
    search_node_sug.set_onclick_dropdown(function() {
        let node = $(this).attr("data-id");
        if (! node_in_canvas(node) || ! is_visible(node)) {
            return;
        }

        let angles = d3.range(0, 2 * Math.PI, Math.PI / 100);
        let color = node_properties[graphManager.getGraph().getNodeType(node)] === undefined
            ? default_color
            : node_properties[graphManager.getGraph().getNodeType(node)]['color'];
        // this is a d3 code for a adding a gelatinous effect around the searched node
        let path = d3.select("#g-"+node).append("path")
            .attr("stroke", color)
            .attr("fill", color)
            .style("mix-blend-mode", "darken")
            .datum(function(d, i) {
                return d3.radialLine()
                    .curve(d3.curveLinearClosed)
                    .angle(function(a) { return a; })
                    .radius(function(a) {
                        let t = d3.now() / 1000;
                        return 55 + Math.cos(a * 10 - i * 2 * Math.PI / 3 + t) * Math.pow((1 + Math.cos(a - t)) / 2, 3) * 20;
                    });
            });

        d3.timer(function() {
            path.attr("d", function(d) {
                return d(angles);
            });
        });
        d3.select("#"+node).moveToFront();
        d3.select("#t-"+node).moveToFront();
        d3.select("#i-"+node).moveToFront();
        d3.select("#ne-"+node).moveToFront();
        d3.select("#inv_"+node).moveToFront();
        center_screen_to_searched_node(svg, node);
    });

    search_node_sug.set_onclick_event_badge(function() {
        // removes the gelatinous effect from the node(s)
        d3.selectAll("#g-"+$(this).attr("data-id")+" path").remove();
    });

    highlight_sug = new InteractiveSuggestor("suggestions",
        "input-text-highlighter", input_css,
        "div-highlighter", div_css,
        xcss, "badge_");

    highlight_sug.setData(graphManager.getGraph().getLabelsForSuggestor());
    highlight_sug.init();
    highlight_sug.set_onclick_dropdown(highlight);
    highlight_sug.set_onclick_event_badge(highlight);

    expansion_prop_sug = new InteractiveSuggestor("suggestions-expan_prop" ,
        "input-text-expan_prop", input_css,
        "div-expan_prop", div_css,
         xcss,"exp_prop_");
    expansion_prop_sug.setData(graphManager.getGraph().getLabelsForSuggestor());
    expansion_prop_sug.init();

    search_node_burger = new InteractiveSuggestor("suggestions-search-node-burger" ,
        "input-text-search-node-burger", input_css,
        "div-search-node-burger", div_css,
         xcss,"search_node_burger_", 1);

    search_node_burger.setData(graphManager.getGraph().getDistinctNodeNames());
    search_node_burger.init();

    /************************************* END SUGGESTORS ********************************************/

    let filtering_options = {
        "Expand" : {clearAll:false},
        "Start with a new node" : {clearAll:true}
    };

    $("#icon_legend").click(function() {
        let screen_height = $(window).height();
        $("#legend-section").css({"bottom" : (screen_height-360)});
    });

    $("#close-legend").click(function() {
        $("#icon_legend").css("opacity", 1);
        d3.selectAll(".highlighter-circles")
            .attr("data-legend", "inactive")
            .attr("fill-opacity", 0)
            .attr("fill", "rgb(150,150,150)");
        $(".legend-item").css("opacity", 1);
        $("#legend-section").css({"bottom" : "-360px"});
    });


    $("#detected-types").html(fill_color_icon_box()).after(on_color_change()).after(on_icon_file_upload_change());

    $("#legend").html(write_legend()).after(add_legend_events());

    $("#undo_button").click(function() {
        undo_manager.undo();
    });

    $("#clear-text").click(function(d) {
        $("#triples").Editor("setText", "");
    });

    $("#icon_f").click(function() {
        $("#filter").css({"left":"0px"});
        $('#overlayer').css({"display":"block"});
    });

    $(".close_alert").click(function() {
        $(this).parent().css("display", "none");
    });

    $("#overlayer, #close").click(close);

    $("#button").click(compute);
    $("#input-text").keyup(function(e) {
        if (e.keyCode === 13) compute();
    });

    $("#button_triples").click(function() {
        let mode = $("#mode-selection option:selected").text();
        let editor_text;
        if (mode === "Basic") {
            editor_text = $("#triples").Editor("getText").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                .replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/<br>/g, "").replace(/&amp;/, "&")
                .replace(/<pre style="color: rgb(0, 0, 0);">/g, "").replace(/<\/pre>/g, "");

        } else {
            editor_text = $("#triples").Editor("getText").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                .replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/<br>/g, "\n").replace(/&amp;/, "&")
                .replace(/<pre style="color: rgb(0, 0, 0);">/g, "").replace(/<\/pre>/g, "").replace(/&nbsp;/g, "");
        }
        let json = create_json_ref(editor_text, mode);
        if (! json.success) {
            $("#messageLd").text(json.error)
                .removeClass("alert-success")
                .text(json.desc+" ["+json.found_in+"]")
                .addClass("alert-danger")
                .css("display", "block");
            $("#help").css("display", "block");
            return;
        }
        reset_internal_config(json);
    });

    function compute() {
        let search = search_node_burger.extract_selected_options()[0];
        console.log(search);
        if (! graphManager.getGraph().hasNode(search)) {
            $("#alert").css("display", "block");
            return;
        }
        $("#input-text").val("");
        let option = filtering_options[$("#selector option:selected").text()];
        close();
        $("#alert").css("display", "none");
        let temp = window.expansion_prop;
        if (option.clearAll) {
            undo_manager.reset();
            clearCanvas();
        }
        spawn_nodes(graphManager.getGraph(), search, temp === undefined ? {clearAll:false} : temp);
    }

    function close() {
        $("#filter").css({"left":"-600px"});
        $('#overlayer').css({"display":"none"});
        $("#alert").css("display", "none");
        $("#messageLd").css("display", "none");
        $("#help").css("display", "none");
    }

    $("#button-h").click(highlight);

    let expansion_options = {
        "Do not expand selected relationships" : false,
        "Expand selected relationships" : true
    };

    $("#input-text-ep").keyup(function(e) {
        if (e.keyCode === 13) apply_expansion_properties();
    });

    $("#button-ep").click(apply_expansion_properties);


    function apply_expansion_properties() {
        let predicates = expansion_prop_sug.extract_selected_options();
        console.log(predicates);
        if (predicates.length === 0) {
            $("#alert-positive-ep").html("Error: cannot apply empty filter");
            $("#alert-positive-ep").css("display", "block");
            return;
        }
        let temp = {filterNodes : {}};
        temp.filterNodes['option'] = expansion_options[$("#selector-ep").val()];
        temp.filterNodes['labels'] = [];
        for (let i = 0; i < predicates.length; i++) {
            temp.filterNodes['labels'].push(predicates[i]);
        }
        window.expansion_prop = temp;
        $("#alert-positive-ep").html("Filter applied. Start with a new node");
        $("#alert-positive-ep").css("display", "block");
    }

    $("#clear-ep").click(function() {
        window.expansion_prop = undefined;
        $("#alert-positive-ep").html("Expansion properties cleared ");
        $("#alert-positive-ep").css("display", "block");
        expansion_prop_sug.init();
    });

    $("#triple-info-i").click(function() {
        $("#triple_format_info").css("display", "block");
    });

    $("#clear-relationship-filter").click(function() {
        d3.selectAll(".link,.edgetext,.node,.nodetext,.nodeimg,.nodeexp").style("opacity", 1);
        highlight_sug.init();
        $("#alert-h-clear").css("display", "block");
    });

    $("#clear-c").click(function() {
        clearCanvas();
    });

    fill_current_nodes();

    /***************************** CONFIG FILE DOWNLOAD **********************/

    function download(filename, text) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    $("#download-configuration-file").click(function() {
        download("node_properties.json", JSON.stringify(node_properties));
    });


    /*************************** ACCORDION ICON *******************************/
    $(".card-header span.icon").off();
    let collapse_id = {"collapseOne" : false, "collapseTwo" : true, "collapseThree" : true};
    $(".card-header").click(function() {
        let selected = $(this).next().attr("id");
        let number = selected.replace("collapse", "");
        if (collapse_id[selected]) {
            $("#icon"+number).css({transition: "500ms", transform : "rotate(45deg)"});
            collapse_id[selected] = false;
        } else {
            $("#icon"+number).css({transition: "500ms", transform : "rotate(0deg)"});
            collapse_id[selected] = true;
        }
        Object.keys(collapse_id).forEach(function(key) {
            if (key !== selected) {
                $("#icon"+key.replace("collapse", "")).css({transition: "500ms", transform : "rotate(0deg)"});
                collapse_id[key] = true;
            }
        });
        console.log(collapse_id);
    })

    /*********************** SNAPSHOT ***********************************/
    $("#snapshot_button").click(function() {
        saveSvgAsPng(document.getElementById("svg-canvas"), "mycanvas");
    })
});

let add_legend_events = function() {
    $(".legend-item").click(function() {
        let select_type = $(this).attr("id");
        if (d3.select(".type-"+select_type+" .highlighter-circles")._groups[0][0] === null) return;
        $("#icon_legend").css("opacity", 0);
        $(".legend-item").css("opacity", 0.4);
        $(this).css("opacity", 1);
        d3.selectAll(".highlighter-circles")
            .filter((_, i, n) => n[i].classList[1] !== select_type)
            .attr("data-legend", "inactive")
            .attr("fill-opacity", 0)
            .attr("fill", "rgb(150,150,150)");

        let is_active = d3.select(".type-"+select_type+" .highlighter-circles")._groups[0][0] === null
            ? false
            : d3.select(".type-"+select_type+" .highlighter-circles").attr("data-legend") === "active";


        if (is_active) {
            d3.selectAll(".type-"+select_type+" .highlighter-circles")
                .attr("fill-opacity", 0)
                .attr("data-legend", "inactive")
                .attr("fill", node_properties[select_type]['color']);
            $(".legend-item").css("opacity", 1);
        } else {
            d3.selectAll(".type-"+select_type+" .highlighter-circles")
                .attr("fill-opacity", 0.8)
                .attr("data-legend", "active")
                .attr("fill", node_properties[select_type]['color']);
        }
    });
}

function reset_burger_suggestors() {
    highlight_sug.setData(graphManager.getGraph().getLabelsForSuggestor());
    highlight_sug.init();
    expansion_prop_sug.setData(graphManager.getGraph().getLabelsForSuggestor());
    expansion_prop_sug.init();
    search_node_sug.setData(graphManager.getGraph().getDistinctNodeNames());
    search_node_sug.init();
    search_node_burger.setData(graphManager.getGraph().getDistinctNodeNames());
    search_node_burger.init();
}

function reset_internal_config(json) {
    node_properties = {};
    let graph = new GraphInitializer(new graphlib.Graph(), json.n, json.e);
    graphManager.setGraph(graph);
    undo_manager.reset();
    $("#messageLd").css("display", "block")
        .removeClass("alert-danger")
        .addClass("alert-success")
        .html("The data has been loaded! Start searching for a node!");
    $("#help").css("display", "none");
    reset_burger_suggestors();
    $("#legend").html(write_legend()).after(add_legend_events());
    $("#detected-types").html(fill_color_icon_box()).after(on_color_change()).after(on_icon_file_upload_change());
    fill_current_nodes();
    clearCanvas();
}

function apply_opacity_node(node_id, opacity) {
    d3.select("#" + node_id).style("opacity", opacity);
    d3.select("#t-" + node_id).style("opacity", opacity);
    d3.select("#i-" + node_id).style("opacity", opacity);
    d3.select("#ne-" + node_id).style("opacity", opacity);
}

function highlight() {
    let labels = highlight_sug.extract_selected_options();
    //console.log("LABELS=>",labels);
    if (labels.length === 0) {
        d3.selectAll(".link,.edgetext,.node,.nodetext,.nodeimg,.nodeexp").style("opacity", 1);
        return;
    }
    let edge_opacity = 0.05;
    let node_opacity = 0.4;
    d3.selectAll(".link,.edgetext").style("opacity", edge_opacity);
    d3.selectAll(".nodetext,.nodeimg,.node,.nodeexp").style("opacity", node_opacity);
    for (let i = 0; i < labels.length; i++) {
        d3.selectAll("."+labels[i]).filter(".link,.edgetext").style("opacity", 1);
        d3.selectAll("line."+labels[i]).each(function(d, i) {
            apply_opacity_node(d.source.id, 1);
            apply_opacity_node(d.target.id, 1);
        })
    }
}