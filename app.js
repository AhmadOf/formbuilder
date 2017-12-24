
$(document).ready(docReady)

/* Make the control draggable */
function makeDraggable() {
    $(".selectorField").draggable({
        // Here I use ondrop_action function to render the question in the desired format while moving it towards the desired question group
        helper: function(){
            this_ctrl = $(this).clone();
            ondrop_action(this_ctrl);
            return this_ctrl;
        },
        stack: "div",
        cursor: "move",
        cancel: null,
        stack: ".selectorField",
        connectToSortable: ".droppedFields",
        zIndex: 1000,
        // This event triggerd when dragging process finished so I remove whileDrag class for element which get it from ondrop_action
        stop: function(){
            $(".droppedField").not('.whileDrag').children("[class='div-content box']").find("[data-widget='collapse']").click();
            $('.whileDrag').removeClass('whileDrag');
        },
        // Prevent dragging noremal control if there is no already question group
        drag: function(){
            if($(this).find("[class^=ctrl]").length > 0 && $('.ctrl-group').length == 0)
                return false;
        }
    });
}

/* This function will be used on drop action for both new created control and already exists one */
function ondrop_action(this_item) {

    var draggable = this_item;
    draggable.width($($('.ctrl-group')[0]).width());

    draggable.css('background','unset !important');
    draggable.css('box-shadow','unset !important');

    // Remove some styles and add new ones from dragged item to take the new style which suit the new position
    draggable.removeClass("selectorField");
    draggable.attr('title', '');
    draggable.removeClass(function (index, css) {
        return (css.match(/^newicon-\S+/g) || []).join(' ');
    });
    draggable.addClass("droppedField");
    draggable.addClass("whileDrag");
    draggable.addClass("col-lg-12 col-md-12");

    // Make the content of question div visible
    draggable.find(".div-content").css('display', 'block');
    draggable.find(".question-tools").css('display', 'block');

    // Attach an ID to the rendered control
    draggable[0].id = "QUS-" + (Math.floor(Date.now() / 1000)) + Math.floor(Math.random() * 100000);

    // Appen the dragged item to the parent group
    //draggable.appendTo(this_item);

    var clickable =draggable.children(':first').children().eq(1);
    var clickable2 =draggable.children(':first').children().eq(0).find('.control-label');
    var id = draggable[0].id;
    // The following assumes that dropped fields will have a ctrl-defined.
    //   If not required, code needs to handle exceptions here.
    var ctrl = draggable.find("[class*=ctrl]")[0];
    if(typeof(ctrl) == 'undefined') return;
    var ctrl_type = $.trim(ctrl.className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);

    /* Once dropped, attach the customization handler to the control */
    clickable.click(function () {
        customize_ctrl(ctrl_type,id,(draggable.is(':first-child')) ? true : false);

    });
    clickable2.click(function (event) {
        if(!($(this).parents('.div-content').hasClass('collapsed-box'))){
            event.stopPropagation();
            customize_ctrl(ctrl_type,id,(draggable.is(':first-child')) ? true : false);
        }
    });
}

/* Make already exist groups sortable */
function makeSortable() {

    $("[id^=selected-action-column]").sortable({
        cancel: null, // Cancel the default events on the controls
        connectWith: ".droppedFields",
        opacity: 0.3,
        cursor: 'move',
        placeholder: 'ui-state-highlight',
        revert: 500,

        create: function (event, ui) {
            makeDroppable();
        },
        start: function (event, ui) {
            // Prevent click event on Question after finish sorting
            var clickable = ui.item.children(':first').children().eq(1);
            clickable.unbind("click");
        },
        stop: function (event, ui) {
            // Rebind click event on question
            var clickable = ui.item.children(':first').children().eq(1);
            var me =  ui.item;
            var id = me[0].id;
            clickable.on('click', function () {
                var ctrl = me.find("[class*=ctrl]")[0];
                var ctrl_type = $.trim(ctrl.className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);
                var first_child = false;
                if(me.is(':first-child')) {
                    first_child = true
                }
                customize_ctrl(ctrl_type, id,first_child);
            });
            // Remove activeDroppable class from all question groups after sorting
            $("[id^=selected-action-column]").removeClass('activeDroppable');
            $("[id^=selected-action-column]").css("opacity","1");

        }
    }).disableSelection();
}

/* Make already exist groups droppable to be able to receive new controls  */
function makeDroppable() {

    $("[id^=selected-action-column]").droppable({
        activeClass: "activeDroppable",
        hoverClass: "hoverDroppable",
        // decline draggableDiv and question-group so when those items start moving droppable Divs donn't get active
        accept: ":not(.ui-sortable-helper , .draggableDiv, .question-group)",
        tolerance: "pointer",

        create: function (event, ui) {
            // Bind click event on question to modify its properties
            var clickable = $(this).find("[id^=QUS-]").children(':first').children().eq(1);
            var question= $(this).find("[id^=QUS-]");
            if (question != null) {
                $(this).find("[id^=QUS-]").each(function () {
                    var id = this.id;
                    var clickable = $(this).children(":first").children().eq(1);
                    var clickable2 = $(this).children(':first').children().eq(0).find('.control-label');
                    var ctrl = $('#' + id).find("[class*=ctrl]")[0];
                    if(typeof(ctrl) == 'undefined') return;
                    var ctrl_type = $.trim(ctrl.className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);

                    // Open modify group modal
                    clickable.on('click', function () {
                        customize_ctrl(ctrl_type, id, ($('#' + id).is(':first-child')) ? true : false);
                    });

                    clickable2.click(function (event) {
                        if(!($(this).parents('.div-content').hasClass('collapsed-box'))){
                            event.stopPropagation();
                            customize_ctrl(ctrl_type,id,($('#' + id).is(':first-child')) ? true : false);
                        }
                    });
                })
            }
        }
    });
}

function translateMultiLangualInput(){
    $.each($("[id^=selected-action-column]").find('.eval'),function(x,y){
        title = $(y).attr('data-trans');
        //if(typeof title != 'undefined')
        $(y).text(messages9[title]);
    })

}

/* This is the main function which executed when loading the page to call already defined functions to make groups droppable and sortable and also to ensure
 * that new groups will be also sortable and droppable */
function docReady() {

    // Compile modal templates
    compileTemplates();

    // Make predefined form controls draggable
    makeDraggable();

    // Check already exist HTML code if there is a need to make any component sortable
    makeSortable();

    // Check already exist HTML code if there is a need to make any component droppable
    makeDroppable();

    // Make gender and yes/no questions options multi lingual
    translateMultiLangualInput();

    /* Make the droppedFields sortable and connected with other droppedFields containers*/
    $(".droppedFields").sortable({
        cancel: null, // Cancel the default events on the controls
        connectWith: ".droppedFields"
    }).disableSelection();

    $("#selected-content").sortable({
        opacity: 0.5,
        cursor: 'move',
        placeholder: 'ui-state-highlight',
        revert: 500,

        stop: function (event, ui) {

            // random number to attach it to group id
            var x = Math.floor(Math.random() * 100000);

            if (ui.item.hasClass('draggableDiv')) {

                ui.item.replaceWith("<div class='box box-designer question-group' id='question-group-wrap" + x + "'>" +
                    "<div class='box-header with-border'>" +
                    "<h3 class='box-title'>" +
                    "<a href='#' class='group_name_container' onclick=\"customize_group_ctrl('group', 'selected-action-column" + x + "')\">Group Name</a>" +
                    "<input type='hidden' name='group_description' value='' />" +
                    "</h3>" +
                    "<div class='box-tools pull-right'>" +
                    "<button title='Collapse' data-toggle='tooltip' data-widget='collapse' class='btn btn-box-tool' type='button'>" +
                    "<i class='fa fa-minus'></i>" +
                    "</button>" +
                    "<button title='Drop' data-toggle='tooltip' data-widget='drop' class='btn btn-box-tool' type='button' data-original-title='Remove'>" +
                    "<i class='fa fa-times'></i>" +
                    "</button>" +
                    "</div>" +
                    "</div>" +
                    "<div class='box-body action-bar droppedFields ctrl-group' id='selected-action-column" + x + "' style='min-height: 100px'>" +
                    "</div>" +
                    "</div>");
            }

            /* Make the recently created droppedFields (id=selected-action-column{x}) sortable and connected with other droppedFields containers*/
            makeSortable();
        }
    });

    $("#selected-content").disableSelection();

    /* Make draggableDiv draggable*/
    $(".draggableDiv").draggable({
        connectToSortable: "#selected-content",
    });

    /* Bind click event on add-scenario class so when clicking it a new scenario div created by copying already exist one */
    $(document).on('click', '.add-scenario', function (e) {
        var parent = $(this).closest('div');

        // Clone scenario template and changing its class and make it visible
        var new_scenario = parent.find('.scenario-template').clone(false);
        new_scenario.removeClass('scenario-template');
        new_scenario.addClass('scenario');
        new_scenario.show();

        // Assign new id for cloned scenario div
        var senario_id = 'scenario-' + Math.floor(Math.random() * 100000);
        new_scenario.attr('id', senario_id);

        // create new condition div inside scenario div by cloning condition template and change its class and make it visible
        var condition_id = senario_id + '_condition-' + Math.floor(Math.random() * 100000);
        var new_condition = parent.find('.condition-template').clone(false);
        new_condition.removeClass('condition-template');
        new_condition.addClass('condition');
        new_condition.show();

        // Assign new id for cloned condition div
        new_condition.attr('id', condition_id);

        // generate the content of new condition and full its selects with the proper data and finally append the condition to its parent scenario
        generate_condition(new_condition, []);
        new_scenario.append(new_condition);

        // append the scenario to its parent div
        parent.append(new_scenario);
    });

    // Bind click event on remove-scenario class to remove the closest scenario
    $(document).on('click', '.remove-scenario', function (e) {
        var current_scenario = $(this).closest('.scenario');
        current_scenario.remove();
    });

    /* Bind click event on add-condition class so when clicking it a new condition div created by copying the template condition */
    $(document).on('click', '.add-condition', function (e) {
        var parent = $(this).closest('.condition').parent();

        var new_condition = $(this).closest('.condition').clone(false);
        senario_id = parent.attr('id');
        var condition_id = senario_id + '_condition-' + Math.floor(Math.random() * 100000);
        new_condition.attr('id', condition_id);

        generate_condition(new_condition, []);
        parent.append(new_condition);

    });

    // Bind click event on remove-condition class to remove the closest condition if there is no siblings for this condition
    $(document).on('click', '.remove-condition', function (e) {
        if ($(this).closest('.condition').siblings('.condition').length != 0) $(this).closest('.condition').remove();
    });


//        $('.box').on('click', '[data-widget="collapse"]', function (e) {
    $(document).on('click', '.box [data-widget="collapse"]', function (e) {
        e.preventDefault();
        collapse($(this));
    });
//        $('.box').on('click', '[data-widget="drop"]', function (e) {
    $(document).on('click', '.box [data-widget="drop"]', function (e) {
        e.preventDefault();
        drop($(this));
        drop($(this).parent());
    });

}

/* Load the already exists conditions which saved in hidden input in each question and render them on popup window*/
function load_conditions(conditions_string) {

    // Parse JSON conditions string
    conditions_array = $.parseJSON(conditions_string);

    // Walk on each scenario
    $.each(conditions_array, function (is, s) {

        var parent = $('#conditions-content');

        var new_scenario = parent.find('.scenario-template').clone(false);
        new_scenario.removeClass('scenario-template');
        new_scenario.addClass('scenario');
        new_scenario.show();

        var scenario_id = s.name;
        new_scenario.attr('id', scenario_id);

        // Walk on each condition of this scenario
        $.each(s.conditions, function (ic, c) {

            var condition_id = c.name;

            var new_condition = parent.find('.condition-template').clone(false);
            new_condition.removeClass('condition-template');
            new_condition.addClass('condition');
            new_condition.show();
            new_condition.attr('id', condition_id);

            generate_condition(new_condition, c.condition);

            new_scenario.append(new_condition);
        });

        parent.append(new_scenario);
    });
}

/* This function called in many cases which includes pressing on new condition button and new scenario and
 * also when loading predefined conditions
 */
function generate_condition(condition, condition_array) {

    condition_id = condition.attr('id');

    // Get question select, change its id and truncate its content
    var question_select = condition.find('[name=condition_question]');
    var question_select_id = condition_id + '_condition_question';
    question_select.attr('id', question_select_id);
    question_select.empty();


    // Get question method select, change its id and truncate its content
    var method_select = condition.find('[name=condition_method]');
    var method_select_id = condition_id + '_condition_method';
    method_select.attr('id', method_select_id);
    method_select.empty();


    // Get question type select, change its id and truncate its content
    var type_select = condition.find('[name=condition_type]');
    var type_select_id = condition_id + '_condition_type';
    type_select.attr('id', type_select_id);
    type_select.empty();

    // Get question value select or input, change its id and truncate its content
    var value_select = condition.find('[name=condition_value]');
    var value_select_id = condition_id + '_condition_value';
    value_select.attr('id', value_select_id);
    value_select.empty();

    // Get the previous questions of the current one
    var siblings = $('#' + $("#theForm").find("[name=forCtrl]").val()).prevAll('.draggableField');

    question_select.append($('<option>'));

    // Fill question select with the ids of previous questions
    siblings.each(function (i, o) {
        curr_question = $(o).find("[class^='ctrl']");

        questionType = $.trim(curr_question[0].className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);
        if(questionType == 'array') {
            qtext   = $(this).find("table:first > tbody > tr > td:first-child").not(':first');
            qtext.each(function(j,k){
                subquestion_code = $(k).next().find('input[type=radio]');
                select_option = {value: o.id+'.'+subquestion_code[0].name, text: $(k).text()};

                if (condition_array.length > 0 && condition_array[0].question == o.id+'.'+subquestion_code[0].name) select_option.selected = true;

                question_select.append($('<option>', select_option));

            });

        } else if(questionType != 'audio' && questionType != 'image' && questionType != 'video' && questionType != 'paragraph' && questionType != 'location') {
            select_option = {value: o.id, text: $(o).find('.control-label').text()};

            if (condition_array.length > 0 && condition_array[0].question == o.id) select_option.selected = true;

            question_select.append($('<option>', select_option));
        }
    });

    // Bind change event which triggered when the question changed to check the type of the selected question and fill other selects
    question_select.change(function () {

        // Get the type selected question
        var patt = /\./;
        qid = (patt.test($(this).val())) ? $(this).val().split(".")[0] : $(this).val();

        var ctrl = $('#' + qid).find("[class*=ctrl]")[0];
        if (typeof(ctrl) == 'undefined') return;
        var ctrl_type = $.trim(ctrl.className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);

        // Empty other selects and start fill it with proper options
        method_select.empty();
        type_select.empty();
        method_select.append(
            $('<option>', {value: '==', text: 'equals'}),
            $('<option>', {value: '!>', text: 'Not equal to'
            }));
        type_select.append($('<option>'));
        type_select.append($('<option>', {value: 'Question', text: 'Question'}));

        if (ctrl_type == 'number' || ctrl_type == 'date') {
            method_select.append($('<option>', {
                value: '>',
                text: 'Greater than'
            }), $('<option>', {value: '<', text: 'Less than'}));
        }

        if (ctrl_type == 'checkboxgroup' || ctrl_type == 'radiogroup' || ctrl_type == 'yesno' || ctrl_type == 'gender' || ctrl_type == 'array') {
            type_select.append($('<option>', {value: 'Predefined', text: 'Predefined'}));
        } else {
            type_select.append($('<option>', {value: 'Constant', text: 'Constant'}));
        }

        value_select = $('#' + value_select_id);
        value_select.empty();
        value_select.val('');

    });

    // If this condition loaded from previous saved one so trigger the previous event to fill other selects depending of the value of this select
    if (condition_array.length > 0) question_select.trigger('change');

    // Bing an event which triggered when select type changed so the value input must be modified by changing its type or filling its options
    type_select.change(function () {

        var patt = /\./;
        qid = (patt.test(question_select.val())) ? question_select.val().split(".")[0] : question_select.val();

        // Get the type selected question
        var ctrl = $('#' + qid).find("[class*=ctrl]")[0];
//            var ctrl = $('#' + question_select.val()).find("[class*=ctrl]")[0];
        if (typeof(ctrl) == 'undefined') return;
        var ctrl_type = $.trim(ctrl.className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);
        value_select = condition.find('[name=condition_value]');
        value_select.empty();
        value_select.val('');

        // If type is question then get all previous questions except the current one and fill them in value select
        if ($(this).val() == 'Question') {

            var new_select = $('<select>')
                .attr('id', value_select_id)
                .attr('name', 'condition_value')
                .css('width', '20%')
            ;
            siblings.each(function (i, o) {

                sibling_question = $(o).find("[class^='ctrl']");

                questionType = $.trim(sibling_question[0].className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);

                if(questionType == 'array') {
                    qtext   = $(o).find("table:first > tbody > tr > td:first-child").not(':first');
                    qtext.each(function(j,k){
                        subquestion_code = $(k).next().find('input[type=radio]');
                        select_option = {value: o.id+'.'+subquestion_code[0].name, text: $(k).text()};

                        if (condition_array.length > 0 && condition_array[0].value == o.id+'.'+subquestion_code[0].name) select_option.selected = true;

                        if (o.id+'.'+subquestion_code[0].name != question_select.val()) {
                            new_select.append($('<option>', select_option));
                        }

                    });
                }
                else if(questionType != 'audio' && questionType != 'image' && questionType != 'video' && questionType != 'paragraph' && questionType != 'location'){
                    select_option = {value: o.id, text: $(o).find('.control-label').text()};
                    if (condition_array.length > 0 && condition_array[0].value == o.id) select_option.selected = true;

                    if (o.id != question_select.val()) {
                        new_select.append($('<option>', select_option));
                    }
                }
            });

            value_select.replaceWith(new_select);
        } // If type is predefined then get the options of selected question and fill them in value select
        else if ($(this).val() == 'Predefined') {
            var new_select = $('<select>')
                .attr('id', value_select_id)
                .attr('name', 'condition_value')
                .css('width', '20%')
            ;

            if (ctrl_type == 'radiogroup' || ctrl_type == 'yesno' || ctrl_type == 'gender') {

                var ctrls = $('#' + question_select.val()).find("div").find("div").find("label");

                ctrls.each(function (i, o) {
                    select_option = {
                        value: $(o).siblings('div').find('input[type=radio]').val(),
                        text: $(o).text()
                    };
                    if (condition_array.length > 0 && condition_array[0].value == $(o).siblings('div').find('input[type=radio]').val())
                        select_option.selected = true;

                    new_select.append($('<option>', select_option));

                });

                value_select.replaceWith(new_select);

            } else if (ctrl_type == 'checkboxgroup') {

                var ctrls = $('#' + question_select.val()).find("div").find("div").find("label");

                ctrls.each(function (i, o) {
                    if($(o).siblings('div').find('input[type=checkbox]').length > 0){
                        select_option = {
                            value: $(o).siblings('div').find('input[type=checkbox]')[0].name,
                            text: $(o).text()
                        };
                        if (condition_array.length > 0 && condition_array[0].value == $(o).siblings('div').find('input[type=checkbox]')[0].name)
                            select_option.selected = true;

                        new_select.append($('<option>', select_option));
                    }
                });

                value_select.replaceWith(new_select);

            } else if(ctrl_type == 'array'){

                // Loop on options to put their text all togather in text area for modification
                c = $('#' + qid).find("[class*=ctrl]")[0];
                var atext   = $(c).find("tbody > tr:first > td:not(:first)");
                inputs = $(c).find("tbody > tr:nth-child(2) > td:nth-child(2)").find('input[type=radio]');

                inputs.each(function(i,o){

                    select_option = {
                        value: $(o).val(),
                        text: $($(atext)[i]).text()
                    };
                    if (condition_array.length > 0 && condition_array[0].value == $(o).val())
                        select_option.selected = true;

                    new_select.append($('<option>', select_option));


                });

                value_select.replaceWith(new_select);
            }
        } // Else the type is constant so change the type of value select to be normal input
        else {
            var new_select = $('<input>')
                .attr('id', value_select_id)
                .attr('type', 'text')
                .attr('name', 'condition_value')
                .css('width', '20%')
            ;
            if(ctrl_type == 'date') new_select.attr('placeholder','dd-mm-yyyy');
            if (condition_array.length) new_select.val(condition_array[0].value);
            value_select.replaceWith(new_select);
        }
    });

    if (condition_array.length > 0) {
        method_select.val(condition_array[0].method).change();
        type_select.val(condition_array[0].type).change();
    }

}

if (typeof(console) == 'undefined' || console == null) {
    console = {};
    console.log = function () {
    }
}

/* Delete the group immediately */
function delete_group(button_id) {
    if (window.confirm("Are you sure about this?")) {
        $("#" + button_id).parent().remove();
    }
}

/* Delete the control from the form in both cases of question or group of questions*/
function delete_ctrl(with_parent) {
    if (window.confirm("Are you sure about this?")) {
        var ctrl_id = $("#theForm").find("[name=forCtrl]").val();

        if (!with_parent) {
            $("#" + ctrl_id).remove();
        } else {
            $("#" + ctrl_id).parent().remove();
        }
    }
}

/* Compile the templates for use
 * here we use Handlebars templates to defined the modals which appear when any question clicked*/
function compileTemplates() {
    window.templates = {};
    window.templates.common = Handlebars.compile($("#control-customize-template").html());

    /* HTML Templates required for specific implementations mentioned below */

    window.templates.group = Handlebars.compile($("#group-template").html());
    window.templates.textbox = Handlebars.compile($("#textbox-template").html());
    window.templates.email = Handlebars.compile($("#email-template").html());
    window.templates.textarea = Handlebars.compile($("#textbox-template").html());
    window.templates.number = Handlebars.compile($("#number-template").html());
    window.templates.date = Handlebars.compile($("#date-template").html());
    window.templates.radiogroup = Handlebars.compile($("#combobox-template").html());
    window.templates.array = Handlebars.compile($("#array-template").html());
    window.templates.checkboxgroup = Handlebars.compile($("#combobox-template").html());
}

// Object containing specific "Save Changes" method
save_changes = {};

// Object containing specific "Load Values" method.
load_values = {};


/* Common method for all controls with Label and Name */
load_values.common = function (ctrl_type, ctrl_id) {

    // Get DOM object for form in modal
    var form = $("#theForm");
    // Get DOM object for the original control which we will get its properties
    var div_ctrl = $("#" + ctrl_id);

    // Set the value of question text box in modal by getting control-label class from original control
    if(ctrl_type != 'paragraph') {
        form.find("[name=label]").val(div_ctrl.find('.control-label').text());
    } else {
        form.find("[name=label]").val(div_ctrl.find('.box-body').find('.control-label').text());
    }
    // Set the value of help text box in modal by getting control-help class from original control
    form.find("[name=help]").val(div_ctrl.find('.control-help').attr('title'));

    // Determine if the original control is required or not
    required_label = div_ctrl.find('.control-required');
    if (required_label.css('display') == 'none') {
        form.find("[name=required][value=no]").prop("checked", true);
    } else {
        form.find("[name=required][value=yes]").prop("checked", true);
    }

    // Call the method which will load the specific properties for certain control
    var specific_load_method = load_values[ctrl_type];
    if (typeof(specific_load_method) != 'undefined') {
        specific_load_method(ctrl_type, ctrl_id);
    }

    // Load conditions
    var conditions = div_ctrl.find('.control-conditions').val();

    if (typeof(conditions) != 'undefined' && conditions.length != 0) {
        load_conditions(conditions);
    }

}

/* Specific method to load values from a group to the customization dialog */
load_values.group = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");

//        form.find("[name=is_template]").attr('checked',
//            ($("#" + ctrl_id).parent().find('input[name=is_template]').attr('value') == 1) ? true : false);
    // Load group name
    form.find("[name=group_name]").val($("#" + ctrl_id).parent().find('.group_name_container').text());

    form.find("[name=group_description]").val($("#" + ctrl_id).parent().find('input[name=group_description]').attr('value'));
}

/* Specific method to load values from a textbox control to the customization dialog */
load_values.textbox = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");
    var div_ctrl = $("#" + ctrl_id);
    var ctrl = undefined;
    ctrl = div_ctrl.find("input:text")[0];
    // In case of text area
    if (typeof(ctrl) == 'undefined') {
        ctrl = div_ctrl.find("textarea")[0];
    }

    // Load max width for text box or area
    maxLengeth = (ctrl.maxLength >= 0) ? ctrl.maxLength : '';
    form.find("[name=maxlength]").val(maxLengeth);
}

/* Specific method to load values from a textarea control to the customization dialog */
load_values.textarea = load_values.textbox;

/* Specific method to load values from a email control to the customization dialog */
load_values.email = load_values.textbox;

/* Specific method to load values from a date control to the customization dialog */
load_values.date = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");
    var div_ctrl = $("#" + ctrl_id);
    var ctrl = div_ctrl.find("input")[0];

    // Load Date formate info which will be stored as placeholder for date input
    //form.find("[name=dateformat]").val(ctrl.placeholder);
}

/* Specific method to load values from a number box control to the customization dialog */
load_values.number = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");
    var div_ctrl = $("#" + ctrl_id);
    var ctrl = div_ctrl.find("input")[0];

    // Load programming name, Min value, Max value and step for numeric inputs
    form.find("[name=min]").val(ctrl.min);
    form.find("[name=max]").val(ctrl.max);
    maxLengeth = (ctrl.maxLength >= 0) ? ctrl.maxLength : '';
    form.find("[name=maxlength]").val(maxLengeth);

    // Load is integer only option from data attribute data-integer_only
    integer_only = ctrl.getAttribute('data-integer_only');

    if (integer_only == 'yes') {
        form.find("[name=integer_only][value=yes]").prop("checked", true);
    } else {
        form.find("[name=integer_only][value=no]").prop("checked", true);
    }

}

/* Specific method to load values from a radio group */
load_values.array = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");
    var div_ctrl = $("#" + ctrl_id);
    var questions_container = '';
    var options_container = '';
    var options = div_ctrl.find("table tr:first td").not(':first');
    var questions   = div_ctrl.find("table:first > tbody > tr > td:first-child").not(':first');

    // Loop on options to put their text all togather in text area for modification
    questions.each(function (i, o) {
        questions_container += $(o).text() + '\n';
    });
    options.each(function (i, o) {
        options_container += $(o).text() + '\n';
    });
    //            form.find("[name=name]").val(radios[0].name);
    form.find("[name=questions]").val($.trim(questions_container));
    form.find("[name=options]").val($.trim(options_container));
}

/* Specific method to load values from a radio group */
load_values.radiogroup = function (ctrl_type, ctrl_id) {
    var form = $("#theForm");
    var div_ctrl = $("#" + ctrl_id);
    var options = '';
    var ctrls = div_ctrl.find(".ctrl-"+ctrl_type).find("label");
    //div_ctrl.find("div").find("div").find("label");
    var radios = div_ctrl.find("div").find("input");

    // Loop on options to put their text all togather in text area for modification
    ctrls.each(function (i, o) {
        options += $(o).text() + '\n';
    });
    //            form.find("[name=name]").val(radios[0].name);
    form.find("[name=options]").val($.trim(options));
}

/* Specific method to load values from a checkbox group */
load_values.checkboxgroup = load_values.radiogroup;

/* Specific method to load values from a yesno question */
load_values.yesno = load_values.radiogroup;

/* Specific method to load values from a gender question */
load_values.gender = load_values.radiogroup;

/* Common method to save changes to a control  - This also calls the specific methods */
save_changes.common = function (values) {

    var div_ctrl = $("#" + values.forCtrl);

    // Set question text
    if(values.type != 'paragraph') {
        div_ctrl.find('.control-label').text(values.label);
    } else {
        div_ctrl.find('.box-body').find('.control-label').text(values.label);
    }

    // Save help text as a title attribute
    var help = div_ctrl.find('.control-help');
    help.attr('title', values.help);

    // check if there is help text then display question mark
    if (typeof(values.help) != 'undefined' && values.help != '') {
        help.css('display', 'inline')
    } else {
        help.css('display', 'none')
    }

    // Check if the question is required then display red star
    var required = div_ctrl.find('.control-required');
    if (typeof(values.required) != 'undefined' && values.required == 'yes') {
        required.css('display', 'inline');
    } else {
        required.css('display', 'none');
    }

    // Call specific save method for each question type
    var specific_save_method = save_changes[values.type];
    if (typeof(specific_save_method) != 'undefined') {
        specific_save_method(values);
    }

    //If there is conditions save it
    var conditions = div_ctrl.find('.control-conditions');

    var scenarios = $("#conditions-content").find('.scenario');

    var jsonConditions = save_conditions(scenarios);
    conditions.val(jsonConditions);

    // Display certain sign beside question if it has conditions
    var hascondition = div_ctrl.find('.control-hascondition');

    if (jsonConditions != '' && jsonConditions != '[]') {
        hascondition.css('display', 'inline');
        hascondition.attr('title', 'Conditional Question');
    } else {
        hascondition.css('display', 'none');
    }
}

/* Save the defined conditions on any question as JSON string*/
function save_conditions(scenarios) {
    var scenarios_text = '';


    var scenarios_array = [];

    // Loop for each scenario
    scenarios.each(function (i, o) {

        conditions_text = '';
        var conditions_array = [];

        conditions = $(o).find('.condition');

        // Loop on each condition in scenario
        conditions.each(function (i, c) {
            condition_array = [];
            // For each condition get the trigger question, method , type and value
            question = $(c).find('[id$=condition_question]');
            method = $(c).find('[id$=condition_method]');
            type = $(c).find('[id$=condition_type]');
            value = $(c).find('[id$=condition_value]');

            if (question.val() != '' &&
                method.val() != null && method.val() != '' &&
                type.val() != null && type.val() != '' &&
                value.val() != null && value.val() != '') {
                condition_array.push({
                    question: question.val(),
                    method: method.val(),
                    type: type.val(),
                    value: value.val()
                });
            }

            if (condition_array.length > 0) {
                conditions_array.push({
                    name: $(c).attr('id'),
                    condition: condition_array
                });
            }

        });

        if (conditions_array.length > 0) {
            scenarios_array.push({
                name: $(o).attr('id'),
                conditions: conditions_array
            });
        }


        scenarios_text += ((scenarios_text == '') ? '' : '||') + conditions_text;
    });

    return JSON.stringify(scenarios_array);

}

/* Specific method to save changes to a text box */
save_changes.textbox = function (values) {
    var div_ctrl = $("#" + values.forCtrl);

    var ctrl = undefined;
    ctrl = div_ctrl.find("input:text")[0];
    if (typeof(ctrl) == 'undefined') {
        ctrl = div_ctrl.find("textarea")[0];
    }

    // Check if max length is not found or not numeric so remove the attribute from text input
    if (values.maxlength <= 0 || values.maxlength == '' || !$.isNumeric(values.maxlength)) {
        ctrl.removeAttribute('maxlength');
    } else {
        ctrl.maxLength = values.maxlength;
    }
}

/* Specific method to save changes to a text area */
save_changes.textarea = save_changes.textbox;

/* Specific method to save changes to a email */
save_changes.email = save_changes.textbox;

/* Specific method to save changes to a date box */
save_changes.date = function (values) {
    var div_ctrl = $("#" + values.forCtrl);
    var ctrl = div_ctrl.find("input")[0];

    // Save date formate as placeholder for date input and save programming name for input
    //ctrl.placeholder = values.dateformat;

}

/* Specific method to save changes to a number box */
save_changes.number = function (values) {
    var div_ctrl = $("#" + values.forCtrl);
    var ctrl = div_ctrl.find("input")[0];

    // Save min, max, step for numeric input with programming name
    ctrl.min = values.min;
    ctrl.max = values.max;
    if (values.maxlength <= 0 || values.maxlength == '' || !$.isNumeric(values.maxlength)) {
        ctrl.removeAttribute('maxlength');
    } else {
        ctrl.maxLength = values.maxlength;
    }

    if (typeof(values.integer_only) != 'undefined' && values.integer_only == 'yes') {
        ctrl.setAttribute('data-integer_only', 'yes')
    } else {
        ctrl.setAttribute('data-integer_only', 'no')
    }


}

/* Specific method to save an array */
save_changes.array = function (values) {
    var div_ctrl = $("#" + values.forCtrl);

    var table_header = div_ctrl.find('table:first > tbody > tr:nth(0)');
    var row_template = div_ctrl.find('table:first > tbody > tr:nth(1)');
    var options_template = $('<tr/>');//row_template.find('td:nth(1) table tr:first');

    var ctrl = div_ctrl.find(".ctrl-array");
    ctrl.empty();

    table_header.find('td').not(':first').remove();
    var options_count = 0;
    answers_count = $.trim(values.options).split('\n').length;
    header_td_width = 75 / answers_count;
    answer_td_width = 100 / answers_count;
    $($.trim(values.options).split('\n')).each(function (i, o) {
        if($.trim(o) == '') return true;
        table_header.append('<td width="'+header_td_width+'%">'+$.trim(o)+'</td>');
        options_count++;
        options_template.append('<td><input name="" value="A'+options_count+'" type="radio"/></td>');
    });
    ctrl.append($(table_header));

//         Get the text in options text area and loop on each line to make it as an option
    var counter = 101;

    $($.trim(values.questions).split('\n')).each(function (i, o) {
        if($.trim(o) == '') return true;

        var new_row_template = $(row_template).clone();
        var new_options_template = $(options_template).clone();
        $(new_options_template).find('input[type=radio]').each(function(i) {
            $(this).attr("name",'SQ' + counter);
        });

        counter++;

        $(new_row_template).find('td:first').text($.trim(o));
        $(new_row_template).find('td:nth(1)').attr('colspan',options_count)
        $(new_row_template).find('td:nth(1) table tr:first').replaceWith(new_options_template);
        ctrl.append($(new_row_template));
    });


}

/* Specific method to save a radiogroup */
save_changes.radiogroup = function (values) {
    var div_ctrl = $("#" + values.forCtrl);

    var radio_template = $(".selectorField .ctrl-radiogroup .form-group")[0];

    var ctrl = div_ctrl.find(".ctrl-radiogroup");
    ctrl.empty();

    // Get the text in options text area and loop on each line to make it as an option
    var counter = 1;
    $(values.options.split('\n')).each(function (i, o) {

        var new_radio_template = $(radio_template).clone();
        $(new_radio_template).find('input[type=radio]')[0].name = values.name;
        $(new_radio_template).find('input[type=radio]')[0].value = 'A' + counter++;//$.trim(o);;
        $(new_radio_template).find('label').text($.trim(o));

        $(ctrl).append($(new_radio_template));
    });
}

/* Specific method to save a yes no question */
save_changes.yesno = function (values) {
    var div_ctrl = $("#" + values.forCtrl);
}

/* Specific method to save a gender question */
save_changes.gender = function (values) {
    var div_ctrl = $("#" + values.forCtrl);
}

/* Specific method to save a checkbox group question */
save_changes.checkboxgroup = function (values) {
    var div_ctrl = $("#" + values.forCtrl);

    var checkbox_template = $(".selectorField .ctrl-checkboxgroup .form-group")[0];

    var ctrl = div_ctrl.find(".ctrl-checkboxgroup");
    ctrl.empty();

    var counter = 101;

    $(values.options.split('\n')).each(function (i, o) {

        var new_checkbox_template = $(checkbox_template).clone();
        $(new_checkbox_template).find('input[type=checkbox]')[0].name = 'SQ' + counter++;
        $(new_checkbox_template).find('label').text($.trim(o));
        $(ctrl).append($(new_checkbox_template));

    });
}

/* Specific method to save group information */
save_changes.group = function (values) {
    var div_ctrl = $("#" + values.forCtrl);
    div_ctrl.parent().find('.group_name_container').text(values.group_name);
//        div_ctrl.parent().find("input[name=is_template]").attr('value', (values.is_template) ? 1 : 0);
    div_ctrl.parent().find("input[name=group_description]").attr('value', values.group_description);
//        div_ctrl.parent().find(".is_template_icon").css('display', (values.is_template) ? 'inline' : 'none');
}

/* Save the changes due to customization
 - This method collects the values and passes it to the save_changes.methods
 */
function save_customize_changes(is_group) {

    var formValues = {};
    var val = null;
    $("#theForm").find("input, textarea").each(function (i, o) {

        if (o.type == "checkbox") {
            val = o.checked;
        } else if (o.type == "radio") {
            if (o.checked) val = o.value;
        } else {
            val = o.value;
        }
        formValues[o.name] = val;
    });
    if (typeof(is_group) == 'undefined') {
        save_changes.common(formValues);
    } else {
        save_changes.group(formValues);
    }
}

/*
 Opens the customization window for group of questions
 */
function customize_group_ctrl(ctrl_type, ctrl_id) {

    var modal_header = $("#" + ctrl_id).parent().find('.group_name_container').text();


    // Gather template params
    var template_params = {
        header: modal_header,
        type: ctrl_type,
        forCtrl: ctrl_id
    }

    // Pass the parameters - along with the specific template content to the Base template
    var s = templates.group(template_params) + "";

    $("[name=customization_modal]").remove(); // Making sure that we just have one instance of the modal opened and not leaking
    $('<div id="customization_modal" name="customization_modal" class="modal" />').append(s).modal('show');


    setTimeout(function () {
        // For some error in the code  modal show event is not firing - applying a manual delay before load
        load_values.group(ctrl_type, ctrl_id);
    }, 300);

}

/*
 Opens the customization window for this question
 */
function customize_ctrl(ctrl_type, ctrl_id, first_child) {

    var ctrl_params = {};

    /* Load the specific templates */
    var specific_template = templates[ctrl_type];
    if (typeof(specific_template) == 'undefined') {
        specific_template = function () {
            return '';
        };
    }
    if(ctrl_type != 'paragraph') {
        var modal_header = $("#" + ctrl_id).find('.control-label').text();
    } else {
        var modal_header = $("#" + ctrl_id).find('.box-title').find('.control-label').text();
    }

    // Gather template params
    var template_params = {
        header: modal_header,
        content: specific_template(ctrl_params),
        type: ctrl_type,
        forCtrl: ctrl_id
    }

    if(ctrl_type == 'paragraph') {
        template_params.textArea = true;
    } else {
        template_params.textArea = false;
    }
    // Pass the parameters - along with the specific template content to the Base template
    var s = templates.common(template_params) + "";

    $('<div id="customization_modal" name="customization_modal" class="modal" />').modal("hide");


    $("#customization_modal").remove(); // Making sure that we just have one instance of the modal opened and notleaking
    $(".modal-backdrop").remove(); // Making sure that we just have one instance of the modal opened and notleaking

    $('<div id="customization_modal" name="customization_modal" class="modal" />').append(s).modal('show');
    if(first_child)
    {
        $('#customization_modal .modal-dialog .modal-content .modal-body .form-horizontal ').find('#conditions-content').remove();
    }

    setTimeout(function () {
        // For some error in the code  modal show event is not firing - applying a manual delay before load
        load_values.common(ctrl_type, ctrl_id);
    }, 300);
}

/*
 Export survey groups and questions into JSON object to send it to server
 */
function export_as_json(ref) {
    var survey = [];

    // Get all groups
    groups = $("#selected-content").find('.question-group');

    // Loop on each group
    groups.each(function () {

        // Get group name and is_template option
        group_name = ($(this).find('.group_name_container').text());
        group_description = $(this).find('input[name=group_description]').val();
//            is_template = ($(this).find('input[name=is_template]').val() == 1) ? true : false;

        questions_array = [];

        // Get questions on this group
        questions = $(this).find('[id^=QUS-]');

        // Loop on each question
        questions.each(function () {

            // Get the control of question
            curr_question = $(this).find("[class^='ctrl']");

            var question = {};

            // Get the common featured for each question like type,question text, help string , is required , conditions
            question.question_code = $(this)[0].id;
            question.question_type = $.trim(curr_question[0].className.match("ctrl-.*")[0].split(" ")[0].split("-")[1]);
            question.question_name_en = $(this).find('.control-label').text();
            question.question_help_en = $(this).find('.control-help').attr('title');
            question.is_required = ($(this).find('.control-required').css('display') == 'none') ? false : true;
            question.question_conditions = ($(this).find('.control-conditions').val().length > 0) ? $.parseJSON($(this).find('.control-conditions').val()) : []
            question.question_attributes = {};

            // For each type get specific features
            switch (question.question_type) {
                // For date get date format and question programming name
                case 'date':
                    question.question_attributes.date_format = $(this).find("input[class^='ctrl']")[0].placeholder;
                    question.question_type = 'D';

                    break;

                // For text box get max length and control programming name
                case 'textbox':
                    question.question_attributes.maximum_chars = ($(this).find("input[class^='ctrl']")[0].maxLength > 0) ? $(this).find("input[class^='ctrl']")[0].maxLength : '';
                    question.question_type = 'S';

                    break;

                // For text box get max length and control programming name
                case 'email':
                    question.question_attributes.maximum_chars = ($(this).find("input[class^='ctrl']")[0].maxLength > 0) ? $(this).find("input[class^='ctrl']")[0].maxLength : '';
                    question.question_type = '@';

                    break;

                // For text box get max length and control programming name
                case 'textarea':
                    question.question_attributes.maximum_chars = ($(this).find("[class^='ctrl']")[0].maxLength > 0) ? $(this).find("[class^='ctrl']")[0].maxLength : '';
                    question.question_type = 'T';

                    break;

                // For numeric input get min, max, step values and control programming name
                case 'number':
                    question.question_attributes.min_num_value_n = $(this).find("input[class^='ctrl']")[0].min;
                    question.question_attributes.max_num_value_n = $(this).find("input[class^='ctrl']")[0].max;
                    question.question_attributes.maximum_chars = ($(this).find("input[class^='ctrl']")[0].maxLength > 0) ? $(this).find("input[class^='ctrl']")[0].maxLength : '';
                    question.question_attributes.num_value_int_only = ($(this).find("input[class^='ctrl']")[0].getAttribute('data-integer_only') == 'yes') ? true : false;
                    question.question_type = 'N';

                    break;

                // For radiogroup, checkboxgroup and yesno question get options with programming name
                case 'radiogroup':

                    var ctrls = $(this).find(".ctrl-radiogroup").find("label");

                    var options = {};
                    ctrls.each(function (i, o) {
                        options[$(o).siblings('div').find('input[type=radio]').val()] = $(o).text();
                    });

                    question.options = options;
                    question.question_type = 'L';

                    break;

                case 'array':

                    var options = {};
                    var questions = {};
                    var answers = {};

                    var rows   = $(this).find("table:first > tbody > tr:not(:first) > td:nth-child(2)");
                    var atext   = $(this).find("table:first > tbody > tr:first > td:not(:first)");
                    var qtext   = $(this).find("table:first > tbody > tr > td:first-child").not(':first');

                    // Loop on options to put their text all togather in text area for modification
                    rows.each(function (i, o) {
                        inputs = $(o).find('input[type=radio]');
                        questions[inputs[0].name] = $($(qtext)[i]).text();
                        inputs.each(function(j,k){
                            answers[$(k).val()] = $($(atext)[j]).text();
                        });
                    });

                    options.questions = questions;
                    options.answers = answers;

                    question.options = options;
                    question.question_type = 'F';

                    break;

                case 'checkboxgroup':

                    var ctrls = $(this).find(".ctrl-checkboxgroup").find("label");

                    var options = {};
                    ctrls.each(function (i, o) {
                        options[$(o).siblings('div').find('input[type=checkbox]')[0].name] = $(o).text();
                    });

                    question.options = options;
                    question.question_type = 'M';

                    break;

                case 'yesno':
                    question.question_type = 'Y';

                    break;

                case 'gender':
                    question.question_type = 'G';

                    break;

                case 'audio':
                    question.question_type = '#';

                    break;

                case 'image':
                    question.question_type = '%';

                    break;

                case 'video':
                    question.question_type = 'V';

                    break;

                case 'paragraph':
                    question.question_type = 'X';
                    question.question_name_en = $(this).find('.box-body').find('.control-label').text();
                    break;

                case 'location':
                    question.question_type = '&';
                    question.question_attributes.location_mapservice = 1;

                    break;
            }


            questions_array.push(question);
        });

        var group_template_html = '';

//            if (is_template == 1) {
//                // group_template_html = $(this).clone();
//                // group_template_html.find("input[name=is_template]").val(0);
//                // group_template_html.find(".is_template_icon").css('display','none');
//                $(this).find("input[name=is_template]").val(0);
//                $(this).find(".is_template_icon").css('display', 'none');
//
//                group_template_html = $(this).clone();
//
//            }

        survey.push({
            'group_name_en': group_name,
            'group_description_en': group_description,
//                'is_template': is_template,
//                'template_html': (is_template) ? group_template_html[0].outerHTML : '',
            'questions': questions_array
        });
    });

    var survey_object = {'form_content': survey};

    $("#resultsArea").val(JSON.stringify(survey_object,null,4));
    $('#resultsModal').modal('show');

    return ;
}

function save_template(){
    template_group = $('[id^=question-group-wrap]');


    group_name = template_group.find('.group_name_container').text();
    group_description = template_group.find('input[name=group_description]').val();

    $('#tg_name').val(group_name);
    $('#tg_description').val(group_description);
    $('#tg_html').val($(template_group)[0].outerHTML);

    $('#template_group_form').submit();

    return ;

}

function collapse(element) {
    //Find the box parent
    var box = element.parents(".box").first();
    //Find the body and the footer
    var box_content = box.find("> .box-body, > .box-footer, > form  >.box-body, > form > .box-footer");
    if (!box.hasClass("collapsed-box")) {
        //Convert minus into plus
        if(element.attr('class') != 'box-header'){
            element.children(":first")
                .removeClass('fa-minus')
                .addClass('fa-plus');
        }
        //Hide the content
        box_content.slideUp(500, function () {
            box.addClass("collapsed-box");
        });

    } else {
        //Convert plus into minus
        if(element.attr('class') != 'box-header') {
            element.children(":first")
                .removeClass('fa-plus')
                .addClass('fa-minus');
        }
        //Show the content
        box_content.slideDown(500, function () {
            box.removeClass("collapsed-box");
        });
    }
}

function drop(element) {
    //Find the box parent
    var box = element.parents(".box").first();
    var parent = $(box).parent()
    box.remove();
    if($(parent).hasClass('draggableField')) {
        parent.remove();
    }
}
