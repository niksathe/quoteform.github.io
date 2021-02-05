

$('document').ready(function () {

    SetUpDummyCookies();
    if (getConsentCookieValue() === "false") {
        deleteCookie();
    }

    function deleteCookie() {
        var ec = "ASP.NET_SessionId|SessionCamTestCookie|__RequestVerificationToken|ASPSESSIONIDQEQAARSC|CookieConsent";
        var allCookies = getCookiesArray();
        for (var thisCookie in allCookies) {
            if (ec.toLowerCase().indexOf(thisCookie.toLowerCase()) === -1) {
                document.cookie = thisCookie + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = thisCookie + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;domain=.directlife.co.uk;";
                document.cookie = thisCookie + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;domain=.confused.com;";
            }
        }
    }
    function getCookiesArray() {
        var allCookies = {};
        if (document.cookie && document.cookie != '') {
            var split = document.cookie.split(';');
            for (var i = 0; i < split.length; i++) {
                var nameValue = split[i].split("=");
                nameValue[0] = nameValue[0].replace(/^ /, '');
                allCookies[decodeURIComponent(nameValue[0])] = decodeURIComponent(nameValue[1]);
            }
        }
        return allCookies;
    }
});

function getCookieValue(cookieName) {
    var name = cookieName + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}

function getConsentCookieValue() {
    var value = getCookieValue("CookieConsent");
    if (value == undefined) {
        return 'true';
    }
    return value;
}


function getURNValue() {

    var urn = "";

    if ($("#DURN").length > 0) {
        urn = $("#DURN").val();
    }

    return urn;
}


function SetUpDummyCookies() {

    //createDummyNewCookie("test21", "1");
    //createDummyConfusedConsentCookie();

}
function createDummyConfusedConsentCookie() {
    var now = new Date();
    now.setDate(now.getDate() + 10000);
    var expires = "expires=" + now.toUTCString();
    document.cookie = "CookieConsent=false;" + expires;
}

function createDummyNewCookie(cookieName, value) {
    var d = new Date();
    d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cookieName + "=" + value + ";" + expires;
}
