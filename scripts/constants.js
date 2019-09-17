/* Default color for a node */
const default_color = "#FF7F50";

/* icon that appear on the node when it is expandable, ie: has new no-sketched neighbors */
const expand_path_icon = "./icons/expand2.svg";

const colors = ["#999CED", "#C0C1C9", "#CD8BF3", "#B66AC6", "#E1BBC9", "#A2DFFD", "#ACE5AF",
    "#FFBFCC", "#FFD4A2", "#C7BFE9", "#F37996", "#FFDD8F", "#49E1B9", "51A9C7", "#4A707C"];

/* If it is wanted to specify new properties for nodes, ie: color and icon, just modify this variable adding or removing accordingly
*
*   "node_type" : {
*       color : "red",
*       icon : "path_to_svg"
*   }
*
*   Remarks:
*       - The color can be specified using either the RGB, HEX or a color's name (red, blue, pink...)
*       - Even though the supported formats for the icons are .jpg, .png or .svg (probably there may be another one),
*           I strongly recommend using the .svg format since it is a scalable vector graphics.
*
*           Bitmap images such as JPG, PNG, GIF are composed of a fixed set of pixels, whereas the vector images are composed
*           of a fixed set of shapes. That is why when scaling a bitmap image the pixels are revealed, whilst in the vectorial
*           ones the shapes are preserved.
*
* */
let node_properties = {
    /*"person" : {
        color : "#7dfa38",
        icon : "./icons/employee.svg"
    },
    "institution" : {
        color : "#00BFFF",
        icon : "./icons/institution.svg"
    },
    "wp" : {
        color : "#8b850e",
        icon : "./icons/model.svg"
    },
    "intern" : {
        color : "#ffc0b2",
        icon : "./icons/student.svg"
    },
    "project" : {
        color : "#768b83",
        icon : "./icons/project.svg"
    }*/
};