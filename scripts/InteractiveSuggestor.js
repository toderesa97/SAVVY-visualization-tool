class InteractiveSuggestor {

    constructor(element_sug_id, element_input_id, input_css ,
                element_div_id, div_css, x_css, prefix_id, max_selected_items) {
        this.sug_id = element_sug_id;
        this.input_id = element_input_id;
        this.div_id = element_div_id;
        this.prefix = prefix_id;
        this.selected_badges = {};
        this.input_css = input_css;
        this.div_css = div_css;
        this.xcss = x_css;
        this.data = undefined;
        this.max_allowed_items = max_selected_items;
        this.current_elements = 0;
    }

    setData(data) {
        /**
         * If you wanted to display other names, you should provide an identifier for it in the format:
         * [{"id" : "..." , "label" : "..."}]
         * Take into account that the field id must be correctly formatted as it is going to be used for selecting DOM elements
         */
        this.data = data;
    }

    init() {
        this.current_elements = 0;
        let all_elements = this.get_all_comma_separated_elements();
        let input_id = this.input_id;
        $("#"+this.div_id)
            .css(this.div_css)
            .html('<input placeholder="Search..." data-list="'+all_elements+'" id="'+input_id+'" data-multiple="'+input_id+'"/>\n');
        $("#"+this.input_id)
            .css(this.input_css);
        let _this = this;
        new Awesomplete('input[data-multiple="'+input_id+'"]', {
            autoFirst : true,
            filter: function(text, input) {
                console.log(text, input, _this.selected_badges);
                if (_this.selected_badges[text] !== undefined) return false;
                return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,]*$/)[0]);
            },

            item: function(text, input) {
                return Awesomplete.ITEM(text, input.match(/[^,]*$/)[0]);
            },

            replace: function(text) {
                this.input.value = "";
                if (! _this.can_add_more_elements()) {
                    return;
                }
                let text_id = _this.get_id_given(text.label);
                $("#"+_this.div_id).prepend(_this.append_badge(text.label, text_id));
                _this.update_input_list("add", text);
                $("#"+_this.prefix+text_id).click(function() {
                    _this.update_input_list("remove", text);
                    $(this).remove();
                    _this.current_elements--;
                    $(this).on("custom", _this.onclick_event_badge);
                    $(this).trigger("custom");
                    $("#"+_this.prefix+text_id).off();
                });
                _this.current_elements++;
                $("#"+_this.prefix+text_id)
                    .on("custom-function", _this.onclick_dropdown)
                    .css(_this.xcss['outer']);
                $("."+_this.prefix+"button .x-icon").css(_this.xcss['inner']);
                $("#"+_this.prefix+text_id).trigger("custom-function");
            }
        });
    }

    update_input_list(operation, text) {
        /**
         * This method updates the data-list attribute of the input
         */
        if (operation === "add") {
            this.selected_badges[text] = "";
        } else {
            delete this.selected_badges[text];
        }
    }

    get_id_given(label) {
        for (let i = 0; i < this.data.length; i++) {
            if (this.data[i].label.toLowerCase() === label.toLowerCase()) {
                return this.data[i].id;
            }
        }
    }

    set_onclick_dropdown(fnc) {
        this.onclick_dropdown = fnc;
    }

    set_onclick_event_badge(fnc) {
        this.onclick_event_badge = fnc;
    }

    append_badge(text, text_id) {
        return '<button data-id="'+text_id+'" data-name="'+text+'" id="'+this.prefix+text_id+'" type="button" class="'+this.prefix+'button btn btn-primary">\n' +
            text+'<i class="x-icon fas fa-times"></i>' +
            '</button>';
    }

    get_all_comma_separated_elements() {
        let comma_separated_values = "";
        this.data.forEach(function( object ) {
            comma_separated_values += object.label.toLowerCase() + ",";
        });
        return comma_separated_values.slice(0, -1);
    }

    setMaximumElements(max) {
        this.max_allowed_items = max;
    }

    can_add_more_elements() {
        return this.max_allowed_items === undefined || this.max_allowed_items > this.current_elements;
    }

    extract_selected_options() {
        let labels = [];
        let _this = this;
        $("#"+this.div_id+" button").each(function(index) {
            if ($(this).attr("id") === _this.input_id) return;
            labels.push($(this).attr("id").replace(_this.prefix, ""));
        });
        return labels;
    }
}