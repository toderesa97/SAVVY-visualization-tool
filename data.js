var theData = {
    "nodes": [
        {"id" : "eifer" , "type" : "institution" },
        { "id" : "monjur", "type" : "person" },
        { "id" : "fran", "type" : "person" },
        { "id" : "java", "type" : "tool" },
        { "id" : "mug", "type" : "model" },
        { "id" : "tomis", "type" : "person" },
        { "id" : "victor", "type" : "person" },
        { "id" : "edf", "type" : "institution" },
        { "id" : "kit", "type" : "institution" }
    ],
    "edges": [
        { "source": "eifer", "target": "monjur", "labeled" : "loves", "viceversa" : "yes"},
        { "source": "monjur", "target": "fran", "labeled" : "friend_of", "viceversa" : "yes"},
        { "source": "monjur", "target": "java", "labeled" : "hates"},
        { "source": "java", "target": "mug", "labeled" : "TEST"},
        { "source": "fran", "target": "java", "labeled" : "loves"},
        { "source": "eifer", "target": "java", "labeled" : "uses"},
        { "source": "eifer", "target": "mug", "labeled" : "uses"},
        { "source": "fran", "target": "mug", "labeled" : "dislikes"},
        { "source": "tomis", "target": "mug", "labeled" : "dislikes"},
        { "source": "mug", "target": "victor", "labeled" : "dislikes"},
        { "source": "eifer", "target": "edf", "labeled" : "part_of"},
        { "source": "kit", "target": "eifer", "labeled" : "has"},
        { "source": "tomis", "target": "edf", "labeled" : "likes"}
    ]
};