
var searchingForPostcode = false;
var searchingForPostcode2 = false;
var hasSubmit = false;
var submitAttempts = 0;



/**
* Title: $.fn.Postcoder
*
* About: Version
* 2.1.1
* 
* About: Copyright
* Copyright (c) 2013 Allies Computing Ltd
*
* Usage:
* (start code)
*	$("#searchField").Postcoder({
*		searchType: "MATCH_ADDRESS",
*		searchURL: "websoap.php",
*		searchButton: "searchButton",
*		identifier: "",
*		usecounty: true,
*		outputMap: {
*			organisationName: "organisation",
*			addressLines: [
*				"address1",
*				"address2",
*				"address3"
*			],
*			postTown: "town",
*			county: "county",
*			postcode: "postcode"			
*		},
*		debug: false
*	});
* (end)
*
* Parameters:
* options - user-defined options object.
* options.searchType - The type of search you would like. Must be one of 'PREMISE_LIST', 'MATCH_ADDRESS', 'THRFARE_ADDRESS', 'GRIDS', 'GEODATA'.
* options.searchURL - The URL to your server-side script.
* options.searchButton - A string containg the name of the search button. This will be the element that calls the server-side script on click.
* options.identifier - A string containing an identifier for your page which can be useful for analysing your usage of the address lookup service.
* options.useCounty - A boolean which controls whether to use county (from the results) or not. Default: false.
* options.premiseInfo - A string containing the name of the field used to input premise info (relevant to street level example only)
* options.buildingNumber -  - A string containing the name of the field used to input premise info (relevant to street level example only)
* options.outputMap - An object that contains mappings to form elements. All form element names must be provided as a string. 
* options.outputMap.addressLines - An array that contains mappings to form elements. All form element names must be provided as a string.
* options.uppercaseTown - A boolean that controls whether to display post town as uppercase or title case. default is title case. Default: true.
* options.timeout - The amount of time the ajax request will wait for a response from the server. Default: 5000 (5 seconds).
* options.onInit - Allows a function to be defined that will be called from the onInit function.
* options.onClickSearch - Allows a function to be defined that will be called from the onClickSearch function.
* options.onClickAddress - Allows a function to be defined that will be called from the onClickAddress function.
* options.onReturnData - Allows a function to be defined that will be called from the onRequestSuccess function.
* options.onPopulateResults - Allows a function to be defined that will be called from the populateResults function.
* options.onPopulateForm - Allows a function to be defined that will be called from the populateForm function.
* options.debug - A boolean that allows debug messages to be displayed to the console window. Only tested in Firefox with Firebug. Default: false.
* options.displayUserHint - A boolean that decides whether to show more detailed error messages to the end-user or to display a default message. Default: true.
*/
(function ($) {
    $.fn.Postcoder = function (options) {
        /**
        * Group: Properties
        */

        /**
        * property: STATUS
        * Status flags for specifying error message level.
        */
        var STATUS = {
            ERROR: 0,
            WARNING: 1
        };

        /**
        * property: self
        * An internal reference to the calling element.
        */
        var self = this;

        /**
        * property: defaults
        * Holds a number of default configuration settings.
        */
        var defaults = {
            searchType: undefined,
            searchURL: undefined,
            searchButton: undefined,
            identifier: undefined,
            useCounty: false,
            premiseInfo: undefined,
            buildingNumber: undefined,
            outputMap: undefined,
            debug: false,
            displayUserHint: true,
            timeout: 5000,
            uppercaseTown: true,

            onInit: function () { },
            onClickSearch: function () { },
            onClickAddress: function () { },
            onReturnData: function () { },
            onPopulateResults: function () { },
            onPopulateForm: function () { }
        };

        /**
        * property: settings
        * The settings property is a combination of the defaults and the user supplied options.
        */
        var settings = $.extend({}, defaults, options);

        /**
        * property: address
        * Container for the selected address template.
        */
        var address;

        /**
        * property: addressLines
        * Container for addresses that are returned from the service.
        */
        var addressLines = [];

        // Group: Functions

        /**
        * Function: init
        * This is the "main" (entry) function that validates the initial config and attachs event listeners. Also fires the user-defined onInit() function.
        */
        var init = function () {
            startDebug.call(self, "init");

            displayDebug.call(self, "Postcoder->init();");
            displayDebug.call(self, "Initial config:", settings);

            if (settings.onInit.constructor == Function) {
                displayDebug.call(self, "trigger function", "onInit();");
                settings.onInit.call(self);
            }

            if (validateConfig.call(self)) {
                $("#" + settings.searchButton).click(onClickSearch);

                self.keyup(function (e) {
                    if (e.keyCode == 13) {
                        onClickSearch.call(self);
                    }
                });
            }

            endDebug.call(self);
        };

        /**
        * Function: onClickSearch
        * Called by the event listener attached in the init function. This function clears fields then makes a proxy request to the server. Also fires the user-defined onClickSearch() function.
        */
        var onClickSearch = function () {
            startDebug.call(self, "onClickSearch");

            displayDebug.call(self, "Postcoder->onClickSearch();");
            displayDebug.call(self, "searchValue", self.val());

            if (settings.onClickSearch.constructor == Function) {
                displayDebug.call(self, "trigger function", "onClickSearch();");
                settings.onClickSearch.call(self);
            }

            clearFields.call(self);

            if (self.val() != "") {
                proxyRequest.call(self);
            } else {
                displayError.call(self, STATUS.WARNING, -5, "Please enter a search value.", null);
                return false;
            }
        };

        /**
        * Function: onClickAddress
        * Called by the event listener attached in the displaySelection function. This function applies a standard template to the selected address, evenly distributes the address lines across the template, populates the form fields and then closes the modalbox. Also fires the user-defined onClickAddress() function.
        *
        * Parameters:
        * e - event object.
        */
        var onClickAddress = function (e) {
            startDebug.call(self, "onClickAddress");

            displayDebug.call(self, "Postcoder->onClickAddress();");

            if (settings.onClickAddress.constructor == Function) {
                displayDebug.call(self, "trigger function", "onClickAddress();");
                settings.onClickAddress.call(self);
            }

            var el = e.target.id.replace("wsi", "").split("-");

            applyTemplate.call(self, addressLines[el[0]], (addressLines[el[0]]["premise"] ? addressLines[el[0]]["premise"][el[1]] : undefined));

            populateResults.call(self);

            populateForm.call(self);

            hideModalbox.call(self, e);

            e.stopPropagation();

            endDebug.call(self);
        };

        /**
        * Function: validateConfig
        * This function validates the user-defined config options that were passed to the class.
        */
        var validateConfig = function () {
            displayDebug.call(self, "Postcoder->validateConfig();");

            if ($.inArray(settings.searchType, ["PREMISE_LIST", "MATCH_ADDRESS", "THRFARE_ADDRESS", "GRIDS", "GEODATA"]) == -1) {
                displayError.call(self, STATUS.ERROR, 5000, "The service you have requested does not exist.", "Must be one of 'PREMISE_LIST', 'MATCH_ADDRESS', 'THRFARE_ADDRESS', 'GRIDS', 'GEODATA'");
                return false;
            }

            return true;
        };  /* validateConfig */

        /**
        * Function: proxyRequest
        * This function makes a request to the server which in turn makes a request to the web service. 
        * The onRequestSuccess and onRequestFailure event handlers are attached to receive the server's response.
        */
        var proxyRequest = function () {
            displayDebug.call(self, "Postcoder->proxyRequest();");

            $.ajax({
                url: settings.searchURL,
                type: "POST",
                data: {
                    searchValue: self.val(),
                    searchType: settings.searchType,
                    identifier: settings.identifier
                },
                dataType: "json",
                success: onRequestSuccess,
                error: onRequestFailure,
                complete: function () {
                    endDebug.call(self);
                },
                timeout: settings.timeout
            });
        }; /* proxyRequest */

        /**
        * Function: onRequestSuccess
        * This function handles the response from the server in the event that the request was successful. If there is only one result returned this function will populate the form, otherwise it will display a selection of addresses to the user. Also fires the user-defined onReturnData() function.
        *
        * Parameters:
        * data - the data returned from the server.
        * status - a string describing the status.
        * xhr - XMLHttpRequest object.
        */
        var onRequestSuccess = function (data, status, xhr) {
            displayDebug.call(self, "Postcoder->onRequestSuccess();");

            if (settings.onReturnData.constructor == Function) {
                displayDebug.call(self, "trigger function", "onReturnData();");
                settings.onReturnData.call(self);
            }

            if (data && data.constructor == Object) {
                if (data.success) {
                    if (data.numberOfResults > 0) {
                        switch (settings.searchType) {
                            case "GEODATA":
                                addressLines = {
                                    geoCoords: data.geoCoords,
                                    localAuthority: data.localAuthority,
                                    nhs: data.nhs
                                };

                                populateForm.call(self);

                                break;

                            case "GRIDS":
                                addressLines = {
                                    geoCoords: data.geoCoords
                                };

                                populateForm.call(self);

                                break;

                            case "THRFARE_ADDRESS":
                                addressLines = data.address;

                                if (addressLines.constructor == Object) {
                                    applyTemplate.call(self, addressLines, undefined);

                                    populateResults.call(self);

                                    populateForm.call(self);
                                } else {
                                    displaySelection.call(this);
                                }

                                break;

                            default: /* Premise level searches */
                                addressLines = data.address;

                                /* If single address returned */
                                if (addressLines.constructor == Object && addressLines.premise.constructor == Object) {
                                    applyTemplate.call(self, addressLines, addressLines.premise);

                                    populateResults.call(self);

                                    populateForm.call(self);
                                } else { /* Multiple addresses returned */
                                    displaySelection.call(this);
                                }
                        }
                    } else {
                        displayError.call(self, STATUS.WARNING, data.retcode, data.userHint, null);
                    }
                } else {
                    displayError.call(self, STATUS.ERROR, data.error.code, data.error.message, data.error.detail);
                }
            } else {
                displayError.call(self, STATUS.ERROR, 5100, "No data was received from request", null);
            }
        }; /* onRequestSuccess */

        /**
        * Function: onRequestFailure
        * This function handles the response from the server in the event that the request failed. It then passes on the relevant details to be displayed as an error message.
        *
        * Parameters:
        * xhr - XMLHttpRequest object.
        * status - a string describing the type of error that occurred.
        * error - an optional exception object.
        */
        var onRequestFailure = function (xhr, status, error) {
            displayDebug.call(self, "Postcoder->onRequestFailure();");

            displayError.call(self, STATUS.ERROR, 5101, "There was a problem with the request", error);
        }; /* onRequestFailure */




        /**
        * Function: displaySelection
        * This function creates a list of return addresses and displays them to the user in a modalbox. The onClickAddress event listener is attached to each inner list item.
        */
        var displaySelection = function () {

            displayDebug.call(self, "Postcoder->displaySelection();");

            var addrRow = 0;
            var thisTown = "";
            var thisCounty = "";

            var outerList = $("#Applicant_1_Address1");
            var list = ["Select", "Address not found"];

            $("#Applicant_1_Address1 option").remove();

            $(outerList).append($("<option value=\"Select\">Select...</option>"));

            if (addressLines.constructor == Object) {
                addressLines = [addressLines];
            }

            /* Build Street level address line which acts as a heading for each premise */
            $.each(addressLines, function (i, addressGroup) {
                var addressGroupTitle = [];
                $.each(["dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"], function (k, prop) {
                    if (typeof (addressGroup[prop]) != "undefined" && addressGroup[prop] != "") {
                        /* Upper case town if specified in settings */
                        if (prop == "postTown" && settings.uppercaseTown) {
                            addressGroup[prop] = addressGroup[prop].toUpperCase();
                            thisTown = addressGroup[prop];
                        }
                        if (prop == "county") {
                            thisCounty = addressGroup[prop];
                        }
                        /* Ignore county if not required */
                        if (!(prop == "county" && settings.useCounty == false)) {
                            addressGroupTitle.push(addressGroup[prop]);
                        }
                    }
                });

                // <option value="Select">Select</option>
                //$(outerList).append($("<option value=\"Select" + i + "\">" + addressGroupTitle.join(", ") + "</option>"));
                //$(outerList).append($("<li><a href=\"javascript:void(0)\" id=\"wsi" + i + "\">" + addressGroupTitle.join(", ") + "</a></li>"));

                /* Now set listener for Street level address line or add the premises */
                switch (settings.searchType) {
                    case "THRFARE_ADDRESS":
                        $(outerList).find("li").click(onClickAddress);
                        break;
                    default:

                        var addressGroupTitle = [];

                        $.each(["dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"], function (k, prop) {
                            if (typeof (addressGroup[prop]) != "undefined" && addressGroup[prop] != "") {
                                if (prop == "postTown" && settings.uppercaseTown) {
                                    addressGroup[prop] = addressGroup[prop].toUpperCase();
                                    thisTown = addressGroup[prop];
                                }
                                if (prop == "county") {
                                    thisCounty = addressGroup[prop];
                                }
                                addressGroupTitle.push(addressGroup[prop]);
                            }
                        });



                        /* Build a list of premises within the street level address */
                        var innerList = $(outerList).children("li").last().append($("<ul></ul>"));
                        if (addressGroup.premise.constructor == Object) {
                            addressGroup.premise = [addressGroup.premise];
                        }

                        $.each(addressGroup.premise, function (j, premiseLine) {
                            var addressLineTitle = [];
                            if (typeof (premiseLine.organisationName) != "undefined") {
                                addressLineTitle.push(premiseLine.organisationName);
                            }
                            if (typeof (premiseLine.formattedPremise) != "undefined") {
                                addressLineTitle.push(premiseLine.formattedPremise);
                            }

                            // Add the first street level line in the address to the selection list
                            // this could be dependent street, main street, double dependent locality or dependent locality (but hopefully not Town!!)
                            // Modified by Alan Shilling, 20/2/2013 to fix "Tidy Premise" bug
                            if (typeof (addressGroup.dependentStreet) != "undefined") {
                                addressLineTitle.push(addressGroup.dependentStreet);
                            } else if (typeof (addressGroup.street) != "undefined") {
                                addressLineTitle.push(addressGroup.street);
                            } else if (typeof (addressGroup.doubleDependentLocality) != "undefined") {
                                addressLineTitle.push(addressGroup.doubleDependentLocality);
                            } else if (typeof (addressGroup.dependentLocality) != "undefined") {
                                addressLineTitle.push(addressGroup.dependentLocality);
                            }
                            //$(innerList).children("ul").last().append($("<li><a href=\"javascript:void(0)\" id=\"wsi" + i + "-" + j + "\">" + addressLineTitle.join(", ") + "</a></li>"));
                            $(outerList).append($("<option value=\"Select" + addrRow + "\">" + addressLineTitle.join(", ") + ", " + thisTown + ", " + thisCounty + "</option>"));
                            addrRow++;
                        }); //$.each(addressGroup.premise

                    //$(innerList).find("li").click(onClickAddress);

                } // switch(settings.searchType)
            }); // $.each(addressLines
            $(outerList).append($("<option value=\"NotFound\">Address not found</option>"));

            if ($("Form").attr("id") == "FurtherDetail") {
                // Show the drop down list now that we've populated it
                $("#Applicant_1_Address1").show();
                // Make sure its associated label is also visible
                $('.addressDDL1').show();
                // the drop down list for app2 no longer needs styling to move it further from the left so remove the class which does that.
                $('#Applicant_2_Address2').removeClass("alone");
                // Set the 'Use applicant1 address' checkbox to unchecked - I don't know what the rules are for this so I'm making this bit up as I go along.
                $('.radio.applicant-address').prop('checked', false);

                // Applicant1_Address1
                $("#Applicant_1_Address1").addClass("SetRedAdress");
            }
            else {

                if ($("#Applicant_1_Address1 option").length <= 2) {
                    //alert("Postcode1 completed in error");
                    console.log("Postcode1 completed in error");
                    $("#Applicant1_PostCode").addClass("error");
                    $("span[id$='1.PostCode']").show();
                    //isValid = false;
                }
                else {
                    //alert("Postcode1 completed successfully");
                    console.log("Postcode1 completed successfully");
                    $("#Applicant1_PostCode").removeClass("error");
                    $("span[id$='1.PostCode']").hide();
                }

                searchingForPostcode = false;

            }


            //showModalbox.call(self, "Please select your address", outerList);
        }; /* displaySelection */



        /**
        * Function: showModalbox
        * This function creates a modal box and then uses a slide down effect to display a message to the user.
        */
        var showModalbox = function (title, content) {
            var div = $("<div id=\"wsModal\"><h1>" + title + "</h1></div>");
            $(div).hide().append(content);
            var mbo = $(document.body).prepend($("<div id=\"wsModalOverlay\"></div>"));
            mbo.click(hideModalbox);
            $(document.body).prepend(div);
            $(div).css("left", ($(window).width() - $(div).outerWidth()) / 2 + "px");
            $(div).slideDown("slow");
        };  /* showModalbox */

        /**
        * Function: hideModalbox
        * This function slides up the modal box and then removes it from the DOM.
        */
        var hideModalbox = function (e) {
            displayDebug.call(self, "Postcoder->hideSelection();");

            $("#wsModal").slideUp("slow", function () {
                $(this).remove();
                $("#wsModalOverlay").remove();
            });

            e.stopPropagation();
        }; /* hideModalbox */

        /**
        * Function: applyTemplate
        * This function applies the retrieved (and user input premise info/building number for street level searches) address data
        * into a standard template to be used in other functions.
        *
        * Parameters:
        * addressThoroughfare - The thoroughfare level of the selected address object.
        * addressPremise - The premise level of the selected address object.
        */
        var applyTemplate = function (addressThoroughfare, addressPremise) {
            displayDebug.call(self, "Postcoder->applyTemplate();");

            address = {
                organisationName: (addressPremise ? addressPremise.organisationName : undefined),
                organisationDepartment: (addressPremise ? addressPremise.organisationDepartment : undefined),
                subBuildingName: (addressPremise ? addressPremise.subBuildingName : undefined),
                buildingName: (addressPremise ? addressPremise.buildingName : ($("#" + settings.premiseInfo).val() != '') ? $("#" + settings.premiseInfo).val() : undefined),
                buildingNumber: (addressPremise ? addressPremise.buildingNumber : ($("#" + settings.buildingNumber).val() != '') ? $("#" + settings.buildingNumber).val() : undefined),
                dependentStreet: addressThoroughfare.dependentStreet,
                street: addressThoroughfare.street,
                doubleDependentLocality: addressThoroughfare.doubleDependentLocality,
                dependentLocality: addressThoroughfare.dependentLocality,
                postTown: addressThoroughfare.postTown,
                county: ((settings.useCounty == true) ? addressThoroughfare.county : undefined),
                postcode: addressThoroughfare.postcode
            };
        }; /* applyTemplate */

        /**
        * Function: populateResults
        * This function adjusts the selected address data to fit within the number of available fields. 
        * Also fires the user-defined onPopulateResults() function.
        */
        var populateResults = function () {
            displayDebug.call(self, "Postcoder->populateResults();");

            if (settings.onPopulateResults.constructor == Function) {
                displayDebug.call(self, "trigger function", "onPopulateResults();");
                settings.onPopulateResults.call(self);
            }

            // **** STEP1 Make necessary adjustments to building name/number ****

            var buildingNumber = '';

            // If Building Name starts and ends with a number OR is only 1 alphabetic char, then treat it like a building number
            // RM store non-numeric building numbers in the building name field. Allies move all but these two types into the 
            // building number field in our address database
            if (address.buildingName) {
                if ((address.buildingName.match('\d.*\d')) || (address.buildingName.match('^[A-Za-z]$'))) {
                    buildingNumber = address.buildingName;
                    delete address.buildingName;
                    if (address.buildingNumber) { // In theory it's impossible for there to be a "building number" in building name and in building number fields, but......
                        address.buildingNumber = buildingNumber + " " + address.buildingNumber;
                    }
                }
            }

            // If there is a building "number" of any description, add it as a prefix to the next street or locality line (we call this "Tidy Premise")
            if (address.buildingNumber) {
                if (address.dependentStreet) {
                    address.dependentStreet = address.buildingNumber + " " + address.dependentStreet; delete address.buildingNumber;
                } else if (address.street) {
                    address.street = address.buildingNumber + " " + address.street; delete address.buildingNumber;
                } else if (address.doubleDependentLocality) {
                    address.doubleDependentLocality = address.buildingNumber + " " + address.doubleDependentLocality; delete address.buildingNumber;
                } else if (address.dependentLocality) {
                    address.dependentLocality = address.buildingNumber + " " + address.dependentLocality; delete address.buildingNumber;
                }
            }

            // **** STEP2 Convert Post Town to uppercase if required ****

            if (settings.uppercaseTown) {
                address.postTown = address.postTown.toUpperCase();
            }

            /* **** STEP3 Copy mapped address elements into their respective positions in the address fields
            and remove them from the address array, leaving just address rows which need to be shoe-horned into the
            available address lines 1..n
            **** */
            $.each(address, function (index, value) {
                // If this element is explicit in outputMap
                if (settings.outputMap[index]) {
                    // Copy the value of the element to the mapped field and remove it from the list
                    $("#" + settings.outputMap[index]).val(value);
                    delete address[index];
                } else { // Candidate for variable address lines 1..n
                    // If the field is populated
                    if ($.inArray(index, ["organisationName", "organisationDepartment", "subBuildingName", "buildingName", "buildingNumber", "dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"]) >= 0) {
                        if (typeof (value) == "undefined") {
                            // Remove this field)
                            delete address[index];
                        }
                    }
                }
            });

            /*  **** STEP 4
            By this stage we have only that address data which is to be inserted into Address1..n
            However, there may be multiple comma separated elements IF the user has input to the premise fields (
            (For street level address lookups only)
            **** */
            var numRowData = 0; // Number of rows of data
            var addressElements = [];
            // First of all decant address elements into a new array - this is to allow for comma separated elements in manually input premise fields
            $.each(address, function (index, value) {
                if (value.indexOf(',') != -1) {
                    // Two or more comma separated element - decant each piece into addressElements
                    var addressTemp = value.split(',');
                    $.each(addressTemp, function (index, value1) {
                        addressElements[numRowData] = $.trim(value1); // Strip leading spaces
                        numRowData++;
                    });
                } else { // One element - simple copy into addressElements
                    addressElements[numRowData] = value;
                    numRowData++;
                }
            });

            var numLinesAvailable = settings.outputMap.addressLines.length; //Number of target address1..n lines
            /* If there are more rows of data than rows available to put them in
            Have to do a bit of shuffling up
            */
            if (numLinesAvailable < numRowData) {
                for (var i = numRowData - numLinesAvailable; i > 0; i--) {
                    var smallest = undefined;
                    var lastLine = {
                        key: undefined,
                        count: 0
                    };

                    $.each(addressElements, function (index, value) {
                        if (typeof (lastLine.key) != "undefined") {
                            var lineLength = value.length + lastLine.count;

                            if (typeof (smallest) == "undefined" || lineLength < smallest.count) {
                                smallest = {
                                    key: index,
                                    count: lineLength,
                                    prevKey: lastLine.key
                                };
                            }
                        }

                        lastLine = {
                            key: index,
                            count: value.length
                        };
                    });

                    addressElements[smallest.prevKey] = addressElements[smallest.prevKey] + ", " + addressElements[smallest.key];
                    addressElements.splice(smallest.key, 1);
                } /* for(var i */
            }
            address = addressElements;
        }; /* populateResults*/

        /**
        * Function: populateForm
        * This function populates the form with the selected, formatted address. Also fires the user-defined onPopulateForm() function.
        */
        var populateForm = function () {
            displayDebug.call(self, "Postcoder->populateForm();");

            if (settings.onPopulateForm.constructor == Function) {
                displayDebug.call(self, "trigger function", "onPopulateForm();");
                settings.onPopulateForm.call(self);
            }

            switch (settings.searchType) {
                case "GEODATA":
                    if (settings.outputMap.geoCoords) {
                        if (settings.outputMap.geoCoords.easting) {
                            $("#" + settings.outputMap.geoCoords.easting).val(addressLines.geoCoords.easting);
                        }

                        if (settings.outputMap.geoCoords.northing) {
                            $("#" + settings.outputMap.geoCoords.northing).val(addressLines.geoCoords.northing);
                        }

                        if (settings.outputMap.geoCoords.status) {
                            $("#" + settings.outputMap.geoCoords.status).val(addressLines.geoCoords.status);
                        }

                        if (settings.outputMap.geoCoords.etrs89) {
                            if (settings.outputMap.geoCoords.etrs89.latitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.latitude).val(addressLines.geoCoords.etrs89.latitude);
                            }

                            if (settings.outputMap.geoCoords.etrs89.longitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.longitude).val(addressLines.geoCoords.etrs89.longitude);
                            }
                        }

                        if (settings.outputMap.geoCoords.osgb36) {
                            if (settings.outputMap.geoCoords.osgb36.latitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.latitude).val(addressLines.geoCoords.osgb36.latitude);
                            }

                            if (settings.outputMap.geoCoords.osgb36.longitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.longitude).val(addressLines.geoCoords.osgb36.longitude);
                            }
                        }
                    }

                    if (settings.outputMap.localAuthority) {
                        if (settings.outputMap.localAuthority.authorityName) {
                            $("#" + settings.outputMap.localAuthority.authorityName).val(addressLines.localAuthority.authorityName);
                        }

                        if (settings.outputMap.localAuthority.ward) {
                            if (settings.outputMap.localAuthority.ward.code) {
                                $("#" + settings.outputMap.localAuthority.ward.code).val(addressLines.localAuthority.ward.code);
                            }

                            if (settings.outputMap.localAuthority.ward.name) {
                                $("#" + settings.outputMap.localAuthority.ward.name).val(addressLines.localAuthority.ward.name);
                            }
                        }
                    }

                    if (settings.outputMap.nhs) {
                        if (settings.outputMap.nhs.healthAuthority) {
                            if (settings.outputMap.nhs.healthAuthority.code) {
                                $("#" + settings.outputMap.nhs.healthAuthority.code).val(addressLines.nhs.healthAuthority.code);
                            }

                            if (settings.outputMap.nhs.healthAuthority.name) {
                                $("#" + settings.outputMap.nhs.healthAuthority.name).val(addressLines.nhs.healthAuthority.name);
                            }
                        }

                        if (settings.outputMap.nhs.primaryCareTrust) {
                            if (settings.outputMap.nhs.primaryCareTrust.code) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.code).val(addressLines.nhs.primaryCareTrust.code);
                            }

                            if (settings.outputMap.nhs.primaryCareTrust.name) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.name).val(addressLines.nhs.primaryCareTrust.name);
                            }

                            if (settings.outputMap.nhs.primaryCareTrust.ha) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.ha).val(addressLines.nhs.primaryCareTrust.ha);
                            }
                        }
                    }
                    break;

                case "GRIDS":
                    if (settings.outputMap.geoCoords) {
                        if (settings.outputMap.geoCoords.easting) {
                            $("#" + settings.outputMap.geoCoords.easting).val(addressLines.geoCoords.easting);
                        }

                        if (settings.outputMap.geoCoords.northing) {
                            $("#" + settings.outputMap.geoCoords.northing).val(addressLines.geoCoords.northing);
                        }

                        if (settings.outputMap.geoCoords.status) {
                            $("#" + settings.outputMap.geoCoords.status).val(addressLines.geoCoords.status);
                        }

                        if (settings.outputMap.geoCoords.etrs89) {
                            if (settings.outputMap.geoCoords.etrs89.latitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.latitude).val(addressLines.geoCoords.etrs89.latitude);
                            }

                            if (settings.outputMap.geoCoords.etrs89.longitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.longitude).val(addressLines.geoCoords.etrs89.longitude);
                            }
                        }

                        if (settings.outputMap.geoCoords.osgb36) {
                            if (settings.outputMap.geoCoords.osgb36.latitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.latitude).val(addressLines.geoCoords.osgb36.latitude);
                            }

                            if (settings.outputMap.geoCoords.osgb36.longitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.longitude).val(addressLines.geoCoords.osgb36.longitude);
                            }
                        }
                    }
                    break;

                default:
                    var i = 0;
                    $.each(address, function (index, value) {
                        $("#" + settings.outputMap.addressLines[i++]).val(value);
                    });
            }
        };  /* populateForm*/

        /**
        * Function: clearFields
        * This function clears all fields defined in settings.outputMap.
        */
        var clearFields = function () {
            displayDebug.call(self, "Postcoder->clearFields();");
            /**
            * Function: clearTree
            * This function clears the contents of <input> fields as defined in the outputMap
            *
            * Parameters:
            * branch - branch of outputMap (sub)tree to be cleared 
            */
            var clearTree = function (branch) {
                $.each(branch, function (index, value) { // Walk through the sub-tree structure
                    if (typeof (value) == 'object') { // Not yet at a leaf node
                        clearTree(value); // Recursive call to traverse sub-tree
                    } else { // At a leaf node
                        $('#' + value).val(""); // Clear the target <input> field
                    }
                });
            }; // clearTree
            clearTree(settings.outputMap);
            displayDebug.call(self, "Postcoder->endclearFields();");
        }; /* clearFields */

        /**
        * Function: displayError
        * This function displays errors.
        *
        * Parameters:
        * status - Requires a STATUS flag (STATUS.ERROR, STATUS.WARNING) to determine how or whether a message is displayed to the end-user.
        * code - The error code. Only shown in a debug message via the console to the developer when debug mode is on.
        * message - The message describing the error.
        * detail - Any detail regarding the error. Only shown in a debug message via the console to the developer when debug mode is on.
        */
        var displayError = function (status, code, message, detail) {
            displayDebug.call(self, "Postcoder->displayError();");

            switch (status) {
                case STATUS.ERROR:
                    //showModalbox.call(self, "Warning", "<p>There has been a problem. Please enter your address manually.</p>");
                    break;
                case STATUS.WARNING:
                    if (settings.displayUserHint) {
                        //showModalbox.call(self, "Warning", "<p>" + message + "</p>");
                    } else {
                        //showModalbox.call(self, "Warning", "<p>There has been a problem. Please enter your address manually.</p>");
                    }
                    break;
            }

            // Applicant1_Address1
            $("#Applicant_1_Address1").addClass("SetRedAdress");

            displayDebug.call(self, status, code, message, detail);
        }; /* displayError */

        /**
        * Function: startDebug
        * This function starts a debug group. Only tested in Firefox with Firebug.
        * 
        * Parameters:
        * groupName: provide a name for a group of debug messages.
        */
        var startDebug = function (groupName) {
            if (settings.debug && typeof (console) != "undefined") {
                console.group('Postcoder Websoap (#' + self.attr("id") + ") - " + groupName);
            }
        }; /* startDebug */

        /**
        * Function: displayDebug
        * This function displays a console message. Only tested in Firefox with Firebug.
        */
        var displayDebug = function () {
            if (settings.debug && typeof (console) != "undefined") {
                //console.info(arguments);
            }
        }; /* displayDebug */

        /**
        * Function: endDebug
        * This function ends a previously defined debug group. Only tested in Firefox with Firebug.
        */
        var endDebug = function () {
            if (settings.debug && typeof (console) != "undefined") {
                console.groupEnd();
            }
        }; /* endDebug */

        return this.each(function () {
            init.call(self);
        });
    };
})(jQuery);







(function ($) {
    $.fn.Postcoder2 = function (options) {
        /**
        * Group: Properties
        */

        /**
        * property: STATUS
        * Status flags for specifying error message level.
        */
        var STATUS = {
            ERROR: 0,
            WARNING: 1
        };

        /**
        * property: self
        * An internal reference to the calling element.
        */
        var self = this;

        /**
        * property: defaults
        * Holds a number of default configuration settings.
        */
        var defaults = {
            searchType: undefined,
            searchURL: undefined,
            searchButton: undefined,
            identifier: undefined,
            useCounty: false,
            premiseInfo: undefined,
            buildingNumber: undefined,
            outputMap: undefined,
            debug: false,
            displayUserHint: true,
            timeout: 5000,
            uppercaseTown: true,

            onInit: function () { },
            onClickSearch: function () { },
            onClickAddress: function () { },
            onReturnData: function () { },
            onPopulateResults: function () { },
            onPopulateForm: function () { }
        };

        /**
        * property: settings
        * The settings property is a combination of the defaults and the user supplied options.
        */
        var settings = $.extend({}, defaults, options);

        /**
        * property: address
        * Container for the selected address template.
        */
        var address;

        /**
        * property: addressLines
        * Container for addresses that are returned from the service.
        */
        var addressLines = [];

        // Group: Functions

        /**
        * Function: init
        * This is the "main" (entry) function that validates the initial config and attachs event listeners. Also fires the user-defined onInit() function.
        */
        var init = function () {
            startDebug.call(self, "init");

            displayDebug.call(self, "Postcoder->init();");
            displayDebug.call(self, "Initial config:", settings);

            if (settings.onInit.constructor == Function) {
                displayDebug.call(self, "trigger function", "onInit();");
                settings.onInit.call(self);
            }

            if (validateConfig.call(self)) {
                $("#" + settings.searchButton).click(onClickSearch);

                self.keyup(function (e) {
                    if (e.keyCode == 13) {
                        onClickSearch.call(self);
                    }
                });
            }

            endDebug.call(self);
        };

        /**
        * Function: onClickSearch
        * Called by the event listener attached in the init function. This function clears fields then makes a proxy request to the server. Also fires the user-defined onClickSearch() function.
        */
        var onClickSearch = function () {
            startDebug.call(self, "onClickSearch");

            displayDebug.call(self, "Postcoder->onClickSearch();");
            displayDebug.call(self, "searchValue", self.val());

            if (settings.onClickSearch.constructor == Function) {
                displayDebug.call(self, "trigger function", "onClickSearch();");
                settings.onClickSearch.call(self);
            }

            clearFields.call(self);

            if (self.val() != "") {
                proxyRequest.call(self);
            } else {
                displayError.call(self, STATUS.WARNING, -5, "Please enter a search value.", null);
                return false;
            }
        };

        /**
        * Function: onClickAddress
        * Called by the event listener attached in the displaySelection function. This function applies a standard template to the selected address, evenly distributes the address lines across the template, populates the form fields and then closes the modalbox. Also fires the user-defined onClickAddress() function.
        *
        * Parameters:
        * e - event object.
        */
        var onClickAddress = function (e) {
            startDebug.call(self, "onClickAddress");

            displayDebug.call(self, "Postcoder->onClickAddress();");

            if (settings.onClickAddress.constructor == Function) {
                displayDebug.call(self, "trigger function", "onClickAddress();");
                settings.onClickAddress.call(self);
            }

            var el = e.target.id.replace("wsi", "").split("-");

            applyTemplate.call(self, addressLines[el[0]], (addressLines[el[0]]["premise"] ? addressLines[el[0]]["premise"][el[1]] : undefined));

            populateResults.call(self);

            populateForm.call(self);

            hideModalbox.call(self, e);

            e.stopPropagation();

            endDebug.call(self);
        };

        /**
        * Function: validateConfig
        * This function validates the user-defined config options that were passed to the class.
        */
        var validateConfig = function () {
            displayDebug.call(self, "Postcoder->validateConfig();");

            if ($.inArray(settings.searchType, ["PREMISE_LIST", "MATCH_ADDRESS", "THRFARE_ADDRESS", "GRIDS", "GEODATA"]) == -1) {
                displayError.call(self, STATUS.ERROR, 5000, "The service you have requested does not exist.", "Must be one of 'PREMISE_LIST', 'MATCH_ADDRESS', 'THRFARE_ADDRESS', 'GRIDS', 'GEODATA'");
                return false;
            }

            return true;
        };  /* validateConfig */

        /**
        * Function: proxyRequest
        * This function makes a request to the server which in turn makes a request to the web service. 
        * The onRequestSuccess and onRequestFailure event handlers are attached to receive the server's response.
        */
        var proxyRequest = function () {
            displayDebug.call(self, "Postcoder->proxyRequest();");

            $.ajax({
                url: settings.searchURL,
                type: "POST",
                data: {
                    searchValue: self.val(),
                    searchType: settings.searchType,
                    identifier: settings.identifier
                },
                dataType: "json",
                success: onRequestSuccess,
                error: onRequestFailure,
                complete: function () {
                    endDebug.call(self);
                },
                timeout: settings.timeout
            });
        }; /* proxyRequest */

        /**
        * Function: onRequestSuccess
        * This function handles the response from the server in the event that the request was successful. If there is only one result returned this function will populate the form, otherwise it will display a selection of addresses to the user. Also fires the user-defined onReturnData() function.
        *
        * Parameters:
        * data - the data returned from the server.
        * status - a string describing the status.
        * xhr - XMLHttpRequest object.
        */
        var onRequestSuccess = function (data, status, xhr) {
            displayDebug.call(self, "Postcoder->onRequestSuccess();");

            if (settings.onReturnData.constructor == Function) {
                displayDebug.call(self, "trigger function", "onReturnData();");
                settings.onReturnData.call(self);
            }

            if (data && data.constructor == Object) {
                if (data.success) {
                    if (data.numberOfResults > 0) {
                        switch (settings.searchType) {
                            case "GEODATA":
                                addressLines = {
                                    geoCoords: data.geoCoords,
                                    localAuthority: data.localAuthority,
                                    nhs: data.nhs
                                };

                                populateForm.call(self);

                                break;

                            case "GRIDS":
                                addressLines = {
                                    geoCoords: data.geoCoords
                                };

                                populateForm.call(self);

                                break;

                            case "THRFARE_ADDRESS":
                                addressLines = data.address;

                                if (addressLines.constructor == Object) {
                                    applyTemplate.call(self, addressLines, undefined);

                                    populateResults.call(self);

                                    populateForm.call(self);
                                } else {
                                    displaySelection.call(this);
                                }

                                break;

                            default: /* Premise level searches */
                                addressLines = data.address;

                                /* If single address returned */
                                if (addressLines.constructor == Object && addressLines.premise.constructor == Object) {
                                    applyTemplate.call(self, addressLines, addressLines.premise);

                                    populateResults.call(self);

                                    populateForm.call(self);
                                } else { /* Multiple addresses returned */
                                    displaySelection.call(this);
                                }
                        }
                    } else {
                        displayError.call(self, STATUS.WARNING, data.retcode, data.userHint, null);
                    }
                } else {
                    displayError.call(self, STATUS.ERROR, data.error.code, data.error.message, data.error.detail);
                }
            } else {
                displayError.call(self, STATUS.ERROR, 5100, "No data was received from request", null);
            }
        }; /* onRequestSuccess */

        /**
        * Function: onRequestFailure
        * This function handles the response from the server in the event that the request failed. It then passes on the relevant details to be displayed as an error message.
        *
        * Parameters:
        * xhr - XMLHttpRequest object.
        * status - a string describing the type of error that occurred.
        * error - an optional exception object.
        */
        var onRequestFailure = function (xhr, status, error) {
            displayDebug.call(self, "Postcoder->onRequestFailure();");

            displayError.call(self, STATUS.ERROR, 5101, "There was a problem with the request", error);
        }; /* onRequestFailure */




        /**
        * Function: displaySelection
        * This function creates a list of return addresses and displays them to the user in a modalbox. The onClickAddress event listener is attached to each inner list item.
        */
        var displaySelection = function () {

            displayDebug.call(self, "Postcoder->displaySelection();");

            var addrRow = 0;
            var thisTown = "";
            var thisCounty = "";

            var outerList = $("#Applicant_2_Address2");
            var list = ["Select", "Address not found"];

            $("#Applicant_2_Address2 option").remove();

            $(outerList).append($("<option value=\"Select\">Select...</option>"));

            if (addressLines.constructor == Object) {
                addressLines = [addressLines];
            }

            /* Build Street level address line which acts as a heading for each premise */
            $.each(addressLines, function (i, addressGroup) {
                var addressGroupTitle = [];
                $.each(["dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"], function (k, prop) {
                    if (typeof (addressGroup[prop]) != "undefined" && addressGroup[prop] != "") {
                        /* Upper case town if specified in settings */
                        if (prop == "postTown" && settings.uppercaseTown) {
                            addressGroup[prop] = addressGroup[prop].toUpperCase();
                            thisTown = addressGroup[prop];
                        }
                        if (prop == "county") {
                            thisCounty = addressGroup[prop];
                        }
                        /* Ignore county if not required */
                        if (!(prop == "county" && settings.useCounty == false)) {
                            addressGroupTitle.push(addressGroup[prop]);
                        }
                    }
                });

                // <option value="Select">Select</option>
                //$(outerList).append($("<option value=\"Select" + i + "\">" + addressGroupTitle.join(", ") + "</option>"));
                //$(outerList).append($("<li><a href=\"javascript:void(0)\" id=\"wsi" + i + "\">" + addressGroupTitle.join(", ") + "</a></li>"));

                /* Now set listener for Street level address line or add the premises */
                switch (settings.searchType) {
                    case "THRFARE_ADDRESS":
                        $(outerList).find("li").click(onClickAddress);
                        break;
                    default:

                        var addressGroupTitle = [];

                        $.each(["dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"], function (k, prop) {
                            if (typeof (addressGroup[prop]) != "undefined" && addressGroup[prop] != "") {
                                if (prop == "postTown" && settings.uppercaseTown) {
                                    addressGroup[prop] = addressGroup[prop].toUpperCase();
                                    thisTown = addressGroup[prop];
                                }
                                if (prop == "county") {
                                    thisCounty = addressGroup[prop];
                                }
                                addressGroupTitle.push(addressGroup[prop]);
                            }
                        });



                        /* Build a list of premises within the street level address */
                        var innerList = $(outerList).children("li").last().append($("<ul></ul>"));
                        if (addressGroup.premise.constructor == Object) {
                            addressGroup.premise = [addressGroup.premise];
                        }

                        $.each(addressGroup.premise, function (j, premiseLine) {
                            var addressLineTitle = [];
                            if (typeof (premiseLine.organisationName) != "undefined") {
                                addressLineTitle.push(premiseLine.organisationName);
                            }
                            if (typeof (premiseLine.formattedPremise) != "undefined") {
                                addressLineTitle.push(premiseLine.formattedPremise);
                            }

                            // Add the first street level line in the address to the selection list
                            // this could be dependent street, main street, double dependent locality or dependent locality (but hopefully not Town!!)
                            // Modified by Alan Shilling, 20/2/2013 to fix "Tidy Premise" bug
                            if (typeof (addressGroup.dependentStreet) != "undefined") {
                                addressLineTitle.push(addressGroup.dependentStreet);
                            } else if (typeof (addressGroup.street) != "undefined") {
                                addressLineTitle.push(addressGroup.street);
                            } else if (typeof (addressGroup.doubleDependentLocality) != "undefined") {
                                addressLineTitle.push(addressGroup.doubleDependentLocality);
                            } else if (typeof (addressGroup.dependentLocality) != "undefined") {
                                addressLineTitle.push(addressGroup.dependentLocality);
                            }
                            //$(innerList).children("ul").last().append($("<li><a href=\"javascript:void(0)\" id=\"wsi" + i + "-" + j + "\">" + addressLineTitle.join(", ") + "</a></li>"));
                            $(outerList).append($("<option value=\"Select" + addrRow + "\">" + addressLineTitle.join(", ") + ", " + thisTown + ", " + thisCounty + "</option>"));
                            addrRow++;
                        }); //$.each(addressGroup.premise

                    //$(innerList).find("li").click(onClickAddress);

                } // switch(settings.searchType)
            }); // $.each(addressLines
            $(outerList).append($("<option value=\"NotFound\">Address not found</option>"));

            if ($("Form").attr("id") == "FurtherDetail") {
                // Show the drop down list now rthat we've populated it
                $("#Applicant_2_Address2").show();
                // Make sure it's associated label is also visible
                $('.addressDDL2').show();
                // The address fields have been hidden for App2, but the drop down remains. 
                // If App1 drop down is hidden then we need to ensure that the App2 drop down does not
                // sidle over to the left. Add a class with the relevant styling.
                if ($("#Applicant_1_Address1").is(":hidden")) {
                    $('#Applicant_2_Address2').addClass("alone");
                    // Why do this? It's an attempt to get the above styling active straight away - it's not happening for me right now:-(
                    $("#Applicant_1_Address1").focus();
                }
                else {
                    $('#Applicant_2_Address2').removeClass("alone");
                }
                // Set the 'Use applicant1 address' checkbox to unchecked - I don't know what the rules are for this so I'm making this bit up as I go along.

                $('.radio.applicant-address').prop('checked', false);

                // Applicant2_Address1
                $("#Applicant_2_Address2").addClass("SetRedAdress");
            }
            else {
                console.log("Postcode complete")
                if ($("input[name=JointPolicy]:checked").val() == 2) {
                    if ($("#Applicant_2_Address2 option").length <= 2) {
                        console.log("Postcode1 completed successfully")
                        $("#Applicant2_PostCode").addClass("error");
                        $("span[id$='2.PostCode']").show();
                        //isValid = false;
                    }
                    else {
                        console.log("Postcode1 completed in error")
                        $("#Applicant2_PostCode").removeClass("error");
                        $("span[id$='2.PostCode']").hide();
                    }
                }

                searchingForPostcode2 = false;

            }

            //showModalbox.call(self, "Please select your address", outerList);
        }; /* displaySelection */



        /**
        * Function: showModalbox
        * This function creates a modal box and then uses a slide down effect to display a message to the user.
        */
        var showModalbox = function (title, content) {
            var div = $("<div id=\"wsModal\"><h1>" + title + "</h1></div>");
            $(div).hide().append(content);
            var mbo = $(document.body).prepend($("<div id=\"wsModalOverlay\"></div>"));
            mbo.click(hideModalbox);
            $(document.body).prepend(div);
            $(div).css("left", ($(window).width() - $(div).outerWidth()) / 2 + "px");
            $(div).slideDown("slow");
        };  /* showModalbox */

        /**
        * Function: hideModalbox
        * This function slides up the modal box and then removes it from the DOM.
        */
        var hideModalbox = function (e) {
            displayDebug.call(self, "Postcoder->hideSelection();");

            $("#wsModal").slideUp("slow", function () {
                $(this).remove();
                $("#wsModalOverlay").remove();
            });

            e.stopPropagation();
        }; /* hideModalbox */

        /**
        * Function: applyTemplate
        * This function applies the retrieved (and user input premise info/building number for street level searches) address data
        * into a standard template to be used in other functions.
        *
        * Parameters:
        * addressThoroughfare - The thoroughfare level of the selected address object.
        * addressPremise - The premise level of the selected address object.
        */
        var applyTemplate = function (addressThoroughfare, addressPremise) {
            displayDebug.call(self, "Postcoder->applyTemplate();");

            address = {
                organisationName: (addressPremise ? addressPremise.organisationName : undefined),
                organisationDepartment: (addressPremise ? addressPremise.organisationDepartment : undefined),
                subBuildingName: (addressPremise ? addressPremise.subBuildingName : undefined),
                buildingName: (addressPremise ? addressPremise.buildingName : ($("#" + settings.premiseInfo).val() != '') ? $("#" + settings.premiseInfo).val() : undefined),
                buildingNumber: (addressPremise ? addressPremise.buildingNumber : ($("#" + settings.buildingNumber).val() != '') ? $("#" + settings.buildingNumber).val() : undefined),
                dependentStreet: addressThoroughfare.dependentStreet,
                street: addressThoroughfare.street,
                doubleDependentLocality: addressThoroughfare.doubleDependentLocality,
                dependentLocality: addressThoroughfare.dependentLocality,
                postTown: addressThoroughfare.postTown,
                county: ((settings.useCounty == true) ? addressThoroughfare.county : undefined),
                postcode: addressThoroughfare.postcode
            };
        }; /* applyTemplate */

        /**
        * Function: populateResults
        * This function adjusts the selected address data to fit within the number of available fields. 
        * Also fires the user-defined onPopulateResults() function.
        */
        var populateResults = function () {
            displayDebug.call(self, "Postcoder->populateResults();");

            if (settings.onPopulateResults.constructor == Function) {
                displayDebug.call(self, "trigger function", "onPopulateResults();");
                settings.onPopulateResults.call(self);
            }

            // **** STEP1 Make necessary adjustments to building name/number ****

            var buildingNumber = '';

            // If Building Name starts and ends with a number OR is only 1 alphabetic char, then treat it like a building number
            // RM store non-numeric building numbers in the building name field. Allies move all but these two types into the 
            // building number field in our address database
            if (address.buildingName) {
                if ((address.buildingName.match('\d.*\d')) || (address.buildingName.match('^[A-Za-z]$'))) {
                    buildingNumber = address.buildingName;
                    delete address.buildingName;
                    if (address.buildingNumber) { // In theory it's impossible for there to be a "building number" in building name and in building number fields, but......
                        address.buildingNumber = buildingNumber + " " + address.buildingNumber;
                    }
                }
            }

            // If there is a building "number" of any description, add it as a prefix to the next street or locality line (we call this "Tidy Premise")
            if (address.buildingNumber) {
                if (address.dependentStreet) {
                    address.dependentStreet = address.buildingNumber + " " + address.dependentStreet; delete address.buildingNumber;
                } else if (address.street) {
                    address.street = address.buildingNumber + " " + address.street; delete address.buildingNumber;
                } else if (address.doubleDependentLocality) {
                    address.doubleDependentLocality = address.buildingNumber + " " + address.doubleDependentLocality; delete address.buildingNumber;
                } else if (address.dependentLocality) {
                    address.dependentLocality = address.buildingNumber + " " + address.dependentLocality; delete address.buildingNumber;
                }
            }

            // **** STEP2 Convert Post Town to uppercase if required ****

            if (settings.uppercaseTown) {
                address.postTown = address.postTown.toUpperCase();
            }

            /* **** STEP3 Copy mapped address elements into their respective positions in the address fields
            and remove them from the address array, leaving just address rows which need to be shoe-horned into the
            available address lines 1..n
            **** */
            $.each(address, function (index, value) {
                // If this element is explicit in outputMap
                if (settings.outputMap[index]) {
                    // Copy the value of the element to the mapped field and remove it from the list
                    $("#" + settings.outputMap[index]).val(value);
                    delete address[index];
                } else { // Candidate for variable address lines 1..n
                    // If the field is populated
                    if ($.inArray(index, ["organisationName", "organisationDepartment", "subBuildingName", "buildingName", "buildingNumber", "dependentStreet", "street", "doubleDependentLocality", "dependentLocality", "postTown", "county", "postcode"]) >= 0) {
                        if (typeof (value) == "undefined") {
                            // Remove this field)
                            delete address[index];
                        }
                    }
                }
            });

            /*  **** STEP 4
            By this stage we have only that address data which is to be inserted into Address1..n
            However, there may be multiple comma separated elements IF the user has input to the premise fields (
            (For street level address lookups only)
            **** */
            var numRowData = 0; // Number of rows of data
            var addressElements = [];
            // First of all decant address elements into a new array - this is to allow for comma separated elements in manually input premise fields
            $.each(address, function (index, value) {
                if (value.indexOf(',') != -1) {
                    // Two or more comma separated element - decant each piece into addressElements
                    var addressTemp = value.split(',');
                    $.each(addressTemp, function (index, value1) {
                        addressElements[numRowData] = $.trim(value1); // Strip leading spaces
                        numRowData++;
                    });
                } else { // One element - simple copy into addressElements
                    addressElements[numRowData] = value;
                    numRowData++;
                }
            });

            var numLinesAvailable = settings.outputMap.addressLines.length; //Number of target address1..n lines
            /* If there are more rows of data than rows available to put them in
            Have to do a bit of shuffling up
            */
            if (numLinesAvailable < numRowData) {
                for (var i = numRowData - numLinesAvailable; i > 0; i--) {
                    var smallest = undefined;
                    var lastLine = {
                        key: undefined,
                        count: 0
                    };

                    $.each(addressElements, function (index, value) {
                        if (typeof (lastLine.key) != "undefined") {
                            var lineLength = value.length + lastLine.count;

                            if (typeof (smallest) == "undefined" || lineLength < smallest.count) {
                                smallest = {
                                    key: index,
                                    count: lineLength,
                                    prevKey: lastLine.key
                                };
                            }
                        }

                        lastLine = {
                            key: index,
                            count: value.length
                        };
                    });

                    addressElements[smallest.prevKey] = addressElements[smallest.prevKey] + ", " + addressElements[smallest.key];
                    addressElements.splice(smallest.key, 1);
                } /* for(var i */
            }
            address = addressElements;
        }; /* populateResults*/

        /**
        * Function: populateForm
        * This function populates the form with the selected, formatted address. Also fires the user-defined onPopulateForm() function.
        */
        var populateForm = function () {
            displayDebug.call(self, "Postcoder->populateForm();");

            if (settings.onPopulateForm.constructor == Function) {
                displayDebug.call(self, "trigger function", "onPopulateForm();");
                settings.onPopulateForm.call(self);
            }

            switch (settings.searchType) {
                case "GEODATA":
                    if (settings.outputMap.geoCoords) {
                        if (settings.outputMap.geoCoords.easting) {
                            $("#" + settings.outputMap.geoCoords.easting).val(addressLines.geoCoords.easting);
                        }

                        if (settings.outputMap.geoCoords.northing) {
                            $("#" + settings.outputMap.geoCoords.northing).val(addressLines.geoCoords.northing);
                        }

                        if (settings.outputMap.geoCoords.status) {
                            $("#" + settings.outputMap.geoCoords.status).val(addressLines.geoCoords.status);
                        }

                        if (settings.outputMap.geoCoords.etrs89) {
                            if (settings.outputMap.geoCoords.etrs89.latitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.latitude).val(addressLines.geoCoords.etrs89.latitude);
                            }

                            if (settings.outputMap.geoCoords.etrs89.longitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.longitude).val(addressLines.geoCoords.etrs89.longitude);
                            }
                        }

                        if (settings.outputMap.geoCoords.osgb36) {
                            if (settings.outputMap.geoCoords.osgb36.latitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.latitude).val(addressLines.geoCoords.osgb36.latitude);
                            }

                            if (settings.outputMap.geoCoords.osgb36.longitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.longitude).val(addressLines.geoCoords.osgb36.longitude);
                            }
                        }
                    }

                    if (settings.outputMap.localAuthority) {
                        if (settings.outputMap.localAuthority.authorityName) {
                            $("#" + settings.outputMap.localAuthority.authorityName).val(addressLines.localAuthority.authorityName);
                        }

                        if (settings.outputMap.localAuthority.ward) {
                            if (settings.outputMap.localAuthority.ward.code) {
                                $("#" + settings.outputMap.localAuthority.ward.code).val(addressLines.localAuthority.ward.code);
                            }

                            if (settings.outputMap.localAuthority.ward.name) {
                                $("#" + settings.outputMap.localAuthority.ward.name).val(addressLines.localAuthority.ward.name);
                            }
                        }
                    }

                    if (settings.outputMap.nhs) {
                        if (settings.outputMap.nhs.healthAuthority) {
                            if (settings.outputMap.nhs.healthAuthority.code) {
                                $("#" + settings.outputMap.nhs.healthAuthority.code).val(addressLines.nhs.healthAuthority.code);
                            }

                            if (settings.outputMap.nhs.healthAuthority.name) {
                                $("#" + settings.outputMap.nhs.healthAuthority.name).val(addressLines.nhs.healthAuthority.name);
                            }
                        }

                        if (settings.outputMap.nhs.primaryCareTrust) {
                            if (settings.outputMap.nhs.primaryCareTrust.code) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.code).val(addressLines.nhs.primaryCareTrust.code);
                            }

                            if (settings.outputMap.nhs.primaryCareTrust.name) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.name).val(addressLines.nhs.primaryCareTrust.name);
                            }

                            if (settings.outputMap.nhs.primaryCareTrust.ha) {
                                $("#" + settings.outputMap.nhs.primaryCareTrust.ha).val(addressLines.nhs.primaryCareTrust.ha);
                            }
                        }
                    }
                    break;

                case "GRIDS":
                    if (settings.outputMap.geoCoords) {
                        if (settings.outputMap.geoCoords.easting) {
                            $("#" + settings.outputMap.geoCoords.easting).val(addressLines.geoCoords.easting);
                        }

                        if (settings.outputMap.geoCoords.northing) {
                            $("#" + settings.outputMap.geoCoords.northing).val(addressLines.geoCoords.northing);
                        }

                        if (settings.outputMap.geoCoords.status) {
                            $("#" + settings.outputMap.geoCoords.status).val(addressLines.geoCoords.status);
                        }

                        if (settings.outputMap.geoCoords.etrs89) {
                            if (settings.outputMap.geoCoords.etrs89.latitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.latitude).val(addressLines.geoCoords.etrs89.latitude);
                            }

                            if (settings.outputMap.geoCoords.etrs89.longitude) {
                                $("#" + settings.outputMap.geoCoords.etrs89.longitude).val(addressLines.geoCoords.etrs89.longitude);
                            }
                        }

                        if (settings.outputMap.geoCoords.osgb36) {
                            if (settings.outputMap.geoCoords.osgb36.latitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.latitude).val(addressLines.geoCoords.osgb36.latitude);
                            }

                            if (settings.outputMap.geoCoords.osgb36.longitude) {
                                $("#" + settings.outputMap.geoCoords.osgb36.longitude).val(addressLines.geoCoords.osgb36.longitude);
                            }
                        }
                    }
                    break;

                default:
                    var i = 0;
                    $.each(address, function (index, value) {
                        $("#" + settings.outputMap.addressLines[i++]).val(value);
                    });
            }
        };  /* populateForm*/

        /**
        * Function: clearFields
        * This function clears all fields defined in settings.outputMap.
        */
        var clearFields = function () {
            displayDebug.call(self, "Postcoder->clearFields();");
            /**
            * Function: clearTree
            * This function clears the contents of <input> fields as defined in the outputMap
            *
            * Parameters:
            * branch - branch of outputMap (sub)tree to be cleared 
            */
            var clearTree = function (branch) {
                $.each(branch, function (index, value) { // Walk through the sub-tree structure
                    if (typeof (value) == 'object') { // Not yet at a leaf node
                        clearTree(value); // Recursive call to traverse sub-tree
                    } else { // At a leaf node
                        $('#' + value).val(""); // Clear the target <input> field
                    }
                });
            }; // clearTree
            clearTree(settings.outputMap);
            displayDebug.call(self, "Postcoder->endclearFields();");
        }; /* clearFields */

        /**
        * Function: displayError
        * This function displays errors.
        *
        * Parameters:
        * status - Requires a STATUS flag (STATUS.ERROR, STATUS.WARNING) to determine how or whether a message is displayed to the end-user.
        * code - The error code. Only shown in a debug message via the console to the developer when debug mode is on.
        * message - The message describing the error.
        * detail - Any detail regarding the error. Only shown in a debug message via the console to the developer when debug mode is on.
        */
        var displayError = function (status, code, message, detail) {
            displayDebug.call(self, "Postcoder->displayError();");

            switch (status) {
                case STATUS.ERROR:
                    //showModalbox.call(self, "Warning", "<p>There has been a problem. Please enter your address manually.</p>");
                    break;
                case STATUS.WARNING:
                    if (settings.displayUserHint) {
                        //showModalbox.call(self, "Warning", "<p>" + message + "</p>");
                    } else {
                        //showModalbox.call(self, "Warning", "<p>There has been a problem. Please enter your address manually.</p>");
                    }
                    break;
            }

            // Applicant2_Address1
            $("#Applicant_2_Address2").addClass("SetRedAdress");

            displayDebug.call(self, status, code, message, detail);
        }; /* displayError */

        /**
        * Function: startDebug
        * This function starts a debug group. Only tested in Firefox with Firebug.
        * 
        * Parameters:
        * groupName: provide a name for a group of debug messages.
        */
        var startDebug = function (groupName) {
            if (settings.debug && typeof (console) != "undefined") {
                console.group('Postcoder Websoap (#' + self.attr("id") + ") - " + groupName);
            }
        }; /* startDebug */

        /**
        * Function: displayDebug
        * This function displays a console message. Only tested in Firefox with Firebug.
        */
        var displayDebug = function () {
            if (settings.debug && typeof (console) != "undefined") {
                //console.info(arguments);
            }
        }; /* displayDebug */

        /**
        * Function: endDebug
        * This function ends a previously defined debug group. Only tested in Firefox with Firebug.
        */
        var endDebug = function () {
            if (settings.debug && typeof (console) != "undefined") {
                console.groupEnd();
            }
        }; /* endDebug */

        return this.each(function () {
            init.call(self);
        });
    };
})(jQuery);