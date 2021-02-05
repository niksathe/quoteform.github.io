/* ===================================================================
plugins.js
======================================================================

@name       Confused.com Stylguide
@author     Red Bullet <support@redbullet.co.uk>
@copyright  Confused.com 2012

This contains javascript that will be used across the entire
application. Feel free to use uncompressed files as this should
be concatenated and minified. 

If a plugin is only required on one page - please add it to the
/libs/ folder instead so it can be served independantly.

======================================================================
Contents
======================================================================

- Safe Console Log
- jQuery Easing Molecules
- Tablesorter
- Chosen
- Colorbox
- Live Filter

=================================================================== */

/* Safe Console Log
=============================================================================================== */
(function (b) { function c() { } for (var d = "assert,clear,count,debug,dir,dirxml,error,exception,firebug,group,groupCollapsed,groupEnd,info,log,memoryProfile,memoryProfileEnd,profile,profileEnd,table,time,timeEnd,timeStamp,trace,warn".split(","), a; a = d.pop(); ) { b[a] = b[a] || c } })((function () {
    try
{ console.log(); return window.console; } catch (err) { return window.console = {}; } 
})());


/* ============================================================================================

@name       jquery.molecules
@depends    jquery

============================================================================================= */

(function (a, b) { function h(a) { return function (b) { return Math.pow(b, a) } } function g(a, b, g) { var h = g ? b() : b, i = g ? b(g) : b; c[d + "In" + a] = h; c[d + "Out" + a] = e(h); c[d + "InOut" + a] = f(i) } function f(a) { return function (b) { return .5 * (b < .5 ? a(2 * b) : 2 - a(2 - 2 * b)) } } function e(a) { return function (b) { return 1 - a(1 - b) } } var c = a.easing, d = "ease"; g("Quad", h(2)); g("Cubic", h(3)); g("Quart", h(4)); g("Quint", h(5)); g("Sine", function (a) { return 1 - Math.cos(a * Math.PI / 2) }); g("Expo", function (a) { return Math.pow(2, 10 * (a - 1)) }); g("Circ", function (a) { return 1 - Math.sqrt(1 - a * a) }); var i = function (a) { if (a === b) a = 1.70158; return function (b) { return b * b * ((a + 1) * b - a) } }; g("Back", i, 1.70158 * 1.525); g("Bounce", function (a) { var b = 2.75, c = 7.5625, d = 0; d = a < .25 / b ? c * (a -= .125 / b) * a + .984375 : a < .75 / b ? c * (a -= .5 / b) * a + .9375 : a < 1.75 / b ? c * (a -= 1.25 / b) * a + .75 : c * --a * a; return 1 - d }); var j = function (a) { if (a === b) a = .3; return function (b) { if (b == !!b) return b; var c = 2 * Math.PI, d = a / c * Math.asin(1); return -(Math.pow(2, 10 * --b) * Math.sin((b - d) * c / a)) } }; g("Elastic", j, .45) })(jQuery);


/* ============================================================================================

@name       jquery.animateCSS
@depends    jquery

============================================================================================= */

(function ($) { $.fn.animateCSS = function (c, d, e) { return this.each(function () { var a = $(this); if (!d || typeof d == 'function') { e = d; d = 0 } var b = setTimeout(function () { a.addClass('animated ' + c); if (a.css('visibility') == 'hidden') { a.css({ 'visibility': 'visible' }) } if (a.is(':hidden')) { a.show() } a.one('animationend webkitAnimationEnd oAnimationEnd', function () { a.removeClass('animated ' + c); if (typeof e == 'function') { e.call(this) } }) }, d) }) } })(jQuery);


/* ============================================================================================

@name       jquery.chosen
@depends    jquery
@link       https://github.com/harvesthq/chosen/

============================================================================================= */

(function () {
    var SelectParser;

    SelectParser = (function () {

        function SelectParser() {
            this.options_index = 0;
            this.parsed = [];
        }

        SelectParser.prototype.add_node = function (child) {
            if (child.nodeName === "OPTGROUP") {
                return this.add_group(child);
            } else {
                return this.add_option(child);
            }
        };

        SelectParser.prototype.add_group = function (group) {
            var group_position, option, _i, _len, _ref, _results;
            group_position = this.parsed.length;
            this.parsed.push({
                array_index: group_position,
                group: true,
                label: group.label,
                children: 0,
                disabled: group.disabled
            });
            _ref = group.childNodes;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                option = _ref[_i];
                _results.push(this.add_option(option, group_position, group.disabled));
            }
            return _results;
        };

        SelectParser.prototype.add_option = function (option, group_position, group_disabled) {
            if (option.nodeName === "OPTION") {
                if (option.text !== "") {
                    if (group_position != null) this.parsed[group_position].children += 1;
                    this.parsed.push({
                        array_index: this.parsed.length,
                        options_index: this.options_index,
                        value: option.value,
                        text: option.text,
                        html: option.innerHTML,
                        selected: option.selected,
                        disabled: group_disabled === true ? group_disabled : option.disabled,
                        group_array_index: group_position,
                        classes: option.className,
                        style: option.style.cssText
                    });
                } else {
                    this.parsed.push({
                        array_index: this.parsed.length,
                        options_index: this.options_index,
                        empty: true
                    });
                }
                return this.options_index += 1;
            }
        };

        return SelectParser;

    })();

    SelectParser.select_to_array = function (select) {
        var child, parser, _i, _len, _ref;
        parser = new SelectParser();
        _ref = select.childNodes;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            child = _ref[_i];
            parser.add_node(child);
        }
        return parser.parsed;
    };

    this.SelectParser = SelectParser;

}).call(this);

/*
Chosen source: generate output using 'cake build'
Copyright (c) 2011 by Harvest
*/

(function () {
    var AbstractChosen, root;

    root = this;

    AbstractChosen = (function () {

        function AbstractChosen(form_field, options) {
            this.form_field = form_field;
            this.options = options != null ? options : {};
            this.set_default_values();
            this.is_multiple = this.form_field.multiple;
            this.set_default_text();
            this.setup();
            this.set_up_html();
            this.register_observers();
            this.finish_setup();
        }

        AbstractChosen.prototype.set_default_values = function () {
            var _this = this;
            this.click_test_action = function (evt) {
                return _this.test_active_click(evt);
            };
            this.activate_action = function (evt) {
                return _this.activate_field(evt);
            };
            this.active_field = false;
            this.mouse_on_container = false;
            this.results_showing = false;
            this.result_highlighted = null;
            this.result_single_selected = null;
            this.allow_single_deselect = (this.options.allow_single_deselect != null) && (this.form_field.options[0] != null) && this.form_field.options[0].text === "" ? this.options.allow_single_deselect : false;
            this.disable_search_threshold = this.options.disable_search_threshold || 0;
            this.search_contains = this.options.search_contains || false;
            this.choices = 0;
            this.single_backstroke_delete = this.options.single_backstroke_delete || false;
            return this.max_selected_options = this.options.max_selected_options || Infinity;
        };

        AbstractChosen.prototype.set_default_text = function () {
            if (this.form_field.getAttribute("data-placeholder")) {
                this.default_text = this.form_field.getAttribute("data-placeholder");
            } else if (this.is_multiple) {
                this.default_text = this.options.placeholder_text_multiple || this.options.placeholder_text || "Select Some Options";
            } else {
                this.default_text = this.options.placeholder_text_single || this.options.placeholder_text || "Select an Option";
            }
            return this.results_none_found = this.form_field.getAttribute("data-no_results_text") || this.options.no_results_text || "No results match";
        };

        AbstractChosen.prototype.mouse_enter = function () {
            return this.mouse_on_container = true;
        };

        AbstractChosen.prototype.mouse_leave = function () {
            return this.mouse_on_container = false;
        };

        AbstractChosen.prototype.input_focus = function (evt) {
            var _this = this;
            if (!this.active_field) {
                return setTimeout((function () {
                    return _this.container_mousedown();
                }), 50);
            }
        };

        AbstractChosen.prototype.input_blur = function (evt) {
            var _this = this;
            if (!this.mouse_on_container) {
                this.active_field = false;
                return setTimeout((function () {
                    return _this.blur_test();
                }), 100);
            }
        };

        AbstractChosen.prototype.result_add_option = function (option) {
            var classes, style;
            if (!option.disabled) {
                option.dom_id = this.container_id + "_o_" + option.array_index;
                classes = option.selected && this.is_multiple ? [] : ["active-result"];
                if (option.selected) classes.push("result-selected");
                if (option.group_array_index != null) classes.push("group-option");
                if (option.classes !== "") classes.push(option.classes);
                style = option.style.cssText !== "" ? " style=\"" + option.style + "\"" : "";
                return '<li id="' + option.dom_id + '" class="' + classes.join(' ') + '"' + style + '>' + option.html + '</li>';
            } else {
                return "";
            }
        };

        AbstractChosen.prototype.results_update_field = function () {
            if (!this.is_multiple) this.results_reset_cleanup();
            this.result_clear_highlight();
            this.result_single_selected = null;
            return this.results_build();
        };

        AbstractChosen.prototype.results_toggle = function () {
            if (this.results_showing) {
                return this.results_hide();
            } else {
                return this.results_show();
            }
        };

        AbstractChosen.prototype.results_search = function (evt) {
            if (this.results_showing) {
                return this.winnow_results();
            } else {
                return this.results_show();
            }
        };

        AbstractChosen.prototype.keyup_checker = function (evt) {
            var stroke, _ref;
            stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
            this.search_field_scale();
            switch (stroke) {
                case 8:
                    if (this.is_multiple && this.backstroke_length < 1 && this.choices > 0) {
                        return this.keydown_backstroke();
                    } else if (!this.pending_backstroke) {
                        this.result_clear_highlight();
                        return this.results_search();
                    }
                    break;
                case 13:
                    evt.preventDefault();
                    if (this.results_showing) return this.result_select(evt);
                    break;
                case 27:
                    if (this.results_showing) this.results_hide();
                    return true;
                case 9:
                case 38:
                case 40:
                case 16:
                case 91:
                case 17:
                    break;
                default:
                    return this.results_search();
            }
        };

        AbstractChosen.prototype.generate_field_id = function () {
            var new_id;
            new_id = this.generate_random_id();
            this.form_field.id = new_id;
            return new_id;
        };

        AbstractChosen.prototype.generate_random_char = function () {
            var chars, newchar, rand;
            chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            rand = Math.floor(Math.random() * chars.length);
            return newchar = chars.substring(rand, rand + 1);
        };

        return AbstractChosen;

    })();

    root.AbstractChosen = AbstractChosen;

}).call(this);

/*
Chosen source: generate output using 'cake build'
Copyright (c) 2011 by Harvest
*/

(function () {
    var $, Chosen, get_side_border_padding, root,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    root = this;

    $ = jQuery;

    $.fn.extend({
        chosen: function (options) {
            //if ($.browser.msie && ($.browser.version === "6.0" || $.browser.version === "7.0")) {
            //    return this;
            //}

            return this.each(function (input_field) {
                var $this;
                $this = $(this);
                if (!$this.hasClass("chzn-done")) {
                    return $this.data('chosen', new Chosen(this, options));
                }
            });
        }
    });

    Chosen = (function (_super) {

        __extends(Chosen, _super);

        function Chosen() {
            Chosen.__super__.constructor.apply(this, arguments);
        }

        Chosen.prototype.setup = function () {
            this.form_field_jq = $(this.form_field);
            this.current_value = this.form_field_jq.val();
            return this.is_rtl = this.form_field_jq.hasClass("chzn-rtl");
        };

        Chosen.prototype.finish_setup = function () {
            return this.form_field_jq.addClass("chzn-done");
        };

        Chosen.prototype.set_up_html = function () {
            var container_div, dd_top, dd_width, sf_width;
            this.container_id = this.form_field.id.length ? this.form_field.id.replace(/[^\w]/g, '_') : this.generate_field_id();
            this.container_id += "_chzn";
            this.f_width = this.form_field_jq.outerWidth() + 25; // Add space for the arrow
            container_div = $("<div />", {
                id: this.container_id,
                "class": "chzn-container" + (this.is_rtl ? ' chzn-rtl' : ''),
                style: 'width: ' + this.f_width + 'px;'
            });
            if (this.is_multiple) {
                container_div.html('<ul class="chzn-choices"><li class="search-field"><input type="text" value="' + this.default_text + '" class="default" autocomplete="off" style="width:25px;" /></li></ul><div class="chzn-drop" style="left:-9000px;"><ul class="chzn-results"></ul></div>');
            } else {
                container_div.html('<a href="javascript:void(0)" class="chzn-single chzn-default"><span>' + this.default_text + '</span><div><i></i></div></a><div class="chzn-drop" style="left:-9000px;"><div class="chzn-search"><input type="text" autocomplete="off" /></div><ul class="chzn-results"></ul></div>');
            }
            this.form_field_jq.hide().after(container_div);
            this.container = $('#' + this.container_id);
            this.container.addClass("chzn-container-" + (this.is_multiple ? "multi" : "single"));
            this.dropdown = this.container.find('div.chzn-drop').first();
            dd_top = this.container.height();
            dd_width = this.f_width - get_side_border_padding(this.dropdown);
            this.dropdown.css({
                "width": dd_width + 1 + "px", // Dropdown width
                "top": dd_top + "px"
            });
            this.search_field = this.container.find('input').first();
            this.search_results = this.container.find('ul.chzn-results').first();
            this.search_field_scale();
            this.search_no_results = this.container.find('li.no-results').first();
            if (this.is_multiple) {
                this.search_choices = this.container.find('ul.chzn-choices').first();
                this.search_container = this.container.find('li.search-field').first();
            } else {
                this.search_container = this.container.find('div.chzn-search').first();
                this.selected_item = this.container.find('.chzn-single').first();
                sf_width = dd_width - get_side_border_padding(this.search_container) - get_side_border_padding(this.search_field);
                this.search_field.css({
                    "width": sf_width + "px"
                });
            }
            this.results_build();
            this.set_tab_index();
            return this.form_field_jq.trigger("liszt:ready", {
                chosen: this
            });
        };

        Chosen.prototype.register_observers = function () {
            var _this = this;
            this.container.mousedown(function (evt) {
                return _this.container_mousedown(evt);
            });
            this.container.mouseup(function (evt) {
                return _this.container_mouseup(evt);
            });
            this.container.mouseenter(function (evt) {
                return _this.mouse_enter(evt);
            });
            this.container.mouseleave(function (evt) {
                return _this.mouse_leave(evt);
            });
            this.search_results.mouseup(function (evt) {
                return _this.search_results_mouseup(evt);
            });
            this.search_results.mouseover(function (evt) {
                return _this.search_results_mouseover(evt);
            });
            this.search_results.mouseout(function (evt) {
                return _this.search_results_mouseout(evt);
            });
            this.form_field_jq.bind("liszt:updated", function (evt) {
                return _this.results_update_field(evt);
            });
            this.search_field.blur(function (evt) {
                return _this.input_blur(evt);
            });
            this.search_field.keyup(function (evt) {
                return _this.keyup_checker(evt);
            });
            this.search_field.keydown(function (evt) {
                return _this.keydown_checker(evt);
            });
            if (this.is_multiple) {
                this.search_choices.click(function (evt) {
                    return _this.choices_click(evt);
                });
                return this.search_field.focus(function (evt) {
                    return _this.input_focus(evt);
                });
            } else {
                return this.container.click(function (evt) {
                    return evt.preventDefault();
                });
            }
        };

        Chosen.prototype.search_field_disabled = function () {
            this.is_disabled = this.form_field_jq[0].disabled;
            if (this.is_disabled) {
                this.container.addClass('chzn-disabled');
                this.search_field[0].disabled = true;
                if (!this.is_multiple) {
                    this.selected_item.unbind("focus", this.activate_action);
                }
                return this.close_field();
            } else {
                this.container.removeClass('chzn-disabled');
                this.search_field[0].disabled = false;
                if (!this.is_multiple) {
                    return this.selected_item.bind("focus", this.activate_action);
                }
            }
        };

        Chosen.prototype.container_mousedown = function (evt) {
            var target_closelink;
            if (!this.is_disabled) {
                target_closelink = evt != null ? ($(evt.target)).hasClass("search-choice-close") : false;
                if (evt && evt.type === "mousedown" && !this.results_showing) {
                    evt.stopPropagation();
                }
                if (!this.pending_destroy_click && !target_closelink) {
                    if (!this.active_field) {
                        if (this.is_multiple) this.search_field.val("");
                        $(document).click(this.click_test_action);
                        this.results_show();
                    } else if (!this.is_multiple && evt && (($(evt.target)[0] === this.selected_item[0]) || $(evt.target).parents("a.chzn-single").length)) {
                        evt.preventDefault();
                        this.results_toggle();
                    }
                    return this.activate_field();
                } else {
                    return this.pending_destroy_click = false;
                }
            }
        };

        Chosen.prototype.container_mouseup = function (evt) {
            if (evt.target.nodeName === "ABBR" && !this.is_disabled) {
                return this.results_reset(evt);
            }
        };

        Chosen.prototype.blur_test = function (evt) {
            if (!this.active_field && this.container.hasClass("chzn-container-active")) {
                return this.close_field();
            }
        };

        Chosen.prototype.close_field = function () {
            $(document).unbind("click", this.click_test_action);
            if (!this.is_multiple) {
                this.selected_item.attr("tabindex", this.search_field.attr("tabindex"));
                this.search_field.attr("tabindex", -1);
            }
            this.active_field = false;
            this.results_hide();
            this.container.removeClass("chzn-container-active");
            this.winnow_results_clear();
            this.clear_backstroke();
            this.show_search_field_default();
            return this.search_field_scale();
        };

        Chosen.prototype.activate_field = function () {
            if (!this.is_multiple && !this.active_field) {
                this.search_field.attr("tabindex", this.selected_item.attr("tabindex"));
                this.selected_item.attr("tabindex", -1);
            }
            this.container.addClass("chzn-container-active");
            this.active_field = true;
            this.search_field.val(this.search_field.val());
            return this.search_field.focus();
        };

        Chosen.prototype.test_active_click = function (evt) {
            if ($(evt.target).parents('#' + this.container_id).length) {
                return this.active_field = true;
            } else {
                return this.close_field();
            }
        };

        Chosen.prototype.results_build = function () {
            var content, data, _i, _len, _ref;
            this.parsing = true;
            this.results_data = root.SelectParser.select_to_array(this.form_field);
            if (this.is_multiple && this.choices > 0) {
                this.search_choices.find("li.search-choice").remove();
                this.choices = 0;
            } else if (!this.is_multiple) {
                this.selected_item.addClass("chzn-default").find("span").text(this.default_text);
                if (this.form_field.options.length <= this.disable_search_threshold) {
                    this.container.addClass("chzn-container-single-nosearch");
                } else {
                    this.container.removeClass("chzn-container-single-nosearch");
                }
            }
            content = '';
            _ref = this.results_data;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                data = _ref[_i];
                if (data.group) {
                    content += this.result_add_group(data);
                } else if (!data.empty) {
                    content += this.result_add_option(data);
                    if (data.selected && this.is_multiple) {
                        this.choice_build(data);
                    } else if (data.selected && !this.is_multiple) {
                        this.selected_item.removeClass("chzn-default").find("span").text(data.text);
                        if (this.allow_single_deselect) this.single_deselect_control_build();
                    }
                }
            }
            this.search_field_disabled();
            this.show_search_field_default();
            this.search_field_scale();
            this.search_results.html(content);
            return this.parsing = false;
        };

        Chosen.prototype.result_add_group = function (group) {
            if (!group.disabled) {
                group.dom_id = this.container_id + "_g_" + group.array_index;
                return '<li id="' + group.dom_id + '" class="group-result">' + $("<div />").text(group.label).html() + '</li>';
            } else {
                return "";
            }
        };

        Chosen.prototype.result_do_highlight = function (el) {
            var high_bottom, high_top, maxHeight, visible_bottom, visible_top;
            if (el.length) {
                this.result_clear_highlight();
                this.result_highlight = el;
                this.result_highlight.addClass("highlighted");
                maxHeight = parseInt(this.search_results.css("maxHeight"), 10);
                visible_top = this.search_results.scrollTop();
                visible_bottom = maxHeight + visible_top;
                high_top = this.result_highlight.position().top + this.search_results.scrollTop();
                high_bottom = high_top + this.result_highlight.outerHeight();
                if (high_bottom >= visible_bottom) {
                    return this.search_results.scrollTop((high_bottom - maxHeight) > 0 ? high_bottom - maxHeight : 0);
                } else if (high_top < visible_top) {
                    return this.search_results.scrollTop(high_top);
                }
            }
        };

        Chosen.prototype.result_clear_highlight = function () {
            if (this.result_highlight) this.result_highlight.removeClass("highlighted");
            return this.result_highlight = null;
        };

        Chosen.prototype.results_show = function () {
            var dd_top;
            if (!this.is_multiple) {
                this.selected_item.addClass("chzn-single-with-drop");
                if (this.result_single_selected) {
                    this.result_do_highlight(this.result_single_selected);
                }
            } else if (this.max_selected_options <= this.choices) {
                this.form_field_jq.trigger("liszt:maxselected", {
                    chosen: this
                });
                return false;
            }
            dd_top = this.is_multiple ? this.container.height() : this.container.height() - 1;
            this.form_field_jq.trigger("liszt:showing_dropdown", {
                chosen: this
            });

            this.dropdown.css({
                "top": dd_top + 1 + "px", // Add a pixel for the border
                "left": 0
            });
            this.results_showing = true;
            this.search_field.focus();
            this.search_field.val(this.search_field.val());
            return this.winnow_results();
        };

        Chosen.prototype.results_hide = function () {
            if (!this.is_multiple) {
                this.selected_item.removeClass("chzn-single-with-drop");
            }
            this.result_clear_highlight();
            this.form_field_jq.trigger("liszt:hiding_dropdown", {
                chosen: this
            });
            this.dropdown.css({
                "left": "-9000px"
            });
            return this.results_showing = false;
        };

        Chosen.prototype.set_tab_index = function (el) {
            var ti;
            if (this.form_field_jq.attr("tabindex")) {
                ti = this.form_field_jq.attr("tabindex");
                this.form_field_jq.attr("tabindex", -1);
                if (this.is_multiple) {
                    return this.search_field.attr("tabindex", ti);
                } else {
                    this.selected_item.attr("tabindex", ti);
                    return this.search_field.attr("tabindex", -1);
                }
            }
        };

        Chosen.prototype.show_search_field_default = function () {
            if (this.is_multiple && this.choices < 1 && !this.active_field) {
                this.search_field.val(this.default_text);
                return this.search_field.addClass("default");
            } else {
                this.search_field.val("");
                return this.search_field.removeClass("default");
            }
        };

        Chosen.prototype.search_results_mouseup = function (evt) {
            var target;
            target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
            if (target.length) {
                this.result_highlight = target;
                return this.result_select(evt);
            }
        };

        Chosen.prototype.search_results_mouseover = function (evt) {
            var target;
            target = $(evt.target).hasClass("active-result") ? $(evt.target) : $(evt.target).parents(".active-result").first();
            if (target) return this.result_do_highlight(target);
        };

        Chosen.prototype.search_results_mouseout = function (evt) {
            if ($(evt.target).hasClass("active-result" || $(evt.target).parents('.active-result').first())) {
                return this.result_clear_highlight();
            }
        };

        Chosen.prototype.choices_click = function (evt) {
            evt.preventDefault();
            if (this.active_field && !($(evt.target).hasClass("search-choice" || $(evt.target).parents('.search-choice').first)) && !this.results_showing) {
                return this.results_show();
            }
        };

        Chosen.prototype.choice_build = function (item) {
            var choice_id, link,
        _this = this;
            if (this.is_multiple && this.max_selected_options <= this.choices) {
                this.form_field_jq.trigger("liszt:maxselected", {
                    chosen: this
                });
                return false;
            }
            choice_id = this.container_id + "_c_" + item.array_index;
            this.choices += 1;
            this.search_container.before('<li class="search-choice" id="' + choice_id + '"><span>' + item.html + '</span><a href="javascript:void(0)" class="search-choice-close" rel="' + item.array_index + '"></a></li>');
            link = $('#' + choice_id).find("a").first();
            return link.click(function (evt) {
                return _this.choice_destroy_link_click(evt);
            });
        };

        Chosen.prototype.choice_destroy_link_click = function (evt) {
            evt.preventDefault();
            if (!this.is_disabled) {
                this.pending_destroy_click = true;
                return this.choice_destroy($(evt.target));
            } else {
                return evt.stopPropagation;
            }
        };

        Chosen.prototype.choice_destroy = function (link) {
            this.choices -= 1;
            this.show_search_field_default();
            if (this.is_multiple && this.choices > 0 && this.search_field.val().length < 1) {
                this.results_hide();
            }
            this.result_deselect(link.attr("rel"));
            return link.parents('li').first().remove();
        };

        Chosen.prototype.results_reset = function () {
            this.form_field.options[0].selected = true;
            this.selected_item.find("span").text(this.default_text);
            if (!this.is_multiple) this.selected_item.addClass("chzn-default");
            this.show_search_field_default();
            this.results_reset_cleanup();
            this.form_field_jq.trigger("change");
            if (this.active_field) return this.results_hide();
        };

        Chosen.prototype.results_reset_cleanup = function () {
            return this.selected_item.find("abbr").remove();
        };

        Chosen.prototype.result_select = function (evt) {
            var high, high_id, item, position;
            if (this.result_highlight) {
                high = this.result_highlight;
                high_id = high.attr("id");
                this.result_clear_highlight();
                if (this.is_multiple) {
                    this.result_deactivate(high);
                } else {
                    this.search_results.find(".result-selected").removeClass("result-selected");
                    this.result_single_selected = high;
                    this.selected_item.removeClass("chzn-default");
                }
                high.addClass("result-selected");
                position = high_id.substr(high_id.lastIndexOf("_") + 1);
                item = this.results_data[position];
                item.selected = true;
                this.form_field.options[item.options_index].selected = true;
                if (this.is_multiple) {
                    this.choice_build(item);
                } else {
                    this.selected_item.find("span").first().text(item.text);
                    if (this.allow_single_deselect) this.single_deselect_control_build();
                }
                if (!(evt.metaKey && this.is_multiple)) this.results_hide();
                this.search_field.val("");
                if (this.is_multiple || this.form_field_jq.val() !== this.current_value) {
                    this.form_field_jq.trigger("change", {
                        'selected': this.form_field.options[item.options_index].value
                    });
                }
                this.current_value = this.form_field_jq.val();
                return this.search_field_scale();
            }
        };

        Chosen.prototype.result_activate = function (el) {
            return el.addClass("active-result");
        };

        Chosen.prototype.result_deactivate = function (el) {
            return el.removeClass("active-result");
        };

        Chosen.prototype.result_deselect = function (pos) {
            var result, result_data;
            result_data = this.results_data[pos];
            result_data.selected = false;
            this.form_field.options[result_data.options_index].selected = false;
            result = $("#" + this.container_id + "_o_" + pos);
            result.removeClass("result-selected").addClass("active-result").show();
            this.result_clear_highlight();
            this.winnow_results();
            this.form_field_jq.trigger("change", {
                deselected: this.form_field.options[result_data.options_index].value
            });
            return this.search_field_scale();
        };

        Chosen.prototype.single_deselect_control_build = function () {
            if (this.allow_single_deselect && this.selected_item.find("abbr").length < 1) {
                return this.selected_item.find("span").first().after("<abbr class=\"search-choice-close\"></abbr>");
            }
        };

        Chosen.prototype.winnow_results = function () {
            var found, option, part, parts, regex, regexAnchor, result, result_id, results, searchText, startpos, text, zregex, _i, _j, _len, _len2, _ref;
            this.no_results_clear();
            results = 0;
            searchText = this.search_field.val() === this.default_text ? "" : $('<div/>').text($.trim(this.search_field.val())).html();
            regexAnchor = this.search_contains ? "" : "^";
            regex = new RegExp(regexAnchor + searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
            zregex = new RegExp(searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'i');
            _ref = this.results_data;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                option = _ref[_i];
                if (!option.disabled && !option.empty) {
                    if (option.group) {
                        $('#' + option.dom_id).css('display', 'none');
                    } else if (!(this.is_multiple && option.selected)) {
                        found = false;
                        result_id = option.dom_id;
                        result = $("#" + result_id);
                        if (regex.test(option.html)) {
                            found = true;
                            results += 1;
                        } else if (option.html.indexOf(" ") >= 0 || option.html.indexOf("[") === 0) {
                            parts = option.html.replace(/\[|\]/g, "").split(" ");
                            if (parts.length) {
                                for (_j = 0, _len2 = parts.length; _j < _len2; _j++) {
                                    part = parts[_j];
                                    if (regex.test(part)) {
                                        found = true;
                                        results += 1;
                                    }
                                }
                            }
                        }
                        if (found) {
                            if (searchText.length) {
                                startpos = option.html.search(zregex);
                                text = option.html.substr(0, startpos + searchText.length) + '</em>' + option.html.substr(startpos + searchText.length);
                                text = text.substr(0, startpos) + '<em>' + text.substr(startpos);
                            } else {
                                text = option.html;
                            }
                            result.html(text);
                            this.result_activate(result);
                            if (option.group_array_index != null) {
                                $("#" + this.results_data[option.group_array_index].dom_id).css('display', 'list-item');
                            }
                        } else {
                            if (this.result_highlight && result_id === this.result_highlight.attr('id')) {
                                this.result_clear_highlight();
                            }
                            this.result_deactivate(result);
                        }
                    }
                }
            }
            if (results < 1 && searchText.length) {
                return this.no_results(searchText);
            } else {
                return this.winnow_results_set_highlight();
            }
        };

        Chosen.prototype.winnow_results_clear = function () {
            var li, lis, _i, _len, _results;
            this.search_field.val("");
            lis = this.search_results.find("li");
            _results = [];
            for (_i = 0, _len = lis.length; _i < _len; _i++) {
                li = lis[_i];
                li = $(li);
                if (li.hasClass("group-result")) {
                    _results.push(li.css('display', 'auto'));
                } else if (!this.is_multiple || !li.hasClass("result-selected")) {
                    _results.push(this.result_activate(li));
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };

        Chosen.prototype.winnow_results_set_highlight = function () {
            var do_high, selected_results;
            if (!this.result_highlight) {
                selected_results = !this.is_multiple ? this.search_results.find(".result-selected.active-result") : [];
                do_high = selected_results.length ? selected_results.first() : this.search_results.find(".active-result").first();
                if (do_high != null) return this.result_do_highlight(do_high);
            }
        };

        Chosen.prototype.no_results = function (terms) {
            var no_results_html;
            no_results_html = $('<li class="no-results">' + this.results_none_found + ' "<span></span>"</li>');
            no_results_html.find("span").first().html(terms);
            return this.search_results.append(no_results_html);
        };

        Chosen.prototype.no_results_clear = function () {
            return this.search_results.find(".no-results").remove();
        };

        Chosen.prototype.keydown_arrow = function () {
            var first_active, next_sib;
            if (!this.result_highlight) {
                first_active = this.search_results.find("li.active-result").first();
                if (first_active) this.result_do_highlight($(first_active));
            } else if (this.results_showing) {
                next_sib = this.result_highlight.nextAll("li.active-result").first();
                if (next_sib) this.result_do_highlight(next_sib);
            }
            if (!this.results_showing) return this.results_show();
        };

        Chosen.prototype.keyup_arrow = function () {
            var prev_sibs;
            if (!this.results_showing && !this.is_multiple) {
                return this.results_show();
            } else if (this.result_highlight) {
                prev_sibs = this.result_highlight.prevAll("li.active-result");
                if (prev_sibs.length) {
                    return this.result_do_highlight(prev_sibs.first());
                } else {
                    if (this.choices > 0) this.results_hide();
                    return this.result_clear_highlight();
                }
            }
        };

        Chosen.prototype.keydown_backstroke = function () {
            if (this.pending_backstroke) {
                this.choice_destroy(this.pending_backstroke.find("a").first());
                return this.clear_backstroke();
            } else {
                this.pending_backstroke = this.search_container.siblings("li.search-choice").last();
                if (this.single_backstroke_delete) {
                    return this.keydown_backstroke();
                } else {
                    return this.pending_backstroke.addClass("search-choice-focus");
                }
            }
        };

        Chosen.prototype.clear_backstroke = function () {
            if (this.pending_backstroke) {
                this.pending_backstroke.removeClass("search-choice-focus");
            }
            return this.pending_backstroke = null;
        };

        Chosen.prototype.keydown_checker = function (evt) {
            var stroke, _ref;
            stroke = (_ref = evt.which) != null ? _ref : evt.keyCode;
            this.search_field_scale();
            if (stroke !== 8 && this.pending_backstroke) this.clear_backstroke();
            switch (stroke) {
                case 8:
                    this.backstroke_length = this.search_field.val().length;
                    break;
                case 9:
                    if (this.results_showing && !this.is_multiple) this.result_select(evt);
                    this.mouse_on_container = false;
                    break;
                case 13:
                    evt.preventDefault();
                    break;
                case 38:
                    evt.preventDefault();
                    this.keyup_arrow();
                    break;
                case 40:
                    this.keydown_arrow();
                    break;
            }
        };

        Chosen.prototype.search_field_scale = function () {
            var dd_top, div, h, style, style_block, styles, w, _i, _len;
            if (this.is_multiple) {
                h = 0;
                w = 0;
                style_block = "position:absolute; left: -1000px; top: -1000px; display:none;";
                styles = ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height', 'text-transform', 'letter-spacing'];
                for (_i = 0, _len = styles.length; _i < _len; _i++) {
                    style = styles[_i];
                    style_block += style + ":" + this.search_field.css(style) + ";";
                }
                div = $('<div />', {
                    'style': style_block
                });
                div.text(this.search_field.val());
                $('body').append(div);
                w = div.width() + 25;
                div.remove();
                if (w > this.f_width - 10) w = this.f_width - 10;
                this.search_field.css({
                    'width': w + 'px'
                });
                dd_top = this.container.height();
                return this.dropdown.css({
                    "top": dd_top + "px"
                });
            }
        };

        Chosen.prototype.generate_random_id = function () {
            var string;
            string = "sel" + this.generate_random_char() + this.generate_random_char() + this.generate_random_char();
            while ($("#" + string).length > 0) {
                string += this.generate_random_char();
            }
            return string;
        };

        return Chosen;

    })(AbstractChosen);

    get_side_border_padding = function (elmt) {
        var side_border_padding;
        return side_border_padding = elmt.outerWidth() - elmt.width();
    };

    root.get_side_border_padding = get_side_border_padding;

}).call(this);


/* ============================================================================================

@name       jquery.colorbox
@depends    jquery
@link       https://github.com/jackmoore/colorbox

============================================================================================= */

// ColorBox v1.3.19.3 - jQuery lightbox plugin
// (c) 2011 Jack Moore - jacklmoore.com
// License: http://www.opensource.org/licenses/mit-license.php
(function ($, document, window) {
    var 
    // Default settings object. 
    // See http://jacklmoore.com/colorbox for details.
    defaults = {
        transition: "elastic",
        speed: 300,
        width: false,
        initialWidth: "600",
        innerWidth: false,
        maxWidth: false,
        height: false,
        initialHeight: "450",
        innerHeight: false,
        maxHeight: false,
        scalePhotos: true,
        scrolling: true,
        inline: false,
        html: false,
        iframe: false,
        fastIframe: true,
        photo: false,
        href: false,
        title: false,
        rel: false,
        opacity: 0.9,
        preloading: true,

        current: "image {current} of {total}",
        previous: "previous",
        next: "next",
        close: "close",
        xhrError: "This content failed to load.",
        imgError: "This image failed to load.",

        open: false,
        returnFocus: true,
        reposition: true,
        loop: true,
        slideshow: false,
        slideshowAuto: true,
        slideshowSpeed: 2500,
        slideshowStart: "start slideshow",
        slideshowStop: "stop slideshow",
        onOpen: false,
        onLoad: false,
        onComplete: false,
        onCleanup: false,
        onClosed: false,
        overlayClose: true,
        escKey: true,
        arrowKey: true,
        top: false,
        bottom: false,
        left: false,
        right: false,
        fixed: false,
        data: undefined
    },

    // Abstracting the HTML and event identifiers for easy rebranding
    colorbox = 'colorbox',
    prefix = 'cbox',
    boxElement = prefix + 'Element',

    // Events   
    event_open = prefix + '_open',
    event_load = prefix + '_load',
    event_complete = prefix + '_complete',
    event_cleanup = prefix + '_cleanup',
    event_closed = prefix + '_closed',
    event_purge = prefix + '_purge',

    // Special Handling for IE
    isIE = !$.support.opacity && !$.support.style, // IE7 & IE8
    isIE6 = isIE && !window.XMLHttpRequest, // IE6
    event_ie6 = prefix + '_IE6',

    // Cached jQuery Object Variables
    $overlay,
    $box,
    $wrap,
    $content,
    $topBorder,
    $leftBorder,
    $rightBorder,
    $bottomBorder,
    $related,
    $window,
    $loaded,
    $loadingBay,
    $loadingOverlay,
    $title,
    $current,
    $slideshow,
    $next,
    $prev,
    $close,
    $groupControls,

    // Variables for cached values or use across multiple functions
    settings,
    interfaceHeight,
    interfaceWidth,
    loadedHeight,
    loadedWidth,
    element,
    index,
    photo,
    open,
    active,
    closing,
    loadingTimer,
    publicMethod,
    div = "div",
    init;

    // ****************
    // HELPER FUNCTIONS
    // ****************

    // Convience function for creating new jQuery objects
    function $tag(tag, id, css) {
        var element = document.createElement(tag);

        if (id) {
            element.id = prefix + id;
        }

        if (css) {
            element.style.cssText = css;
        }

        return $(element);
    }

    // Determine the next and previous members in a group.
    function getIndex(increment) {
        var 
        max = $related.length,
        newIndex = (index + increment) % max;

        return (newIndex < 0) ? max + newIndex : newIndex;
    }

    // Convert '%' and 'px' values to integers
    function setSize(size, dimension) {
        return Math.round((/%/.test(size) ? ((dimension === 'x' ? $window.width() : $window.height()) / 100) : 1) * parseInt(size, 10));
    }

    // Checks an href to see if it is a photo.
    // There is a force photo option (photo: true) for hrefs that cannot be matched by this regex.
    function isImage(url) {
        return settings.photo || /\.(gif|png|jpe?g|bmp|ico)((#|\?).*)?$/i.test(url);
    }

    // Assigns function results to their respective properties
    function makeSettings() {
        var i,
            data = $.data(element, colorbox);

        if (data == null) {
            settings = $.extend({}, defaults);
            if (console && console.log) {
                console.log('Error: cboxElement missing settings object')
            }
        } else {
            settings = $.extend({}, data);
        }

        for (i in settings) {
            if ($.isFunction(settings[i]) && i.slice(0, 2) !== 'on') { // checks to make sure the function isn't one of the callbacks, they will be handled at the appropriate time.
                settings[i] = settings[i].call(element);
            }
        }

        settings.rel = settings.rel || element.rel || 'nofollow';
        settings.href = settings.href || $(element).attr('href');
        settings.title = settings.title || element.title;

        if (typeof settings.href === "string") {
            settings.href = $.trim(settings.href);
        }
    }

    function trigger(event, callback) {
        $.event.trigger(event);
        if (callback) {
            callback.call(element);
        }
    }

    // Slideshow functionality
    function slideshow() {
        var 
        timeOut,
        className = prefix + "Slideshow_",
        click = "click." + prefix,
        start,
        stop,
        clear;

        if (settings.slideshow && $related[1]) {
            start = function () {
                $slideshow
                    .text(settings.slideshowStop)
                    .unbind(click)
                    .bind(event_complete, function () {
                        if (settings.loop || $related[index + 1]) {
                            timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
                        }
                    })
                    .bind(event_load, function () {
                        clearTimeout(timeOut);
                    })
                    .one(click + ' ' + event_cleanup, stop);
                $box.removeClass(className + "off").addClass(className + "on");
                timeOut = setTimeout(publicMethod.next, settings.slideshowSpeed);
            };

            stop = function () {
                clearTimeout(timeOut);
                $slideshow
                    .text(settings.slideshowStart)
                    .unbind([event_complete, event_load, event_cleanup, click].join(' '))
                    .one(click, function () {
                        publicMethod.next();
                        start();
                    });
                $box.removeClass(className + "on").addClass(className + "off");
            };

            if (settings.slideshowAuto) {
                start();
            } else {
                stop();
            }
        } else {
            $box.removeClass(className + "off " + className + "on");
        }
    }

    function launch(target) {
        if (!closing) {

            element = target;

            makeSettings();

            $related = $(element);

            index = 0;

            if (settings.rel !== 'nofollow') {
                $related = $('.' + boxElement).filter(function () {
                    var data = $.data(this, colorbox),
                        relRelated;

                    if (data) {
                        relRelated = data.rel || this.rel;
                    }

                    return (relRelated === settings.rel);
                });
                index = $related.index(element);

                // Check direct calls to ColorBox.
                if (index === -1) {
                    $related = $related.add(element);
                    index = $related.length - 1;
                }
            }

            if (!open) {
                open = active = true; // Prevents the page-change action from queuing up if the visitor holds down the left or right keys.

                $box.show();

                if (settings.returnFocus) {
                    $(element).blur().one(event_closed, function () {
                        $(this).focus();
                    });
                }

                // +settings.opacity avoids a problem in IE when using non-zero-prefixed-string-values, like '.5'
                $overlay.css({ "opacity": +settings.opacity, "cursor": settings.overlayClose ? "pointer" : "auto" }).show();

                // Opens inital empty ColorBox prior to content being loaded.
                settings.w = setSize(settings.initialWidth, 'x');
                settings.h = setSize(settings.initialHeight, 'y');
                publicMethod.position();

                if (isIE6) {
                    $window.bind('resize.' + event_ie6 + ' scroll.' + event_ie6, function () {
                        $overlay.css({ width: $window.width(), height: $window.height(), top: $window.scrollTop(), left: $window.scrollLeft() });
                    }).trigger('resize.' + event_ie6);
                }

                trigger(event_open, settings.onOpen);

                $groupControls.add($title).hide();

                $close.html(settings.close).show();
            }

            publicMethod.load(true);
        }
    }

    // ColorBox's markup needs to be added to the DOM prior to being called
    // so that the browser will go ahead and load the CSS background images.
    function appendHTML() {
        if (!$box && document.body) {
            init = false;

            $window = $(window);
            $box = $tag(div).attr({ id: colorbox, 'class': isIE ? prefix + (isIE6 ? 'IE6' : 'IE') : '' }).hide();
            $overlay = $tag(div, "Overlay", isIE6 ? 'position:absolute' : '').hide();
            $wrap = $tag(div, "Wrapper");
            $content = $tag(div, "Content").append(
                $loaded = $tag(div, "LoadedContent", 'width:0; height:0; overflow:hidden'),
                $loadingOverlay = $tag(div, "LoadingOverlay").add($tag(div, "LoadingGraphic")),
                $title = $tag(div, "Title"),
                $current = $tag(div, "Current"),
                $next = $tag(div, "Next"),
                $prev = $tag(div, "Previous"),
                $slideshow = $tag(div, "Slideshow").bind(event_open, slideshow),
                $close = $tag(div, "Close")
            );

            $wrap.append( // The 3x3 Grid that makes up ColorBox
                $tag(div).append(
                    $tag(div, "TopLeft"),
                    $topBorder = $tag(div, "TopCenter"),
                    $tag(div, "TopRight")
                ),
                $tag(div, false, 'clear:left').append(
                    $leftBorder = $tag(div, "MiddleLeft"),
                    $content,
                    $rightBorder = $tag(div, "MiddleRight")
                ),
                $tag(div, false, 'clear:left').append(
                    $tag(div, "BottomLeft"),
                    $bottomBorder = $tag(div, "BottomCenter"),
                    $tag(div, "BottomRight")
                )
            ).find('div div').css({ 'float': 'left' });

            $loadingBay = $tag(div, false, 'position:absolute; width:9999px; visibility:hidden; display:none');

            $groupControls = $next.add($prev).add($current).add($slideshow);

            $(document.body).append($overlay, $box.append($wrap, $loadingBay));
        }
    }

    // Add ColorBox's event bindings
    function addBindings() {
        if ($box) {
            if (!init) {
                init = true;

                // Cache values needed for size calculations
                interfaceHeight = $topBorder.height() + $bottomBorder.height() + $content.outerHeight(true) - $content.height(); //Subtraction needed for IE6
                interfaceWidth = $leftBorder.width() + $rightBorder.width() + $content.outerWidth(true) - $content.width();
                loadedHeight = $loaded.outerHeight(true);
                loadedWidth = $loaded.outerWidth(true);

                // Setting padding to remove the need to do size conversions during the animation step.
                $box.css({ "padding-bottom": interfaceHeight, "padding-right": interfaceWidth });

                // Anonymous functions here keep the public method from being cached, thereby allowing them to be redefined on the fly.
                $next.click(function () {
                    publicMethod.next();
                });
                $prev.click(function () {
                    publicMethod.prev();
                });
                $close.click(function () {
                    publicMethod.close();
                });
                $overlay.click(function () {
                    if (settings.overlayClose) {
                        publicMethod.close();
                    }
                });

                // Key Bindings
                $(document).bind('keydown.' + prefix, function (e) {
                    var key = e.keyCode;
                    if (open && settings.escKey && key === 27) {
                        e.preventDefault();
                        publicMethod.close();
                    }
                    if (open && settings.arrowKey && $related[1]) {
                        if (key === 37) {
                            e.preventDefault();
                            $prev.click();
                        } else if (key === 39) {
                            e.preventDefault();
                            $next.click();
                        }
                    }
                });

                try {

                    $(document).on('click', '.' + boxElement, function (e) {
                        // ignore non-left-mouse-clicks and clicks modified with ctrl / command, shift, or alt.
                        // See: http://jacklmoore.com/notes/click-events/
                        if (!(e.which > 1 || e.shiftKey || e.altKey || e.metaKey)) {
                            e.preventDefault();
                            launch(this);
                        }
                    });


                } catch (e) {

                }


            }
            return true;
        }
        return false;
    }

    // Don't do anything if ColorBox already exists.
    if ($.colorbox) {
        return;
    }

    // Append the HTML when the DOM loads
    $(appendHTML);


    // ****************
    // PUBLIC FUNCTIONS
    // Usage format: $.fn.colorbox.close();
    // Usage from within an iframe: parent.$.fn.colorbox.close();
    // ****************

    publicMethod = $.fn[colorbox] = $[colorbox] = function (options, callback) {
        var $this = this;

        options = options || {};

        appendHTML();

        if (addBindings()) {
            if (!$this[0]) {
                if ($this.selector) { // if a selector was given and it didn't match any elements, go ahead and exit.
                    return $this;
                }
                // if no selector was given (ie. $.colorbox()), create a temporary element to work with
                $this = $('<a/>');
                options.open = true; // assume an immediate open
            }

            if (callback) {
                options.onComplete = callback;
            }

            $this.each(function () {
                $.data(this, colorbox, $.extend({}, $.data(this, colorbox) || defaults, options));
            }).addClass(boxElement);

            if (($.isFunction(options.open) && options.open.call($this)) || options.open) {
                launch($this[0]);
            }
        }

        return $this;
    };

    publicMethod.position = function (speed, loadedCallback) {
        var 
        top = 0,
        left = 0,
        offset = $box.offset(),
        scrollTop,
        scrollLeft;

        $window.unbind('resize.' + prefix);

        // remove the modal so that it doesn't influence the document width/height        
        $box.css({ top: -9e4, left: -9e4 });

        scrollTop = $window.scrollTop();
        scrollLeft = $window.scrollLeft();

        if (settings.fixed && !isIE6) {
            offset.top -= scrollTop;
            offset.left -= scrollLeft;
            $box.css({ position: 'fixed' });
        } else {
            top = scrollTop;
            left = scrollLeft;
            $box.css({ position: 'absolute' });
        }

        // keeps the top and left positions within the browser's viewport.
        if (settings.right !== false) {
            left += Math.max($window.width() - settings.w - loadedWidth - interfaceWidth - setSize(settings.right, 'x'), 0);
        } else if (settings.left !== false) {
            left += setSize(settings.left, 'x');
        } else {
            left += Math.round(Math.max($window.width() - settings.w - loadedWidth - interfaceWidth, 0) / 2);
        }

        if (settings.bottom !== false) {
            top += Math.max($window.height() - settings.h - loadedHeight - interfaceHeight - setSize(settings.bottom, 'y'), 0);
        } else if (settings.top !== false) {
            top += setSize(settings.top, 'y');
        } else {
            top += Math.round(Math.max($window.height() - settings.h - loadedHeight - interfaceHeight, 0) / 2);
        }

        $box.css({ top: offset.top, left: offset.left });

        // setting the speed to 0 to reduce the delay between same-sized content.
        speed = ($box.width() === settings.w + loadedWidth && $box.height() === settings.h + loadedHeight) ? 0 : speed || 0;

        // this gives the wrapper plenty of breathing room so it's floated contents can move around smoothly,
        // but it has to be shrank down around the size of div#colorbox when it's done.  If not,
        // it can invoke an obscure IE bug when using iframes.
        $wrap[0].style.width = $wrap[0].style.height = "9999px";

        function modalDimensions(that) {
            $topBorder[0].style.width = $bottomBorder[0].style.width = $content[0].style.width = that.style.width;
            $content[0].style.height = $leftBorder[0].style.height = $rightBorder[0].style.height = that.style.height;
        }

        $box.dequeue().animate({ width: settings.w + loadedWidth, height: settings.h + loadedHeight, top: top, left: left }, {
            duration: speed,
            complete: function () {
                modalDimensions(this);

                active = false;

                // shrink the wrapper down to exactly the size of colorbox to avoid a bug in IE's iframe implementation.
                $wrap[0].style.width = (settings.w + loadedWidth + interfaceWidth) + "px";
                $wrap[0].style.height = (settings.h + loadedHeight + interfaceHeight) + "px";

                if (settings.reposition) {
                    setTimeout(function () {  // small delay before binding onresize due to an IE8 bug.
                        $window.bind('resize.' + prefix, publicMethod.position);
                    }, 1);
                }

                if (loadedCallback) {
                    loadedCallback();
                }
            },
            step: function () {
                modalDimensions(this);
            }
        });
    };

    publicMethod.resize = function (options) {
        if (open) {
            options = options || {};

            if (options.width) {
                settings.w = setSize(options.width, 'x') - loadedWidth - interfaceWidth;
            }
            if (options.innerWidth) {
                settings.w = setSize(options.innerWidth, 'x');
            }
            $loaded.css({ width: settings.w });

            if (options.height) {
                settings.h = setSize(options.height, 'y') - loadedHeight - interfaceHeight;
            }
            if (options.innerHeight) {
                settings.h = setSize(options.innerHeight, 'y');
            }
            if (!options.innerHeight && !options.height) {
                $loaded.css({ height: "auto" });
                settings.h = $loaded.height();
            }
            $loaded.css({ height: settings.h });

            publicMethod.position(settings.transition === "none" ? 0 : settings.speed);
        }
    };

    publicMethod.prep = function (object) {
        if (!open) {
            return;
        }

        var callback, speed = settings.transition === "none" ? 0 : settings.speed;

        $loaded.remove();
        $loaded = $tag(div, 'LoadedContent').append(object);

        function getWidth() {
            settings.w = settings.w || $loaded.width();
            settings.w = settings.mw && settings.mw < settings.w ? settings.mw : settings.w;
            return settings.w;
        }
        function getHeight() {
            settings.h = settings.h || $loaded.height();
            settings.h = settings.mh && settings.mh < settings.h ? settings.mh : settings.h;
            return settings.h;
        }

        $loaded.hide()
        .appendTo($loadingBay.show())// content has to be appended to the DOM for accurate size calculations.
        .css({ width: getWidth(), overflow: settings.scrolling ? 'auto' : 'hidden' })
        .css({ height: getHeight() })// sets the height independently from the width in case the new width influences the value of height.
        .prependTo($content);

        $loadingBay.hide();

        // floating the IMG removes the bottom line-height and fixed a problem where IE miscalculates the width of the parent element as 100% of the document width.
        //$(photo).css({'float': 'none', marginLeft: 'auto', marginRight: 'auto'});

        $(photo).css({ 'float': 'none' });

        // Hides SELECT elements in IE6 because they would otherwise sit on top of the overlay.
        if (isIE6) {
            $('select').not($box.find('select')).filter(function () {
                return this.style.visibility !== 'hidden';
            }).css({ 'visibility': 'hidden' }).one(event_cleanup, function () {
                this.style.visibility = 'inherit';
            });
        }

        callback = function () {
            var preload,
                i,
                total = $related.length,
                iframe,
                frameBorder = 'frameBorder',
                allowTransparency = 'allowTransparency',
                complete,
                src,
                img,
                data;

            if (!open) {
                return;
            }

            function removeFilter() {
                //if (isIE) {
                //    $box[0].style.removeAttr('filter');
                //}
            }

            complete = function () {
                clearTimeout(loadingTimer);
                $loadingOverlay.hide();
                trigger(event_complete, settings.onComplete);
            };

            if (isIE) {
                //This fadeIn helps the bicubic resampling to kick-in.
                if (photo) {
                    $loaded.fadeIn(100);
                }
            }

            $title.html(settings.title).add($loaded).show();

            if (total > 1) { // handle grouping
                if (typeof settings.current === "string") {
                    $current.html(settings.current.replace('{current}', index + 1).replace('{total}', total)).show();
                }

                $next[(settings.loop || index < total - 1) ? "show" : "hide"]().html(settings.next);
                $prev[(settings.loop || index) ? "show" : "hide"]().html(settings.previous);

                if (settings.slideshow) {
                    $slideshow.show();
                }

                // Preloads images within a rel group
                if (settings.preloading) {
                    preload = [
                        getIndex(-1),
                        getIndex(1)
                    ];
                    while (i = $related[preload.pop()]) {
                        data = $.data(i, colorbox);

                        if (data && data.href) {
                            src = data.href;
                            if ($.isFunction(src)) {
                                src = src.call(i);
                            }
                        } else {
                            src = i.href;
                        }

                        if (isImage(src)) {
                            img = new Image();
                            img.src = src;
                        }
                    }
                }
            } else {
                $groupControls.hide();
            }

            if (settings.iframe) {
                iframe = $tag('iframe')[0];

                if (frameBorder in iframe) {
                    iframe[frameBorder] = 0;
                }
                if (allowTransparency in iframe) {
                    iframe[allowTransparency] = "true";
                }
                // give the iframe a unique name to prevent caching
                iframe.name = prefix + (+new Date());
                if (settings.fastIframe) {
                    complete();
                } else {
                    $(iframe).one('load', complete);
                }
                iframe.src = settings.href;
                if (!settings.scrolling) {
                    iframe.scrolling = "no";
                }
                $(iframe).addClass(prefix + 'Iframe').appendTo($loaded).one(event_purge, function () {
                    iframe.src = "//about:blank";
                });
            } else {
                complete();
            }

            if (settings.transition === 'fade') {
                $box.fadeTo(speed, 1, removeFilter);
            } else {
                removeFilter();
            }
        };

        if (settings.transition === 'fade') {
            $box.fadeTo(speed, 0, function () {
                publicMethod.position(0, callback);
            });
        } else {
            publicMethod.position(speed, callback);
        }
    };

    publicMethod.load = function (launched) {
        var href, setResize, prep = publicMethod.prep;

        active = true;

        photo = false;

        element = $related[index];

        if (!launched) {
            makeSettings();
        }

        trigger(event_purge);

        trigger(event_load, settings.onLoad);

        settings.h = settings.height ?
                setSize(settings.height, 'y') - loadedHeight - interfaceHeight :
                settings.innerHeight && setSize(settings.innerHeight, 'y');

        settings.w = settings.width ?
                setSize(settings.width, 'x') - loadedWidth - interfaceWidth :
                settings.innerWidth && setSize(settings.innerWidth, 'x');

        // Sets the minimum dimensions for use in image scaling
        settings.mw = settings.w;
        settings.mh = settings.h;

        // Re-evaluate the minimum width and height based on maxWidth and maxHeight values.
        // If the width or height exceed the maxWidth or maxHeight, use the maximum values instead.
        if (settings.maxWidth) {
            settings.mw = setSize(settings.maxWidth, 'x') - loadedWidth - interfaceWidth;
            settings.mw = settings.w && settings.w < settings.mw ? settings.w : settings.mw;
        }
        if (settings.maxHeight) {
            settings.mh = setSize(settings.maxHeight, 'y') - loadedHeight - interfaceHeight;
            settings.mh = settings.h && settings.h < settings.mh ? settings.h : settings.mh;
        }

        href = settings.href;

        loadingTimer = setTimeout(function () {
            $loadingOverlay.show();
        }, 100);

        if (settings.inline) {
            // Inserts an empty placeholder where inline content is being pulled from.
            // An event is bound to put inline content back when ColorBox closes or loads new content.
            $tag(div).hide().insertBefore($(href)[0]).one(event_purge, function () {
                $(this).replaceWith($loaded.children());
            });
            prep($(href));
        } else if (settings.iframe) {
            // IFrame element won't be added to the DOM until it is ready to be displayed,
            // to avoid problems with DOM-ready JS that might be trying to run in that iframe.
            prep(" ");
        } else if (settings.html) {
            prep(settings.html);
        } else if (isImage(href)) {
            $(photo = new Image())
            .addClass(prefix + 'Photo')
            .error(function () {
                settings.title = false;
                prep($tag(div, 'Error').html(settings.imgError));
            })
            .load(function () {
                var percent;
                photo.onload = null; //stops animated gifs from firing the onload repeatedly.

                if (settings.scalePhotos) {
                    setResize = function () {
                        photo.height -= photo.height * percent;
                        photo.width -= photo.width * percent;
                    };
                    if (settings.mw && photo.width > settings.mw) {
                        percent = (photo.width - settings.mw) / photo.width;
                        setResize();
                    }
                    if (settings.mh && photo.height > settings.mh) {
                        percent = (photo.height - settings.mh) / photo.height;
                        setResize();
                    }
                }

                if (settings.h) {
                    photo.style.marginTop = Math.max(settings.h - photo.height, 0) / 2 + 'px';
                }

                if ($related[1] && (settings.loop || $related[index + 1])) {
                    photo.style.cursor = 'pointer';
                    photo.onclick = function () {
                        publicMethod.next();
                    };
                }

                if (isIE) {
                    photo.style.msInterpolationMode = 'bicubic';
                }

                setTimeout(function () { // A pause because Chrome will sometimes report a 0 by 0 size otherwise.
                    prep(photo);
                }, 1);
            });

            setTimeout(function () { // A pause because Opera 10.6+ will sometimes not run the onload function otherwise.
                photo.src = href;
            }, 1);
        } else if (href) {
            $loadingBay.load(href, settings.data, function (data, status, xhr) {
                prep(status === 'error' ? $tag(div, 'Error').html(settings.xhrError) : $(this).contents());
            });
        }
    };

    // Navigates to the next page/image in a set.
    publicMethod.next = function () {
        if (!active && $related[1] && (settings.loop || $related[index + 1])) {
            index = getIndex(1);
            publicMethod.load();
        }
    };

    publicMethod.prev = function () {
        if (!active && $related[1] && (settings.loop || index)) {
            index = getIndex(-1);
            publicMethod.load();
        }
    };

    // Note: to use this within an iframe use the following format: parent.$.fn.colorbox.close();
    publicMethod.close = function () {
        if (open && !closing) {

            closing = true;

            open = false;

            trigger(event_cleanup, settings.onCleanup);

            $window.unbind('.' + prefix + ' .' + event_ie6);

            $overlay.fadeTo(200, 0);

            $box.stop().fadeTo(300, 0, function () {

                $box.add($overlay).css({ 'opacity': 1, cursor: 'auto' }).hide();

                trigger(event_purge);

                $loaded.remove();

                setTimeout(function () {
                    closing = false;
                    trigger(event_closed, settings.onClosed);
                }, 1);
            });
        }
    };

    // Removes changes ColorBox made to the document, but does not remove the plugin
    // from jQuery.
    publicMethod.remove = function () {
        $([]).add($box).add($overlay).remove();
        $box = null;
        $('.' + boxElement)
            .removeData(colorbox)
            .removeClass(boxElement)
            .die();
    };

    // A method for fetching the current element ColorBox is referencing.
    // returns a jQuery object.
    publicMethod.element = function () {
        return $(element);
    };

    publicMethod.settings = defaults;

} (jQuery, document, this));


/* ============================================================================================

@name       jquery.liveFilter
@depends    jquery

============================================================================================= */

(function ($) {
    $.fn.liveFilter = function (inputEl, filterEl, options) {
        var defaults = {
            filterChildSelector: null,
            before: function () { },
            after: function () { }
        };
        var options = $.extend(defaults, options);

        var el = $(this).find(filterEl);
        if (options.filterChildSelector) el = el.find(options.filterChildSelector);

        $(inputEl).keyup(function () {
            var val = $(this).val();
            var contains = el.filter(':inContains("' + val + '")');
            var containsNot = el.filter(':not(:inContains("' + val + '"))');
            if (options.filterChildSelector) {
                contains = contains.parents(filterEl);
                containsNot = containsNot.parents(filterEl).hide();
            }

            options.before.call(this, contains, containsNot);

            contains.show();
            containsNot.hide();

            options.after.call(this, contains, containsNot);
        });

        $.extend($.expr[':'], {
            inContains: function (a, i, m) {
                return $(a).text().toUpperCase().indexOf(m[3].toUpperCase()) >= 0;
            }
        });
    }
})(jQuery);


/* ============================================================================================

@name       jquery.scrollTo
@depends    jquery
@link       https://github.com/flesler/jquery.scrollTo/

============================================================================================= */

; (function ($) {

    var $scrollTo = $.scrollTo = function (target, duration, settings) {
        $(window).scrollTo(target, duration, settings);
    };

    $scrollTo.defaults = {
        axis: 'xy',
        duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
        limit: true
    };

    // Returns the element that needs to be animated to scroll the window.
    // Kept for backwards compatibility (specially for localScroll & serialScroll)
    $scrollTo.window = function (scope) {
        return $(window)._scrollable();
    };

    // Hack, hack, hack :)
    // Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
    $.fn._scrollable = function () {
        return this.map(function () {
            var elem = this,
                isWin = !elem.nodeName || $.inArray(elem.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;

            if (!isWin)
                return elem;

            var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;

            return $.browser.safari || doc.compatMode == 'BackCompat' ?
                doc.body :
                doc.documentElement;
        });
    };

    $.fn.scrollTo = function (target, duration, settings) {
        if (typeof duration == 'object') {
            settings = duration;
            duration = 0;
        }
        if (typeof settings == 'function')
            settings = { onAfter: settings };

        if (target == 'max')
            target = 9e9;

        settings = $.extend({}, $scrollTo.defaults, settings);
        // Speed is still recognized for backwards compatibility
        duration = duration || settings.duration;
        // Make sure the settings are given right
        settings.queue = settings.queue && settings.axis.length > 1;

        if (settings.queue)
        // Let's keep the overall duration
            duration /= 2;
        settings.offset = both(settings.offset);
        settings.over = both(settings.over);

        return this._scrollable().each(function () {
            var elem = this,
                $elem = $(elem),
                targ = target, toff, attr = {},
                win = $elem.is('html,body');

            switch (typeof targ) {
                // A number will pass the regex 
                case 'number':
                case 'string':
                    if (/^([+-]=)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                        targ = both(targ);
                        // We are done
                        break;
                    }
                    // Relative selector, no break!
                    targ = $(targ, this);
                case 'object':
                    // DOMElement / jQuery
                    if (targ.is || targ.style)
                    // Get the real position of the target 
                        toff = (targ = $(targ)).offset();
            }
            $.each(settings.axis.split(''), function (i, axis) {
                var Pos = axis == 'x' ? 'Left' : 'Top',
                    pos = Pos.toLowerCase(),
                    key = 'scroll' + Pos,
                    old = elem[key],
                    max = $scrollTo.max(elem, axis);

                if (toff) {// jQuery / DOMElement
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);

                    // If it's a dom element, reduce the margin
                    if (settings.margin) {
                        attr[key] -= parseInt(targ.css('margin' + Pos)) || 0;
                        attr[key] -= parseInt(targ.css('border' + Pos + 'Width')) || 0;
                    }

                    attr[key] += settings.offset[pos] || 0;

                    if (settings.over[pos])
                    // Scroll to a fraction of its width/height
                        attr[key] += targ[axis == 'x' ? 'width' : 'height']() * settings.over[pos];
                } else {
                    var val = targ[pos];
                    // Handle percentage values
                    attr[key] = val.slice && val.slice(-1) == '%' ?
                        parseFloat(val) / 100 * max
                        : val;
                }

                // Number or 'number'
                if (settings.limit && /^\d+$/.test(attr[key]))
                // Check the limits
                    attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);

                // Queueing axes
                if (!i && settings.queue) {
                    // Don't waste time animating, if there's no need.
                    if (old != attr[key])
                    // Intermediate animation
                        animate(settings.onAfterFirst);
                    // Don't animate this axis again in the next iteration.
                    delete attr[key];
                }
            });

            animate(settings.onAfter);

            function animate(callback) {
                $elem.animate(attr, duration, settings.easing, callback && function () {
                    callback.call(this, target, settings);
                });
            };

        }).end();
    };

    // Max scrolling position, works on quirks mode
    // It only fails (not too badly) on IE, quirks mode.
    $scrollTo.max = function (elem, axis) {
        var Dim = axis == 'x' ? 'Width' : 'Height',
            scroll = 'scroll' + Dim;

        if (!$(elem).is('html,body'))
            return elem[scroll] - $(elem)[Dim.toLowerCase()]();

        var size = 'client' + Dim,
            html = elem.ownerDocument.documentElement,
            body = elem.ownerDocument.body;

        return Math.max(html[scroll], body[scroll])
             - Math.min(html[size], body[size]);
    };

    function both(val) {
        return typeof val == 'object' ? val : { top: val, left: val };
    };

})(jQuery);


/**
* jQuery.LocalScroll
* Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
* Dual licensed under MIT and GPL.
* Date: 3/11/2009
*
* @projectDescription Animated scrolling navigation, using anchors.
* http://flesler.blogspot.com/2007/10/jquerylocalscroll-10.html
* @author Ariel Flesler
* @version 1.2.7
*
* @id jQuery.fn.localScroll
* @param {Object} settings Hash of settings, it is passed in to jQuery.ScrollTo, none is required.
* @return {jQuery} Returns the same jQuery object, for chaining.
*
* @example $('ul.links').localScroll();
*
* @example $('ul.links').localScroll({ filter:'.animated', duration:400, axis:'x' });
*
* @example $.localScroll({ target:'#pane', axis:'xy', queue:true, event:'mouseover' });
*
* Notes:
*  - The plugin requires jQuery.ScrollTo.
*  - The hash of settings, is passed to jQuery.ScrollTo, so the settings are valid for that plugin as well.
*  - jQuery.localScroll can be used if the desired links, are all over the document, it accepts the same settings.
*  - If the setting 'lazy' is set to true, then the binding will still work for later added anchors.
* - If onBefore returns false, the event is ignored.
**/
; (function ($) {
    var URI = location.href.replace(/#.*/, ''); // local url without hash

    var $localScroll = $.localScroll = function (settings) {
        $('body').localScroll(settings);
    };

    // Many of these defaults, belong to jQuery.ScrollTo, check it's demo for an example of each option.
    // @see http://flesler.demos.com/jquery/scrollTo/
    // The defaults are public and can be overriden.
    $localScroll.defaults = {
        duration: 1000, // How long to animate.
        axis: 'y', // Which of top and left should be modified.
        event: 'click', // On which event to react.
        stop: true, // Avoid queuing animations 
        target: window, // What to scroll (selector or element). The whole window by default.
        reset: true // Used by $.localScroll.hash. If true, elements' scroll is resetted before actual scrolling
        /*
        lock:false, // ignore events if already animating
        lazy:false, // if true, links can be added later, and will still work.
        filter:null, // filter some anchors out of the matched elements.
        hash: false // if true, the hash of the selected link, will appear on the address bar.
        */
    };

    // If the URL contains a hash, it will scroll to the pointed element
    $localScroll.hash = function (settings) {
        if (location.hash) {
            settings = $.extend({}, $localScroll.defaults, settings);
            settings.hash = false; // can't be true

            if (settings.reset) {
                var d = settings.duration;
                delete settings.duration;
                $(settings.target).scrollTo(0, settings);
                settings.duration = d;
            }
            scroll(0, location, settings);
        }
    };

    $.fn.localScroll = function (settings) {
        settings = $.extend({}, $localScroll.defaults, settings);

        return settings.lazy ?
        // use event delegation, more links can be added later.     
            this.bind(settings.event, function (e) {
                // Could use closest(), but that would leave out jQuery -1.3.x
                var a = $([e.target, e.target.parentNode]).filter(filter)[0];
                // if a valid link was clicked
                if (a)
                    scroll(e, a, settings); // do scroll.
            }) :
        // bind concretely, to each matching link
            this.find('a,area')
                .filter(filter).bind(settings.event, function (e) {
                    scroll(e, this, settings);
                }).end()
            .end();

        function filter() {// is this a link that points to an anchor and passes a possible filter ? href is checked to avoid a bug in FF.
            return !!this.href && !!this.hash && this.href.replace(this.hash, '') == URI && (!settings.filter || $(this).is(settings.filter));
        };
    };

    function scroll(e, link, settings) {
        var id = link.hash.slice(1),
            elem = document.getElementById(id) || document.getElementsByName(id)[0];

        if (!elem)
            return;

        if (e)
            e.preventDefault();

        var $target = $(settings.target);

        if (settings.lock && $target.is(':animated') ||
            settings.onBefore && settings.onBefore.call(settings, e, elem, $target) === false)
            return;

        if (settings.stop)
            $target.stop(true); // remove all its animations

        if (settings.hash) {
            var attr = elem.id == id ? 'id' : 'name',
                $a = $('<a> </a>').attr(attr, id).css({
                    position: 'absolute',
                    top: $(window).scrollTop(),
                    left: $(window).scrollLeft()
                });

            elem[attr] = '';
            $('body').prepend($a);
            location = link.hash;
            $a.remove();
            elem[attr] = id;
        }

        $target
            .scrollTo(elem, settings) // do scroll
            .trigger('notify.serialScroll', [elem]); // notify serialScroll about this change
    };

})(jQuery);


/* ============================================================================================

@name       jquery.imagesLoaded
@depends    jquery
@link       http://github.com/desandro/imagesloaded

============================================================================================= */

/*jshint curly: true, eqeqeq: true, noempty: true, strict: true, undef: true, browser: true */

; (function ($, undefined) {
    'use strict';

    // blank image data-uri bypasses webkit log warning (thx doug jones)
    var BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

    $.fn.imagesLoaded = function (callback) {
        var $this = this,
        deferred = $.isFunction($.Deferred) ? $.Deferred() : 0,
        hasNotify = $.isFunction(deferred.notify),
        $images = $this.find('img').add($this.filter('img')),
        loaded = [],
        proper = [],
        broken = [];

        function doneLoading() {
            var $proper = $(proper),
            $broken = $(broken);

            if (deferred) {
                if (broken.length) {
                    deferred.reject($images, $proper, $broken);
                } else {
                    deferred.resolve($images);
                }
            }

            if ($.isFunction(callback)) {
                callback.call($this, $images, $proper, $broken);
            }
        }

        function imgLoaded(img, isBroken) {
            // don't proceed if BLANK image, or image is already loaded
            if (img.src === BLANK || $.inArray(img, loaded) !== -1) {
                return;
            }

            // store element in loaded images array
            loaded.push(img);

            // keep track of broken and properly loaded images
            if (isBroken) {
                broken.push(img);
            } else {
                proper.push(img);
            }

            // cache image and its state for future calls
            $.data(img, 'imagesLoaded', { isBroken: isBroken, src: img.src });

            // trigger deferred progress method if present
            if (hasNotify) {
                deferred.notifyWith($(img), [isBroken, $images, $(proper), $(broken)]);
            }

            // call doneLoading and clean listeners if all images are loaded
            if ($images.length === loaded.length) {
                setTimeout(doneLoading);
                $images.unbind('.imagesLoaded');
            }
        }

        // if no images, trigger immediately
        if (!$images.length) {
            doneLoading();
        } else {
            $images.bind('load.imagesLoaded error.imagesLoaded', function (event) {
                // trigger imgLoaded
                imgLoaded(event.target, event.type === 'error');
            }).each(function (i, el) {
                var src = el.src;

                // find out if this image has been already checked for status
                // if it was, and src has not changed, call imgLoaded on it
                var cached = $.data(el, 'imagesLoaded');
                if (cached && cached.src === src) {
                    imgLoaded(el, cached.isBroken);
                    return;
                }

                // if complete is true and browser supports natural sizes, try
                // to check for image status manually
                if (el.complete && el.naturalWidth !== undefined) {
                    imgLoaded(el, el.naturalWidth === 0 || el.naturalHeight === 0);
                    return;
                }

                // cached images don't fire load sometimes, so we reset src, but only when
                // dealing with IE, or image is complete (loaded) and failed manual check
                // webkit hack from http://groups.google.com/group/jquery-dev/browse_thread/thread/eee6ab7b2da50e1f
                if (el.readyState || el.complete) {
                    el.src = BLANK;
                    el.src = src;
                }
            });
        }

        return deferred ? deferred.promise($this) : $this;
    };

})(jQuery);


/* ============================================================================================

@name       jquery.smartResize
@depends    jquery
@link       http://paulirish.com/2009/throttled-smartresize-jquery-event-handler/

============================================================================================= */

(function ($, sr) {

    // debouncing function from John Hann
    // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
    var debounce = function (func, threshold, execAsap) {
        var timeout;

        return function debounced() {
            var obj = this, args = arguments;
            function delayed() {
                if (!execAsap)
                    func.apply(obj, args);
                timeout = null;
            };

            if (timeout)
                clearTimeout(timeout);
            else if (execAsap)
                func.apply(obj, args);

            timeout = setTimeout(delayed, threshold || 100);
        };
    }
    // smartresize 
    jQuery.fn[sr] = function (fn) { return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery, 'smartresize');