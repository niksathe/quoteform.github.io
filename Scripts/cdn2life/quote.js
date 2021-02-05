(function($) {
    /*****************************************************************
      Core Quote page validate function
    *****************************************************************/

    var ddmAccount = "";
    var ddmSortCode = "";
    var App1JourneyEnded = false;
    var App2JourneyEnded = false;
    
    //*** *********************************
    var app1Section1ID = "Section_1_App1"; 
    var app1Section2ID = "Section_2_App1"; 
    var app1Section3ID = "Section_3_App1"; 
    var app1Section4ID = "Section_4_App1"; 
    var app2Section2ID = "Section_2_App2"; 
    var app2Section3ID = "Section_3_App2"; 
    var app2Section4ID = "Section_4_App2"; 

    var isCancel = 0;

    var ValidateQuote = function() {

        // Sort out the smoker statuses for both applicants
        var isValid = validateSmokerStatus(1);
        if ($(".jointPolicySet").is(":visible") && ($('.jointPolicyYes').prop('checked') === true)) {
            if (isValid == false) {
                validateSmokerStatus(2);
            } else {
                isValid = validateSmokerStatus(2);
            }
        }
        if (isValid == false) {
            validateApplicant(1);
        } else {
            isValid = validateApplicant(1);
        }
        if ($(".jointPolicySet").is(":visible") && ($("input[name=JointPolicy]:checked").val() == 2)) {
            if (isValid == false) {
                validateApplicant(2);
            } else {
                isValid = validateApplicant(2);
            }
        }
        
        // Validate the Policy details
        // Policy details automatically set focus on error. Applicant errors do not do this so we must set focus as appropriate.
        if (isValid == false) {
            var HasValidPolicy = true;
            HasValidPolicy = validatePolicyDetails();
            if (HasValidPolicy) {

                // No errors on the main form - so lets get the 1st Q+ error
                var firstError = $('fieldset.box-blue .SetRed').first();
                // Get the parent row.
                // Then find the div with the input/select. 
                var divfld = $(firstError).parent('.form-row').children(".fld");
                //This is where the input/select field resides.
                // Set focus on this.
                $(divfld).find("input[id^='Applicant'], select[id^='Applicant']").focus();
            }
        } else {
            isValid = validatePolicyDetails();
        }

        if ($('#ExplicitConsentAgreement').prop('checked') === true) {
            $('#Applicant1_ExplicitConsent').val("Yes");
            $("#lblExplicitConsent").addClass("smallprint");
            $("#lblExplicitConsent").removeClass("SetRed");
        } else {
            $("#lblExplicitConsent").addClass("SetRed");
            $("#lblExplicitConsent").removeClass("smallprint");

            // iPad ignores JQuery focus()
            if (isApple()) {
                $('html, body').animate({
                        scrollTop: $('#ExplicitConsentAgreement').offset().top
                    },
                    0);
            } else {
                $("#ExplicitConsentAgreement").focus();

            }
            isValid = false;
        }

        // Validate the Q+ Questions
        if (isValid) {
            isValid = IsQuotePlusValid(1);
            if ($(".jointPolicySet").is(":visible") && ($("input[name=JointPolicy]:checked").val() == 2)) {
                if (isValid) {
                    isValid = IsQuotePlusValid(2);
                } else {
                    IsQuotePlusValid(2);
                }
            }
        } else {
            IsQuotePlusValid(1);
            if ($(".jointPolicySet").is(":visible") && ($("input[name=JointPolicy]:checked").val() == 2))
                IsQuotePlusValid(2);
        }
        return isValid;
    }

    //*****************************************************************
    //   Smoking status validate function
    //*****************************************************************
    var validateSmokerStatus = function(AppNum) {

        var IsValid = true;
        $("input[name='Applicant" + AppNum + ".SmokerStatus']").removeClass("error");
        $("input[id$='Applicant" + AppNum + "_SmokerStatus']").removeClass("error");
        $("input[name='Applicant" + AppNum + ".SmokerStatus']").parent(".form-row.form-row--horizontal")
            .children("span").removeClass("error2");

        $("#Applicant" + AppNum + "_YearsSinceSmoked").removeClass("error");
        $("#Applicant" + AppNum + "_DailySmokingAmount").removeClass("error");
        $("#Applicant" + AppNum + "_DailySmokingAmount").parent().siblings('label')
            .removeClass("field-validation-error");


        $("input[name='Applicant" + AppNum + ".IsYearsSinceSmoked']:checked").parents('label').removeClass("error");
        $("#Applicant" + AppNum + "_YearsSinceSmoked").parents('.form-row.form-row--vertical').find("label")
            .removeClass("field-validation-error");
        $("input[name='Applicant" + AppNum + ".SmokerStatus']").parents('.form-row.form-row--vertical').find("label")
            .removeClass("error");

        var smokerStatus = $("input[name='Applicant" + AppNum + ".SmokerStatus']:checked").val();

        // Ex-smoker
        // Gave up < 12 months ago - has a value of 0 or 
        // Gave up x years ago - has a value of 1 (see next comment for x definition)
        var IsYearsSince = $("input[name='Applicant" + AppNum + ".IsYearsSinceSmoked']:checked").val();

        // The x in Gave up x years ago
        var YearsSince = $("#Applicant" + AppNum + "_YearsSinceSmoked").val();

        // This value is used when Current smoker or Ex smoker (Gave up < 12 months ago)
        var DailyAmount = $("#Applicant" + AppNum + "_DailySmokingAmount").val();

        // Remove leading 0's
        if (YearsSince.substr(0, 1) == "0" && YearsSince.length > 1) {
            YearsSince = YearsSince.substr(1, 1);
            $("#Applicant" + AppNum + "_YearsSinceSmoked").val(YearsSince);
        }

        if (DailyAmount.substr(0, 1) == "0" && DailyAmount.length > 1) {
            DailyAmount = DailyAmount.substr(1, 1);
            $("#Applicant" + AppNum + "_DailySmokingAmount").val(DailyAmount);
        }

        if (YearsSince.length > 0)
            if (isNaN(YearsSince) || YearsSince.indexOf(".") >= 0 || YearsSince.indexOf(",") >= 0) {
                IsValid = false;
                $("#Applicant" + AppNum + "_YearsSinceSmoked").addClass("error");
                $("input[name='Applicant" + AppNum + ".IsYearsSinceSmoked']:checked")
                    .parent(".form-row.form-row--horizontal").children("span").addClass("field-validation-error");
                $("#Applicant" + AppNum + "_YearsSinceSmoked").parent().siblings('label')
                    .addClass("field-validation-error");
            }

        if (DailyAmount.length > 0)
            if (isNaN(DailyAmount) || DailyAmount.indexOf(".") >= 0 || DailyAmount.indexOf(",") >= 0) {
                IsValid = false;
                $("#Applicant" + AppNum + "_DailySmokingAmount").addClass("error");
                $("#Applicant" + AppNum + "_DailySmokingAmount").parent().siblings('label')
                    .addClass("field-validation-error");
            }

        if (IsValid) {
            if (!(smokerStatus === "1" || smokerStatus === "2" || smokerStatus === "3")) {
                IsValid = false;
                $("input[name='Applicant" + AppNum + ".SmokerStatus']").addClass("error");
                $("input[name='Applicant" + AppNum + ".SmokerStatus']").parent(".form-row.form-row--horizontal")
                    .children("span").addClass("error2");
            }

            if (smokerStatus === "2" || smokerStatus === "3") {
                if (IsYearsSince === "1") {
                    // Years since must be greater than
                    if (parseInt(YearsSince) <= 0 || YearsSince.length === 0) {
                        IsValid = false;
                        $("#Applicant" + AppNum + "_YearsSinceSmoked").addClass("error");
                        $("input[name='Applicant" + AppNum + ".IsYearsSinceSmoked']:checked")
                            .parent(".form-row.form-row--horizontal").children("span")
                            .addClass("field-validation-error");
                        $("#Applicant" + AppNum + "_YearsSinceSmoked").parent().siblings('label')
                            .addClass("field-validation-error");
                    }
                }

                if (parseInt(DailyAmount) <= 0 || DailyAmount.length === 0) {
                    IsValid = false;
                    $("#Applicant" + AppNum + "_DailySmokingAmount").addClass("error");
                    $("#Applicant" + AppNum + "_DailySmokingAmount").parent().siblings('label')
                        .addClass("field-validation-error");
                }
            }
        }
        return IsValid;
    }

    var UpdateQPErrors = function() {
        $(
                "div.extra-questions label[for*='Applicant1_QuestionSet'], div.extra-questions label[for*='Applicant2_QuestionSet']")
            .click(function() {
                $(this).parent().siblings('div.fld-msg.qp-error').hide();
            });
    }

    var app1QuotePlusTaggingEvents = function() {
        //var app1ClickOnce = 0;

        $("input[id*='Applicant1_QuestionSet_'][id$='__AnswerValue_0'], input[id*='Applicant1_QuestionSet_'][id$='__AnswerValue_1']").click(function () {


            var id = $(this).attr("id");
            var qsNumber = id.substr(23, 2);
            var lastChar = id[id.length - 1];
            var storeVal = (lastChar === "0" ? "No" : "Yes");

            switch (qsNumber) {
                case "13":
                    window.dataLayer.push({ 'event': 'Medical_Last_2_Years_You_Click', 'Medical_Last_2_Years_You_Value': storeVal });
                    break;
                case "14":
                    window.dataLayer.push({ 'event': 'Medical_Last_2_Years_Family_Click', 'Medical_Last_2_Years_Family_Value': storeVal });
                    break;
                case "15":
                    window.dataLayer.push({ 'event': 'Medical_Have_You_Ever_Click', 'Medical_Have_you_Ever_Value': storeVal });
                    break;
                case "16":
                    window.dataLayer.push({ 'event': 'Medical_Last_5_Years_Click', 'Medical_Last_5_Years_Value': storeVal });
                    break;
                case "17":
                    window.dataLayer.push({ 'event': 'Medical_Last_3_Months_Click', 'Medical_Last_3_Months_Value': storeVal });
                    break;
                case "18":
                    window.dataLayer.push({ 'event': 'Medical_Regular_Activities_Click', 'Medical_Regular_Activities_Value': storeVal });
                    break;
                case "19":
                    window.dataLayer.push({ 'event': 'Medical_Last_2_Years_90_Days_Click', 'Medical_Last_2_Years_90_Days_Value': storeVal });
                    break;
                case "20":
                    window.dataLayer.push({ 'event': 'Medical_Next_2_Years_30_Days_Click', 'Medical_Next_2_Years_30_Days_Value': storeVal });
                    break;
                case "21":
                    window.dataLayer.push({ 'event': 'Medical_Heights_Over_Click', 'Medical_Heights_Over_Value': storeVal });
                    break;
                case "22":
                    window.dataLayer.push({ 'event': 'Medical_Last_5_Years_Driving_Click', 'Medical_Last_5_Years_Driving_Value': storeVal });
                    break;
                case "23":
                    window.dataLayer.push({ 'event': 'Medical_Recreational_Drugs_Click', 'Medical_Recreational_Drugs_Value': storeVal });
                    break;
                case "24":
                    window.dataLayer.push({ 'event': 'Medical_Alcohol_Intake_Click', 'Medical_Alcohol_Intake_Value': storeVal });
                    break;
                default:
            }


            //if (app1ClickOnce === 0) {



            //    app1ClickOnce++;
            //} else {
            //    app1ClickOnce = 0;
            //}

        });


    };

    var app2QuotePlusTaggingEvents = function() {

        //var app2ClickOnce = 0;

        $("input[id*='Applicant2_QuestionSet_'][id$='__AnswerValue_0'], input[id*='Applicant2_QuestionSet_'][id$='__AnswerValue_1']").click(function () {

            var id = $(this).attr("id");
            var qsNumber = id.substr(23, 2);
            var lastChar = id[id.length - 1];
            var storeVal = (lastChar === "0" ? "No" : "Yes");

            switch (qsNumber) {
                case "13":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_2_Years_You_Click', 'Applicant_2_Medical_Last_2_Years_You_Value': storeVal });
                    break;
                case "14":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_2_Years_Family_Click', 'Applicant_2_Medical_Last_2_Years_Family_Value': storeVal });
                    break;
                case "15":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Have_You_Ever_Click', 'Applicant_2_Medical_Have_you_Ever_Value': storeVal });
                    break;
                case "16":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_5_Years_Click', 'Applicant_2_Medical_Last_5_Years_Value': storeVal });
                    break;
                case "17":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_3_Months_Click', 'Applicant_2_Medical_Last_3_Months_Value': storeVal });
                    break;
                case "18":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Regular_Activities_Click', 'Applicant_2_Medical_Regular_Activities_Value': storeVal });
                    break;
                case "19":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_2_Years_90_Days_Click', 'Applicant_2_Medical_Last_2_Years_90_Days_Value': storeVal });
                    break;
                case "20":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Next_2_Years_30_Days_Click', 'Applicant_2_Medical_Next_2_Years_30_Days_Value': storeVal });
                    break;
                case "21":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Heights_Over_Click', 'Applicant_2_Medical_Heights_Over_Value': storeVal });
                    break;
                case "22":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Last_5_Years_Driving_Click', 'Applicant_2_Medical_Last_5_Years_Driving_Value': storeVal });
                    break;
                case "23":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Recreational_Drugs_Click', 'Applicant_2_Medical_Recreational_Drugs_Value': storeVal });
                    break;
                case "24":
                    window.dataLayer.push({ 'event': 'Applicant_2_Medical_Alcohol_Intake_Click', 'Applicant_2_Medical_Alcohol_Intake_Value': storeVal });
                    break;
                default:
            }

            //if (app2ClickOnce === 0) {


            //    app2ClickOnce++;

            //} else {
            //    app2ClickOnce = 0;
            //}

        });
    };

    
    var IsQuotePlusValid = function(AppNum) {
        var isQPValid = true;
        var names = "";

        // Get each Hidden value
        // Get each Question AnswerValue - these are input fields of type hidden. Sample id = Applicant1_QuestionSet_11__AnswerValue
        $("input[type=hidden][id*='Applicant" + AppNum + "_QuestionSet'][id$='AnswerValue']").each(function() {
            // Take the name of this field and use it to get the assocaited radio buttons - but only the one which is selected.
            // if there are none checked then this needs to be flagged.
            var thisId = $(this).attr("id");
            $(this).removeClass("error");
            $(this).siblings(".input-group__item").children("input[type=radio]").removeClass("error");

            if (thisId.indexOf("AnswerValue") > 0 && $(this).attr("value") === "") {
                var name = $(this).attr("name");
                // These relate to QuestionID's: 3 (SumAssured), 5 (BMI), 9 (Alcohol), 11 (Is Smoker)
                // App1: QuestionSet[2] = QID 3, QuestionSet[4] = QID 11, QuestionSet[4] = QPID 5, QuestionSet[9] = QPID 9
                // App2: QuestionSet[0] = QPID 11, QuestionSet[3] = QPID 3, QuestionSet[5] = QPID 5, QuestionSet[9] = QPID 9
                if ((!(name === "Applicant1.QuestionSet[2].AnswerValue" ||
                        name === "Applicant1.QuestionSet[4].AnswerValue" ||
                        name === "Applicant1.QuestionSet[5].AnswerValue" ||
                        name === "Applicant1.QuestionSet[9].AnswerValue" ||
                        name === "") &&
                    !(name === "Applicant2.QuestionSet[0].AnswerValue" ||
                        name === "Applicant2.QuestionSet[3].AnswerValue" ||
                        name === "Applicant2.QuestionSet[5].AnswerValue" ||
                        name === "Applicant2.QuestionSet[9].AnswerValue" ||
                        name === ""))) {

                    //Then the check to see if the input button (radio) has been checked is extended to also see if that section is visible
                    //So if the section is visible but one or more buttons within that section hasn't been checked, add that buttom to the array of buttons that aren't valid
                    var IsChecked =
                        ($(this).siblings(".input-group__item").children("input[type=radio]:checked").length > 0);
                    var IsVisible =
                        ($(this).siblings(".input-group__item").children("input[type=radio]:visible").length > 0);

                    if (!IsChecked && IsVisible) {
                        isQPValid = false;
                        $("span[for='" + name + "']").show();
                        names += (name == "" ? name : "|" + name);
                        $(this).siblings(".input-group__item").children("input[type=radio]").addClass("error");
                    }
                }
            }
        });


        $("input[type=number][id*='Applicant" + AppNum + "_QuestionSet'][id$='AnswerValue']").each(function() {

            // We should be looking at the new trouser/skirt size questions as well as the final question for Total amount of life cover
            if (!$(this).hasClass("alc" + AppNum + "Sumtotal")) {
                $(this).removeClass("error");
            }
            var name = $(this).attr("name");
            var isTotalAmount = ($(this).attr("class").indexOf("qp_totalcover") >= 0);

            // Is the value empty?
            // Is the question visible?
            // Ignore the alcohol question - it's dealt with elsewhere
            if ($(this).val() === "" &&
                $(this).is(":visible") &&
                name !== "Applicant1.QuestionSet[10].AnswerValue") {
                isQPValid = false;
                $("span[for='" + name + "']").show();
                names += (name == "" ? name : "|" + name);
                $(this).addClass("error");
            } else if (isTotalAmount && $(this).is(":visible")) {

                $("span#TotalAmount-" + appNumber + "-3").hide();
                var answerVal = $(this).val().replace(",", "");
                var sumAssuredVal = $("#SumAssured").val().replace(",", "");
                var appNumber = ($(this).attr("id").indexOf("Applicant1") === 0 ? 1 : 2);

                if (parseInt(answerVal) < parseInt(sumAssuredVal)) {
                    $(this).addClass("error");
                    isQPValid = false;
                    $("span#TotalAmount-" + appNumber + "-3").show();
                }
            }

            if ($(this).attr("class").indexOf("TrouserQuestion") >= 0) {
                if ($(this).val().length === 1) {
                    isQPValid = false;
                    $(this).addClass("error");
                    $("span[id='Trouser-1-1']").show();
                }
            }

        });


        if (names.length > 0) {
            var nameArray = names.split("|");
            // Doing this in the a loop above causes a synchronous XMLHttpRequest which it can't handle and so it then bombs out.
            $.each(nameArray,
                function(index, value) {
                    $("span[for='" + value + "']").show();
                });
        }
        return isQPValid;
    }

    $("input.qp_totalcover").blur(function () {
        var sumAssured = $("#SumAssured").val();

        if ($(this).val() >= sumAssured) {
            $(this).removeClass("error");
            $(this).parent().parent().siblings("div.fld-msg").children("span").children("span").hide();
        } else {
            $(this).addClass("error");
            $(this).parent().parent().siblings("div.fld-msg").children("span").children("span").show();
        }

    });


    // Errors have already been detected these can now be flagged up appropriately
    var SetQuoteErrorFocus = function(isMobile) {
        var focus;
        var checkForZero = false;
        //
        //**********************************************************************
        //***********         Your Policy Details Section      *****************
        //**********************************************************************
        var inputGroup = $("fieldset.bordered-section").not(".hasqplus");
        var inputGroup1 = inputGroup.find(".error").not("input[type='hidden']");

        //**********************************************************************
        //*******************         Applicant 1      *************************
        //**********************************************************************
        // About You
        var inputApp1Group2 = $("fieldset.singlePolicySet span.field-validation-error[style!='display: none;']")
            .not('[style="DISPLAY: none"]');

        // LifeStyle - Smoker
        var inputApp1Group3 = $("input[name='Applicant1.SmokerStatus']").parent(".form-row.form-row--horizontal")
            .children("span.error2");

        // LifeStyle - Smoker subset
        var inputApp1Group3a = $("label.field-validation-error[for='Applicant1_DailySmokingAmount']");
        var inputApp1Group3ai = $("#Applicant1_DailySmokingAmount.error");

        var inputApp1Group3b = $("label.field-validation-error[for='Applicant1_YearsSinceSmoked']");
        var inputApp1Group3bi = $("#Applicant1_YearsSinceSmoked.error");


        // Lifestyle - Alcohol
        inputGroup = $("fieldset.singlePolicySet.AppAnswers div.form-row").not(".display-none");
        var inputApp1Group4 = $("#alcohol-1-1.field-validation-error[style!='display:none'][style!='display: none;']")
            .not('[style="DISPLAY: none"]');

        // Lifestyle - Get the first App1 Q+ error
        var inputApp1Group5a = inputGroup.find("div.fld-msg.qp-error[style!='display: none;']")
            .not('[style="DISPLAY: none"]').not(".App1Alculater").first();
        var inputApp1Group5b = inputGroup.find("span.qp-error[style!='display:none;']").not('[style="DISPLAY: none"]')
            .not(".App1Alculater").first();


        //**********************************************************************
        //*******************         Applicant 2      *************************
        //**********************************************************************
        // About You
        var inputApp2Group2 = $("fieldset.jointPolicySet span.field-validation-error[style!='display: none;']")
            .not('[style="DISPLAY: none"]');

        // LifeStyle - Smoker
        var inputApp2Group3 = $("input[name='Applicant2.SmokerStatus']").parent(".form-row.form-row--horizontal")
            .children("span.error2");

        // LifeStyle - Smoker subset
        var inputApp2Group3a = $("label.field-validation-error[for='Applicant2_DailySmokingAmount']");
        var inputApp2Group3ai = $("#Applicant2_DailySmokingAmount.error");

        var inputApp2Group3b = $("label.field-validation-error[for='Applicant2_YearsSinceSmoked']");
        var inputApp2Group3bi = $("#Applicant2_YearsSinceSmoked.error");

        // Lifestyle - Alcohol
        inputGroup = $("fieldset.jointPolicySet.AppAnswers div.form-row").not(".display-none");
        var inputApp2Group4 = $("#alcohol-2-1.field-validation-error[style!='display:none'][style!='display: none;']")
            .not('[style="DISPLAY: none"]');

        // Lifestyle - Get the first App1 Q+ error
        var inputApp2Group5a = inputGroup.find("div.fld-msg.qp-error[style!='display: none;']")
            .not('[style="DISPLAY: none"]').not(".App2Alculater").first();
        var inputApp2Group5b = inputGroup.find("span.qp-error[style!='display:none;']").not('[style="DISPLAY: none"]')
            .not(".App2Alculater").first();

        // Set Focus on uppermost error
        if (inputGroup1.length > 0) {
            focus = inputGroup1.first();
            checkForZero = (focus.attr("id") === "SumAssured");
        }
        //**********************************************************************
        // Applicant 1
        //**********************************************************************
        else if ((inputApp1Group2.length > 0) &&
            (inputApp1Group2.parent(".input-group").children("div.input-group__item").children("input").length > 0)) {
            // App 1 Title
            focus = inputApp1Group2.parent(".input-group").children("div.input-group__item").children("input").first();
        } else if ((inputApp1Group2.length > 0) &&
            (inputApp1Group2.parent(".form-row, .input-group").children(".error").length > 0)) {
            // App 1 The rest bar H&W
            focus = inputApp1Group2.parent(".form-row, .input-group").children(".error").first();
        } else if ((inputApp1Group2.length > 0) &&
            (inputApp1Group2.parent(".input-group").children().children().children(".error").length > 0)) {
            //  App 1 H&W - Height & Weight
            focus = inputApp1Group2.parent(".input-group").children().children().children(".error").first();
        } else if (inputApp1Group3.length > 0) {
            //  App 1 Lifestyle - Smoker
            focus = inputApp1Group3.parent().children(".input-group").children().children("input").first();
        } else if (inputApp1Group3a.length > 0 && inputApp1Group3ai.length > 0) {
            focus = inputApp1Group3ai;
            checkForZero = true;
        } else if (inputApp1Group3b.length > 0 && inputApp1Group3bi.length > 0) {
            focus = inputApp1Group3bi;
            checkForZero = true;
        } else if (inputApp1Group4.length > 0) {
            focus = $("input.alc1Sumtotal");
        } else if (inputApp1Group5a.length > 0 && inputApp1Group5b.length > 0) {
            //  App 1 Lifestyle - Q+
            focus = inputApp1Group5a.prev().children("input");
        }
        //**********************************************************************
        // Applicant 2
        //**********************************************************************
        else if ((inputApp2Group2.length > 0) &&
            (inputApp2Group2.parent(".input-group").children("div.input-group__item").children("input").length > 0)) {
            //  App 2 Title
            focus = inputApp2Group2.parent(".input-group").children("div.input-group__item").children("input").first();
        } else if ((inputApp2Group2.length > 0) &&
            (inputApp2Group2.parent(".form-row, .input-group").children(".error").length > 0)) {
            // App 2 The rest bar H&W
            focus = inputApp2Group2.parent(".form-row, .input-group").children(".error").first();
        } else if ((inputApp2Group2.length > 0) &&
            (inputApp2Group2.parent(".input-group").children().children().children(".error").length > 0)) {
            // App 2 H&W - Height & Weight
            focus = inputApp2Group2.parent(".input-group").children().children().children(".error").first();
        } else if (inputApp2Group3.length > 0) {
            // App 2 Lifestyle - Smoker
            focus = inputApp2Group3.parent().children(".input-group").children().children("input").first();
        } else if (inputApp2Group3a.length > 0 && inputApp2Group3ai.length > 0) {
            focus = inputApp2Group3ai;
            checkForZero = true;
        } else if (inputApp2Group3b.length > 0 && inputApp2Group3bi.length > 0) {
            focus = inputApp2Group3bi;
            checkForZero = true;
        } else if (inputApp2Group4.length > 0) {
            focus = $("input.alc2Sumtotal");
        } else if (inputApp2Group5a.length > 0 && inputApp2Group5b.length > 0) {
            // App 2 Lifestyle - Q+
            focus = inputApp2Group5a.prev().children("input").focus();
        }

        if (focus != null) {
            if (isMobile == true) {
                $('html, body').animate({ scrollTop: focus.offset().top }, 0);
            } else {
                focus.focus();
            }
            if (checkForZero) {
                var txtVal = jQuery.trim(focus.val().replace(/\,/g, ""));
                if (txtVal == "0")
                    $(focus).val("");
            }
        }
    }

    var isValidRange = function(val, min, max) {
        return (parseInt(val, 0) >= parseInt(min, 0) && parseInt(val, 0) <= parseInt(max, 0));
    }

    // CheckNum
    var CheckNum = function(value) {
        if (!$.isNumeric(value)) {
            return false;
        }

        // No value entered in the Nectar card field (not acceptable, mandatory)
        if (value.length <= 8) {
            return false;
        }

        // Invalid number of characters entered in Nectar card field
        if (value.length != 19) {
            return false;
        }

        // Perform checksum
        var digits = new Array(value.length);
        for (var i = 0; i < value.length; i++) {
            digits[i] = value[i] - '0';
        }

        var sum = 0;
        var alt = true;
        for (var i = digits.length - 2; i >= 0; i--) {
            if (alt) {
                digits[i] *= 2;

                if (digits[i] > 9) {
                    digits[i] -= 9;
                }
            }
            sum += digits[i];
            alt = !alt;
        }

        var mod = sum % 10;

        if (mod == 0 && digits[digits.length - 1] == 0) {
            return true;
        }

        if (10 - mod == digits[digits.length - 1]) {
            return true;
        }
        return false;
    }

    var validateApplicant = function(AppNum) {

        var IsValid = true;

        //remove the error class
        $("[id^='Applicant" + AppNum + "_AppTitle']").removeClass("error");
        $("span[id='Applicant" + AppNum + ".AppTitle']").hide();

        $("#Applicant" + AppNum + "_Forename").removeClass("error");
        $("span[id='Applicant" + AppNum + ".Forename']").hide();
        $("#Applicant" + AppNum + "_Surname").removeClass("error");
        $("span[id='Applicant" + AppNum + ".Surname']").hide();

        $("#Applicant" + AppNum + "_DOBDD").removeClass("error");
        $("#Applicant" + AppNum + "_DOBMM").removeClass("error");
        $("#Applicant" + AppNum + "_DOBYYYY").removeClass("error");
        $("span[id='Applicant" + AppNum + ".DOBDD']").hide();

        $("#Applicant" + AppNum + "_PostCode").removeClass("error");
        $("span[id*='Applicant" + AppNum + "'][id$='PostCode']").hide();

        $("#Applicant" + AppNum + "_Email").removeClass("error");
        $("span[id*='Applicant" + AppNum + "'][id$='Email']").hide();

        $("#Applicant" + AppNum + "_PhoneHome").removeClass("error");
        $("span[id*='Applicant" + AppNum + "'][id$='PhoneHome']").hide();

        // Title
        if ($("input[id*='Applicant" + AppNum + "_AppTitle']").is(":checked")) {
            var titleVal = $("input[name='Applicant" + AppNum + ".AppTitle']:checked").val();
            $("#Applicant" + AppNum + "_AppTitle").val(titleVal);
        } else {
            IsValid = false;
            $("span[id='Applicant" + AppNum + ".AppTitle']").show();
            $("input[id*='Applicant" + AppNum + "_AppTitle']").addClass("error");
        }

        // Forename
        var foreName = jQuery.trim($("#Applicant" + AppNum + "_Forename").val());
        if (foreName.length < 2) {
            // Empty text box
            IsValid = false;
            $("#Applicant" + AppNum + "_Forename").addClass("error");
            $("span[id='Applicant" + AppNum + ".Forename']").show();
        } else {
            var matches = foreName.match(/\d+/g);
            if (matches != null) {
                IsValid = false;
                $("#Applicant" + AppNum + "_Forename").addClass("error");
                $("span[id='Applicant" + AppNum + ".Forename']").show();
            }
        }

        // Surname
        var surName = jQuery.trim($("#Applicant" + AppNum + "_Surname").val());
        if (surName.length < 2) {
            // Empty text box
            IsValid = false;
            $("#Applicant" + AppNum + "_Surname").addClass("error");
            $("span[id='Applicant" + AppNum + ".Surname']").show();
        } else {
            var matches = surName.match(/\d+/g);
            if (matches != null) {
                IsValid = false;
                $("#Applicant" + AppNum + "_Surname").addClass("error");
                $("span[id='Applicant" + AppNum + ".Surname']").show();
            }
        }

        /*********************************** 
          Date of Birth - drop down lists
        ***********************************/
        // Year
        var selectedYYYYVal = $("#Applicant" + AppNum + "_DOBYYYY option:selected").val();

        if (selectedYYYYVal == "0") {
            IsValid = false;
            dobSelected = false;
            $("#Applicant" + AppNum + "_DOBYYYY").addClass("error");
        }


        // Month
        var selectedMMVal = $("#Applicant" + AppNum + "_DOBMM option:selected").val();

        if (selectedMMVal == "0") {
            IsValid = false;
            dobSelected = false;
            $("#Applicant" + AppNum + "_DOBMM").addClass("error");
        }

        // Day
        var selectedDDVal = $("#Applicant" + AppNum + "_DOBDD option:selected").val();
        var maxDDValue = maxDDinMonth(selectedMMVal, selectedYYYYVal);
        var dobSelected = true;

        if (selectedDDVal == "0" || !isValidRange(selectedDDVal, "1", maxDDValue)) {
            IsValid = false;
            dobSelected = false;
            $("#Applicant" + AppNum + "_DOBDD").addClass("error");
        }

        if (!dobSelected)
            $("span[id='Applicant" + AppNum + ".DOBDD']").show();

        /*******************************************************
          Further details: Postcode, Email & Telephone Number
        *******************************************************/
        // PostCode
        var postCode = jQuery.trim($("#Applicant" + AppNum + "_PostCode").val());
        if (postCode.length == 0) {
            IsValid = false;
            $("#Applicant" + AppNum + "_PostCode").addClass("error");
            $("span[id*='Applicant" + AppNum + "'][id$='PostCode']").show();
        }

        if (AppNum == 1) {
            // Email
            var email1 = jQuery.trim($("#Applicant" + AppNum + "_Email").val());
            if (email1 != "") {
                if ((!IsChosenQuoteEmailValid($("#Applicant" + AppNum + "_Email")))) {
                    IsValid = false;
                    $("#Applicant" + AppNum + "_Email").addClass("error");
                    $("span[id*='Applicant" + AppNum + "'][id$='Email']").show();
                }
            }

            // Phone
            var phone1 = jQuery.trim($("#Applicant" + AppNum + "_PhoneHome").val());
            phone1 = phone1.replace(/\ /g, "");
            //if (phone1.length == 0) {
            //IsValid = false;
            //$("#Applicant" + AppNum + "_PhoneHome").addClass("error");
            //$("span[id*='Applicant" + AppNum + "'][id$='PhoneHome']").show();
            //}
            //else if 
            if (phone1.length != 0) {
                if (!isValidHomePhone(phone1) && !isValidMobilePhone(phone1)) {
                    IsValid = false;
                    $("#Applicant" + AppNum + "_PhoneHome").addClass("error");
                    $("span[id*='Applicant" + AppNum + "'][id$='PhoneHome']").show();
                }
            }

        }

        if ($("#ReferralSource").val().indexOf("Nectar") > -1) {
            $("#Applicant1_fVoucherPrefix").removeClass("error");
            var numval = $("#Applicant1_fVoucherPrefix").val();
            if (CheckNum(numval) != true) {
                IsValid = false;
                $("#Applicant1_fVoucherPrefix").addClass("error");
                $("#Applicant1_fVoucherPrefix").siblings("span").show();
            } else {
                $("#Applicant1_fadviserid").val(numval);
            }
        }
        if (($('#optionQuotePlus').val() == "True" || $('.optionQuotePlus').prop("checked") === true)) {
            if (AppNum == 2) {
                $("span#alcohol-2-1").hide();
                $("span#alcohol-2-2").hide();
                $("span#alcohol-2-3").hide();
            } else {
                $("span#alcohol-" + AppNum + "-1").hide();
                $("span#alcohol-" + AppNum + "-2").hide();
                $("span#alcohol-" + AppNum + "-3").hide();
            }

            $(".alc" + AppNum + "Sumtotal").removeClass("error");

            if (!validateAlcohol(AppNum)) {
                IsValid = false;
                
                var totalAlcohol = $(".alc" + AppNum + "Sumtotal").val();

                if (totalAlcohol.length == 0)
                    if (AppNum == 2) {
                        $("span#alcohol-2-1").show();
                    } else {
                        $("span#alcohol-" + AppNum + "-1").show();
                    }
                else if (!$.isNumeric(totalAlcohol))
                    $("span#alcohol-" + AppNum + "-2").show();
                else if (parseInt(totalAlcohol) < 0 || parseInt(totalAlcohol) > 99)
                    $("span#alcohol-" + AppNum + "-3").show();

                $(".alc" + AppNum + "Sumtotal").addClass("error");

            }
            if (!validHeight(AppNum)) {
                $("#Applicant" + AppNum + "_HeightFeet").parent().parent().siblings("span").show();
                IsValid = false;
            }
            if (!validWeight(AppNum)) {
                $("#Applicant" + AppNum + "_WeightStone").parent().parent().siblings("span").show();
                IsValid = false;
            }
        }
        return IsValid;
    }

    var isValidHomePhone = function(PhoneNumber) {
        var pattern = /^\+?\d{10,14}$/;
        return pattern.test(PhoneNumber);
    }

    var isValidMobilePhone = function(PhoneNumber) {
        var pattern = /^((07|00447|\+447)\s*\d{9}\s*)$/;
        return pattern.test(PhoneNumber);
    }

    var validHeight = function(AppNum) {

        var isValidHeight = true;

        // Check both values for validity
        // Height Validation Range
        // Feet     3 - 6
        // Inches   0 - 11

        var Feet = $("#Applicant" + AppNum + "_HeightFeet").val();
        var Inches = $("#Applicant" + AppNum + "_HeightInches").val();

        // The replace function removes all instances of leading 0's. Not good because 0 is valid on it's own.
        if (Inches.substr(0, 1) == "0" && Inches.length > 1) {
            Inches = Inches.substr(1, 1);
            $("#Applicant" + AppNum + "_HeightInches").val(Inches);
        }

        if (Feet == "" || Inches == "") {
            isValidHeight = false;
        } else {

            // Convert to inches before comparing to range limits
            var person_height = parseInt(Feet) * 12 + parseInt(Inches);
            isValidHeight =
            ((person_height >= 36 && person_height <= 83) && (parseInt(Inches) <= 11)
            ); // 36=3ft 0ins   83=6ft 11ins
        }

        if (isValidHeight) {

            // Set the correct Option in the Q+ hidden drop-down
            var heightText = Feet + "ft " + Inches + "ins";
            $("select.App" + AppNum + "Answers.Answer6 option").each(function() {
                if (this.text == heightText) {
                    $(this).prop("selected", true);
                }
            });

            $("#Applicant" + AppNum + "_HeightFeet").removeClass("error");
            $("#Applicant" + AppNum + "_HeightInches").removeClass("error");

        } else {
            if (Feet == "") {
                $("#Applicant" + AppNum + "_HeightFeet").addClass("error");
            }
            if (Inches == "") {
                $("#Applicant" + AppNum + "_HeightInches").addClass("error");
            }

        }

        return isValidHeight;

    }

    var validateAlcohol = function(AppNum) {

        var isValidAlcohol = true;

        var totalAlcohol = $(".alc" + AppNum + "Sumtotal").val();


        if (totalAlcohol.substr(0, 1) == "0" && totalAlcohol.length > 1) {
            totalAlcohol = totalAlcohol.substr(1, 1);
            $(".alc" + AppNum + "Sumtotal").val(totalAlcohol);
        }


        if (totalAlcohol.length == 0 ||
            !$.isNumeric(totalAlcohol) ||
            parseInt(totalAlcohol) < 0 ||
            parseInt(totalAlcohol) > 99)
            isValidAlcohol = false;

        return isValidAlcohol;
        //alc1Sumtotal
    }

    var validWeight = function(AppNum) {

        var isValidWeight = true;

        // Check both values for validity
        // Weight Validation MIN 6st 0lbs - MAX 25st 01b
        // Stone    6 - 25
        // Pounds   0 - 13

        var Stone = $("#Applicant" + AppNum + "_WeightStone").val();
        var Pounds = $("#Applicant" + AppNum + "_WeightPounds").val();

        // The replace function removes all instances of leading 0's. Not good because 0 is valid on it's own.
        if (Stone.substr(0, 1) == "0") {
            Stone = Stone.substr(1, 1);
            $("#Applicant" + AppNum + "_WeightStone").val(Stone);
        }
        if (Pounds.substr(0, 1) == "0" && Pounds.length > 1) {
            Pounds = Pounds.substr(1, 1);
            $("#Applicant" + AppNum + "_WeightPounds").val(Pounds);
        }


        if (Stone == "" || Pounds == "") {
            isValidWeight = false;
        } else {

            // Convert to pounds before comparing to range limits
            var person_weight = parseInt(Stone) * 14 + parseInt(Pounds);
            isValidWeight =
            ((person_weight >= 70 && person_weight <= 349) && (parseInt(Pounds) <= 13)
            ); // 70=5st 0lbs   363=25st 13lbs

        }

        if (isValidWeight) {

            // Set the correct Option in the Q+ hidden drop-down
            var weightText = Stone + "st " + Pounds + "lbs";
            $("select.App" + AppNum + "Answers.Answer7 option").each(function() {
                if (this.text == weightText) {
                    $(this).prop("selected", true);
                }
            });

            $("#Applicant" + AppNum + "_WeightStone").removeClass("error");
            $("#Applicant" + AppNum + "_WeightPounds").removeClass("error");

        } else {
            if (Stone == "") {
                $("#Applicant" + AppNum + "_WeightStone").addClass("error");
            }
            if (Pounds == "") {
                $("#Applicant" + AppNum + "_WeightPounds").addClass("error");
            }
        }
        return isValidWeight;
    }

    var validatePolicyDetails = function() {

        var IsValid = true;

        // Remove the red class
        $("span#PolicyType").hide();
        $("span#MortgageType").hide();
        $("#Term").removeClass("error");
        $("span#Term-1").hide();
        $("span#Term-2").hide();
        $("#SumAssured").removeClass("error");
        $("span#SumAssured-1").hide();
        $("span#SumAssured-2").hide();
        $("span#SumAssured-3").hide();
        $("span#SumAssured-4").hide();
        $("span#SumAssured-5").hide();
        $("span#livingcostpayout-error").hide();

        /**************************************************
          Validate PolicyType, Term, Sum Assured and CIC
        **************************************************/

        // PolicyType
        if ($("input[type=radio][id*=ProtectionType]:checked").length == 1) {

            var policyVal = $("input[type=radio][id*=ProtectionType]:checked").val();

            if (policyVal === "1") {
                if ($("input[type=radio][id*=MortgageType]:checked").length == 1) {
                    policyVal = $("input[type=radio][id*=MortgageType]:checked").val();
                    $("#PolicyType").val(policyVal);
                    $("#MortgageType").val(policyVal);
                    $("input[type=radio][id*=MortgageType]").removeClass("error");
                } else {
                    IsValid = false;
                    $("span#MortgageType").show();
                    $("input[type=radio][id*=MortgageType]").addClass("error");
                    $("input[type=radio][id*=ProtectionType]").removeClass("error");
                }
            } else if (policyVal === "2") {
                if ($("input[type=radio][id*=livingcostpayout]:checked").val() == "K") {
                    $("#PolicyType").val("K");
                    $("#ProtectionType").val(policyVal);
                    $("#MortgageType").val("K");
                    $("input[type=radio][id*=ProtectionType]").removeClass("error");
                } else if ($("input[type=radio][id*=livingcostpayout]:checked").val() == "L") {
                    $("#PolicyType").val("L");
                    $("#ProtectionType").val(policyVal);
                    $("#MortgageType").val("L");
                    $("input[type=radio][id*=ProtectionType]").removeClass("error");
                } else {
                    IsValid = false;
                    $("span#livingcostpayout-error").show();
                    $("input[type=radio][id*=ProtectionType]").addClass("error");
                }
            } else {
                $("#PolicyType").val("L");
                $("#ProtectionType").val(policyVal);
                $("#MortgageType").val("L");
                $("input[type=radio][id*=ProtectionType]").removeClass("error");
            }
        } else {
            IsValid = false;
            $("span#PolicyType").show();
            $("input[type=radio][id*=ProtectionType]").addClass("error");
        }


        var selectedTermVal = jQuery.trim($("#Term").val());
        if (selectedTermVal.length == 0 ||
            parseFloat(selectedTermVal) < 5 ||
            parseFloat(selectedTermVal) > 40 ||
            isNaN(parseFloat(selectedTermVal))) {
            // Nothing chosen so set to red
            IsValid = false;
            if (isNaN(parseFloat(selectedTermVal))) {
                $("#Term").addClass("error");
                $("span#Term-2").show();
            } else {
                $("#Term").addClass("error");
                $("span#Term-1").show();
            }
        }

        //make sure one sum assured has been entered.
        var SumAssured = jQuery.trim($("#SumAssured").val());
        var maxSumAssured = 9999999;
        if ($("#livingcostpayout-1").is(':checked') && $("#ProtectionType-2").is(':checked')) {
            maxSumAssured = 100000;
        }

        if ($("#SumAssured").is(":visible")) {
            if (SumAssured.length == 0 ||
                parseFloat(SumAssured) < 5000 ||
                parseFloat(SumAssured) > maxSumAssured ||
                !$.isNumeric(SumAssured)) {

                // Empty text box
                IsValid = false;
                $("#SumAssured").addClass("error");

                if (SumAssured.length <= 0) {
                    $(this).addClass("error");
                    $("span#SumAssured-2").show();
                } else if (parseInt(SumAssured) < 5000) {
                    $(this).addClass("error");
                    $("span#SumAssured-1").show();
                } else if (!$.isNumeric(SumAssured)) {
                    $(this).addClass("error");
                    $("span#SumAssured-3").show();
                } else {
                    if ($("#livingcostpayout-1").is(':checked') && $("#ProtectionType-2").is(':checked')) {
                        if (parseInt(SumAssured) > maxSumAssured) {
                            $(this).addClass("error");
                            $("span#SumAssured-5").show();
                        }
                    } else {
                        if (parseInt(SumAssured) > maxSumAssured) {
                            $(this).addClass("error");
                            $("span#SumAssured-4").show();
                        }
                    }
                }
            }
        }




        return IsValid;
    }

    //// Acquired from: http://stackoverflow.com/questions/3883342/add-commas-to-a-number-in-jquery
    //function commaSeparateNumber(val) {
    //    while (/(\d+)(\d{3})/.test(val.toString())) {
    //        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    //    }
    //    return val;
    //}

    var PolicyDetailsChange = function() {

        $(".mortgagetype").hide();
        $('.livingcostoptions').hide();
        $('#tooltipAnnualLumpSum').hide();
        var clickOnce = 0;


        $("#ProtectionType-1, #ProtectionType-2, #ProtectionType-3, label[for^='ProtectionType']").click(function() {
            $('#ProtectionType').val($(this).val());

            // IE11
            var val = 0
            if ($(this).prop("for") != null) {
                val = $(this).prop("for").charAt($(this).prop("for").length - 1);

                if ($('#ProtectionType').val() != val) {
                    $('#ProtectionType').val(val);
                    val = $(this).prop("for");
                    $("#" + val).prop("checked", "checked");
                }

                // Get rid of any white lined images 
                var src = $("label[for='ProtectionType-1']").children('img').attr("src");
                src = src.replace('-white', '');
                $("label[for='ProtectionType-1']").children('img').attr("src", src);

                src = $("label[for='ProtectionType-2']").children('img').attr("src");
                src = src.replace('-white', '');
                $("label[for='ProtectionType-2']").children('img').attr("src", src);

                src = $("label[for='ProtectionType-3']").children('img').attr("src");
                src = src.replace('-white', '');
                $("label[for='ProtectionType-3']").children('img').attr("src", src);

                src = $(this).children("img").attr("src");
                src = src.substr(0, src.length - 4) + "-white.png";
                $(this).children("img").attr("src", src);

            }


            $(this).removeClass("error");
            $("#ProtectionType-1, #ProtectionType-2, #ProtectionType-3").parent("div").removeClass("isSelected");
            $(this).parent("div").addClass("isSelected");

            $("span#PolicyType").hide();

            if ($(this).prop("id") === "ProtectionType-1" || $(this).prop("for") === "ProtectionType-1") {
                $(".mortgagetype").show();
                $('#PolicyType').val("");

                if (clickOnce === 0) {
                    window.dataLayer.push(
                        { 'event': 'Insurance_Type_Click', 'Insurance_Type_Value': 'Mortgage' });
                    clickOnce++;
                } else {
                    clickOnce = 0;
                }

                
            } else {
                $(".mortgagetype").hide();
                $('#PolicyType').val("L");
            }

            if (($(this).prop("id") === "ProtectionType-2" || $(this).prop("for") === "ProtectionType-2") &&
                (!$('#livingcostpayout-1').is(':checked') && !$('#livingcostpayout-2').is(':checked'))) {
                $('#SumAssured').removeClass("error");
                $("span#SumAssured-4").hide();
                $("span#SumAssured-5").hide();
            }

            if ($(this).prop("id") === "ProtectionType-2" || $(this).prop("for") === "ProtectionType-2") {

                if (clickOnce === 0) {
                    window.dataLayer.push({ 'event': 'Insurance_Type_Click', 'Insurance_Type_Value': 'Living Costs' });
                    clickOnce++;
                } else {
                    clickOnce = 0;
                }

                
                if ($("label[for^='livingcostpayout-']").hasClass("replaced-input-label--selected")) {
                    $(".livingcost-option-question").show();
                    $(".livingcost-option-question").siblings("a").show();
                    $("#livingcost-option-question").show();

                    if ($('#livingcostpayout-1').is(':checked')) {
                        $('#SumAssured').val("0");
                        $('#SumAssured').removeClass("error");
                        $("span#SumAssured-4").hide();
                    }

                } else {
                    $("#livingcost-option-question").hide();
                    $(".livingcost-option-question").hide();
                    $(".livingcost-option-question").siblings("a").hide();

                }
                $('#tooltipAnnualLumpSum').show();
                $(".livingcostoptions").show();
                $('.hide-for-living-cost').hide();
                $('#c-calculator').hide();
                $("#SumAssured").parent("div").addClass("indented-section");

            } else {
                
                $(".livingcost-option-question").show();
                $(".livingcost-option-question").siblings("a").show();
                $("#livingcost-option-question").show();

                if ($('#SumAssured').val() < 9999999) {
                    $('#SumAssured').removeClass("error");
                }

                $("span#SumAssured-5").hide();


                $(".livingcostoptions").hide();
                $('#tooltipAnnualLumpSum').hide();
                $('.hide-for-living-cost').show();
                $('#c-calculator').show();
                $("#SumAssured").parent("div").removeClass("indented-section");
            }

            if ($(this).prop("id") === "ProtectionType-3" || $(this).prop("for") === "ProtectionType-3") {

                if (clickOnce === 0) {
                    window.dataLayer.push({
                        'event': 'Insurance_Type_Click',
                        'Insurance_Type_Value': 'Both'
                    });
                    clickOnce++;
                } else {
                    clickOnce = 0;
                }

            }

        });

        $("#livingcostpayout-1, #livingcostpayout-2, label[for^='livingcostpayout']").click(function() {
            $(".livingcost-option-question").show();
            $(".livingcost-option-question").siblings("a").show();
            $("#livingcost-option-question").show();

            $("#livingcostpayout-error").hide();

            if ($(this).val() === "K") {
                window.dataLayer.push({ 'event': 'Payout_Option_Click', 'Payout_Option_Value': 'Living Costs/Annual Income' });
                $('.livingcost-option-question').text("How much income is required? (this is tax free)");
                $('#c-calculator').hide();
                $('#SumAssured').val("0");
                $("span#SumAssured-4").hide();
                $('#SumAssured').removeClass("error");
            } else if ($(this).val() === "L") {
                window.dataLayer.push({ 'event': 'Payout_Option_Click', 'Payout_Option_Value': 'Living costs/Lump Sum' });
                $('.livingcost-option-question').text("What lump sum would you like to be protected for?");
                $('#c-calculator').show();
                $("span#SumAssured-5").hide();
                $('#SumAssured').removeClass("error");
            }
        });

        $("#MortgageType-1, #MortgageType-2, label[for^='MortgageType']").click(function() {
            $("span#MortgageType").hide();
            //$('#PolicyType').val($(this).val());
            $('#MortgageType').val($(this).val());

            if ($(this).attr("id") === "MortgageType-1") {
                window.dataLayer.push({ 'event': 'Payout_Option_Click', 'Payout_Option_Value': 'Mortgage/Interest Only' });
            } else if ($(this).attr("id") === "MortgageType-2")
            {
                window.dataLayer.push({ 'event': 'Payout_Option_Click', 'Payout_Option_Value': 'Mortgage/Repayment' });
            }

            // IE11
            var val = 0;
            if ($(this).prop("for") != null) {
                val = $(this).prop("for").charAt($(this).prop("for").length - 1);

                if ($('#MortgageType').val() != val) {
                    $('#MortgageType').val(val);
                    val = $(this).prop("for");
                    $("#" + val).prop("checked", "checked");
                }

                var src = $("label[for='MortgageType-1']").children('img').attr("src");
                src = src.replace('-white', '');
                $("label[for='MortgageType-1']").children('img').attr("src", src);

                src = $("label[for='MortgageType-2']").children('img').attr("src");
                src = src.replace('-white', '');
                $("label[for='MortgageType-2']").children('img').attr("src", src);

                src = $(this).children("img").attr("src");
                src = src.substr(0, src.length - 4) + "-white.png";
                $(this).children("img").attr("src", src);

                $("#MortgageType-1, #MortgageType-2").parent("div").removeClass("isSelected");
                $(this).parent("div").addClass("isSelected");
            }


        });


        $("#Term").blur(function() {
            var selectedTermVal = $(this).val();
            $("span#Term-1").hide();
            $("span#Term-2").hide();
            if (isNaN(parseFloat(selectedTermVal))) {
                $("#Term").addClass("error");
                $("span#Term-2").show();
            } else if (selectedTermVal.length == 0 ||
                parseFloat(selectedTermVal) < 5 ||
                parseFloat(selectedTermVal) > 40) {
                // Nothing chosen so set to red
                $(this).addClass("error");
                $("span#Term-1").show();
            } else if (selectedTermVal.length > 0 ||
                parseFloat(selectedTermVal) >= 5 ||
                parseFloat(selectedTermVal) <= 40) {
                $(this).removeClass("error");
                $("span#Term-1").hide();
            }

            window.dataLayer.push({ 'event': 'Cover_Length_Click', 'Cover_Length_Value': selectedTermVal + ' years' });

        });


        $("#SumAssured").on('blur',
            function() {

                var selectedSAVal = $(this).val().replace(",", "");

                $(this).removeClass("error");
                $("span#SumAssured-1").hide();
                $("span#SumAssured-2").hide();
                $("span#SumAssured-3").hide();
                $("span#SumAssured-4").hide();
                $("span#SumAssured-5").hide();

                if (selectedSAVal.length <= 0) {
                    $(this).addClass("error");
                    $("span#SumAssured-2").show();
                } else if (parseFloat(selectedSAVal) < 5000) {
                    $(this).addClass("error");
                    $("span#SumAssured-1").show();
                } else if (!$.isNumeric(selectedSAVal)) {
                    $(this).addClass("error");
                    $("span#SumAssured-3").show();
                } else {
                    if ($("#livingcostpayout-1").is(':checked') && $("#ProtectionType-2").is(':checked')) {
                        if (parseInt(selectedSAVal) > 100000) {
                            $(this).addClass("error");
                            $("span#SumAssured-5").show();
                        }
                    } else {
                        if (parseInt(selectedSAVal) > 9999999) {
                            $(this).addClass("error");
                            $("span#SumAssured-4").show();
                        }
                    }
                }

                if ($("#ProtectionType").val() == "1") {
                    window.dataLayer.push({ 'event': 'Cover_Amount_Click', 'Cover_Amount_Value': 'Mortgage - ' + selectedSAVal });
                } else if ($("#ProtectionType").val() == "2") {
                    window.dataLayer.push({ 'event': 'Cover_Amount_Click', 'Cover_Amount_Value': 'Living Costs - ' + selectedSAVal });
                } else if ($("#ProtectionType").val() == "3") {
                    window.dataLayer.push({
                        'event': 'Cover_Amount_Click',
                        'Cover_Amount_Value': 'Mortgage + Living Costs - ' + selectedSAVal
                    });
                } else {
                    window.dataLayer.push({
                        'event': 'Cover_Amount_Click',
                        'Cover_Amount_Value': 'No protection selected - ' + selectedSAVal
                    });
                }

            });


        $("#JointPolicy-1, #JointPolicy-2").click(function() {
            if ($(this).val() == "1") {
                window.dataLayer.push({ 'event': 'Cover_For_Click', 'Cover_For_Value': 'Just You' });
            } else {
                window.dataLayer.push({ 'event': 'Cover_For_Click', 'Cover_For_Value': 'You and someone else' });
            }
        });

        $("#Applicant1_QuestionSet_25__AnswerValue, #Applicant2_QuestionSet_25__AnswerValue").on('blur',
            function() {

                var appNumber = ($(this).attr("id") === "Applicant1_QuestionSet_25__AnswerValue" ? 1 : 2);
                var answerVal = $(this).val().replace(",", "");
                var sumAssuredVal = $("#SumAssured").val().replace(",", "");
                var name = $(this).attr("name");

                $(this).removeClass("error");
                $("span#TotalAmount-" + appNumber + "-1").hide();
                $("span#TotalAmount-" + appNumber + "-2").hide();
                $("span#TotalAmount-" + appNumber + "-3").hide();
                $("span[for='" + name + "']").hide();

                if (answerVal.length <= 0) {
                    $(this).addClass("error");
                    //$("span#TotalAmount-" + appNumber + "-1").show();
                    $("span[for='" + name + "']").show();

                } else if (!$.isNumeric(answerVal)) {
                    $(this).addClass("error");
                    $("span#TotalAmount-" + appNumber + "-2").show();
                } else if (parseInt(answerVal) < parseInt(sumAssuredVal)) {
                    $(this).addClass("error");
                    $("span#TotalAmount-" + appNumber + "-3").show();
                }

            });

        $("#Applicant1_QuestionSet_11__AnswerValue, #Applicant1_QuestionSet_12__AnswerValue, " +
            "#Applicant2_QuestionSet_11__AnswerValue, #Applicant2_QuestionSet_12__AnswerValue").on('blur',
            function() {

                var answerVal = $(this).val().replace(",", "");
                var name = $(this).attr("name");
                var isTrouser = ($(this).attr("class").indexOf("TrouserQuestion") >= 0);
                var appNumber = ($(this).attr("id") === "Applicant1_QuestionSet_11__AnswerValue" ? 1 : 2);

                $(this).removeClass("error");
                $("span[for='" + name + "']").hide();
                if (isTrouser) {
                    $("span#Trouser-" + appNumber + "-1").hide();
                }

                if (answerVal.length <= 0) {
                    $(this).addClass("error");
                    $("span[for='" + name + "']").show();
                } else if (isTrouser && answerVal.length <= 1) {
                    $(this).addClass("error");
                    $("span#Trouser-" + appNumber + "-1").show();
                }

            });

    }

    var ApplicantChange = function() {

        /*****************************************************************
        Title for Apps 1 & 2
        *****************************************************************/
        $("form#Quote input[id*='Applicant1_AppTitle'], form#Quote input[id*='Applicant2_AppTitle']").change(
            function() {
                $(this).parent().siblings('span').hide();
                var appId = $(this).attr("id");
                var AppNum = (appId.indexOf("Applicant1") === 0 ? 1 : 2);
                var titleVal = $(this).val();

                var Last2YearsMale = $("div[qp-data='Last2YearsMale-App" + AppNum + "']");
                var Last5YearsMale = $("div[qp-data='Last5YearsMale-App" + AppNum + "']");
                var Last2YearsFemale = $("div[qp-data='Last2YearsFemale-App" + AppNum + "']");
                var Last5YearsFemale = $("div[qp-data='Last5YearsFemale-App" + AppNum + "']");

                var anxietyf = $("div[data-at='qp_" + AppNum + "-anxiety-f']");
                var bloodpressuref = $("div[data-at='qp_" + AppNum + "-bloodpressure-f']");
                var anxietym = $("div[data-at='qp_" + AppNum + "-anxiety-m']");
                var bloodpressurem = $("div[data-at='qp_" + AppNum + "-bloodpressure-m']");

                var label = "div.input-group__item label";
                var input = "div.input-group__item input";
                var classSelected = "replaced-input-label--selected";
                var hiddenInput = "input[type=hidden][id*='Applicant" + AppNum + "'][id$='AnswerValue']";
                var spanError = "div.fld-msg.qp-error";


                $("input[id*='Applicant" + AppNum + "_AppTitle']").removeClass("error");
                if (AppNum == 1) {
                    window.dataLayer.push({ 'event': 'About_You_Click', 'About_You_Value': $(this).val() });
                } else {
                    window.dataLayer.push({ 'event': 'Applicant_2_Applicant_2_About_You_Click', 'Applicant_2_About_You_Value': $(this).val() });
                }

                if (titleVal === "Mr") {
                    Last2YearsMale.show();
                    Last5YearsMale.show();
                    Last2YearsFemale.hide();
                    Last5YearsFemale.hide();

                    anxietyf.children(hiddenInput).val("");
                    anxietyf.find(label).removeClass(classSelected);
                    anxietyf.find(input).prop('checked', false);
                    anxietyf.find(spanError).show();
                        
                    bloodpressuref.children(hiddenInput).val("");
                    bloodpressuref.find(label).removeClass(classSelected);
                    bloodpressuref.find(input).prop('checked', false);
                    bloodpressuref.find(spanError).show();

                } else {

                    Last2YearsFemale.show();
                    Last5YearsFemale.show();
                    Last2YearsMale.hide();
                    Last5YearsMale.hide();

                    anxietym.children(hiddenInput).val("");
                    anxietym.find(label).removeClass(classSelected);
                    anxietym.find(input).prop('checked', false);
                    anxietym.find(spanError).show();

                    bloodpressurem.children(hiddenInput).val("");
                    bloodpressurem.find(label).removeClass(classSelected);
                    bloodpressurem.find(input).prop('checked', false);
                    bloodpressurem.find(spanError).show();

                }
                

            });


        /*****************************************************************
        Title for Apps 1 & 2
        *****************************************************************/
        $("form#FurtherDetail input[id*='Applicant1_AppTitle'], form#FurtherDetail input[id*='Applicant2_AppTitle']")
            .change(function() {
                $(this).parent().siblings('span').hide();
                var appId = $(this).attr("id");
                var AppNum = (appId.indexOf("Applicant1") == 0 ? 1 : 2);
                $("input[id*='Applicant" + AppNum + "_AppTitle']").removeClass("error");

            });


        /*****************************************************************
        Forename & Surname for Apps 1 & 2
        *****************************************************************/
        // Quote Screen
        $("#Applicant1_Forename, #Applicant2_Forename, #Applicant1_Surname, #Applicant2_Surname").blur(function() {
            CheckName(this);
        });

        function CheckName(me) {
            var Name = jQuery.trim($(me).val());
            if (Name.length >= 2) {
                // Check for numbers
                var matches = Name.match(/\d+/g);
                if (matches != null) {
                    $(me).addClass("error");
                    $(me).siblings('span').show();
                } else {
                    $(me).removeClass("error");
                    $(me).siblings('span').hide();
                }
            } else {
                $(me).addClass("error");
                $(me).siblings('span').show();
            }
        };

        // Further Detals screen
        $("#Applicant_Forename, #Applicant_Applicant2_Forename, #Applicant_Surname, #Applicant_Applicant2_Surname")
            .change(function() {
                var Name = jQuery.trim($(this).val());
                if (Name.length > 0) {
                    $(this).removeClass("error");
                    $(this).parents().parents().children(".form-label").find("label").removeClass("error");
                }
            });

        /*****************************************************************
        Date Of Birth for Apps 1 & 2
        *****************************************************************/
        $("#Applicant1_DOBDD, #Applicant1_DOBMM, #Applicant1_DOBYYYY").change(function() {
            var selectedVal = $(this).val();

            if (parseInt(selectedVal) != 0)
                $(this).removeClass("error");

            var selectedDDVal = $("#Applicant1_DOBDD option:selected").val();
            var selectedMMVal = $("#Applicant1_DOBMM option:selected").val();
            var selectedYYYYVal = $("#Applicant1_DOBYYYY option:selected").val();
            if (parseInt(selectedDDVal) != 0 && parseInt(selectedMMVal) != 0 && parseInt(selectedYYYYVal) != 0)
                $("span[id*='Applicant1'][id$='DOBDD']").hide();

            $('#Applicant1_MinDDValue').val('1');
            $('#Applicant1_MaxDDValue').val(maxDDinMonth(selectedMMVal, selectedYYYYVal));

        });

        $("#Applicant1_DOBDD, #Applicant1_DOBMM, #Applicant1_DOBYYYY").blur(function() {
            var selectedVal = $(this).val();
            if (parseInt(selectedVal) == 0)
                $(this).addClass("error");
        });


        $("#Applicant2_DOBDD, #Applicant2_DOBMM, #Applicant2_DOBYYYY").change(function() {
            var selectedVal = $(this).val();
            var selected2DDVal = $("#Applicant2_DOBDD option:selected").val();
            var selected2MMVal = $("#Applicant2_DOBMM option:selected").val();
            var selected2YYYYVal = $("#Applicant2_DOBYYYY option:selected").val();

            if (parseInt(selectedVal) != 0)
                $(this).removeClass("error");

            if (parseInt(selected2DDVal) != 0 && parseInt(selected2MMVal) != 0 && parseInt(selected2YYYYVal) != 0)
                $("span[id*='Applicant2'][id$='DOBDD']").hide();

            $('#Applicant2_MinDDValue').val('1');
            $('#Applicant2_MaxDDValue').val(maxDDinMonth(selected2MMVal, selected2YYYYVal));
        });

        /*****************************************************************
        Postcode, Email & Telephone number for Apps 1 & 2
        *****************************************************************/
        // Quote Screen
        $("#Applicant1_Email, #Applicant1_PhoneHome, #Applicant1_fVoucherPrefix").blur(function() {
            var thisVal = jQuery.trim($(this).val());

            if ($(this).attr("id") == "Applicant1_Email") {

                if (thisVal === "") {
                    $("span[id$='Email'][id^='Applicant1']").hide();
                    $(this).removeClass("error");
                } else {
                    if (IsChosenQuoteEmailValid($(this))) {
                        $("span[id$='Email'][id^='Applicant1']").hide();
                    } else {
                        $(this).addClass("error");
                        $("span[id$='Email']").attr("style", "");
                    }
                }


            } else if ($(this).attr("id") == "Applicant1_fVoucherPrefix") {
                if (CheckNum(thisVal) != true) {
                    $(this).addClass("error");
                    $(this).siblings('span').show();
                } else {
                    $(this).removeClass("error");
                    $(this).siblings('span').hide();
                }
            } else if ($(this).attr("id") == "Applicant1_PhoneHome") {
                thisVal = thisVal.replace(/\ /g, '');
                if (thisVal === "") {
                    $(this).removeClass("error");
                    $(this).siblings('span').hide();
                } else {
                    if (!isValidHomePhone(thisVal) && !isValidMobilePhone(thisVal)) {
                        $(this).addClass("error");
                        $(this).siblings('span').show();
                    } else {
                        $(this).removeClass("error");
                        $(this).siblings('span').hide();
                    }
                }

            } else {
                if (thisVal.length > 0) {
                    $(this).removeClass("error");
                    $(this).siblings('span').hide();
                }
            }
        });

        $("#Applicant1_PostCode, #Applicant2_PostCode").blur(function () {
            var thisId = $(this).attr("id").replace("_", ".");
            if ($(this).val() !== "") {
                $(this).removeClass("error");
                $("span[id='" + thisId +  "']").hide();
            } else {
                $(this).addClass("error");
                $("span[id='" + thisId + "']").show();
            }

        });


        // Further Details
        $("#Applicant_PostCode, form#FurtherDetail #Applicant2_PostCode, form#FurtherDetail #Applicant_PhoneWork, form#FurtherDetail #Applicant2_PhoneWork, form#FurtherDetail #Applicant_PhoneHome, form#FurtherDetail #Applicant2_PhoneHome, form#FurtherDetail #Applicant_MobilePhone, form#FurtherDetail #Applicant2_MobilePhone, form#FurtherDetail #Applicant_Email, form#FurtherDetail #Applicant2_Email")
            .blur(function() {
                var thisVal = jQuery.trim($(this).val());
                var id = $(this).attr("id");

                if ($(this).attr("id") == "Applicant_Email" || $(this).attr("id") == "Applicant2_Email") {
                    if (IsChosenQuoteEmailValid($(this))) {
                        $(this).removeClass("error");
                        $(this).parent().find("label").removeClass("error");
                    } else {
                        $(this).addClass("error");
                        $(this).parent().find("label").addClass("error");
                    }
                } else if (id == "Applicant_PhoneHome" || id == "Applicant2_PhoneHome" || 
                    id == "Applicant_PhoneWork" || id == "Applicant2_PhoneWork" || 
                    id == "Applicant_MobilePhone" || id == "Applicant2_MobilePhone") {
                    thisVal = thisVal.replace(/\ /g, '');
                    if (thisVal === "") {
                        $(this).removeClass("error");
                        $(this).siblings('span').hide();
                    } else {
                        if (!isValidHomePhone(thisVal) && !isValidMobilePhone(thisVal)) {
                            $(this).addClass("error");
                            $(this).siblings('span').show();
                        } else {
                            $(this).removeClass("error");
                            $(this).siblings('span').hide();
                            $(this).siblings('label').removeClass("error");
                        }
                    }

                } else if (thisVal.length > 0) {
                    $(this).removeClass("error");
                    $(this).parent().find("label").removeClass("error");
                }



            });


        // Restart Screen
        $("#Applicant1_NewEmail").blur(function() {
            var thisVal = jQuery.trim($(this).val());
            if (thisVal.length > 0) {
                $(this).removeClass("error");
                $(this).parents('.form-row').children('label.fld-lbl').removeClass("error");
            }
        });

        /*****************************************************************
        Marital status & occupation for Apps 1 & 2
        *****************************************************************/
        $(
                "#ApplicantAdditionalInfo_Marital, #ApplicantAdditionalInfo2_Marital, #ApplicantAdditionalInfo_EmpStatus, #ApplicantAdditionalInfo2_EmpStatus")
            .change(function() {
                var selectedTermVal = $(this + "option:selected").val();
                if (selectedTermVal != "") {
                    $(this).removeClass("error");
                    $(this).parents().parents().children(".form-label").find("label").removeClass("error");
                }
            });

        $("#ApplicantAdditionalInfo_Occupation, #ApplicantAdditionalInfo2_Occupation").change(function() {
            var thisVal = jQuery.trim($(this).val());

            if (thisVal.length > 0) {
                $(this).removeClass("error");
                $(this).parent().find("label").removeClass("error");
            }
        });

        /*****************************************************************
        Address Detail for Apps 1
        *****************************************************************/
        $("#Applicant_Address1, #Applicant_Address2").change(function() {
            var thisVal = jQuery.trim($(this).val());

            if (thisVal.length > 0) {
                $(this).removeClass("error");
                $(this).parents().parents().children(".form-label").find("label").removeClass("error");
            }
        });


        /*****************************************************************
        Smoker status for Apps 1 & 2
        *****************************************************************/
        $(".smokerNever, .smokerNow, .smokerEx").click(function() {
            $(".smokerNever, .smokerNow, .smokerEx").removeClass("error");
            $(this).parents('.form-row').children('label.fld-lbl').removeClass("error");
        });
    }


    var setCountry = function() {

        $("#Applicant_1_BirthCountry, #Applicant_2_BirthCountry").change(function() {

            if ($(this).attr("id") === "Applicant_1_BirthCountry")
                $("#Applicant_BirthCountry").val($("#Applicant_1_BirthCountry option:selected").val());
            else
                $("#Applicant2_BirthCountry").val($("#Applicant_2_BirthCountry option:selected").val());

        });

        $("#Applicant_1_Nationality, #Applicant_2_Nationality").change(function() {

            if ($(this).attr("id") === "Applicant_1_Nationality")
                $("#Applicant_Nationality").val($("#Applicant_1_Nationality option:selected").val());
            else
                $("#Applicant2_Nationality").val($("#Applicant_2_Nationality option:selected").val());

        });

    }

    var isLeapYear = function(yyyy) {
        return !(yyyy % 4) && (yyyy % 100) || !(yyyy % 400);
    }

    var maxDDinMonth = function(mm, yyyy) {
        var tmpDDMax = (mm == 2 ? 28 : (("|1|3|5|7|8|10|12|".indexOf(mm) > -1) ? 31 : 30));
        if (mm == 2)
            tmpDDMax += (isLeapYear(yyyy) ? 1 : 0);

        return tmpDDMax;
    }

    var SetQPChangesHandlers = function() {
        $('.extra-questions .input-group .input-group__item input[type=radio]').change(function() {
            $(this).parent().siblings('p.fld-msg.qp-error').children('span').hide();
            var qpName = $(this).attr("name");
            var qpVal = $(this).attr("value");
            $(this).parent().siblings("input[type=hidden][name='" + qpName + "']").val(qpVal);
        });
        $("input[id$='HeightFeet'], input[id$='HeightInches'], input[id$='WeightStone'], input[id$='WeightPounds']")
            .blur(function() {

                var isValidHeightWeight = true;

                $(this).parent().parent().siblings('span').hide();

                var thisId = $(this).attr("id"); // Applicant1_HeightFeet

                var isHeight = (thisId.search("Height") >= 0);

                // For some reason can't get indexOf to work so have used search instead: returns -1 if not found
                // Derive the applicant id
                var applicantId = ((thisId.search("Applicant1") >= 0) ? 1 : 2);

                // For this applicant, verify that the value is correct. 
                isValidHeightWeight = (isHeight ? validHeight(applicantId) : validWeight(applicantId));

                // Split up the height & weight boolean to give more meaningful output errors - ain't  got time right now.

                if (!isValidHeightWeight) {
                    $(this).parent().parent().siblings("span[id$='-range']").show();
                }
            });

    }

    var SumAssuredClick = function() {

        $("#SumAssured").click(function(e) {
            hasFocus(this, e);
        }).focusin(function(e) {
            hasFocus(this, e);
        });

        $("#SumAssured").blur(function() {
            SetSumAssured(this);
        });


        $(".cover-calculator").focus(function() {
            SetSumAssured($("#SumAssured"));
        });


        function hasFocus(sumassured, e) {

            var fldmsgSpan = $(sumassured).parent().siblings("p.fld-msg").children("span");
            $(fldmsgSpan).attr("data-valmsg-for", "");
            var errSpan = $(sumassured).parent().parent().children("p.fld-msg").children("span").children("span");
            $(errSpan).text("");


            var txtVal = jQuery.trim($(sumassured).val().replace(/\,/g, ''));
            processSA(sumassured, txtVal, e);

        }

        function processSA(sumassured, txtVal, e) {

            if (txtVal == "0") {
                $(sumassured).val("");
            } else {

                // try some basic validation
                if ($.isNumeric(txtVal)) {
                    isValidNum = true;
                    if (parseInt(txtVal) >= 5000) {
                        isValidSum = true;
                    }
                }
                if (txtVal != jQuery.trim($(sumassured).val())) {
                    $(sumassured).val(txtVal);
                }

            }
        }

        function SetSumAssured(sumassured) {

            var fldmsgSpan = $(sumassured).parent().siblings("p.fld-msg").children("span");
            $(fldmsgSpan).attr("data-valmsg-for", "SumAssured");

            var txtVal = jQuery.trim($(sumassured).val().replace(/\,/g, ''));
            isValidNum = false;
            isValidSum = false;

            // try some basic validation
            if ($.isNumeric(txtVal)) {
                isValidNum = true;
                if (parseInt(txtVal) >= 5000) {
                    isValidSum = true;
                }
            }

            if (txtVal == "") {
                $(sumassured).val("0");
            } else {
                $(sumassured).val(txtVal);
                //    $(sumassured).val(commaSeparateNumber(txtVal));
            }

        }

    }

    var RadioClick = function() {
        var SectionDesc = $('fieldset[id^="Section_"]:visible').last().attr('id');
        if (SectionDesc != null)
            var SectionId = SectionDesc.replace("Section_", "").slice(0, -5);

        var App1QPlusComplete = checkCompletedApp(1, SectionId);
        var App2QPlusComplete = false;

        $("#app1EditBox").hide();
        $("#app2EditBox").hide();

        $("#Quote .form-row input.youAndSomeone, #Quote .form-row input.justYou").change(function(e) {
            if ($('.jointPolicyYes').prop('checked') === true) {
                $('.jointPolicyYes').attr("checked", "checked");
                $('.justYou').removeAttr("checked");
                $('#JointPolicy').val('2');
                $('#Applicant2_AppIsValid').val('True');
                $('.box-blue.singlePolicySet').removeClass('isalone');
                $('.extra-questions.extra-questions_app2').removeClass('ishidden');
                $('.extra-questions.extra-questions_app2').addClass('isvisible');
                $('.extra-questions.extra-questions_app1').removeClass('isvisiblealone');
                $('.extra-questions.extra-questions_app1').addClass('isvisible');
                toggleJoint = true;
                App2JourneyEnded = false;
                App2QPlusComplete = checkCompletedApp(2, null);
            } else {
                $('.justYou').attr("checked", "checked");
                $('.jointPolicyYes').removeAttr("checked");
                $('#JointPolicy').val('1');
                $('fieldset[id^="Section_"][id$="_App1"]').hide();
                $('fieldset[id^="Section_"][id$="_App2"]').hide();
                $('fieldset[id^="Section_"][id$="_App2"]').removeClass("section_open");
                $('.jointPolicySet').hide();
                $('#Applicant2_AppIsValid').val('False');
                $('.extra-questions.extra-questions_app2').removeClass('isvisible').toggleClass('ishidden');
                $('.extra-questions.extra-questions_app2').addClass('ishidden');
                $('.box-blue.singlePolicySet').addClass('isalone');
                toggleJoint = false;
                if ($('#optionQuotePlus').val() == "True" || $('.optionQuotePlus').prop('checked') === true) {
                    $('.extra-questions.extra-questions_app1').removeClass('isvisible');
                    $('.extra-questions.extra-questions_app1').addClass('isvisiblealone');
                }
            }

            if ($("#optionQuotePlus").val() !== "False") {
                Display_Buttons(true, App1QPlusComplete, App2QPlusComplete);
            } else {
                Display_Buttons(true, false, false);
            }
            ShowNextSection(true, true);
            DisplayOpenSections();

        });
    }

    $('#ExplicitConsentAgreement').click(function() {
        if ($('#ExplicitConsentAgreement').prop('checked') === true) {
            $("#lblExplicitConsent").addClass("smallprint");
            $("#lblExplicitConsent").removeClass("SetRed");

            var app1SectionID = $('fieldset[id^="Section_"][id$="_App1"]:visible').last().attr("id");
            //var sectionId = app1SectionID.substring(8, app1SectionID.indexOf("_", 8));
            //Section_199_App1
            if (app1Section1ID === app1SectionID) {
                window.dataLayer.push({ 'event': 'Data_Consent_1_Tick', 'Data_Consent_1_Value': 'Yes' });
            }

        }
    });


    $('#btnNext').click(function() {

        var SectionDesc = $('fieldset[id^="Section_"]:visible').last().attr('id');
        if (SectionDesc != null)
            var SectionId = SectionDesc.replace("Section_", "").slice(0, -5);

        var App1QPlusComplete = checkCompletedApp(1, SectionId);
        var App2QPlusComplete = false;
        var ApplicationNumber = 1;
        var IsValid = ValidateQuote();

        if ($('.jointPolicyYes').prop('checked') === true && IsValid && $(".jointPolicySet").is(":visible")) {

            if ($("#optionQuotePlus").val() === "False") {
                App2QPlusComplete = true;
            } else {
                App2QPlusComplete = checkCompletedApp(2, null);
            }

            ApplicationNumber = 2;
        }
        setQPlusSmokerStatus();

        if ($("#optionQuotePlus").val() === "False") {
            if (IsValid) {
                if ($('.jointPolicyYes').prop('checked') === true) {
                    window.dataLayer.push({ 'event': 'Other_Applicant' });
                    $('.jointPolicySet').show();
                    App1QPlusComplete = true;
                    // We're not using Quote+ so in order for App2 to be complete we just need the names, DOB & Smoking data
                    //App2QPlusComplete = true;
                    //App2QPlusComplete = checkCompletedApp(2, null);
                    if (App1QPlusComplete === true && App2QPlusComplete === true) {
                        showNextSection = false;
                    } else {
                        showNextSection = true;
                    }

                    Display_Buttons(showNextSection, App1QPlusComplete, App2QPlusComplete);
                } else {
                    Display_Buttons(true, true, true);
                }
            }
        }

        // Get the last visible section element ID, trim the start of the string and trim the last 5 characters to leave the Section ID value
        if (SectionId != null) {
            if (IsValid) {
                // Ajax call returns status of 'false' if no Excellent/Good quotes returned
                var result = false;
                var App1ShowWaist = false;
                var App2ShowWaist = false;
                var formData = $("form[id='Quote']").toJSON();
                $.ajax({
                    url: "/Quote/GetQuoteplusContinueJourney",
                    type: "POST",
                    data: JSON.stringify({
                        'objQuotePlusVwQuote': formData,
                        'sectionID': SectionId,
                        'appNumber': ApplicationNumber
                    }),
                    async: false,
                    cache: false,
                    contentType: "application/json",
                    dataType: "json",
                    success: function(data) {
                        result = data.Status;
                        App1ShowWaist = data.App1ShowWaist;
                        App2ShowWaist = data.App2ShowWaist;
                        if (ApplicationNumber === 1 && result === false)
                            App1JourneyEnded = true;
                        if (ApplicationNumber === 2 && result === false) {
                            App2JourneyEnded = true;
                            App2QPlusComplete = true;
                        }
                        $("#QuotePlusApplicationId").val(data.ApplicationId);
                    }
                });

                if (App1QPlusComplete && App2QPlusComplete)
                    result = false;

                applyWaistSettings(App1ShowWaist, App2ShowWaist, true);

                IsValid = ValidateQuote();
                if (IsValid) {
                    Display_Buttons(result, App1QPlusComplete, App2QPlusComplete);
                    ShowNextSection(result, false);
                } else {
                    if ($("input[class*='error'], select[class*='error']").not("input[type='hidden']").first().length >
                        0) {
                        $("input[class*='error'], select[class*='error']").not("input[type='hidden']").first().focus();
                        $("html, body").animate({
                                scrollTop: $("input[class*='error'], select[class*='error']")
                                    .not("input[type='hidden']")
                                    .first()
                                    .offset().top -
                                    100
                            },
                            0);
                    }
                }

            } else {
                if ($('input[class*="error"], select[class*="error"]').not("input[type='hidden']").first().length > 0) {
                    $('input[class*="error"], select[class*="error"]').not("input[type='hidden']").first().focus();
                    $('html, body').animate({
                            scrollTop: $('input[class*="error"], select[class*="error"]').not("input[type='hidden']")
                                .first().offset().top -
                                100
                        },
                        0);
                }
            }
        }

    });

    (function($) {
        $.fn.toJSON = function() {
            var obj = {};
            $(this).find("input:text, input[type=number], input[type=email], select, input:radio:checked, input:hidden")
                .each(function() {
                    var name = $(this).attr("name");
                    if (name !== undefined) {
                        var val = $(this).val();
                        obj[name] = val;
                    }
                });
            return obj;
        }
    })(jQuery);

    function ShowNextSection(result, toggleSingleJoint) {
        var sumAssured = $("#SumAssured").val();
        if (result) {
            if ($(".jointPolicySet").is(":visible")) {
                var numApp2HiddenSections = $('fieldset[id^="Section_"][id$="_App2"]:visible')
                    .nextAll('fieldset[id^="Section_"][id$="_App2"]:hidden').length;

                var numApp2VisibleSections = $('fieldset[id^="Section_"][id$="_App2"]:visible').length + 1;

                if (numApp2HiddenSections > 0) {
                    if (!toggleSingleJoint) {

                        var app2SectionID = $('fieldset[id^="Section_"][id$="_App2"]:visible').next('fieldset[id^="Section_"][id$="_App2"]:hidden').attr("id");

                        $('fieldset[id^="Section_"][id$="_App2"]:visible')
                            .next('fieldset[id^="Section_"][id$="_App2"]:hidden')
                            .addClass("section_open").addClass("openedApp2_section" + numApp2VisibleSections).show();

                        // Use the sectionID as above to deterime which has been opened.
                        if (app2SectionID == app2Section2ID) {
                            window.dataLayer.push({ 'event': 'Applicant_2_Medical_Pt_1' });
                            window.dataLayer.push({ 'event': 'Applicant_2_Data_Consent_1_Tick', 'Applicant_2_Data_Consent_1_Value': 'Yes' });
                        } else if (app2SectionID == app2Section3ID) {
                            window.dataLayer.push({ 'event': 'Applicant_2_Medical_Pt_2' });
                            window.dataLayer.push({ 'event': 'Applicant_2_Data_Consent_2_Tick', 'Applicant_2_Data_Consent_2_Value': 'Yes' });
                        } else if (app2SectionID == app2Section4ID) {
                            window.dataLayer.push({ 'event': 'Applicant_2_Medical_Pt_3' });
                            window.dataLayer.push({ 'event': 'Applicant_2_Data_Consent_3_Tick', 'Applicant_2_Data_Consent_3_Value': 'Yes' });
                        }
                        scrollToTheTop($('fieldset[id^="Section_"][id$="_App2"]:visible').last().first('div.input-group__item label'));
                    }
                }
                if (numApp2VisibleSections === 4) {
                    $(".qp_totalcover").val(sumAssured);
                }
            }
            if ($(".jointPolicySet").is(":hidden")) {
                var numApp1HiddenSections = $('fieldset[id^="Section_"][id$="_App1"]:visible')
                    .nextAll('fieldset[id^="Section_"][id$="_App1"]:hidden').length;

                var numApp1VisibleSections = $('fieldset[id^="Section_"][id$="_App1"]:visible').length + 1;

                if (numApp1HiddenSections > 0) {
                    if (!toggleSingleJoint) {

                        var app1SectionID = $('fieldset[id^="Section_"][id$="_App1"]:visible')
                            .next('fieldset[id^="Section_"][id$="_App1"]:hidden').attr("id");

                        $('fieldset[id^="Section_"][id$="_App1"]:visible')
                            .next('fieldset[id^="Section_"][id$="_App1"]:hidden')
                            .addClass("section_open").addClass("openedApp1_section" + numApp1VisibleSections).show();
                        
                        // Use the sectionID as above to deterime which has been opened.
                        if (app1SectionID == app1Section2ID) {
                            window.dataLayer.push({ 'event': 'Medical_Pt_1' });
                        } else if (app1SectionID == app1Section3ID) {
                            window.dataLayer.push({ 'event': 'Medical_Pt_2' });
                            window.dataLayer.push({ 'event': 'Data_Consent_2_Tick', 'Data_Consent_2_Value': 'Yes' });
                        } else if (app1SectionID == app1Section4ID) {
                            window.dataLayer.push({ 'event': 'Medical_Pt_3' });
                            window.dataLayer.push({ 'event': 'Data_Consent_3_Tick', 'Data_Consent_3_Value': 'Yes' });
                        }
                        scrollToTheTop($('fieldset[id^="Section_"][id$="_App1"]:visible').last().first('div.input-group__item label'));
                    }
                } else {
                    if ($('.jointPolicyYes').prop('checked') === true && !$(".jointPolicySet").is(":visible")) {
                        Initialise_JointApplication();
                    }
                }

                if (numApp1VisibleSections === 4) {
                    $(".qp_totalcover").val(sumAssured);
                }

            }
        } else {
            if ($(".jointPolicySet").is(":hidden") &&
                $('.jointPolicyYes').prop('checked') === true &&
                !$(".jointPolicySet").is(":visible")) {
                Initialise_JointApplication();
            }


        }
    }


    function scrollToTheTop(obj) {

        $("html, body").animate({
                scrollTop: obj.offset().top
            },0);
        
    }

    function checkCompletedApp(appNumber, SectionNum) {
        var AppQPlusComplete = false;
        var SectionComplete = false;
        var numAppHiddenSections = $('fieldset[id^="Section_"][id$="_App' + appNumber + '"]:visible')
            .nextAll('fieldset[id^="Section_"][id$="_App' + appNumber + '"]:hidden').length;

        if (appNumber === 1) {
            if (SectionNum != null && numAppHiddenSections === 0) {

                var NumberVisible = ($('fieldset[id="Section_' + SectionNum + '_App' + appNumber + '"]')
                    .find('input[type="radio"]:visible').length /
                    2);
                var NumberChecked = $('fieldset[id="Section_' + SectionNum + '_App' + appNumber + '"]')
                    .find('input[type="radio"]:checked').length;

                if (NumberVisible == NumberChecked)
                    SectionComplete = true;
            }

            if ((numAppHiddenSections === 0 && SectionComplete) || App1JourneyEnded)
                AppQPlusComplete = true;
        }
        if (appNumber === 2) {
            if ($("#optionQuotePlus").val() === "True") {

                if (numAppHiddenSections === 0 || App2JourneyEnded)
                    AppQPlusComplete = true;
            } else {
                if (numAppHiddenSections === 0 && SectionComplete) {
                    AppQPlusComplete = true;
                }
            }

        }
        return AppQPlusComplete;
    }

    function DisplayOpenSections() {
        $('.section_open').show();
        $('[class*="openedApp1"]').show();
        if ($(".jointPolicySet").is(":visible"))
            $('[class*="openedApp2"]').show();
    }

    function Initialise_JointApplication() {
        var SectionDesc = $('fieldset[id^="Section_"]:visible').last().attr("id");
        if (SectionDesc != null)
            var SectionId = SectionDesc.replace("Section_", "").slice(0, -5);
        var App1QPlusComplete = checkCompletedApp(1, SectionId);

        if ($('.jointPolicyYes').prop('checked') === true && (App1QPlusComplete || App1JourneyEnded)) {
            $('.jointPolicySet').show();
            window.dataLayer.push({ 'event': 'Other_Applicant' });
            $('fieldset[id^="Section_"][id$="_App2"]').hide();
            $('fieldset[id^="Section_"][id$="_App2"]:first').show();
            $('fieldset[id^="Section_"][id$="_App2"]:first').addClass("section_open").addClass("openedApp2_section1");
        }
    }

    function Display_Buttons(showNextSection, app1Completed, app2Completed) {
        if ($('.jointPolicyYes').prop('checked') === true) {
            if (!showNextSection && (app2Completed && app1Completed)) {
                showGetQuote_hideNext();
            } else {
                showNext_hideGetQuote();
            }
        } else {
            if (!showNextSection || app1Completed) {
                showGetQuote_hideNext();
            } else {
                showNext_hideGetQuote();
            }
        }
    }

    function showGetQuote_hideNext() {
        $('#txtSubmit').show();
        $('#btnSubmit').show();
        if ($(".jointPolicySet").is(":visible")) {
            window.dataLayer.push({ 'event': 'Applicant_2_Get_Your_Quote' });
        }
        
        $('#btnNext').hide();
    }

    function showNext_hideGetQuote() {
        $('#txtSubmit').hide();
        $('#btnSubmit').hide();
        $('#btnNext').show();
    }


    var setDoBMMText = function() {

        $("#Applicant1_DOBMM > option, #Applicant2_DOBMM > option").each(function() {
            if (this.text === "MM")
                this.text = "Month";
            if (this.text === "01")
                this.text = "January";
            if (this.text === "02")
                this.text = "February";
            if (this.text === "03")
                this.text = "March";
            if (this.text === "04")
                this.text = "April";
            if (this.text === "05")
                this.text = "May";
            if (this.text === "06")
                this.text = "June";
            if (this.text === "07")
                this.text = "July";
            if (this.text === "08")
                this.text = "August";
            if (this.text === "09")
                this.text = "September";
            if (this.text === "10")
                this.text = "October";
            if (this.text === "11")
                this.text = "November";
            if (this.text === "12")
                this.text = "December";
        });
    }

    var setupQuotePlus = function() {

        showRelevantSet();

        $('.quote-options input[type=radio]').change(showRelevantSet);
        $('#Quote').addClass('lbl-left align-r clearfix full-page');

        function showRelevantSet() {
            if ($('.optionQuotePlus').prop('checked') === true) {
                $("#optionQuotePlus").val("True");
            } else if ($('.optionQuotePlus').prop('checked') === false) {
                $("#optionQuotePlus").val("False");
            }

            if ($('#optionQuotePlus').val() == "True" || $('.optionQuotePlus').prop('checked') === true) {
                $('.extra-questions').show();
                $('.bordered-section.jointPolicySet, .bordered-section.singlePolicySet').addClass('hasqplus');

                if ($('.jointPolicyYes').prop('checked') === true) {
                    $('.extra-questions.extra-questions_app1').addClass('isvisible');
                    $('.extra-questions.extra-questions_app2').addClass('isvisible');
                    $('.bordered-section.singlePolicySet').addClass('isalone');
                    $('.extra-questions.extra-questions_app1, .extra-questions.extra-questions_app2')
                        .removeAttr('style');
                } else {
                    $('.extra-questions.extra-questions_app1').addClass('isvisiblealone');
                    $('.extra-questions.extra-questions_app2').addClass('ishidden');
                    $('.bordered-section.singlePolicySet').removeClass('isalone');
                    $('.extra-questions.extra-questions_app1, .extra-questions.extra-questions_app2')
                        .removeAttr('style');
                }

                $('#Quote').removeAttr('style');
            } else {
                $('.extra-questions').hide();
                $('.bordered-section.jointPolicySet, .bordered-section.singlePolicySet').removeClass('hasqplus');
                $('.extra-questions.extra-questions_app2, .extra-questions.extra-questions_app1')
                    .removeClass('isvisible');

                if ($('.jointPolicyYes').prop('checked') === true) {
                    $('.bordered-section.singlePolicySet').addClass('isalone');
                } else {
                    $('.bordered-section.singlePolicySet').removeClass('isalone');
                }
            }
        }
    }

    /*
    Joint Policy - additional applicant toggle
    */
    var jointPolicy = function() {
        if ($('.jointPolicyYes').prop('checked') === true) {
            $('.jointPolicySet').show();
            $('#Applicant2_AppIsValid').val('True');
            $('.box-blue.singlePolicySet').removeClass('isalone');
            $('.extra-questions.extra-questions_app2').removeClass('ishidden');
            $('.extra-questions.extra-questions_app2').addClass('isvisible');
            $('.extra-questions.extra-questions_app1').removeClass('isvisiblealone');
            $('.extra-questions.extra-questions_app1').addClass('isvisible');
            App2JourneyEnded = false;
        } else {
            $('.jointPolicySet').hide();
            $('#Applicant2_AppIsValid').val('False');
            $('.extra-questions.extra-questions_app2').removeClass('isvisible').toggleClass('ishidden');
            $('.extra-questions.extra-questions_app2').addClass('ishidden');
            $('.box-blue.singlePolicySet').addClass('isalone');
            $('fieldset[id^="Section_"][id$="_App1"]').hide();
            $('fieldset[id^="Section_"][id$="_App1"]:first').show();
            $('fieldset[id^="Section_"][id$="_App1"]:first').addClass("section_open");
            $('#btnSubmit').hide();
            $('#txtSubmit').hide();
            if ($('#optionQuotePlus').val() == "True" || $('.optionQuotePlus').prop('checked') === true) {
                $('.extra-questions.extra-questions_app1').removeClass('isvisible');
                $('.extra-questions.extra-questions_app1').addClass('isvisiblealone');
            }
            App2JourneyEnded = true;
        }

    }

    function checkSmokerSettings(AppNum) {

        // Applicant1_SmokerStatus
        // Applicant1_DailySmokingAmount
        // Applicant1_IsYearsSinceSmoked hidden
        // Applicant1_YearsSinceSmoked

        // Because the Q+ smoker questions are distributor and environment (test/live) specific,
        // We have to read them from the target question
        // 31 in test
        var QPQuestion = $("#Applicant" + AppNum + "_DailySmokingAmount").data('qp-target-field');

        // Ex-smoker
        // Gave up < 12 months ago - has a value of 0 or 
        // Gave up x years ago - has a value of 1 (see next comment for x definition)
        var IsYearsSince = $("#Applicant" + AppNum + "_IsYearsSinceSmoked").val();

        // The x in Gave up x years ago
        var YearsSince = $("#Applicant" + AppNum + "_YearsSinceSmoked").val();

        // This value is used when Current smoker or Ex smoker (Gave up < 12 months ago)
        var DailyAmount = $("#Applicant" + AppNum + "_DailySmokingAmount").val();

        // Clear any selected option from the hidden Q+ Smoking drop-down
        $("div.App" + AppNum + "Answers select.Answer" + QPQuestion + " option:selected").removeAttr("selected");
        $("div.App" + AppNum + "Answers select.Answer" + QPQuestion).prop('selectedIndex', 0);

        if ($("#Applicant" + AppNum + "_SmokerStatus-1").prop('checked') === true) {
            // Never smoked
            $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select option[value=0]")
                .attr('selected', 'selected');
            $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select").prop('selectedIndex', 0);

        } else if ($("#Applicant" + AppNum + "_SmokerStatus-2").prop('checked') === true) {
            // Currently smoke
            SetQPlusSmokerSelect("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select", DailyAmount);

        } else if ($("#Applicant" + AppNum + "_SmokerStatus-3").prop('checked') === true) {
            // Ex-smoker
            if (IsYearsSince == 0) {
                // Gave up less than 12 months ago!
                SetQPlusSmokerSelect("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select", DailyAmount);
            } else {
                if (YearsSince < 5) {
                    $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select option[value=2]")
                        .attr('selected', 'selected');
                    $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select").prop('selectedIndex', 2);
                } else {
                    $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select option[value=1]")
                        .attr('selected', 'selected');
                    $("div.App" + AppNum + "Answers.Answer" + QPQuestion + " select").prop('selectedIndex', 1);
                }
            }
        }
    }

    function SetQPlusSmokerSelect(thisSelector, DailyAmount) {
        switch (true) {
        case (DailyAmount <= 20):
            $(thisSelector + " option[value=4]").attr('selected', 'selected');
            $(thisSelector).prop('selectedIndex', 3);
            break;
        case (DailyAmount <= 30):
            $(thisSelector + " option[value=5]").attr('selected', 'selected');
            $(thisSelector).prop('selectedIndex', 4);
            break;
        case (DailyAmount <= 40):
            $(thisSelector + " option[value=6]").attr('selected', 'selected');
            $(thisSelector).prop('selectedIndex', 5);
            break;
        case (DailyAmount <= 50):
            $(thisSelector + " option[value=7]").attr('selected', 'selected');
            $(thisSelector).prop('selectedIndex', 6);
            break;
        case (DailyAmount > 50):
            $(thisSelector + " option[value=8]").attr('selected', 'selected');
            $(thisSelector).prop('selectedIndex', 7);
            break;
        }
    }

    var setQPlusSmokerStatus = function() {
        checkSmokerSettings(1);
        if ($('.jointPolicyYes').prop('checked') === true) {
            checkSmokerSettings(2);
        }
    }

    var setQPlusSumAssured = function() {
        var txtVal = jQuery.trim($("#SumAssured").val().replace(/\,/g, ""));
        $("#Applicant1_QuestionSet_4__AnswerValue").val(txtVal);
        if ($('.jointPolicyYes').prop('checked') === true) {
            $("#Applicant2_QuestionSet_0__AnswerValue").val(txtVal);
        }
    }

    var SmokePerDayAndYearsSince = function() {

        $(
                "#Applicant1_DailySmokingAmount, #Applicant2_DailySmokingAmount, #Applicant1_YearsSinceSmoked, #Applicant2_YearsSinceSmoked")
            .click(function(e) {
                hasSmkFocus(this, e);
            }).focusin(function(e) {
                hasSmkFocus(this, e);
            });


        function hasSmkFocus(smkVal, e) {
            var txtVal = jQuery.trim($(smkVal).val().replace(/\,/g, ''));
            processSmk(smkVal, txtVal, e);
        }

        function processSmk(smkVal, txtVal, e) {
            if (txtVal == "0") {
                $(smkVal).val("");
            } else {
                if ($.isNumeric(txtVal)) {
                    isValidNum = true;

                }
                if (txtVal != jQuery.trim($(smkVal).val())) {
                    $(smkVal).val(txtVal);
                }
            }
        }
    }

    var smokingQuestions = function() {
        $("#Applicant1_SmokerStatus-1, #Applicant2_SmokerStatus-1").click(function() {

            //PHIL remove the error class from the correct span

            var AppNum = ($(this).prop("id") == "Applicant1_SmokerStatus-1" ? "1" : "2");
            $("#Applicant" + AppNum + "_SmokerStatus").siblings("span").removeClass("error2");
            var prefix = "fieldset.App" + AppNum + "Answers ";
            
            $(prefix + "div.indented-section.smoke-amount").hide();
            $(prefix + "div.indented-section.ex-smoker").hide();
            $(prefix + "div.indented-section.yearsSinceSmoked").hide();
            $("#Applicant" + AppNum + "_SmokerStatus").val("1");

            if (AppNum === "1") {
                window.dataLayer.push({ 'event': 'Lifestyle_Smoking_Click', 'Lifestyle_Smoking_Value': 'Never Smoked' });
            } else {
                window.dataLayer.push({ 'event': 'Applicant_2_Lifestyle_Smoking_Click', 'Applicant_2_Lifestyle_Smoking_Value': 'Never Smoked' });
            }

        });

        $("#Applicant1_SmokerStatus-2, #Applicant2_SmokerStatus-2").click(function () {

            var AppNum = ($(this).prop("id") == "Applicant1_SmokerStatus-2" ? "1" : "2");
            $("#Applicant" + AppNum + "_SmokerStatus").siblings("span").removeClass("error2");
            var prefix = "fieldset.App" + AppNum + "Answers ";

            $("#Applicant" + AppNum + "_IsYearsSinceSmoked-1").trigger("click");

            $(prefix + "div.indented-section.smoke-amount").show();
            $(prefix + "div.indented-section.ex-smoker").hide();
            $(prefix + "div.indented-section.yearsSinceSmoked").hide();
            $("#Applicant" + AppNum + "_SmokerStatus").val("2");


            if (AppNum === "1") {
                window.dataLayer.push({ 'event': 'Lifestyle_Smoking_Click', 'Lifestyle_Smoking_Value': 'Currently Smoke' });
            } else {
                window.dataLayer.push({ 'event': 'Applicant_2_Lifestyle_Smoking_Click', 'Applicant_2_Lifestyle_Smoking_Value': 'Currently Smoke' });
            }

        });

        $("#Applicant1_SmokerStatus-3, #Applicant2_SmokerStatus-3").click(function () {

            var AppNum = ($(this).prop("id") == "Applicant1_SmokerStatus-3" ? "1" : "2");
            $("#Applicant" + AppNum + "_SmokerStatus").siblings("span").removeClass("error2");

            var prefix = "fieldset.App" + AppNum + "Answers ";
            var yss = $("#Applicant" + AppNum + "_IsYearsSinceSmoked").val();

            $(prefix + "div.indented-section.smoke-amount").show();
            $(prefix + "div.indented-section.ex-smoker").show();

            if (yss == "0") {
                $(prefix + " div.indented-section.yearsSinceSmoked").hide();
            } else {
                $(prefix + " div.indented-section.yearsSinceSmoked").show();
            }
            $("#Applicant" + AppNum + "_SmokerStatus").val("3");

            if (AppNum === "1") {
                window.dataLayer.push({ 'event': 'Lifestyle_Smoking_Click', 'Lifestyle_Smoking_Value': 'Ex-Smoker' });
            } else {
                window.dataLayer.push({ 'event': 'Applicant_2_Lifestyle_Smoking_Click', 'Applicant_2_Lifestyle_Smoking_Value': 'Ex-Smoker' });
            }

        });

        $('#Applicant1_DailySmokingAmount, #Applicant2_DailySmokingAmount, #Applicant1_YearsSinceSmoked, #Applicant2_YearsSinceSmoked').blur(function () {
            var thisId = $(this).prop("id");
            if ($(this).val() != "" && $(this).val() != "0") {
                $(this).removeClass("error");
                $("label[for='" + thisId + "']").removeClass("field-validation-error");
            } else {
                $(this).addClass("error");
                $("label[for='" + thisId + "']").addClass("field-validation-error");
            }
        });
        
        $("#Applicant1_IsYearsSinceSmoked-1, #Applicant2_IsYearsSinceSmoked-1").click(function () {

            var AppNum = ($(this).prop("id") == "Applicant1_IsYearsSinceSmoked-1" ? "1" : "2");
            var fieldID = "#Applicant" + AppNum + "_IsYearsSinceSmoked";
            var prefix = "fieldset.App" + AppNum + "Answers ";

            $("#Applicant" + AppNum + "_YearsSinceSmoked").removeClass("error");
            $("label[for='Applicant" + AppNum + "_YearsSinceSmoked']").removeClass("field-validation-error");

            $(fieldID).val("0");
            $(prefix + "div.indented-section.yearsSinceSmoked").hide();
            

            
            if (AppNum === "1") {
                window.dataLayer.push({ 'event': 'Lifestyle_Ex-Smoker_Click', 'Lifestyle_Ex-Smoker_Value': 'Less than 12 months' });
            } else {
                window.dataLayer.push({ 'event': 'Applicant_2_Lifestyle_Ex-Smoker_Click', 'Applicant_2_Lifestyle_Ex-Smoker_Value': 'Less than 12 months' });
            }

        });

        $("#Applicant1_IsYearsSinceSmoked-2, #Applicant2_IsYearsSinceSmoked-2").click(function() {
            var fieldID = "#Applicant1_IsYearsSinceSmoked";
            var prefix = "fieldset.App1Answers ";
            if ($(this).attr("id") == "Applicant2_IsYearsSinceSmoked-2") {
                prefix = "fieldset.App2Answers ";
                fieldID = "#Applicant2_IsYearsSinceSmoked";
            }
            $(prefix + "div.indented-section.yearsSinceSmoked").show();
            $(fieldID).val("1");

            var AppNum = ($(this).attr("id") == "Applicant2_IsYearsSinceSmoked-1" ? 2 : 1);

            if (AppNum === 1) {
                window.dataLayer.push({ 'event': 'Lifestyle_Ex-Smoker_Click', 'Lifestyle_Ex-Smoker_Value': 'More than 12 months' });
            } else {
                window.dataLayer.push({ 'event': 'Applicant_2_Lifestyle_Ex-Smoker_Click', 'Applicant_2_Lifestyle_Ex-Smoker_Value': 'More than 12 months' });
            }

        });

        if ($("#Applicant1_SmokerStatus").val() == "1") {
            $("fieldset.App1Answers div.indented-section.smoke-amount").hide();
            $("fieldset.App1Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App1Answers div.indented-section.yearsSinceSmoked").hide();
        } else if ($("#Applicant1_SmokerStatus").val() == "2") {
            $("fieldset.App1Answers div.indented-section.smoke-amount").show();
            $("fieldset.App1Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App1Answers div.indented-section.yearsSinceSmoked").hide();
        } else if ($("#Applicant1_SmokerStatus").val() == "3") {
            $("fieldset.App1Answers div.indented-section.smoke-amount").show();
            $("fieldset.App1Answers div.indented-section.ex-smoker").show();

            if ($("#Applicant1_IsYearsSinceSmoked").val() == "0") {
                $("fieldset.App1Answers div.indented-section.yearsSinceSmoked").hide();
            } else {
                $("fieldset.App1Answers div.indented-section.yearsSinceSmoked").show();
            }
        } else {
            $("fieldset.App1Answers div.indented-section.smoke-amount").hide();
            $("fieldset.App1Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App1Answers div.indented-section.yearsSinceSmoked").hide();
        }

        if ($("#Applicant2_SmokerStatus").val() == "1") {
            $("fieldset.App2Answers div.indented-section.smoke-amount").hide();
            $("fieldset.App2Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App2Answers div.indented-section.yearsSinceSmoked").hide();
        } else if ($("#Applicant2_SmokerStatus").val() == "2") {
            $("fieldset.App2Answers div.indented-section.smoke-amount").show();
            $("fieldset.App2Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App2Answers div.indented-section.yearsSinceSmoked").hide();
        } else if ($("#Applicant2_SmokerStatus").val() == "3") {
            $("fieldset.App2Answers div.indented-section.smoke-amount").show();
            $("fieldset.App2Answers div.indented-section.ex-smoker").show();

            if ($("#Applicant2_IsYearsSinceSmoked").val() == "0") {
                $("fieldset.App2Answers div.indented-section.yearsSinceSmoked").hide();
            } else {
                $("fieldset.App2Answers div.indented-section.yearsSinceSmoked").show();
            }
        } else {
            $("fieldset.App2Answers div.indented-section.smoke-amount").hide();
            $("fieldset.App2Answers div.indented-section.ex-smoker").hide();
            $("fieldset.App2Answers div.indented-section.yearsSinceSmoked").hide();
        }
    }

    var ChosenQuoteApp2Email = function() {
        $(".add-email-link").click(function() {
            $(this).hide();
            $("#app2Email").show();
        });
    }


    var SetChosenQuoteEmailChangeHandler = function() {
        $('#App1Email, #App2Email').change(function() {
            IsChosenQuoteEmailValid($(this));
        });
    }

    var IsChosenQuoteEmailValid = function(email) {

        // Only very simple email validation is required here.
        // The field should not be empty and should contain 
        // within it a '@', though not at the start nor at the end.
        var Email = email.val();

        var isValid = (Email.length > 0 && Email.indexOf("@") > 0 && Email.indexOf("@") < Email.length);

        if (isValid === false) {
            email.addClass("error");
            $('#span' + email.attr("id")).text("Invalid email address");
        } else {
            // try with regex
            var pattern =
                /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
            isValid = pattern.test(Email);
            if (isValid) {
                email.removeClass("error");
                $('#span' + email.attr("id")).text("");
            } else {
                email.addClass("error");
                $('#span' + email.attr("id")).text("Invalid email address");
            }
        }
        return isValid;
    }

    var SetWoPDifference = function(HasWop, HasIdx) {
        // Indexed checked
        if ($('#NoNullIsIndexed').is(':checked')) {
            $("#idxInclude").hide();
            $("#idxI").show();
            $("#idxAdded").show();
            $("#ExtraIdx").hide();

        }

        // Indexed is not
        if ($("#NoNullIsIndexed").prop('checked') == false) {
            $("#idxInclude").show();
            $("#idxI").hide();
            $("#idxAdded").hide();
            $("#ExtraIdx").show();
        }
    }

    /********************************************************************
    ******************    START OF DECLARATION    ***********************
    ********************************************************************/
    $('#decsubmit').css({
        "cursor": "default",
        "color": "#999",
        "background": "#eee",
        "box-shadow": "none",
        "border-color": "#ddd"
    });

    $('#decsubmit').click( function (e) {
        if (!$("#DeclarationAgreement").prop('checked')) {
            e.preventDefault();
        }
    });

    $(".information.cic").click(function() {
        window.dataLayer.push({ 'event': 'Results_Policy_Add_Critical_Illness_Click', 'Results_Policy_Add_Critical_Illness_Value': 'Learn More' });
    });

    // Attach a click event to the checkbox to dis/en able the submit button
    $('#DeclarationAgreement').click(function(e) {
        if ($('#DeclarationAgreement').prop('checked') == true) {
            $('#decsubmit').removeAttr("style");
            $("#lblDec").removeClass("SetRed");
        } else {
            $('#decsubmit').css({
                "cursor": "default",
                "color": "#999",
                "background": "#eee",
                "box-shadow": "none",
                "border-color": "#ddd"
            });
        }
    });

    var cbdefaults = {
        iframe: true,
        width: '75%',
        height: '50%',
        open: false
    };

    $(".faq-trigger").click(function () {
        $(".faq-trigger").colorbox({
            iframe: true,
            width: '860px',
            height: '600px',
            href: function () {
                var url = $(this).attr('href');
                return url;
            }
        });
    });

    $(".information.cic").click(function() {
            $(".information.cic").colorbox($.extend(cbdefaults,
                {
                    href: "Results/InformationOverlay/?Overlay=CIC",
                }));
    });

    function SetCBDefaults() {
        cbdefaults = {
            iframe: true,
            width: '75%',
            height: '75%',
            open: false
        };        
    }

    $(".declaration.dps").click(function () {
        SetCBDefaults();
        $(".declaration.dps").colorbox($.extend(cbdefaults,
            {
                href: "Declaration/InformationOverlay/?Overlay=DPS",
            }));
    });

    $(".declaration.dpbs").click(function () {
        SetCBDefaults();
        $(".declaration.dpbs").colorbox($.extend(cbdefaults,
            {
                href: "Declaration/InformationOverlay/?Overlay=DPBS",
            }));
    });

    $(".declaration.mls").click(function () {
        SetCBDefaults();
        $(".declaration.mls").colorbox($.extend(cbdefaults,
            {
                href: "Declaration/InformationOverlay/?Overlay=MLS",
            }));
    });

    $(".declaration.mra").click(function () {
        SetCBDefaults();
        $(".declaration.mra").colorbox($.extend(cbdefaults,
            {
                href: "Declaration/InformationOverlay/?Overlay=MRA",
            }));
    });

    /********************************************************************
    ******************    END OF DECLARATION   **************************
    ********************************************************************/

    // Added from: 
    // http://stackoverflow.com/questions/4617638/detect-ipad-users-using-jquery/4617648
    // 
    function isApple() {
        return (
            //Detect iPhone
            (navigator.platform.indexOf("iPhone") != -1) ||
                //Detect iPad
                (navigator.platform.indexOf("iPad") != -1)
        );
    }

    function isMobile() {
        return ($(window).width() < 700 || navigator.platform.indexOf("iPhone") != -1);
    }

    /* Current tariff
    ================================================================= */
    var currentTariff = function() {
        $(".current-tariff-trigger").click(function() {
            if ($(this).is(":visible")) {
                toggleButtonState($(this), 'icon-caret-down', 'icon-caret-up', $(this).text());
                $(".current-tariff").slideToggle();
            }
        });
    }

    /* FAQ
    ================================================================= */
    var faq = function() {
        function alignContent(trigger) {
            var winTop = $(window).scrollTop(),
                content = $(".faq-content");

            //Work out where trigger/content container is vertically
            var triggerY = Math.floor(trigger.position().top);
            var contentY = 0; //Math.floor($('.faq-container').offset().top);

            //Get height of modal content container
            var containerHeight = $(".modal-inner").height() - contentY;

            //Get height of content box
            var contentHeight = $(content).outerHeight();

            if (contentHeight < containerHeight) {
                //Move content box to trigger
                var move = triggerY - contentY - 20;

                //If move will push content past bottom of document
                if ((contentHeight + move) >= containerHeight) {
                    move = containerHeight - contentHeight;
                }

                content.animate({ top: move + 'px' }, 300);
            }
        }

        function loadQuestion(trigger) {
            var title = "<h3>" + trigger.text() + "</h3>";
            var content = trigger.next().html();
            var iconhtml = '<i class="icon icon-arrow-right"></i>';

            trigger.append(iconhtml);
            trigger.addClass("active");
            $(".faq-content").html(title + content);
            alignContent(trigger);
        }

        //init
        if ($(".faq li a").length) {
            loadQuestion($(".faq li:first-child a"));
        }

        //Action based call
        $(".faq a").click(function() {
            $(".faq a").removeClass("active");
            $(".faq a .icon").remove();
            loadQuestion($(this));
        });
    }


    function toggleButtonState($selector, beforeIcon, afterIcon, beforeText, afterText) {
        if (typeof $selector == 'string') {
            var $selector = $(selector);
        }

        // Cache the variables for speed
        var $icon = $selector.find('.icon');

        // Swap text function for reuability
        function swapText(text) {
            if (text !== '') {
                $selector.text(text);
            }
            $selector.append($icon);
        }

        function iconSwap(remove, add) {
            $icon.detach().removeClass(remove).addClass(add);

        }

        function changeStyle() {
            if ($selector.hasClass('btn-primary')) {
                $selector.removeClass('btn-primary');
                $selector.data('btn-primary', true);
            } else {
                if ($selector.data('btn-primary') === true) {
                    $selector.addClass('btn-primary');
                    $selector.data('btn-primary', false);
                }
            }
        }

        (function init() {
            if ($icon.hasClass(beforeIcon)) {
                iconSwap(beforeIcon, afterIcon);
                swapText(afterText);
            } else {
                iconSwap(afterIcon, beforeIcon);
                swapText(beforeText);
            }
            changeStyle();
        })();
    }


    var BankDetailsChanged = function() {

        $("#fnameofbankbs, #fnameofaccountholder").change(function() {
            if ($(this).val().length > 0) {
                $(this).removeClass("error");
                $(this).parent().find("label.fld-lbl").removeClass("error");
                $(this).parent().parent(".form-row").children(".fld-lbl").removeClass("error");
            } else {
                $(this).addClass("error");
                $(this).parent().parent(".form-row").children(".fld-lbl").addClass("error");
            }
        });

        $("#faccountnumber").blur(function() {
            if ($(this).val().length >= 7 && $(this).val().length <= 8) {

                if ($.isNumeric($(this).val())) {
                    if ($(this).val().indexOf(".") >= 0) {
                        $(this).addClass("error");
                    } else {
                        $(this).removeClass("error");
                    }
                } else {
                    $(this).addClass("error");
                }
            } else {
                $(this).addClass("error");
            }
        });

        $("#fsortcode1, #fsortcode2, #fsortcode3").blur(function() {
            if ($(this).val().length == 2) {
                if ($.isNumeric($(this).val())) {
                    if ($(this).val().indexOf(".") >= 0) {
                        $(this).addClass("error");
                    } else {
                        $(this).removeClass("error");
                    }
                } else {
                    $(this).addClass("error");
                    $(this).parent().parent(".form-row").children(".fld-lbl").addClass("error");
                }
            } else {
                $(this).addClass("error");
                $(this).parent().parent(".form-row").children(".fld-lbl").addClass("error");
            }
        });
    }

    /*====================================================================
    Constants
    ====================================================================*/
    var ALL_TEXTBOXES = "input[type='text'],input[type='number'],input[type='email']";
    var ALL_PHONES = "input[id*='Phone']";
    var APP1_PHONES = "input[id*='Phone']:not([id*='Applicant2'])";
    var APP2_PHONES = "input[id*='Phone'][id*='Applicant2']";
    var ALL_DDL_SELECTED_ITEMS = "select option:selected";

    var SetUpFurtherDetailsValidation = function() {

        var IsValid = true;
        // Firstly Remove all error classes from all items.
        $(".error").removeClass("error");
        $(".errorList").hide();


        var hasSecondApplicant = ($('#Has2ndApplicant').val() == 'True');
        var checkAddress_ddl = false;

        // Lets find out what's not passed valdation
        // 1st off empty textboxes
        $(ALL_TEXTBOXES).not('.lz_form_box').each(function (i, v) {

            if ($(v).val() == '') {
                if (($(v).attr("id") != 'Applicant_Address3') &&
                    ($(v).attr("id") != 'Applicant2_Address3') &&
                    ($(v).attr("id") != 'Applicant_Address4') &&
                    ($(v).attr("id") != 'Applicant2_Address4') &&
                    ($(v).attr("id") != 'Applicant_Address5') &&
                    ($(v).attr("id") != 'Applicant2_Address5')) {

                    // We'll only want to check the Address drop-down if there is no text in Address1 & 2
                    if (($(v).attr("id") == 'Applicant_Address1') ||
                        ($(v).attr("id") == 'Applicant_Address2')) {
                        checkAddress_ddl = true;
                    }
                    if (hasSecondApplicant == true) {
                        if (($(v).attr("id") == 'Applicant2_Address1') ||
                            ($(v).attr("id") == 'Applicant2_Address2')) {
                            checkAddress_ddl = true;
                        }
                    }

                    $(v).addClass("error");
                }
            }

            if ($(v).attr("id") == 'Applicant_Email' || $(v).attr("id") == 'Applicant2_Email') {
                if (IsChosenQuoteEmailValid($(v))) {
                    $(v).removeClass("error");
                    $(v).parent().find("label").removeClass("error");
                } else {
                    $(v).addClass("error");
                    //$("span#Applicant1.Email").addClass("field-validation-error");
                    $(v).parent().find("label").addClass("error");
                }
            }

        });

        //.not('select#lz_form_groups')
        // Hightlight all dropdown lists (Select) which are set to Select...
        $(ALL_DDL_SELECTED_ITEMS).each(function () {
            if ($(this).index() == 0) {

                if ($(this).parent().attr('id') != "lz_form_groups") {
                    // If this is one of the Address drop downs and they need checking (checkAddress_ddl == true) 
                    // then set them 2 red as well. Only do the 2nd applicant if there is one (hasSecondApplicant == true)
                    if (($(this).parent().attr("id") == 'Applicant_1_Address1') ||
                        ($(this).parent().attr("id") == 'Applicant_2_Address2')) {
                        if (checkAddress_ddl == true) {
                            if ($(this).parent().attr("id") == 'Applicant_2_Address2') {
                                if (hasSecondApplicant == true) {
                                    $(this).parent().addClass("error");
                                }
                            } else {
                                $(this).parent().addClass("error");
                            }
                        }
                    } else {
                        $(this).parent().addClass("error");
                    }
                }

            }
        });

        $(ALL_PHONES).removeClass("error");
        var phoneNo = 0;

        // Check all App1 Phones and if all are empty then flag this up
        $(APP1_PHONES).each(function(i, v) {
            if ($(this).val() == '') {
                phoneNo++;
            } else {
                if ( !(isValidHomePhone($(this).val()) || isValidMobilePhone($(this).val())) ) {
                    $(this).addClass("error");
                }
            }
        });
        if (phoneNo == 3) {
            $(APP1_PHONES).addClass("error");
        }

        phoneNo = 0;

        // Check all App2 Phones and if all are empty then flag this up
        $(APP2_PHONES).each(function(i, v) {
            if ($(this).val() == '') {
                phoneNo++;
            } else {
                if (!(isValidHomePhone($(this).val()) || isValidMobilePhone($(this).val()))) {
                    $(this).addClass("error");
                }
            }
        });
        if (phoneNo == 3) {
            $(APP2_PHONES).addClass("error");
        }

        // Also find the correpsonding label E.g.
        //<div class="form-label"><label for="Applicant_Email">Email</label>
        $(".error").parent(".form-row").children("label").addClass("error");

        if ($(".error").length > 0) {
            $(".errorList").show();
            IsValid = false;
        }

        // ***********************************************************************
        // Apps 1 & 2 Title 
        // ***********************************************************************
        $("[id^='Applicant1_AppTitle']").removeClass("error");
        $("span[id='Applicant.AppTitle']").hide();

        // App 1
        if ($("input[id*='Applicant1_AppTitle']").is(":checked")) {
            var titleVal = $("input[name='Applicant.AppTitle']:checked").val();
            $("#Applicant_AppTitle").val(titleVal);
        } else {
            IsValid = false;
            $("span[id='Applicant.AppTitle']").show();
            $("input[id*='Applicant1_AppTitle']").addClass("error");
        }

        if (hasSecondApplicant == true) {

            // App 2
            $("[id^='Applicant2_AppTitle']").removeClass("error");
            $("span[id='Applicant2.AppTitle']").hide();

            if ($("input[id*='Applicant2_AppTitle']").is(":checked")) {
                var titleVal = $("input[name='Applicant2.AppTitle']:checked").val();
                $("#Applicant2_AppTitle").val(titleVal);
            } else {
                IsValid = false;
                $("span[id='Applicant2.AppTitle']").show();
                $("input[id*='Applicant2_AppTitle']").addClass("error");
            }
        }

        // ***********************************************************************
        // Apps 1 & 2 Marital Status 
        // ***********************************************************************
        $("[id^='ApplicantAdditionalInfo_Marital']").removeClass("error");
        $("span[id='ApplicantAdditionalInfo.Marital']").hide();

        // App 1
        if ($("input[id*='ApplicantAdditionalInfo_Marital']").is(":checked")) {
            var MaritalVal = $("input[name='ApplicantAdditionalInfo.Marital']:checked").val();
            $("#ApplicantAdditionalInfo_Marital").val(MaritalVal);
        } else {
            IsValid = false;
            $("span[id='ApplicantAdditionalInfo.Marital']").show();
            $("input[id*='ApplicantAdditionalInfo_Marital']").addClass("error");
        }

        if (hasSecondApplicant == true) {

            $("[id^='ApplicantAdditionalInfo2_Marital']").removeClass("error");
            $("span[id='ApplicantAdditionalInfo2.Marital']").hide();

            // App 2
            if ($("input[id*='ApplicantAdditionalInfo2_Marital']").is(":checked")) {
                var MaritalVal = $("input[name='ApplicantAdditionalInfo2.Marital']:checked").val();
                $("#ApplicantAdditionalInfo2_Marital").val(MaritalVal);
            } else {
                IsValid = false;
                $("span[id='ApplicantAdditionalInfo2.Marital']").show();
                $("input[id*='ApplicantAdditionalInfo2_Marital']").addClass("error");
            }
        }


        // ***********************************************************************
        // Apps 1 & 2 Emp Status 
        // ***********************************************************************
        $("[id^='ApplicantAdditionalInfo_EmpStatus']").removeClass("error");
        $("span[id='ApplicantAdditionalInfo.EmpStatus']").hide();

        // App 1
        if ($("input[id*='ApplicantAdditionalInfo_EmpStatus']").is(":checked")) {
            var MaritalVal = $("input[name='ApplicantAdditionalInfo.EmpStatus']:checked").val();
            $("#ApplicantAdditionalInfo_EmpStatus").val(MaritalVal);
        } else {
            IsValid = false;
            $("span[id='ApplicantAdditionalInfo.EmpStatus']").show();
            $("input[id*='ApplicantAdditionalInfo_EmpStatus']").addClass("error");
        }

        if (hasSecondApplicant == true) {

            $("[id^='ApplicantAdditionalInfo2_EmpStatus']").removeClass("error");
            $("span[id='ApplicantAdditionalInfo2.EmpStatus']").hide();

            // App 1
            if ($("input[id*='ApplicantAdditionalInfo2_EmpStatus']").is(":checked")) {
                var MaritalVal = $("input[name='ApplicantAdditionalInfo2.EmpStatus']:checked").val();
                $("#ApplicantAdditionalInfo2_EmpStatus").val(MaritalVal);
            } else {
                IsValid = false;
                $("span[id='ApplicantAdditionalInfo2.EmpStatus']").show();
                $("input[id*='ApplicantAdditionalInfo2_EmpStatus']").addClass("error");
            }
        }

        return IsValid;

    }

    var SetUpApplicationValidation = function() {

        var IsValid = true;
        // Firstly Remove all error classes from all items.
        $(".error").removeClass("error");
        $(".errorList").hide();

        // Lets find out what's not passed valdation
        // 1st off empty textboxes
        $(ALL_TEXTBOXES).not('.lz_form_box').each(function (i, v) {
            var valText = $(v).val();
            if (valText == '') {
                if (($(v).attr("id") != 'fbankaddress1') &&
                    ($(v).attr("id") != 'fbankaddress2') &&
                    ($(v).attr("id") != 'fbankaddress3') &&
                    ($(v).attr("id") != 'fbankaddress4') &&
                    ($(v).attr("id") != 'fbankpostcode')) {

                    $(v).addClass("error");

                    $(v).parents('div.form-row').children('.fld-lbl').toggleClass('error');
                }
            } else if ($(v).attr("id") == 'faccountnumber') {

                if (valText.length >= 7 && valText.length <= 8) {
                    if ($.isNumeric(valText)) {
                        // isNumeric returns true for values with a decuimal point
                        if (valText.indexOf(".") >= 0) {
                            $(v).addClass("error");
                            IsValid = false;
                        }
                    } else {
                        $(v).addClass("error");
                        IsValid = false;
                    }
                } else {
                    $(v).addClass("error");
                    IsValid = false;
                }
            } else if (valText == '') {
                $(v).addClass("error");
                $(v).parents('div.form-row').children('.fld-lbl').toggleClass('error');
            }



        });

        var fullSortCode = "";
        // Check sort codes
        $("#fsortcode1, #fsortcode2, #fsortcode3").each(function() {

            var sortCode = $.trim($(this).val());
            fullSortCode = fullSortCode + sortCode;

            if (sortCode.length <= 1) {
                $(this).addClass("error");
            }

            if ($.isNumeric(sortCode)) {
                // isNumeric returns true for values with a decuimal point
                if (sortCode.indexOf(".") >= 0) {
                    $(this).addClass("error");
                }
            } else {
                $(this).addClass("error");
            }

            if ($(this).hasClass("error")) {
                IsValid = false;
                $(this).parent().parent(".form-row").children(".fld-lbl").addClass("error");
            }

        });


        if (IsValid == true && (fullSortCode != ddmSortCode || $("#faccountnumber").val() != ddmAccount)) {
            ddmAccount = $("#faccountnumber").val();
            ddmSortCode = fullSortCode;
            var result = "";
            $.ajax({
                url: "https://pce.afd.co.uk/afddata.pce",
                type: "GET",
                data: {
                    'Serial': '830877',
                    'Password': '2pkNNMmT',
                    'UserID': 'DIREC07',
                    'Data': 'Bank',
                    'Task': 'Account',
                    'Fields': 'Account',
                    'SortCode': fullSortCode,
                    'AccountNumber': $("#faccountnumber").val(),
                    'Format': 'JSON'
                },
                async: false,
                cache: false,
                contentType: false,
                dataType: "json",
                success: function(data) {
                    result = data.Result;

                    if (result === "1") {
                        $("#verifyAccount").hide();
                        $("#faccountnumber, #fsortcode1, #fsortcode2, #fsortcode3").removeClass("error");
                    } else {
                        IsValid = false;
                        $("#verifyAccount").show();
                        $("#faccountnumber, #fsortcode1, #fsortcode2, #fsortcode3").addClass("error");
                        console.log(result);
                    }
                },
                error: function(e) {

                    IsValid = false;
                    $("#verifyAccount").show();
                    $("#faccountnumber, #fsortcode1, #fsortcode2, #fsortcode3").addClass("error");
                    console.log(e.statusText);
                }

                

            });

        } else {
            IsValid = false;
            $("#verifyAccount").hide();
            $("#faccountnumber, #fsortcode1, #fsortcode2, #fsortcode3").removeClass("error");
        }


        // Also find the correpsonding label E.g.
        //<div class="form-label"><label for="Applicant_Email">Email</label>
        //    $(".error").parents().parents().children(".form-label").find("label").addClass("error");

        if ($(".error").length > 0) {
            $(".errorList").show();
            IsValid = false;
        }

        return IsValid;

    }

    $("#verifyDDM").click(function () {
        SetUpApplicationValidation();
    });

    var furtherDetailsChange = function() {


        /*****************************************************************
        Marital Status for Apps 1 & 2
        *****************************************************************/
        $(
                "form#FurtherDetail input[id*='ApplicantAdditionalInfo_EmpStatus'], form#FurtherDetail input[id*='ApplicantAdditionalInfo2_EmpStatus']")
            .change(function() {

                $(this).parent().siblings('span').hide();
                var appId = $(this).attr("id");
                if (appId.indexOf("ApplicantAdditionalInfo2") == 0) {
                    $("input[id*='ApplicantAdditionalInfo2_EmpStatus']").removeClass("error");
                } else {
                    $("input[id*='ApplicantAdditionalInfo_EmpStatus']").removeClass("error");
                }

            })

        /*****************************************************************
        Emp Status for Apps 1 & 2
        *****************************************************************/
        $(
                "form#FurtherDetail input[id*='ApplicantAdditionalInfo_Marital'], form#FurtherDetail input[id*='ApplicantAdditionalInfo2_Marital']")
            .change(function() {

                $(this).parent().siblings('span').hide();
                var appId = $(this).attr("id");
                if (appId.indexOf("ApplicantAdditionalInfo2") == 0) {
                    $("input[id*='ApplicantAdditionalInfo2_Marital']").removeClass("error");
                } else {
                    $("input[id*='ApplicantAdditionalInfo_Marital']").removeClass("error");
                }

            })

    }

    var completionFandF = function() {

        var width;
        var height;

        if (isMobile()) {
            width = "30%";
            height = "25%";
        } else {
            width = "20%";
            height = "10%";
        }

        var cbdefaults2 = {
            iframe: true,
            width: width,
            height: height,
            open: false
        };


        $(".thankyou.fandf").click(function() {

            var isSuccess = false;
            var URN = $("#URN").val();


            $.ajax({
                url: "/Completion/SendFandF",
                type: "POST",
                data: JSON.stringify({
                    'URN': URN
                }),
                async: false,
                cache: false,
                contentType: "application/json",
                dataType: "json",
                success: function(data) {

                    isSuccess = data.Success;
                }
            });
            if (isSuccess === false) {

                event.stopImmediatePropagation();
                event.preventDefault();
                return false;
            }


            $(".thankyou.fandf").colorbox($.extend(cbdefaults2,
                {
                    href: "Completion/InformationOverlay/?Overlay=FNF",
                    scrolling: false
                }));

        });

    }

    var ShowHideCICResults = function() {
        if ($("table.quote-results tbody tr.hideResults").length > 0) {
            // Close every More Details section prior to changing anything 
            // otherwise it will still be visible.

            $("tr.more-info").each(function() {
                if ($(this).attr("style") == "display: table-row;") {
                    $(this).hide();
                }
            });

            $("div.result").each(function() {
                $(this).find("table.quote-results tbody tr ").toggleClass("hideResults");
                if (($(this).find("table.quote-results tbody tr ").length) >
                    $(this).find("table.quote-results tbody tr.hideResults").length) {
                    $(this).find("table.quote-results tbody tr.showResults").removeClass("hideResults");
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });

        }
    }

    var ProcessCIC = function() {
        $("#ShowCIC").click(function() {
            if ($(this).text() == "add cover") {
                window.dataLayer.push({ 'event': 'Results_Policy_Add_Critical_Illness_Click', 'Results_Policy_Add_Critical_Illness_Value': 'Add Cover' });
                groupItemIsLoading = true; // don't alter groupItemChanged, as this is an automated click 
                $('.show-cic').show();
                $('.show-no-cic').hide();
                
                $('#QuoteAmend_CriticalIllnessCover').val('2').change();
                //$("#QuoteAmend_IsCIC-3").trigger("click");

                // Restore CIC banner
                //$("#cicBanner").show();
                groupItemIsLoading = false;
                $(".cicTitlex").hide();
                $(".cicTitle").show();
            } else {
                // Remove CIC has been clicked. This will trigger a requote
                // but only if the user has changed any of the original quote criteria in the recalc section.
                if (needsARecalc() == true) {
                    $("#QuoteAmend_StartWithCICResults").val("False");
                    //$("#QuoteAmend_IsCIC-2").trigger("click");
                    $('#QuoteAmend_CriticalIllnessCover').val('0').change();
                    $("form").submit();
                } else {
                    ShowHideCICResults();
                    $('.show-cic').hide();
                    $('.show-no-cic').show();
                    $(".cicTitlex").show();
                    $(".cicTitle").hide();
                    $("#cic-addbanner").show();
                    $(this).text("add cover");
                    $("#cic-removebanner").hide();
                    if ($("#QuoteAmend_IsCIC").val() == "true") {
                        groupItemIsLoading = true; // don't alter groupItemChanged, as this is an automated click 
                        //$("#QuoteAmend_IsCIC-1").trigger("click");
                        $('#QuoteAmend_CriticalIllnessCover').val('1').change();
                        groupItemIsLoading = false;
                    } else {
                        groupItemIsLoading = true; // don't alter groupItemChanged, as this is an automated click 
                        //$("#QuoteAmend_IsCIC-2").trigger("click");
                        $('#QuoteAmend_CriticalIllnessCover').val('0').change();
                        groupItemIsLoading = false;
                    }

                    $(".more-details-link").text("More details");
                }
            }
            DeactivateRecalcButton();
        });
    }

    var GetCICPercentage = function() {
        // Check that the newly revealed CIC Sum is less than 65% of the sum assured.
        if ($("#QuoteAmend_CICAmount").val() != "") {
            if (parseInt($("#QuoteAmend_CICAmount").val()) > 0) {
                var result = parseInt($("#QuoteAmend_CICAmount").val()) *
                    100 /
                    parseInt($("#QuoteAmend_CoverAmount").val());
                if (!isFinite(result)) result = 0;

                return result;
            }
        }
        return 0;
    }

    var ShowCICSum = function() {

        // Phil from Level Term no CIC Click Additional and then Cancel
        // Then select Combined and the Reclc doesn't show

        $("#QuoteAmend_CriticalIllnessCover").change(function() {
            groupItemChanged = true && !groupItemIsLoading;

            
            var selectedCic = $(this).children("option:selected").val();

            if (selectedCic === "2") {
                if (isCancel !== 1) {
                    window.dataLayer.push({ 'event': 'Results_Policy_CIC_Click', 'Results_Policy_Cic_Value': 'Additional' });
                }
                
                if ($("#addcic-banner").is(":visible")) {
                    if (!$("#cicAmount").is(":visible")) {
                        // Check the percentage
                        if (GetCICPercentage() > 65) {
                            $(".cic-combined-popup a.modal-text-link").trigger("click");
                        } else {
                            $("form").submit();
                        }
                    } else {
                        $("form").submit();
                    }

                } else {
                    $("#cicAmount").show();
                    if ($("#cicBanner").is(":visible")) {

                        if ($("#ShowCIC").text() == "add cover" && $("#ShowCIC").is(":visible")) {
                            ShowHideCICResults();
                            $(".cicTitlex").hide();
                            $(".cicTitle").show();

                            $("#cic-addbanner").hide();
                            $("#ShowCIC").text("remove cover");
                            $("#cic-removebanner").show();
                        }

                        // Check that the newly revealed CIC Sum is less than 65% of the sum assured.
                        if (GetCICPercentage() > 65) {
                            $(".cic-combined-popup a.modal-text-link").trigger("click");
                        }
                    }
                }
            }


            if (selectedCic === "1") {
                if (isCancel !== 1) {
                    window.dataLayer.push({ 'event': 'Results_Policy_CIC_Click', 'Results_Policy_Cic_Value': 'Combined' });
                }
                
                groupItemChanged = true && !groupItemIsLoading;
                $("#cicAmount").hide();
                $("#cicBanner").hide();
            }

            if (selectedCic === "0") {
                if (isCancel !== 1) {
                    window.dataLayer.push({ 'event': 'Results_Policy_CIC_Click', 'Results_Policy_Cic_Value': 'None' });
                }
                
                groupItemChanged = true && !groupItemIsLoading;
                $("#cicAmount").hide();
            }


            var IsCIC = $("#QuoteAmend_IsCIC").val();
            var IsAddCIC = $("#QuoteAmend_AdditionalCIC").val();
            //var selectedCic = $(this).children("option:selected").val();

            if (IsCIC == "True" && IsAddCIC == "True") {
                // Originally Additional CIC
                if (selectedCic !== "2") {
                    ActivateRecalcButton(true);
                }
            }
            else if (IsCIC == "True" && IsAddCIC == "False") {
                // Originally Combined
                if (selectedCic !== "1") {
                    ActivateRecalcButton(true);
                }
            }
            else if (IsCIC == "False" && IsAddCIC == "False") {
                // Originally None
                if (selectedCic != "0") {
                    ActivateRecalcButton(true);
                }
            } else {
                ActivateRecalcButton(false);
            }



        });


        //$("#QuoteAmend_IsCIC-3").click(function () {
        //    groupItemChanged = true && !groupItemIsLoading;
        //    if ($("#addcic-banner").is(":visible")) {
        //        if (!$("#cicAmount").is(":visible")) {
        //            // Check the percentage
        //            if (GetCICPercentage() > 65) {
        //                $(".cic-combined-popup a.modal-text-link").trigger("click");
        //            }
        //            else {
        //                $("form").submit();
        //            }
        //        }
        //        else {
        //            $("form").submit();
        //        }

        //    }
        //    else {
        //        $("#cicAmount").show();
        //        if ($("#cicBanner").is(":visible")) {

        //            if ($("#ShowCIC").text() == "add cover" && $("#ShowCIC").is(":visible")) {
        //                ShowHideCICResults();
        //                $(".cicTitlex").hide();
        //                $(".cicTitle").show();

        //                $("#cic-addbanner").hide();
        //                $("#ShowCIC").text("remove cover");
        //                $("#cic-removebanner").show();
        //            }

        //            // Check that the newly revealed CIC Sum is less than 65% of the sum assured.
        //            if (GetCICPercentage() > 65) {
        //                $(".cic-combined-popup a.modal-text-link").trigger("click");
        //            }
        //        }
        //    }

        //    var showCIC = $("#ShowCIC").is(":visible");
        //    var recalcBanner = $("#pressrecalc-banner").is(":visible");

        //    if ((!showCIC && recalcBanner) && groupItemChanged) {
        //        $("#QuoteAmend_CICAmount").val("");
        //    }
        //});

        //$("#QuoteAmend_IsCIC-1").click(function () {
        //    groupItemChanged = true && !groupItemIsLoading;
        //    $("#cicAmount").hide();
        //    $("#cicBanner").hide();
        //});

        //$("#QuoteAmend_IsCIC-2").click(function () {
        //    groupItemChanged = true && !groupItemIsLoading;
        //    $("#cicAmount").hide();
        //});


    }
    
    var ActivateRecalcButton = function(v) {
        if (!$('[id^="fibValidationError-"]').is(':visible')) {
            //$("#recalculate").removeClass("recalculate--inactive");
            //$("#recalculate").attr("disabled", false);
            $(".layout.filter-update.display-none-non-mobile").show();
            if (v == true) {
                $("#recalculate").removeClass("display-none");
            } else {
                $("#recalculate").addClass("display-none");
            }
            //$(".layout.filter-update.display-none-non-mobile").attr("style", "display: inline !important");

        }

    }


    var DeactivateRecalcButton = function() {
        //$("#recalculate").attr("disabled", true);
        //$("#recalculate").addClass("recalculate--inactive");
        $(".layout.filter-update.display-none-non-mobile").hide();
    }

    var needsARecalc = function () {
        var Recalc = false;

        // Get the original values for PolicyType, SumAssured and Term. These are hidden types
        var origPolicyType = $("#QuoteAmend_PolicyCode").val();
        var origSumAssured = $("#SumAssured").val();
        var origTerm = $("#Term").val();
        var origCiC = $("#hfHasCiC").val();
        var origWoP = $("#WaiverOfPremium").val();
        var origCICAmount = $("#QuoteAmend_hfCICAmount").val();

        var CiCVal = $("#QuoteAmend_CriticalIllnessCover option:selected").val();
        var WoPVal = $("input[type='checkbox'][id*='QuoteAmend_WaiverOfPremium']:checked").val();
        var PolicyVal = $("#QuoteAmend_PolicyType option:selected").val();
        var IsNewPolicy = (origPolicyType != PolicyVal);
        var IsCic = (CiCVal == "1" || CiCVal == "3" ? "True" : "False");
        var IsWoP = (WoPVal == "true" ? "True" : "False");
        var CICAmount = $("#QuoteAmend_CICAmount").val();

        var IsNewSumAssured = (origSumAssured != $("#QuoteAmend_CoverAmount").val());

        var IsNewTerm = (origTerm != $("#QuoteAmend_Term option:selected").val());

        var IsNewCICSum = false;
        if (IsCic == origCiC && CiCVal == "2" && origCICAmount != CICAmount) {
            IsNewCICSum = true;
        }



        Recalc = (IsNewPolicy == true || IsNewSumAssured == true || IsNewTerm == true || (IsCic != origCiC) || (IsWoP != origWoP) || IsNewCICSum == true || groupItemChanged == true);

        $(".validation-message.validation-message--error").hide();
        $("#termValidationError-1").hide();
        $("#saValidationError-1").hide();
        $("#saValidationError-2").hide();
        $("#fibValidationError-1").hide();
        $("#fibValidationError-2").hide();
        //$("#fibValidationError-3").hide();

        if (PolicyVal == "K") {
            Recalc = (Recalc && isValidFibSumAssured() && isValidTerm());
        } else {
            Recalc = (Recalc && isValidSumAssured() && isValidTerm());
        }

        if (Recalc == true) {

            // Perform final updates to relevant fields on the model
            if ($("#addcic-banner").is(":visible") && CiCVal == "2") {
                $("#QuoteAmend_IsForce10Percent").val("True")
            }
            else {
                $("#QuoteAmend_IsForce10Percent").val("False")
            }

            $("#QuoteAmend_WaiverOfPremium").val(IsWoP);

            if (CiCVal == "2") {
                $("#QuoteAmend_AdditionalCIC").val("True")
            }
            else {
                $("#QuoteAmend_AdditionalCIC").val("False")
            }

            if (IsCic && CiCVal == "1") {
                // Set the correct value on the Policy type.
                var poltype = (PolicyVal == "L" ? "A" : PolicyVal == "M" ? "B" : "N");
                $("#QuoteAmend_PolicyCode").val(poltype);
            }
            else if (IsNewPolicy) {
                $("#QuoteAmend_PolicyCode").val(PolicyVal);
            }
        }

        return Recalc;

    };


    $("#QuoteAmend_PolicyType").change(function () {

        $("#cicBanner").hide();

        if (!groupItemChanged)
            groupItemFocus();
        groupItemBanner();

        var origPolicyType = $("#PolicyType").val();
        var selectedPolicy = $(this).children("option:selected").val();
        var selectedDescription = $(this).children("option:selected").text();
        if (isCancel !== 1) {
            window.dataLayer.push({ 'event': 'Results_Product_Offered_Click', 'Results_Product_Offered_Value': selectedDescription });
        }
        

        if ($("#cic-addbanner").is(":visible")) {
            if (selectedPolicy != origPolicyType) {
                // Change the banner
                processBanner();
            }
        }

        if (selectedPolicy === "K") {
            
            $('#QuoteAmend_CoverAmount').val("0");
            var additionalIsSelected = ($("#QuoteAmend_CriticalIllnessCover").find(":selected").text() == "Additional");

            //TODO What to do here when the old method was to disable the button?
            //$("#QuoteAmend_IsCIC-3").attr("disabled", true);
            $("#QuoteAmend_CriticalIllnessCover option[value='2']").hide();
            $('#QuoteAmend_CriticalIllnessCover').val('0').change();

            //$("label[for='QuoteAmend_IsCIC-3']").addClass("inactive");
            $("#cicAmount").hide();

            if (additionalIsSelected === true) {

                if ($("#QuoteAmend_IsCIC").val() === "True") {
                    if ($("#QuoteAmend_AdditionalCIC").val() === "False") {

                        $('#QuoteAmend_CriticalIllnessCover').val('1').change();
                    }
                } else {

                    $('#QuoteAmend_CriticalIllnessCover').val('0').change();
                }

            }


        } else {
            //TODO What to do here when the old method was to disable the button?
            //$("#QuoteAmend_IsCIC-3").attr("disabled", false);
            //$("#QuoteAmend_CriticalIllnessCover option[value='2']").prop('disabled', false);
            $("#QuoteAmend_CriticalIllnessCover option[value='2']").show();

            //$("label[for='QuoteAmend_IsCIC-3']").removeClass("inactive");
            $("#QuoteAmend_CoverAmount").removeClass("error");
            if ($('[id^="fibValidationError-"]').is(':visible')) {
                $("#fibValidationError-1").hide();
                $("#fibValidationError-2").hide();
                //$("#fibValidationError-3").hide();
                $(".validation-message.validation-message--error").hide();
                ActivateRecalcButton(true);
            }
        }

        if ((selectedPolicy !== origPolicyType) || needsARecalc()) {
            ActivateRecalcButton(true);
        } else {
            ActivateRecalcButton(false);
        }

    });


    //$("input[id*='QuoteAmend_PolicyType']").click(function () {
    //    if (!groupItemChanged)
    //        groupItemFocus();
    //    groupItemBanner();

    //    var origPolicyType = $("#PolicyType").val();
    //    if ($("#cic-addbanner").is(":visible")) {
    //        if ($(this).val() != origPolicyType) {
    //            // Change the banner
    //            processBanner();
    //        }
    //    }

    //    if ($(this).attr("id") === "QuoteAmend_PolicyType-3") {

    //        $('#QuoteAmend_CoverAmount').val("0");

    //        var additionalIsSelected = $("label[for='QuoteAmend_IsCIC-3']").hasClass("replaced-input-label--selected");
    //        $("#QuoteAmend_IsCIC-3").attr("disabled", true);
    //        $("label[for='QuoteAmend_IsCIC-3']").addClass("inactive");
    //        $("#cicAmount").hide();

    //        if (additionalIsSelected === true) {

    //            if ($("#QuoteAmend_IsCIC").val() === "True") {
    //                if ($("#QuoteAmend_AdditionalCIC").val() === "False") {
    //                    $("#QuoteAmend_IsCIC-1").trigger("click");
    //                }
    //            } else {
    //                $("#QuoteAmend_IsCIC-2").trigger("click");
    //            }
    //        }


    //    } else {
    //        $("#QuoteAmend_IsCIC-3").attr("disabled", false);
    //        $("label[for='QuoteAmend_IsCIC-3']").removeClass("inactive");
    //        $("#QuoteAmend_CoverAmount").removeClass("error");
    //        if ($('[id^="fibValidationError-"]').is(':visible')) {
    //            $("#fibValidationError-1").hide();
    //            $("#fibValidationError-2").hide();
    //            ActivateRecalcButton();
    //        }
    //    }

    //    if ($(this).val() != origPolicyType) {
    //        ActivateRecalcButton();
    //    }

    //});

    $("#QuoteAmend_Term").change(function () {

        $("#cicBanner").hide();

        if (!groupItemChanged)
            groupItemFocus();
        groupItemBanner();

        var origTerm = $("#Term").val();

        var selectedDescription = $(this).children("option:selected").text();
        if (isCancel !== 1) {
            window.dataLayer.push({ 'event': 'Results_Policy_Length_Click', 'Results_Policy_Length_Value': selectedDescription });
        }
        
        if ($("#cic-addbanner").is(":visible")) {
            if (origTerm != $("#QuoteAmend_Term option:selected").val()) {
                processBanner();
            }
        }
        if (origTerm != $("#QuoteAmend_Term option:selected").val()) {
            ActivateRecalcButton(true);
        }
    });

    //$("#QuoteAmend_CriticalIllnessCover").change(function() {
    //    var IsCIC = $("#QuoteAmend_IsCIC").val();
    //    var IsAddCIC = $("#QuoteAmend_AdditionalCIC").val();
    //    var selectedCic = $(this).children("option:selected").val();

    //    if (IsCIC == "True" && IsAddCIC == "True") {
    //        // Originally Additional CIC
    //        if (selectedCic !== "2") {
    //            ActivateRecalcButton();
    //        }
    //    }
    //    else if (IsCIC == "True" && IsAddCIC == "False") {
    //        // Originally Combined
    //        if (selectedCic !== "1") {
    //            ActivateRecalcButton();
    //        }
    //    }
    //    else if (IsCIC == "False" && IsAddCIC == "False") {
    //        // Originally None
    //        if (selectedCic != "0") {
    //            ActivateRecalcButton();
    //        }
    //    }

    //});

    //$("input[type='radio'][id*='QuoteAmend_IsCIC']").change(function () {
    //    var IsCIC = $("#QuoteAmend_IsCIC").val();
    //    var IsAddCIC = $("#QuoteAmend_AdditionalCIC").val();

    //    if (IsCIC == "True" && IsAddCIC == "True") {
    //        // Originally Additional CIC
    //        if ($(this).attr("id") != "QuoteAmend_IsCIC-3") {
    //            ActivateRecalcButton();
    //        }
    //    }
    //    else if (IsCIC == "True" && IsAddCIC == "False") {
    //        // Originally Combined
    //        if ($(this).attr("id") != "QuoteAmend_IsCIC-1") {
    //            ActivateRecalcButton();
    //        }
    //    }
    //    else if (IsCIC == "False" && IsAddCIC == "False") {
    //        // Originally None
    //        if ($(this).attr("id") != "QuoteAmend_IsCIC-2") {
    //            ActivateRecalcButton();
    //        }
    //    }
    //});

    $("#QuoteAmend_CoverAmount").keypress(function (e) {
        $("#cicBanner").hide();

        var unicode = e.keyCode ? e.keyCode : e.charCode;
        var isTextSelected = ($(this)[0].selectionStart != $(this)[0].selectionEnd);

        // Restrict the input values to the specified limits
        if ($(this).val().length >= 7 && !isTextSelected && (unicode >= 48 && unicode <= 57))
            return false;

        return true;
    });

    $("#QuoteAmend_Term").focus(function () {
        groupItemFocus();
        groupItemBanner();
    });

    $("#QuoteAmend_CoverAmount").focus(function () {
        groupItemFocus();
        groupItemBanner();
    });

    $("#QuoteAmend_CoverAmount").change(function () {

        var origSumAssured = $("#SumAssured").val();

        if ($("#cic-addbanner").is(":visible")) {
            if (origSumAssured != $(this).val()) {
                processBanner();
            }
        }

        if (origSumAssured != $(this).val()) {
            ActivateRecalcButton(true);
        }

        // Now lets check whether this is in the 65% or over range
        if ($("#QuoteAmend_CICAmount").is(":visible")) {
            if (GetCICPercentage() > 65) {
                $(".cic-combined-popup a.modal-text-link").trigger("click");
            }
        }

        window.dataLayer.push({ 'event': 'Results_Policy_Cover_Click', 'Results_Policy_Cover_Value': $(this).val() });

    });

    $("#QuoteAmend_CICAmount").change(function () {
        $("#cicBanner").hide();
        if (GetCICPercentage() > 65) {
            $(".cic-combined-popup a.modal-text-link").trigger("click");
        }

        if ($(this).val() != $("#QuoteAmend_hfCICAmount").val()) {
            ActivateRecalcButton(true);
        }

    });

    $("#editQuote").click(function() {
        window.dataLayer.push({ 'event': 'Results_Policy_Edit_Quote_Click' });
    });


    $("#CombinedQuote").click(function () {
        $(".modal__dismiss").trigger("click");
        //$("#QuoteAmend_IsCIC-1").trigger("click");
        $('#QuoteAmend_CriticalIllnessCover').val('1').change();
        $("form").submit();
    });

    $("#cboxCloseAndContinue").click(function () {
        $(".modal__dismiss").trigger("click");
        $("form").submit();
    });

    $("input[type='checkbox'][id*='QuoteAmend_WaiverOfPremium']").click(function () {
        if (!groupItemChanged)
            groupItemFocus();
        groupItemBanner();

        var origWoP = $("#WaiverOfPremium").val();
        if ($("#cic-addbanner").is(":visible")) {
            if (origWoP != $(this).prop('checked')) {
                processBanner();
            }
        }

        if (origWoP != $(this).prop('checked')) {
            ActivateRecalcButton(true);
        }
        if ($(this).prop('checked')) {
            window.dataLayer.push({ 'event': 'Results_Policy_WOP_Click', 'Results_Policy_Wop_Value': 'Selected' });
        } else {
            window.dataLayer.push({ 'event': 'Results_Policy_WOP_Click', 'Results_Policy_Wop_Value': 'None' });
        }
        
    });

    $("#add-cic").click(function () {
        $("#QuoteAmend_StartWithCICResults").val("True");
        $("form").submit();
    });

    $("#btnRecalc").click(function () {
        window.dataLayer.push({ 'event': 'Results_Policy_Edit_Policy_Click' });

        $(".filter-triggers").addClass("mobile").hide();
        //$(".filter-triggers").addClass("display-none-mobile");
        
        $("#recalcDiv").removeClass("display-none-mobile");
        $(".filters-section-panel-close").show();
        $(".results-section, #footerDiv").hide();
    });

    $("#btnFilter").click(function () {
        window.dataLayer.push({ 'event': 'Results_Policy_Edit_Filters_Click' });
        $("#filterDiv, #results-filter-update").removeClass("display-none-mobile");
        $(".filter-triggers").addClass("mobile").hide();
        //$(".filter-triggers").addClass("display-none-mobile");
        
        $(".results-section, #footerDiv").hide();
        //$("#filter-clear").css({ float: "left" });
        $("#results-filter-update").removeClass("display-none-non-mobile");
        $("#results-filter-update").removeClass("display-none");
        $("#results-filter-update").show();
        $(".filters-section-panel-close").show();
        $("#filterViewResults").text("View Results");
    });

    $("#filterViewResults, .filters-section-panel-close a").click(function () {
        $("#filterDiv, #results-filter-update").addClass("display-none-mobile");
        $(".filter-triggers").removeClass("display-none-mobile");
        if ($(".filter-triggers").hasClass("mobile")) {
            $(".filter-triggers").removeClass("display-none-non-mobile").show();
        }
        $("#reclacFieldset, .filter-update-dimmer").removeClass("focussed");
        $(".filter-update-dimmer, #results-filter-update").addClass("display-none");
        $(".results-section, #footerDiv").show();
        $(".filters-section-panel-close").hide();
        $("#filterViewResults").text("Show Results");
        window.dataLayer.push({ 'event': 'Results_Policy_Edit_View_Results_Click' });
    });

    $("#cancelFilter, .filters-section-panel-close a").click(function () {

        if ($("#filterDiv").is(":visible")) {
            $("#filterDiv, #results-filter-update").addClass("display-none-mobile");
            $(".filter-triggers").removeClass("display-none-mobile");
            $("#reclacFieldset, .filter-update-dimmer").removeClass("focussed");
            $(".filter-update-dimmer, #results-filter-update").addClass("display-none");
            $(".filters-section-panel-close").hide();
            clearAndResetFilters();


            //$("#recalcDiv").addClass("display-none-mobile").removeClass("mobile");
            if ($(".filter-triggers").hasClass("mobile")) {
                $(".filter-triggers").removeClass("display-none-non-mobile").show();
            }


            $(".results-section, #footerDiv").show();
            window.dataLayer.push({ 'event': 'Results_Policy_Edit_Cancel_Edit_Click' });
        }

    });


    
    $("#QuoteAmend_WaiverOfPremium").click(function() {
        $("#cicBanner").hide();
    });

    $("#QuoteAmend_PolicyType,#QuoteAmend_Term,#QuoteAmend_CoverAmount,#QuoteAmend_WaiverOfPremium,#QuoteAmend_CriticalIllnessCover, #QuoteAmend_CICAmount").click(function () {
        $("#filterDiv fieldset, .filter-update-dimmer").removeClass("focussed");
        $("#reclacFieldset, .filter-update-dimmer").addClass("focussed");
        $(".filter-update-dimmer").removeClass("display-none");
        $(".filters-section-panel-close").show();
        if (!$("#recalculate").is(":visible")) {
            ActivateRecalcButton(false);                                    
        }
        
    });

    //// Tabbing handler
    //$("#QuoteAmend_PolicyType,#QuoteAmend_Term,#QuoteAmend_CoverAmount,#QuoteAmend_WaiverOfPremium,#QuoteAmend_CriticalIllnessCover, #QuoteAmend_CICAmount").focus(function () {
    //    if (!window.loadMoreResults) {
    //        if (!$("#filterDiv fieldset, .filter-update-dimmer").hasClass("focussed")) {
    //            $("#filterDiv fieldset, .filter-update-dimmer").removeClass("focussed");
    //            $("#reclacFieldset, .filter-update-dimmer").addClass("focussed");
    //            $(".filter-update-dimmer").removeClass("display-none");
    //            $(".filters-section-panel-close").show();
    //            if (!$("#recalculate").is(":visible")) {
    //                ActivateRecalcButton(false);
    //            }
    //        }
    //    }
    //});


    var processBanner = function () {
        if ($("#cicBanner").length > 0) {
            if ($("#cicBanner").is(":visible")) {
                // Change the banner
                $("#cic-addbanner").hide();
                $("#cic-removebanner").hide();
                $("#ShowCIC").hide();
                $(".learn-more").hide();
                $("#add-cic").show();
                $("#addcic-banner").show();
            }
        }
    };

    var groupItemBanner = function () {

        if ($("#cicBanner").is(":visible")) {
            $("#add-cic").hide();
            $("#ShowCIC").hide();
            $("#cic-addbanner").hide();
            $("#cic-removebanner").hide();
            $("#cic-forced").hide();
            $("#addcic-banner").hide();
            $(".learn-more").hide();
            $("#pressrecalc-banner").show();
        }
    };

    var groupItemFocus = function () {
        groupItemBanner();
        ActivateRecalcButton(true);
        groupItemChanged = true && !groupItemIsLoading;
    };



    $("#cancelRecalc, .filters-section-panel-close a").click(function () {

        if ($("#recalcDiv").is(":visible")) {
            
            var origPolicyType = $("#QuoteAmend_PolicyCode").val();
            var origSumAssured = $("#SumAssured").val();
            var origTerm = $("#Term").val();
            var origCiC = $("#QuoteAmend_cicVal").val();
            var origWoP = $("#WaiverOfPremium").val();
            var origCICAmount = $("#QuoteAmend_hfCICAmount").val();

            if (origPolicyType == "X") {
                origPolicyType = $("#QuoteAmend_originalPolicyType").val();
            } else if (origPolicyType == "A") {
                origPolicyType = "L";
            } else if (origPolicyType == "B") {
                origPolicyType = "M";
            }


            isCancel = 1;
            $('#QuoteAmend_PolicyType').val(origPolicyType).change();
            $('#QuoteAmend_CriticalIllnessCover').val(origCiC).change();
            $('#QuoteAmend_Term').val(origTerm).change();
            isCancel = 0;
            $("#QuoteAmend_CoverAmount").val(origSumAssured);

            $("#QuoteAmend_WaiverOfPremium").prop("checked", (origWoP === true ? true : false));
            $("#QuoteAmend_CICAmount").val(origCICAmount);

            $("#reclacFieldset, .filter-update-dimmer").removeClass("focussed");
            $(".filter-update-dimmer").addClass("display-none");
            $(".results-section, #footerDiv").show();
            $(".filters-section-panel-close").hide();

            $("#recalcDiv").addClass("display-none-mobile");
            //$("#recalcDiv").addClass("display-none-mobile").removeClass("mobile");
            if ($(".filter-triggers").hasClass("mobile")) {
                $(".filter-triggers").removeClass("display-none-non-mobile").show();
            }

            $(".validation-message.validation-message--error").hide();
            $("#termValidationError-1").hide();
            $("#saValidationError-1").hide();
            $("#saValidationError-2").hide();
            $("#fibValidationError-1").hide();
            $("#fibValidationError-2").hide();
            //$("#fibValidationError-3").hide();

            //if (origCiC == "0") {
            //    ShowHideCICResults();
            //}
            processBanner();
            DeactivateRecalcButton();

        }

    });

    
 
    $(document).ready(function () {
        setDoBMMText();
        smokingQuestions();
        setupQuotePlus();
        jointPolicy();
        PolicyDetailsChange();
        RadioClick();
        SumAssuredClick();
        ApplicantChange();
        SetQPChangesHandlers();
        UpdateQPErrors();
        ChosenQuoteApp2Email();
        SetChosenQuoteEmailChangeHandler();
        SmokePerDayAndYearsSince();
        furtherDetailsChange();
        


        //Application pages
        currentTariff();
        faq();
        setCountry();
        BankDetailsChanged();
        ProcessCIC();
        ShowHideCICResults();
        completionFandF();

        showBmiWaistQuestion();
        app1QuotePlusTaggingEvents();
        app2QuotePlusTaggingEvents();

        $("label[for='Term']").text("How many years would you like to be protected for?");

        if ($("#QuoteAmend_AdditionalCIC").val() == "False") {
            $("#cicAmount").hide();
        }
        ShowCICSum();
        
        $("#cicBanner").hide();
        $(".validation-message.validation-message--error").hide();
        $("#fibValidationError-1").hide();
        $("#fibValidationError-2").hide();
        //$("#fibValidationError-3").hide();

        $("#QuoteAmend_Term option[value='4']").hide();

        //
        if ($("#PolicyType").val() === "K" || $("#PolicyType").val() === "N") {
            //$("#QuoteAmend_CriticalIllnessCover option[value='2']").prop('disabled', true);
            $("#QuoteAmend_CriticalIllnessCover option[value='2']").hide();
            //$('#QuoteAmend_CriticalIllnessCover').val('2').change();

            //$("#QuoteAmend_IsCIC-3").attr("disabled", true);
            //$("label[for='QuoteAmend_IsCIC-3']").addClass("inactive");

        }



        $(".current-tariff-trigger").trigger("click");

        /*****************************
         *  Added for the results page
        ******************************/
        var newSrc = '/' + $('.tooltip-image').attr("src");
        $('.tooltip-image').attr("src", newSrc);

        var hasQP = ($(".hascic-True").length > 0);
        var hasCiC = ($("#hfHasCiC").val() == "True");
        var tableClass = (hasQP && hasCiC ? "qplc" : hasQP && !hasCiC ? "qpl" : !hasQP && hasCiC ? "qlc" : "ql");
        if (hasQP) {
            $(".hascic-True").addClass(tableClass)
            $(".quote-results").removeClass("hascic-True")
        } else {
            $(".hascic-False").addClass(tableClass)
            $(".quote-results").removeClass("hascic-False")
        }

        var prevKey = -1, prevControl = '';

        var validKey = function (keyCode, targetId) {

            return (keyCode == 8 // backspace
                ||
                keyCode == 9 // tab
                ||
                keyCode == 17 // ctrl
                ||
                keyCode == 46 // delete
                ||
                (keyCode >= 35 && keyCode <= 40) // arrow keys/home/end
                ||
                (keyCode >= 48 && keyCode <= 57) // numbers on keyboard
                ||
                (keyCode >= 96 && keyCode <= 105) // number on keypad
                ||
                (keyCode == 65 && prevKey == 17 && prevControl == targetId));
        }

        $('input.alc1Sumtotal, input.alc2Sumtotal, .OnlyNumbers').keydown(function (event) {
            // Allow numeric and arrows et al
            var allow = (validKey(event.keyCode, event.currentTarget.id));
            var charCode = (event.which) ? event.which : event.keyCode;

            // Filter out any SHIFT (e.g. from numeric to Â£$ etc)
            allow = allow && (!((charCode >= 48 || charCode <= 57) && event.shiftKey));
            if (!allow) {
                event.preventDefault(); // Prevent character input
            } else {
                prevKey = event.keyCode;
                prevControl = event.currentTarget.id;
            }
        });

        var HasWop = $("#HasWop").val();
        var HasIdx = $("#HasIdx").val();
        if (HasWop == 'False') {
            $("#wop").hide();
            $("p.extras-intro").hide();
        }
        if (HasIdx == 'False') {
            $("#idx").hide();
        }

        SetWoPDifference(HasWop, HasIdx);

        var newSrc = '/' + $('.tooltip-image').attr("src");
        $('.tooltip-image').attr("src", newSrc);

        var hasQP = ($(".hascic-True").length > 0);
        var hasCiC = ($("#hfHasCiC").val() == "True");
        var tableClass = (hasQP && hasCiC ? "qplc" : hasQP && !hasCiC ? "qpl" : !hasQP && hasCiC ? "qlc" : "ql");
        if (hasQP) {
            $(".hascic-True").addClass(tableClass)
            $(".quote-results").removeClass("hascic-True")
        } else {
            $(".hascic-False").addClass(tableClass)
            $(".quote-results").removeClass("hascic-False")
        }
        //$("#recalculate").attr("disabled", true);
        //$("#recalculate").addClass("recalculate--inactive");
        $(".layout.filter-update.display-none-non-mobile").hide();

        $('input,select').filter(':visible').first().focus();

        $("#Applicant_1_BirthCountry").val($("#Applicant_BirthCountry").val());
        $("#Applicant_2_BirthCountry").val($("#Applicant2_BirthCountry").val());
        $("#Applicant_1_Nationality").val($("#Applicant_Nationality").val());
        $("#Applicant_2_Nationality").val($("#Applicant2_Nationality").val());

        $("#filter-mobile").hide();

        $('#SumAssured').on('click',
            function() {
                if ($("#ProtectionType-2").is(':checked')) {
                    if (isMobile() == false) {
                        $('#fib-sumassured-tooltip').show();
                    }
                }
            });

        var urn, element = document.getElementById('DURN');
        if (element != null) urn = element.value;
        else urn = '';

        if (window.dataLayer != null) {
            if (window.dataLayer.length >= 0) {
                try {
                    window.dataLayer[0].URN = urn;
                } catch (e) {
                }
            }
        }
        
    });

    $("#NoNullIsWaiver, #NoNullIsIndexed").click(function () {
        var HasWop = $("#HasWop").val();
        var HasIdx = $("#HasIdx").val();

        SetWoPDifference(HasWop, HasIdx);
    });

    //$("#QuoteAmend_CoverAmount").on('blur', function () {
    //    $('#QuoteAmend_CoverAmount').removeClass('error');
    //    if (isValidFibSumAssured($(this).val())) {
    //        $('#QuoteAmend_CoverAmount').removeClass('error');
    //        $(".validation-message.validation-message--error").hide();
    //        $("#fibValidationError-1").hide();
    //        $("#fibValidationError-2").hide();
    //        //$("#fibValidationError-3").hide();

    //    }
    //});
    

    //$("#QuoteAmend_Term").on('blur', function () {
    //    //$('#QuoteAmend_Term').removeClass('error');
    //    if (isValidTerm()) {
    //        //$('#QuoteAmend_Term').removeClass('error');
    //        $(".validation-message.validation-message--error").hide();
    //        $("#termValidationError-1").hide();
    //    }
    //});


    $("#QuoteAmend_CoverAmount").on('click', function () {
        $('#QuoteAmend_CoverAmount').removeClass('error');
        $(".validation-message.validation-message--error").hide();
        $("#fibValidationError-1").hide();
        $("#fibValidationError-2").hide();
        //$("#fibValidationError-3").hide();

    });

    function isValidFibSumAssured(value) {

        var selectedPolicy = $("select#QuoteAmend_PolicyType option:checked").val();

        if (selectedPolicy == "K") {
            if (parseInt($('#QuoteAmend_CoverAmount').val()) > 100000 || parseInt($('#QuoteAmend_CoverAmount').val()) < 5000) {
                //DeActivateRecalcButton();
                $(".validation-message.validation-message--error").show();
                $("#fibValidationError-1").show();
                return false;
            }
            else {
                ActivateRecalcButton(true);
                $(".validation-message.validation-message--error").hide();
                $("#fibValidationError-1").hide();
            }

            if (parseInt($('#QuoteAmend_CoverAmount').val()) == 0 || $('#QuoteAmend_CoverAmount').val().length == 0) {
                //DeActivateRecalcButton();
                $(".validation-message.validation-message--error").show();
                $("#fibValidationError-2").show();
                return false;
            }
            else {
                //ActivateRecalcButton(true);
                $(".validation-message.validation-message--error").hide();
                $("#fibValidationError-2").hide();
            }
        }
        return true;
    }

    function isValidSumAssured() {

        var selectedSum = parseInt($("#QuoteAmend_CoverAmount").val());

        if (selectedSum < 5000) {
            $(".validation-message.validation-message--error").show();
            $("#saValidationError-1").show();
            return false;
        }
        else {
            //ActivateRecalcButton(true);
            $(".validation-message.validation-message--error").hide();
            $("#saValidationError-1").hide();
        }

        if ($("#QuoteAmend_CoverAmount").val() == 0) {
            $(".validation-message.validation-message--error").show();
            $("#saValidationError-2").show();
            return false;
        }
        else {
            $(".validation-message.validation-message--error").hide();
            $("#saValidationError-2").hide();
        }

        return true;
    }

    function isValidTerm() {

        var selectedTerm = parseInt($("#QuoteAmend_Term option:selected").val());

        if (selectedTerm == 4) {
            $(".validation-message.validation-message--error").show();
            $("#termValidationError-1").show();
            return false;
        }
        else {
            $(".validation-message.validation-message--error").hide();
            $("#termValidationError-1").hide();
        }

        return true;
    }


    function finalWaistCheck() {
        

        var SectionDesc = $('fieldset[id^="Section_"]:visible').last().attr('id');
        if (SectionDesc != null)
            var SectionId = SectionDesc.replace("Section_", "").slice(0, -5);

        var ApplicationNumber = 1;

        if ($('.jointPolicyYes').prop('checked') === true && $(".jointPolicySet").is(":visible")) {

            ApplicationNumber = 2;
        }


        var result = false;
        var App1ShowWaist = false;
        var App2ShowWaist = false;
        var formData = $("form[id='Quote']").toJSON();
        $.ajax({
            url: "/Quote/GetQuoteplusContinueJourney",
            type: "POST",
            data: JSON.stringify({
                'objQuotePlusVwQuote': formData,
                'sectionID': SectionId,
                'appNumber': ApplicationNumber
            }),
            async: false,
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                result = data.Status;
                App1ShowWaist = data.App1ShowWaist;
                App2ShowWaist = data.App2ShowWaist;
               
                $("#QuotePlusApplicationId").val(data.ApplicationId);
            }
        });

        applyWaistSettings(App1ShowWaist, App2ShowWaist, true);

    }

    function applyWaistSettings(app1ShowWaist, app2ShowWaist, checkApp2) {

        $("fieldset.App1Answers div[qp-data='TrouserQuestion']").hide();
        $("fieldset.App1Answers div[qp-data='SkirtQuestion']").hide();

        if ($("#Applicant1_AppTitle").val() === "Mr") {

            if (app1ShowWaist === true) {
                $("fieldset.App1Answers div[qp-data='TrouserQuestion']").show();
            } else {
                $("fieldset.App1Answers input.TrouserQuestion").val("");
                $("fieldset.App1Answers input.SkirtQuestion").val("");
            }

        } else {
            if (app1ShowWaist === true) {
                $("fieldset.App1Answers div[qp-data='SkirtQuestion']").show();
            } else {
                $("fieldset.App1Answers input.TrouserQuestion").val("");
                $("fieldset.App1Answers input.SkirtQuestion").val("");
            }
        }

        if (checkApp2 === true) {

            $("fieldset.App2Answers div[qp-data='TrouserQuestion']").hide();
            $("fieldset.App2Answers div[qp-data='SkirtQuestion']").hide();

            if ($("#Applicant2_AppTitle").val() === "Mr") {

                if (app2ShowWaist === true) {
                    $("fieldset.App2Answers div[qp-data='TrouserQuestion']").show();
                } else {
                    $("fieldset.App2Answers input.TrouserQuestion").val("");
                    $("fieldset.App2Answers input.SkirtQuestion").val("");
                }

            } else {
                if (app2ShowWaist === true) {
                    $("fieldset.App2Answers div[qp-data='SkirtQuestion']").show();
                } else {
                    $("fieldset.App2Answers input.TrouserQuestion").val("");
                    $("fieldset.App2Answers input.SkirtQuestion").val("");
                }
            }

        }

    }

    function showBmiWaistQuestion() {

        var App1ShowWaist = false;
        var App2ShowWaist = false;
        var formData = $("form[id='Quote']").toJSON();
        $.ajax({
            url: "/Quote/GetBMIWaist",
            type: "POST",
            data: JSON.stringify({
                'objQuotePlusVwQuote': formData
            }),
            async: false,
            cache: false,
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                App1ShowWaist = data.App1ShowWaist;
                App2ShowWaist = data.App2ShowWaist;
            }

        });

        var checkApp2 = ($(".jointPolicySet").is(":visible") && ($('.jointPolicyYes').prop('checked') === true));
        applyWaistSettings(App1ShowWaist, App2ShowWaist, checkApp2);

    }

    $("form").submit(function (e) {

        var action = $(this).attr('action');

        if (action.toLowerCase().indexOf('furtherdetail') > 0) {
            if (SetUpFurtherDetailsValidation() == false) {
                e.preventDefault();
            }
        } else if (action.toLowerCase().indexOf('applyddm') > 0) {
            if (SetUpApplicationValidation() == false) {
                e.preventDefault();
            } else {
                $("#fdsubmit1").attr("disabled", true);
                $("#fdsubmit1").addClass("quote--inactive");                
            }


        } else if (action.toLowerCase().indexOf('results') > 0) {



            if (needsARecalc() == true) {
                $("#recalculate").attr("disabled", true);
                $("#recalculate").addClass("inactive");
                //$(".layout.filter-update.display-none-non-mobile").hide();

                $("td.result__td--action a").attr("disabled", true);
                $("td.result__td--action a").addClass("inactive");

            } else {

                //$("#recalculate").removeClass("recalculate--inactive");
                //$("#recalculate").attr("disabled", false);
                //$(".layout.filter-update.display-none-non-mobile").hide();

                //$("td.result__td--action a").attr("disabled", false);
                //$("td.result__td--action a").removeClass("inactive");

                e.preventDefault();
            }
        } else if (action.toLowerCase().indexOf('chosenquote') > 0) {

            if ($('#IsAdmiral').val() === "True" || $('#Prefix').val() === "LGB") {
                var isValid = IsChosenQuoteEmailValid($('#App1Email'));

                if ($('#Prefix').val() === "LGB" && $("#Applicant2_Sex").val() != "N") {
                    isValid = (IsChosenQuoteEmailValid($('#App2Email')) && isValid);
                }

                // Only Simple Email validation required
                if (isValid === false) {
                    e.preventDefault();
                }
            }
        } else if (action.toLowerCase().indexOf('declaration') > 0) {

            if ($('#DeclarationAgreement').prop('checked') == false) {
                $("#lblDec").addClass("SetRed");

                // iPad ignores JQuery focus()
                if (isApple()) {
                    $('html, body').animate({
                        scrollTop: $('#DeclarationAgreement').offset().top
                    },
                        0);
                } else {
                    $("#DeclarationAgreement").focus();
                }
                e.preventDefault();
            }

        } else if (action.toLowerCase().indexOf('quote') > 0) {
            window.dataLayer.push({ 'event': 'Data_Consent_4_Tick', 'Data_Consent_4_Value': 'Yes' });
            if ($(".jointPolicySet").is(":visible")) {
                window.dataLayer.push({ 'event': 'Applicant_2_Data_Consent_4_Tick', 'Applicant_2_Data_Consent_4_Value': 'Yes' });
            }
            window.dataLayer.push({ 'event': 'Get_Your_Quote' });
            var txtVal = jQuery.trim($("#SumAssured").val().replace(/\,/g, ''));
            $("#SumAssured").val(txtVal);
            
            var isValid = ValidateQuote();

            if (isValid) {
                // Lets check the BMI/Waistline question
                // No point doing this if the page isn't valid anyway!

                $("#btnNext").trigger("click");

                finalWaistCheck();
                isValid = ValidateQuote();
            }


            if (!isValid) {
                e.preventDefault();
                e.stopPropagation();
                //SetQuoteErrorFocus(isApple());
                $(".error").not(":hidden").first().focus();
                $("#btnSubmit").attr("disabled", false);
                $("#btnSubmit").removeClass("quote--inactive");
            } else {
                $("#btnSubmit").attr("disabled", true);
                $("#btnSubmit").addClass("quote--inactive");
            }

            if ($('#optionQuotePlus').val() == "True" || $('.optionQuotePlus').prop('checked') === true) {
                setQPlusSmokerStatus();
                setQPlusSumAssured();
            }
        }
    });
    window.ValidateQuote = ValidateQuote;
    window.SetQuoteErrorFocus = SetQuoteErrorFocus;

})(jQuery);