/*
 The following script converts from triples form to json. A triple is a mere string comprised of three main parts:

 - Subject
 - Predicate (an action or relationship between subject and object)
 - Object

 An example:

 <BernersLee> <created> <www> .
 <You> <are_reading> <this_script> .

 Also Subject/Object type can be defined by using the [a] operator, Eg:

 <BernersLee> a <Person> .
 <www> a <Thing> .
 <You> a <Person> .

 CAVEATS (read with special care and assimilate them):
    1. PLEASE NOTE THE USE OF < > and . (spaces are not required)
    2. DO NOT USE NEITHER THE - (hyphen) NOR THE < > . CHARACTERS FOR DEFINING SUBs, OBJs OR PREDs.
    3. USE PLAIN ENGLISH CHARACTERS (a...z or A...Z) to avoid encoding problems
*/

function create_json_ref(src, mode) {
    if (mode === "Basic") {
        return get_edges_nodes_simple(src);
    } else {
        return get_edges_nodes_extended(src);
    }
}

function get_edges_nodes_extended(src) {
    let all_lines = src.split("\n");
    let prefixes = {};
    let nodes = [];
    let edges = [];
    for (let i = 0; i < all_lines.length; i++) {
        if (all_lines[i].length === 0) continue;
        let line = all_lines[i].trim();
        if (line.startsWith("@prefix")) {
            let regex = /@prefix[ ]+(.*):[ ]*<([\w\/\:\-\.#\&]+)>./gm;
            let matches = regex.exec(line);
            if (matches[1] in prefixes) continue;
            prefixes[matches[1]] = matches[2];
        }
        if (line.match(/^[<\w+"]/gm) != null) {
            if (line.indexOf("\"") !== -1) {
                let c = 0;
                let auxiliar_line = "";
                for (let j = 0; j < line.length; j++) {
                    if (line.charAt(j) === '"') {
                        if (c > 0) {
                            c = 0;
                        } else {
                            c = 1;
                        }
                    } else {
                        if (c > 0) {// within a ""
                            if (line.charAt(j) === " ") continue;
                            auxiliar_line += line.charAt(j);
                        } else {
                            auxiliar_line += line.charAt(j);
                        }
                    }
                }
                line = auxiliar_line;
            }
            let triple_elements = line.split(/[ ]+/gm);
            if (triple_elements[1] === "a") {
                // semantic
                if (triple_elements.length > 2) {
                    nodes.push(extract_node_information(prefixes, triple_elements));
                }
            } else {
                // declaration
                if (triple_elements.length > 2) {
                    edges.push(extract_edge_information(prefixes, triple_elements));
                }
            }

        }
    }
    return {success: true, n : nodes, e: edges};
}

function extract_node_information(prefixes, elements) {
    let node_id = treat_element(prefixes, elements[0]);
    let type = treat_element(prefixes, elements[2]);

    return {id:node_id, type:type};
}

function treat_element(prefixes, string) {
    let invalid_characters = /[^A-Za-z_-]/gm;
    if (string.startsWith("<")) {
        return string.replace(invalid_characters, "");
    } else {
        let foo = string.split(":");
        return foo.length > 1 ? foo[1].replace(invalid_characters, "")
            : string.replace(invalid_characters, "");
    }
}

function extract_edge_information(prefixes, elements) {
    let src_id = treat_element(prefixes, elements[0]);
    let label = treat_element(prefixes, elements[1]);
    let target_id = treat_element(prefixes, elements[2]);

    return {source: src_id, target: target_id, labeled: label};
}

function get_edges_nodes_simple(src) {
    let triples = src.split(".");
    let declarations = [];
    let edges = [];
    let foundNodes = {};
    let semantic_meaning = {};
    for (let i = 0; i < triples.length-1; i++) {
        if (triples[triples.length-1] !== "") {
            return {success:false, desc: "Missing . at the end"};
        }
        let triple_elements = get_triple_elements(triples[i]);
        console.log(triple_elements);
        if (triple_elements.success) {
            let content = triple_elements.content;
            if (triple_elements.triple_type === "semantic") {
                semantic_meaning[content[0]] = content[1];
            } else {
                declarations.push(content);
                if (! (content[0] in foundNodes)) {
                    foundNodes[content[0]] = "";
                }
                if (! (content[2] in foundNodes)) {
                    foundNodes[content[2]] = "";
                }
            }
        } else {
            return triple_elements;
        }
    }
    let nodes = [];
    for (let i = 0; i < declarations.length; i++) {
        // create the edge if the nodes are defined!
        let content = declarations[i];
        if (foundNodes[content[0]] !== undefined) {
            delete foundNodes[content[0]];
            nodes.push({"id" : content[0], "type" : semantic_meaning[content[0]]});
        }
        if (foundNodes[content[2]] !== undefined) {
            nodes.push({"id" : content[2], "type" : semantic_meaning[content[2]]});
            delete foundNodes[content[2]];
        }
        edges.push({"source":content[0], "target":content[2], "labeled":content[1],
            "id":content[0]+"-"+content[2]});
    }
    return {success: true, n : nodes, e : edges};
}

function get_triple_elements(triple) {
    let triple_elements = [];
    let counter = 0;
    let elements = 0;
    if (triple === "") return "";
    for (let j = 0; j < triple.length; j++) {
        let character = triple.charAt(j);
        if (character === '<') counter = 0;
        if (character !== '>') counter++;
        if (character === '>') {
            if (elements > 3) {
                return {success:false, desc:"Syntax error. Missing <> or dot", found_in: triple};
            }
            triple_elements.push(triple.substring(j-counter+1, j).replace("-", "_").replace("/", "__")
                .replace(".", "").replace("&", "_and_").replace("?", "").toLowerCase());
            counter = 0;
            elements++;
        }
    }
    return {success:true, content:triple_elements,
        triple_type:triple_elements.length === 3 ? "declaration" : "semantic"};
}
