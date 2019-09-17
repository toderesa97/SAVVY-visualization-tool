let reader;
let progress = document.querySelector('.percent');

function abortRead() {
    reader.abort();
}

function errorHandler(evt) {
    switch(evt.target.error.code) {
        case evt.target.error.NOT_FOUND_ERR:
            $("#data-loading-message").removeClass("display-none").text("File Not Found");
            //alert('File Not Found!');
            break;
        case evt.target.error.NOT_READABLE_ERR:
            $("#data-loading-message").removeClass("display-none").text("File is not readable");
            break;
        case evt.target.error.ABORT_ERR:
            break; // noop
        default:
            $("#data-loading-message").removeClass("display-none").text("Something went wrong :(");
    }
}

function updateProgress(evt) {
    // evt is an ProgressEvent.
    if (evt.lengthComputable) {
        let percentLoaded = Math.round((evt.loaded / evt.total) * 100);
        // Increase the progress bar length.
        if (percentLoaded < 100) {
            progress.style.width = percentLoaded + '%';
            progress.textContent = percentLoaded + '%';
        }
    }
}

function handleFileSelect(evt) {
    // Reset progress indicator on new file selection.
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
        $("#data-loading-message").removeClass("display-none").text("File read cancelled");
        //alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
        document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
        // Ensure that the progress bar displays 100% at the end.
        progress.style.width = '100%';
        progress.textContent = '100%';
        setTimeout("document.getElementById('progress_bar').className='';", 2000);
    };

    reader.onloadend = function(evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            let src = evt.target.result;
            let json = create_json_ref(src, "Extended");
            if (! json.success) {
                $("#data-loading-message").removeClass("alert-success display-none")
                    .addClass("alert-warning")
                    .text("There was a problem in "+json.desc);
                return;
            }
            reset_internal_config(json);
        }
        $("#data-loading-message").removeClass("display-none").text("Data loaded");
    };

    // Read in the image file as a binary string.
    reader.readAsBinaryString(evt.target.files[0]);
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

document.getElementById("load-configuration-file").addEventListener("change", function(evt) {
    let rder = new FileReader();
    rder.onloadend = function(evt) {
        if (evt.target.readyState === FileReader.DONE) {
            node_properties = JSON.parse(evt.target.result);
            fill_current_nodes();
        }
    };
    rder.readAsBinaryString(evt.target.files[0]);
} ,false);

function fill_current_nodes() {
    let types = Object.keys(node_properties);
    types.forEach(function(type) {
        if (node_properties[type] === {} || node_properties[type] === undefined) {
            return;
        }
        if (node_properties[type].color !== undefined) {
            d3.selectAll(".type.type-"+type+" .node").style("fill", node_properties[type].color);
            $("#cp-"+type).spectrum("set", node_properties[type].color);
        }
        if (node_properties[type].icon !== undefined) {
            d3.selectAll(".type.type-"+type+" .nodeimg").attr("href", node_properties[type].icon);
        }
        $("#legend").html(write_legend()).after(add_legend_events());
    });
}
