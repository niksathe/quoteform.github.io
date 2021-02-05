/*
    Validation logic is handled in ~/Scripts/cdn2life/quote-validation.js
*/
(function ($) {
    /*
    Alcohol Calculator
    */
    var alcoholCalculator = function () {
        $(".units-wrapper a.App1Alc-ulater").click(function (e) {
            var app1Alc = $(".App1NoAlc");
            $(app1Alc).parent().parent().children('p.fld-msg').children('span').empty();
            $(app1Alc).parent().parent().parent().children('span.fld-lbl').removeClass('SetRed');
        });

        $(".App2NoAlc").click(function (e) {
            if ($(this).attr("checked") == "checked") {
                $(".alc2Sumtotal").val("0");
                $(this).parent().parent().children('p.fld-msg').children('span').empty();
                $(this).parent().parent().parent().children('span.fld-lbl').removeClass('SetRed');
            }
        });

        $(".units-wrapper a.App2Alc-ulater").click(function (e) {
            var app1Alc = $(".App2NoAlc");
            $(app1Alc).parent().parent().children('p.fld-msg').children('span').empty();
            $(app1Alc).parent().parent().parent().children('span.fld-lbl').removeClass('SetRed');
        });

        $(".done-btn.App1Alc-ulater, .done-btn.App2Alc-ulater").click(function (e) {
            var inputAlcoholUnits = "";
            var units = "";
            var modalAlculator = "";

            if ($(this).hasClass('App1Alc-ulater') == true) {
                inputAlcoholUnits = '.qp_alcoholicdrinks' + '.min.alc1Sumtotal';
                units = ".App1Alculater span.total-units strong";
                modalAlculator = ".modal--alcohol-calc.modal--text-link.App1Alculater";
            }
            else if ($(this).hasClass('App2Alc-ulater') == true) {
                inputAlcoholUnits = '.qp_alcoholicdrinks' + '.min.alc2Sumtotal';
                units = ".App2Alculater span.total-units strong";
                modalAlculator = ".modal--alcohol-calc.modal--text-link.App2Alculater";
            }

            var totalUnits = parseInt($(units).text(), 10);
            $(inputAlcoholUnits).val(totalUnits);
            $(modalAlculator).hide();
            $(".modal-dimmer").hide();
            $(inputAlcoholUnits).focus();

            return false;
        });

        $('input.alc1Sumtotal, input.alc2Sumtotal').bind('blur', function () {

            var selectedAlcoholVal = jQuery.trim($(this).val());
            var spanName = $(this).attr("name");

            $("span#" + spanName + "-1").hide();
            $(this).removeClass("error");
            if ($(this).hasClass("alc1Sumtotal")) {
                
                $("span#alcohol-1-1").hide();
            }
            if ($(this).hasClass("alc2Sumtotal")) {
                
                $("span#alcohol-2-1").hide();
            }


            if (parseInt(selectedAlcoholVal) < 0 || parseInt(selectedAlcoholVal) > 99 || isNaN(parseInt(selectedAlcoholVal))) {
                if (isNaN(parseFloat(selectedAlcoholVal))) {
                    $(this).addClass("error");
                    $("span#" + spanName + "-1").show();
                    if ($(this).hasClass("alc1Sumtotal")) {
                        $("span#alcohol-1-1").show();
                    }
                    if ($(this).hasClass("alc2Sumtotal")) {
                        $("span#alcohol-2-1").show();
                    }
                }
            }
        });
        $('p.tooltip.cic i[title="Help"]').attr("title", "Critical Illness Cover");
    }

    /*
    Alcohol Units Calculator
    */
    var unitsCalculator = function () {
        $('.alcohol').each(function () {
            var alcoholSet = this,
                $totalUnitsWrap = $(alcoholSet).find('.total-units'),           // The span which wraps the calulated total - show when has a value
                $totalUnits = $totalUnitsWrap.children('strong'),               // The value in bold within the above wrapper
                $totalUnitsValue = $(alcoholSet).find('.total-units-value'),    // A hidden field which holds the accumnulated total value
                $noUnitsCheck = $(alcoholSet).find('.no-units-check'),          // Check box now moribund
                $unitSelectText = $(alcoholSet).find('.unit-select input[type=number]'),
                $unitSelectInput = $(alcoholSet).find('.unit-select input');

            if (parseInt($totalUnitsValue.val()) === 0) {                       //if the page has loaded with 0 value in hidden field, then hide the 'total' text
                $totalUnitsWrap.hide();
            }

            $unitSelectInput.each(function () {

                $(this).blur(function () {
                    var $this = $(this),
                        thisVal = $this.val(),
                        totalUnitsVal = 0;

                    thisVal = parseFloat(thisVal);

                    if (isNaN(thisVal)) {                
                        $this.val('');
                        $this.parent().addClass('error');
                    }
                    else {
                        $this.parent().removeClass('error');
                    }

                    $unitSelectText.each(function () {
                        var thisInputVal = this.value;
                        var parentClass = $(this).parent().attr('class'); // parent label

                        switch (parentClass) {
                            //strong/premium beer or cider 3 units
                            case "fld beer-strong":
                                thisInputVal = thisInputVal * 3;
                                break;

                            //pint of ordinary strength beer 2 units, 
                            case "fld beer-weak":
                                thisInputVal = thisInputVal * 2;
                                break;

                            //A glass of wine (175ml) is 2 units, 
                            case "fld wine":
                                thisInputVal = thisInputVal * (1.42858 * 2);
                                break;

                            //single pub measure of spirit, sherry, port or any other drink 1 unit.
                            case "fld spirits":
                               thisInputVal = thisInputVal * 1.5;
                                break;

                            default:

                        }

                        thisInputVal = parseFloat(thisInputVal);    
                        if (isNaN(thisInputVal)) {
                            thisInputVal = 0;
                        }
                        totalUnitsVal = totalUnitsVal + thisInputVal;
                        totalUnitsVal = Math.ceil((totalUnitsVal * 10) / 10);    //round to one decimal place

                        return totalUnitsVal;
                    });

                    $totalUnits.text(totalUnitsVal);
                    $totalUnitsValue.val(totalUnitsVal);

                    if (totalUnitsVal !== 0) {      // if the total units are > 0 then uncheck the 'dont drink' checkbox
                        $noUnitsCheck.prop('checked', false);
                        $totalUnitsWrap.show();
                    }

                });
            });
        });
    }

    $(document).ready(function () {
        //$("div.input-with-suffix input[data-qp-target-field]").each(function (index, domEle) {

        //    // Add a change event trap which will copy the value into the target QP field
        //    $(this).change(function (e) {
        //        e.preventDefault();
        //        var target = $(this).attr("data-qp-target-field");  // Get the Q+ target field from an attribute value
        //        var newValue = $(this).val();                       // Get the value of this element
        //        $(target).val(newValue);                            // copy to Q+ field
        //    });
        //});

        // Inject the Alcoholcalculator into the correct Q+ question
        //$(QPAlcAnswer).parent().toggleClass("alcohol");

        // Hide the Q+ smoking question; we're going to use our own data entry fields
        $("span.fld-lbl:contains('Smoking History?')").parent().hide();

        // Hide the Q+ submit button, as we'll be doing this programtically
        $(".QPResultSetSubmitContainer").hide();

        if (typeof QPAlcQuestion !== "undefined") {
            // TEMPORARY - Set the correct classes; should really be done by Q+ using Question Attributes.
            $("." + QPAlcQuestion).toggleClass("min");
            //$("." +QPHeightQuestion, "."+QPWeightQuestion).toggleClass("medium");

            // EditorFor isn't adding this properly
            $("#Applicant1_PostCode, #Applicant2_PostCode").attr("maxlength", "10");
            $("#Applicant1_PostCode, #Applicant2_PostCode").addClass("medium");

            //$(".App1Answers.Answer" + QPAlcoholQuestionNumber + " .unit-calc-btn").addClass("App1Alc-ulater-btn");
            //$(".App2Answers.Answer" + QPAlcoholQuestionNumber + " .unit-calc-btn").addClass("App2Alc-ulater-btn");

            $(".App1Answers ." + QPAlcQuestion).addClass("alc1Sumtotal");
            $(".App2Answers ." + QPAlcQuestion).addClass("alc2Sumtotal");

            $(".App1Answers .done-btn").addClass("App1Alc-ulater");
            $(".App2Answers .done-btn").addClass("App2Alc-ulater");

            $(".App1Answers .radio.no-units-check").addClass("App1NoAlc");
            $(".App2Answers .radio.no-units-check").addClass("App2NoAlc");

            alcoholCalculator();
            unitsCalculator();
            Modernizr.load([{ load: ["/Scripts/cdn2life/v1.0/life.min.js"] }]);
        }



        
    });
})(jQuery);

