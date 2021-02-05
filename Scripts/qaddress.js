
(function ($) {

    $(document).ready(function () {
        var clicknum = 0;
        var hiddenAddress = false;

        // Applicant_PostCode


        /*
         * ***************************************************************************************
         * TEMP REMOVAL START
         * ***************************************************************************************
         */

        //if ($("#Applicant1_PostCode").val().length > 0) {
            

        //    setTimeout(function () {
        //        searchingForPostcode = true;
        //        console.log("Postcode1 click triggered");
        //        //alert("Postcode1 click triggered");
        //        $("#btnAddress1").trigger('click');
        //    }, 250);

            
        //}
        //else {
        //    console.log("No Postcode1 length");
        //}


        //if ($("#Applicant2_PostCode").val().length > 0) {
            

        //    setTimeout(function () {
        //        searchingForPostcode2 = true;
        //        console.log("Postcode2 click triggered");
        //        $("#btnAddress2").trigger('click');
        //    }, 250);

            
        //}
        //else {
        //    console.log("No Postcode2 length");
        //}

        //$("#Applicant1_PostCode, #Applicant2_PostCode").blur(function () {

        //    //alert("Postcode1 blur click triggered");

        //    if ($(this).val() == "") {
        //        $(this).addClass("error");
        //        $(this).siblings('span').show();
        //    }
        //    else {

        //        $(this).removeClass("error");
        //        $(this).siblings('span').hide();

        //        if ($(this).attr("id") == "Applicant1_PostCode") {
        //            $("#Applicant_1_Address1").find("option").remove();
        //            console.log("Send message to postcoder1")
        //            searchingForPostcode = true;
        //            $("#btnAddress1").trigger('click');
        //        }
        //        else {
        //            $("#Applicant_2_Address2").find("option").remove();
        //            console.log("Send message to postcoder2")
        //            searchingForPostcode2 = true;
        //            $("#btnAddress2").trigger('click');
        //        }
        //    }

        //});

        //$("#Applicant1_PostCode, #Applicant2_PostCode").on('touchleave', function () {

        //    //alert("Postcode1 blur click triggered");

        //    if ($(this).val() == "") {
        //        $(this).addClass("error");
        //        $(this).siblings('span').show();
        //    }
        //    else {

        //        $(this).removeClass("error");
        //        $(this).siblings('span').hide();

        //        if ($(this).attr("id") == "Applicant1_PostCode") {
        //            $("#Applicant_1_Address1").find("option").remove();
        //            console.log("Send message to postcoder1")
        //            searchingForPostcode = true;
        //            $("#btnAddress1").trigger('click');
        //        }
        //        else {
        //            $("#Applicant_2_Address2").find("option").remove();
        //            console.log("Send message to postcoder2")
        //            searchingForPostcode2 = true;
        //            $("#btnAddress2").trigger('click');
        //        }
        //    }

        //});

        /*
         * ***************************************************************************************
         * TEMP REMOVAL END
         * ***************************************************************************************
         */


        /************************************************************************************************************
        And now the PostCoder stuff for Applicants 1 and 2
        ************************************************************************************************************/

        $("#Applicant1_PostCode").Postcoder({
            searchType: "MATCH_ADDRESS",
            searchURL: "http://confusedlifetest2.directlife.co.uk/Quote/WebSoap",
            searchButton: "btnAddress1",
            identifier: "Quote",
            useCounty: true,
            outputMap: {
                organisationName: "organisation",
                addressLines: [
                                    "address1",
                                    "address2",
                                    "address3"
                ],
                postTown: "town",
                county: "county",
                postcode: "postcode"
            },
            debug: false
        });


        $("#Applicant2_PostCode").Postcoder2({
            searchType: "MATCH_ADDRESS",
            searchURL: "http://confusedlifetest2.directlife.co.uk/Quote/WebSoap",
            searchButton: "btnAddress2",
            identifier: "Quote",
            useCounty: true,
            outputMap: {
                organisationName: "organisation",
                addressLines: [
                                    "address1",
                                    "address2",
                                    "address3"
                ],
                postTown: "town",
                county: "county",
                postcode: "postcode"
            },
            debug: false
        });

    });


})(jQuery);

