// ==UserScript==
// @name         Tag list
// @namespace    https://github.com/SOTagBurners/Userscripts
// @downloadURL  https://github.com/SOTagBurners/Userscripts/raw/master/TagList.user.js
// @author       Will Sullivan (Will)
// @developer    David Bingham (Mogsdad)
// @maintainer   SOTagBurners
// @version      1.3.1
// @grant        none
// @description  Adds an expandable list containing a link to every question on the current tag page.  Useful when you want to open many questions with the same tag at the same time.
// @include      /^https?:\/\/(?:meta.)?(?:stackoverflow|stackexchange|serverfault|superuser|askubuntu|stackapps)\.com(?:\/(?:\?|questions(?:$|\/tagged|\?)|search|unanswered).*)?$/
// https://regex101.com/r/1D5jof/3
// ==/UserScript==

var runTagList = tagList();
var wannaReSort = false;  // Set to true to sort closed items to top

$(document).ajaxComplete(tagList);

function tagList() {
    // If list already present, quit.
    if ($('.linkylist').length) return;

    var App = {};

    userscriptCSS();

    // Locate the element containing list of posts.
    App.linkytarget = $('.s-post-summary').parent();


    // Note: this is broken. Thank you SE for continuing to break all the nice things
    if (wannaReSort) {
      // re-sort list; move all the already handled cruff to the top
      $.each(["closed", "on hold", "migrated", "duplicate"], function(index) {
          App.items = $('.question-summary .summary:contains(' + this + ')');
          App.items.closest('.question-summary').detach().insertBefore($('.question-summary').first());
      });
    }
  
    // Bail out if we don't have 5+ posts. (reviews have 1 or 2, but 5 is a nice number)
    if( $(App.linkytarget).children().length <= 5 ) return;

    // get all the hrefs
    App.root = App.linkytarget;
    // This is currently only compatible with search; we can¨t hijack every s-link because not all of them lead to questions.
    // However, as far as I know, this only leaves tag pages broken
    App.hrefs = App.root.find('.s-link[data-searchsession^="/"],.answer-hyperlink');  // SE doesn't let us have nice things
    if (App.hrefs.length === 0) {
        console.log("No post hyperlinks found");
        return;
    }

    App.listroot = $('<div class="linkylist"/>');
    App.listhead = $('<p class="linkyhead">Click here to <span id="linkyaction">open</span> a list of all links on this page</p>');
    App.listbody = $('<div class="linkybody"/>');
    App.linkytarget.before(App.listroot);
    App.listroot.prepend(App.listbody);
    App.listroot.prepend(App.listhead);
    App.listbody.hide();
    App.listhead.click(function() {
        App.listbody.slideToggle(600);
        $('#linkyaction').text(function (index, text) {
           return (text == 'open' ? 'close' : 'open');
        });
    });
    // note that when you click a link it gets removed from the list.
    App.hrefs.each(function() {
        App.parent = $('<span class="linkeyspan"/>');
        App.linkey = $(this).clone().attr('target', '_blank');
        App.linkey.click(function() {
            $(this).closest('.linkeyspan').remove();
        });
        App.parent.prepend(App.linkey);
        App.parent.prepend($('<br/>'));
        App.listbody.append(App.parent);
    });

    /**
     * Define "CSS" for this user script
     */
    function userscriptCSS() {
        addCss(
            '.linkylist {margin: 0px;padding: 0px;}' +
            '.linkyhead {text-align: right;padding: 5px 10px;cursor: pointer;position: relative;background-color:#FFCCCC;margin:1px;}' +
            '.linkybody {padding: 5px 10px 15px;background-color:#F4F4F8;}'
        );
    }

    /**
     * Stuff string of styles into doc head.
     */
    function addCss(cssString) {
        var head = document.getElementsByTagName('head')[0];
        if (!head) return;
        var newCss = document.createElement('style');
        newCss.type = "text/css";
        newCss.innerHTML = cssString;
        head.appendChild(newCss);
    }
}
