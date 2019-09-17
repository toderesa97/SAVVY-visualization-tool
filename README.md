# Graph Visualization

Welcome to this amazing app! You are going to be given thorough instructions on how to use the app to leverage its capabilities. Go to, [SAVVY Tool](https://tymlinhart.com/savvy-tool) to try it.

## Installation

You do not need any kind of installation. Just download the `.zip` file (or using the desired format) and then open the `index.html` file using either
Mozilla or Chrome.

Opening the app using Edge does not work. So far, the app has not been tested in other browsers such as Safari or Opera.

## Required software

- For Windows users:
    - Mozilla, Google Chrome or Opera
- For MAC users:
    - Mozilla or Google Chrome. With Safari the features work but it does not render colors the same way other browsers do. Same with icons.
- For LINUX users:
    - Mozilla
- Mobiles:
    - iOS: seems not to work on any browser. For any reason seems like there is a first layer that avoids interactivity.
    - android: Chrome, Mozilla, Opera

Exhaustive tests have not been performed. There might be some browsers that actually can or cannot support the application, depending upon the version and OS.

- Internet connection for retrieving the needed libraries.

## Customization of the graph

### Changing node colors

`./scripts/constants.js` is the file responsible for defining the mapping between data types and its color and icon. Nodes are applied default properties if it were not to be specified anything within this file.


```
const colors = {
    "person" : "#7dfa38",
    "institution" : "#00BFFF",
    "intern" : "#7FFF00",
    "maintenance" : "#008B8B",
    "model" : "#8b850e",
    "tool" : "#768b83",
};

const default_color = "#FF7F50";

const expand_path_icon = "./icons/expand.svg";

const dict_type_icon = {
    "person" : "./icons/employee.svg",
    "institution" : "./icons/institution.svg",
    "intern" : "./icons/student.svg",
    "maintenance" : "./icons/maintenance.svg",
    "tool" : "./icons/sketch.svg",
    "model" : "./icons/model.svg"
};
```

The data types defined within this file must match the ones defined within the RDF structure. **Take into account that the app internally has a case-insensitive policy.**

