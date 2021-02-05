/**
 * Functions exclusive to on page filtering
 * Row must have  <tr class="filter-row" data-filters="@i.FilterParams" ....   to qualify
 * Sliders from https://refreshless.com/nouislider/
 */


var showFilters = true;
var useCicUrn = false;

const USE_FILTERSTATS = true;
const CHECKBOX_B = "B";  // Boolean Yes/No
const RANGE = "R";       // Greater than
const MINMAX_G = "G";    // Min Max Values
const STAR = "S";
const DEFAQTO_PREFEX = "3";
const DEFAQTO_MAX_RATING = 5;
const CONDITIONS_PREFEX = "6";
const ADDITIONAL_PAYMENTS_PREFEX = "8";
const CLAIMS_PREFEX = "10";
const SLIDER_DEFAULT_MIN = 1;
const SLIDER_DEFAULT_MAX = 100;
var rangeFilterPrefixes = [DEFAQTO_PREFEX, CONDITIONS_PREFEX, ADDITIONAL_PAYMENTS_PREFEX, CLAIMS_PREFEX];
var groupFilterPrefixes = [CLAIMS_PREFEX];
var conditionsMinMax;
var claimsMinMax;
var cicMinMaxValues = [];
var conditionsSlider;
var claimsSlider;
var activeFilters;

// Some flags which are reset on each page load.
// required to prevent unwanted values being posted 
// until user interaction has teken place.
var conditionsSliderHasChanged = false;
var claimsSliderHasChanged = false;
var defaqtoRatingHasChanged = false;
var filtersHaveBeenTouched = false;


function clearAndResetFilters() {

    // Clear checkboxes
    $('#filters :checkbox:checked').each(function () {
        $('#' + $(this).attr('id')).prop('checked', false);
    });

    // Set first star selected
    $('#df1').prop('checked', true);
    defaqtoRatingHasChanged = false;

    conditionsSlider.noUiSlider.reset();
    claimsSlider.noUiSlider.reset();

    // Run filters to set all the rows back to visible
    runResultRowFilters();
}

/* function to run on any control change.
     * re-evaluates the filters and shows/hides rows
     * based on the updated selection
     */
function runResultRowFilters() {

    $('.filter-row').hide();
    $('.filter-row').next('tr').hide();

    activeFilters = getActiveFilters();
    if (activeFilters.length > 0) {
        $('.result-table--no-quote').hide();
    }
    else {
        $('.result-table--no-quote').show();
    }

    $('.filter-row').each(function () {
        var $resultsRow = $(this);
        var productFilterParams = $resultsRow.data('filters');
        if (rowQualified(activeFilters, productFilterParams)) {
            if (!$resultsRow.hasClass('hideResults')) {  // Don't filter the hidden rows
                $resultsRow.show();
            }
        }
    });

    updateFilterStats();
    checkIfHeaderShouldShow();
}


function updateFilterStats() {

    if (USE_FILTERSTATS == true) {   // if not turned off...................

        var miFilterData = getActiveFilterForStats().toString();
        var referalSource = $("#RefSource").val();
        var urn = $("#hURN").val();
        var cicUrn = "";

        if (!miFilterData && !filtersHaveBeenTouched) {
            return;
        }
        filtersHaveBeenTouched = true;
        if (!miFilterData) { miFilterData = "0-0"; }

        $('.quote-results').find("a.btn--btn1").each(function () {
            var x = $(this).attr('href').split("=");
            var y = x[1].split("&");
            if (y[0] != urn) {
                cicUrn = y[0];
            }
        });

        if (useCicUrn) {
            urn = cicUrn;
        }

        $.ajax({
            url: "/Results/UpdateFilterStats",
            type: "POST",
            data: JSON.stringify({
                'filterData': miFilterData,
                'referalSource': referalSource,
                'urn': urn,
                'useFilterthread': true
            }),
            async: false,
            cache: false,
            contentType: "application/json",
            dataType: "json"
        });
    }
}


// Create array of selected filter values from filter panel 
function getActiveFilters() {
    var filterArray = [];

    $('#filters :checkbox:checked').each(function () {
        if ($(this).data('filter-method') != STAR) {
            filterArray.push($(this).data('filter-method') + "-" + $(this).attr('id'));
        }
    });

    // Handle Defaqto star rating
    var defaqtoRating = $("input[name='rating']:checked").val();
    filterArray.push(MINMAX_G + "-" + DEFAQTO_PREFEX + "-" + defaqtoRating + "-" + DEFAQTO_MAX_RATING);

    var conditionsSliderValues = conditionsSlider.noUiSlider.get();
    filterArray.push(MINMAX_G + "-" + CONDITIONS_PREFEX + "-" + conditionsSliderValues[0] + "-" + conditionsSliderValues[1]);

    var claimsSliderValue = claimsSlider.noUiSlider.get();
    filterArray.push(MINMAX_G + "-" + CLAIMS_PREFEX + "-" + claimsSliderValue + "-100");

    return filterArray;
}


function checkIfHeaderShouldShow() {
    if ($('.buynow tr:visible').length == 1) { $('.buynow th').hide(); } else { $('.buynow th').show(); }
    if ($('.guaranteed tr:visible').length == 1) { $('.guaranteed th').hide(); } else { $('.guaranteed th').show(); }
    if ($('.non-guaranteed tr:visible').length == 1) { $('.non-guaranteed th').hide(); } else { $('.non-guaranteed th').show(); }
}

// This function creates a simplyfied version of the selected 
// filters to send to MI
function getActiveFilterForStats() {

    var miFilterArray = [];

    $('#filters :checkbox:checked').each(function () {
        if ($(this).data('filter-method') != STAR) {
            miFilterArray.push($(this).attr('id'));
        }
    });

    var defaqtoRating = $("input[name='rating']:checked").val();
    if (defaqtoRatingHasChanged) {
        miFilterArray.push(DEFAQTO_PREFEX + "-" + defaqtoRating);
    }

    var conditionsSliderValues = conditionsSlider.noUiSlider.get();
    if (conditionsSliderHasChanged) {
        miFilterArray.push(CONDITIONS_PREFEX + "-" + conditionsSliderValues[0] + "-" + conditionsSliderValues[1]);
    }

    var claimsSliderValue = claimsSlider.noUiSlider.get();
    if (claimsSliderHasChanged) {
        miFilterArray.push(CLAIMS_PREFEX + "-" + claimsSliderValue);
    }


    return miFilterArray;
}


// Main control and logic to decide which rows to hide/show
// Runs for each row. As soon as a filter is not valid, exit and
// don't show row.
function rowQualified(filters, rowParameters) {

    var showRow = false;
    var rowParam = rowParameters.split(",");
    var rangeArray = getRangeArrayFromRowParameters(rowParam);

    for (i = 0; i < filters.length; i++) {

        filterItem = filters[i].split("-");

        // Validate all binary check boxes
        if (filterItem[0] == CHECKBOX_B) {
            if (rowParam.indexOf(filterItem[1] + "-" + filterItem[2]) == -1) {
                showRow = false;
                break;
            }
        }

        // Validate all min/max controls
        if (filterItem[0] == MINMAX_G) {
            if (isValidGroupItem(rangeArray, filterItem) == false) {
                showRow = false;
                break;
            }
        }

        // Validate x or above controls
        if (filterItem[0] == RANGE) {
            if (isValidRangeItem(rangeArray, filterItem) == false) {
                showRow = false;
                break;
            }
        }

        // Every filter for this row is valid, so show row
        showRow = true;
    }

    // show everything when no filter selected
    if (filters.length == 0) {
        showRow = true;
    }

    return showRow;
}


function isValidRangeItem(rangeArray, filterItem) {

    var validRange = true;
    var filterPrefix = filterItem[1];
    var filterValue = parseInt(filterItem[2]);

    for (r = 0; r < rangeArray.length; r++) {
        var paramItem = rangeArray[r].split("-");
        var paramPrefix = paramItem[0];
        var paramValue = parseInt(paramItem[1]);

        if (filterPrefix == paramPrefix) {
            if (filterValue > paramValue) {
                validRange = false;
                break;
            }
        }
    }
    return validRange;
}

function isValidGroupItem(rangeArray, filterItem) {

    var validRange = true;
    var filterPrefix = filterItem[1];
    var lowerBound = parseInt(filterItem[2]);
    var upperBound = parseInt(filterItem[3]);

    for (r = 0; r < rangeArray.length; r++) {
        var paramItem = rangeArray[r].split("-");
        var paramPrefix = paramItem[0];
        var paramValue = parseInt(paramItem[1]);

        if (filterPrefix == paramPrefix) {
            if (paramValue < lowerBound || paramValue > upperBound) {
                validRange = false;
                break;
            }
        }
    }
    return validRange;
}

function getRangeArrayFromRowParameters(params) {
    // Helper function to extract range filters only
    var p = [];
    for (i = 0; i < params.length; i++) {
        if (rangeFilterPrefixes.indexOf(getSplitValue(params[i], 0)) > -1) {
            p.push(params[i]);
        }
    }
    return p;
}

function getSplitValue(value, ndx) {
    out = value.split("-");
    return out[ndx];
}


function docReady() {

    // Turn the filters off here, or set "DisplayResultsFilters" to false in the web config
    if (!showFilters) {
        turnOffFilters();
    }

    creatFilterSliders();

    $('#cic-filter-group').hide();

    if ($('#hfHasCiC').val() == "True" || $('#isAdditionalCic').val() == "True") {
        setFiltersForCic();
    }
    else {
        setFiltersForDefault();
    }

    $("#filterDiv div.rating input, #filterDiv div.input-group__item input,#filterDiv div.noUi-handle.noUi-handle-lower, #filterDiv div.noUi-connect").click(function () {
        
        if ($(this).hasClass("star")) {
            var stars = ($(this).val() === "1" ? " Star" : " Stars");
            window.dataLayer.push({ 'event': 'Results_Policy_Defaqto_Rating_Click', 'Results_Policy_Defaqto_Rating_Value': $(this).val() + stars });
        }

        if ($(this).attr("id").indexOf("2-") === 0 && $(this).is(':checked')) {
            var labelText = "";
            $("input[id^='2-']").each(function () {
                if ($(this).is(":checked")) {
                    labelText = (labelText === "" ? $(this).siblings("label").text() : labelText + ', ' + $(this).siblings("label").text());
                }
            });
            window.dataLayer.push({ 'event': 'Results_Policy_Change_Cover_Click', 'Results_Policy_Change_Cover_Value': labelText });
        }

        if ($(this).attr("id").indexOf("4-0") === 0 && $(this).is(':checked')) {
            window.dataLayer.push({ 'event': 'Results_Policy_Terminal_Illness_Click', 'Results_Policy_Terminal_Illness_Value': $(this).siblings("label").text() });
        }
        if ($(this).attr("id").indexOf("1-1") === 0 && $(this).is(':checked')) {
            window.dataLayer.push({ 'event': 'Results_Policy_Free_Cover_Click', 'Results_Policy_Free_Cover_Value': $(this).siblings("label").text() });
        }


        $("#reclacFieldset, .filter-update-dimmer").removeClass("focussed");
        $("#filterDiv fieldset, .filter-update-dimmer").addClass("focussed");
        $(".filter-update-dimmer").removeClass("display-none");
        $("#results-filter-update").removeClass("display-none-non-mobile");
        $("#results-filter-update").removeClass("display-none");
        $("#results-filter-update").show();
        
    });

    // Accordion
    $(".facet-header").click(function () {
        if ($(this).siblings(".facet-panel").is(":visible")) {
            $(this).siblings(".facet-panel").hide();
            $(this).removeClass("expanding-panel__heading--open").addClass("expanding-panel__heading--closed");
        } else {
            $(this).siblings(".facet-panel").show();
            $(this).removeClass("expanding-panel__heading--closed").addClass("expanding-panel__heading--open");
        }
    });

    $("#filterDetail").click(function () {
        $("#filter-mobile").hide();
        $(".filter-bar").show();
    });

    $("#filterClose").click(function () {
        $(".filter-bar").hide();
        $("#filter-mobile").show();
    });

    // Set any initial open or closed filters by editing this function
    setInitialOpenFilters();

    // Any checkbox change causes the filters to be re-run
    $('#filters :checkbox').on('click', function () {
        runResultRowFilters();
    });

    //// Any slider change causes the filters to be re-run 
    conditionsSlider.noUiSlider.on('end', function () {
        runResultRowFilters();
    });

    claimsSlider.noUiSlider.on('end', function () {
        runResultRowFilters();
    });

    // Update the presented min/max slider values
    conditionsSlider.noUiSlider.on('update', function (values, handle) {
        $('#conditions-lower-value').html(values[0]);
        $('#conditions-upper-value').html(values[1]);
    });

    conditionsSlider.noUiSlider.on('change', function () {
        conditionsSliderHasChanged = true;
    })

    claimsSlider.noUiSlider.on('update', function (values, handle) {
        $('#claims-lower-value').html(values[0]);
    });

    claimsSlider.noUiSlider.on('change', function () {
        claimsSliderHasChanged = true;
    })

    $('.star').on('click', function () {
        defaqtoRatingHasChanged = true;
        runResultRowFilters(); 
    })


    // Clear all filters
    //$('#filter-clear').on('click', function () {
    //    clearAndResetFilters();
    //});

    // Clear all filters when CIC button is pressed
    $('#ShowCIC').on('click', function () {
        clearAndResetFilters();
        if ($(this).text() == "remove cover") {
            useCicUrn = true;
            setFiltersForCic();
        }
        else {
            useCicUrn = false;
            setFiltersForDefault();
        }
    })


    // Hide & show the filter sidebar
    $('.collapse-filters').on('click', function () {
        hideFilterBar();
    });

    $('#show-filters-btn').on('click', function () {
        $('.filter-bar').show();
        $(this).hide();
        //$('.faux-results-header__col--provider').removeClass('replace-no-sidebar').addClass('header-with-sidebar')
        //$('#results-container').removeClass('replace-no-sidebar').addClass('with-sidebar')
    })


    
    function setFiltersForCic() {
        reEvaluateSliders();

        // Set first star selected
        $('#df1').prop('checked', true);

        $('#cic-filter-group').show();
    }

    function setFiltersForDefault() {
        conditionsSlider.noUiSlider.updateOptions({
            range: {
                'min': SLIDER_DEFAULT_MIN,
                'max': SLIDER_DEFAULT_MAX
            }
        });

        claimsSlider.noUiSlider.updateOptions({
            range: {
                'min': SLIDER_DEFAULT_MIN,
                'max': SLIDER_DEFAULT_MAX
            }
        });

        // Set first star selected
        $('#df1').prop('checked', true);

        $('#cic-filter-group').hide();
    }

    function turnOffFilters() {
        $('.filter-bar').hide();
    }

    function creatFilterSliders() {

        conditionsSlider = document.getElementById('conditions-slider');
        noUiSlider.create(conditionsSlider, {
            start: [1, 100],
            connect: true,
            step: 1,
            tooltips: true,
            range: {
                'min': SLIDER_DEFAULT_MIN,
                'max': SLIDER_DEFAULT_MAX
            },
            format: {
                to: function (value) {
                    return value.toFixed(0);
                },
                from: function (value) {
                    return value;
                }
            }
        });

        claimsSlider = document.getElementById('claims-slider');
        noUiSlider.create(claimsSlider, {
            start: [1],
            step: 1,
            tooltips: true,
            range: {
                'min': SLIDER_DEFAULT_MIN,
                'max': SLIDER_DEFAULT_MAX
            },
            format: {
                to: function (value) {
                    return value.toFixed(0);
                },
                from: function (value) {
                    return value;
                }
            }
        });
    }

    function getMinMaxFromResultsParams(searchPrefix, p) {

        var store = [];
        var returnValues = [];

        for (i = 0; i < p.length; i++) {
            var rowParameters = p[i];
            var items = rowParameters.split(",");
            for (r = 0; r < items.length; r++) {
                if (getSplitValue(items[r], 0) == searchPrefix) {
                    store.push(getSplitValue(items[r], 1));
                }
            }
        }

        if (store.length > 1) {
            store.sort(function (a, b) { return a - b });
            returnValues.push(store[0]);
            returnValues.push(store[store.length - 1]);
        }
        return returnValues;
    }

    function UpdateSlidersMinMaxValues(p) {
        conditionsMinMax = getMinMaxFromResultsParams(CONDITIONS_PREFEX, p);
        if (conditionsMinMax.length > 0) {
            conditionsSlider.noUiSlider.updateOptions({
                range: {
                    'min': parseInt(conditionsMinMax[0]),
                    'max': parseInt(conditionsMinMax[1])
                }
            });

            claimsMinMax = getMinMaxFromResultsParams(CLAIMS_PREFEX, p);
            claimsSlider.noUiSlider.updateOptions({
                range: {
                    'min': parseInt(claimsMinMax[0]),
                    'max': parseInt(claimsMinMax[1])
                }
            });
        }
    }

    function reEvaluateSliders() {

        // Browser cache the params to prevent bad things happening (race condition?)    
        if (cicMinMaxValues.length < 1) {
            $('.filter-row').each(function () {
                if ($(this).is(':hidden') != true) { // -- dont change this to the more logical "is(';visible')" - it doesn't work in this situation!!!
                    cicMinMaxValues.push($(this).data('filters'));
                }
            });
        }
        UpdateSlidersMinMaxValues(cicMinMaxValues);
    }

    function setInitialOpenFilters() {
        if ($('.filter-bar').css("width") != "220px") {
            setInitialMobileFilterView();
        } else {
            setInitialDesktopFilterView();
        }

    }

    function hideFilterBar() {
        $('#show-filters-btn').show();
        //$('.faux-results-header__col--provider').removeClass('header-with-sidebar').addClass('replace-no-sidebar')
        //$('#results-container').removeClass('with-sidebar').addClass('replace-no-sidebar')
    }

    function setInitialMobileFilterView() {
        $('.facet-header').each(function () {
            $(this).siblings(".facet-panel").hide();
            $(this).removeClass("expanding-panel__heading--open").addClass("expanding-panel__heading--closed");
        });
        $('.filter-bar').hide();
        $('#filter-mobile').show();
    }

    function setInitialDesktopFilterView() {
        $('.facet-header').each(function () {
            if ($(this).siblings(".facet-panel").is(':hidden')) {
                $(this).siblings(".facet-panel").show();
                $(this).removeClass("expanding-panel__heading--closed").addClass("expanding-panel__heading--open");
            }
        });
        $('.filter-bar').show();
        $('#filter-mobile').hide();
    }

    

};
