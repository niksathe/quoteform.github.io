(function ($) {
    $(document).ready(function () {
        $("div.extra-questions div.form-row span.fld-lbl").each(function (index, domEle) {
            var wrap;
            if (index === 0) {
                wrap = "<span class=\"leftside leftside" + index.toString() + "\" >";
            }
            else {
                wrap = "</span><span class=\"leftside leftside" + index.toString() + "\" >";
            }
            var txt = domEle.innerHTML;
            txt = txt.split("- ").join("<br/>" + wrap + " - ");
            domEle.innerHTML = txt;
        });
    });
})(jQuery);