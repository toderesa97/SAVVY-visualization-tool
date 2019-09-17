var driver = neo4j.v1.driver("bolt://localhost", neo4j.v1.auth.basic("neo4j", "neo4j"));


driver.close();

var session = driver.session();
session
.run('MERGE (james:Person {name : {nameParam} }) RETURN james.name AS name', {nameParam: 'James'})
.then(function (result) {
        result.records.forEach(function (record) {
            console.log(record.get('name'));
        });
        session.close();
    })
.catch(function (error) {
        console.log(error);
    });

