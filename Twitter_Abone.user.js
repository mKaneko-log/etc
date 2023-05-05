// ==UserScript==
// @name         Twitter Abone
// @namespace    http://example.net/
// @version      0.1
// @description  Twitterの本文を単語で非表示
// @author       ---
// @match        https://twitter.com/*
// @grant        GM_addElement
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.4.slim.min.js
// ==/UserScript==

(function($) {
    'use strict';

    /** 試験的に導入されたメソッドを使ってみる */
    GM_addElement(document.getElementsByTagName('head')[0], 'style', {
        textContent: `
            button.do-ng{ cursor:pointer; background:#f00; color:#fff; margin-left:1em; }
            .ng-abone{ display:none; }
            #ng_modal{ z-index:1024; position:fixed; top:0; left:10%; }
            #ng_modal button{ cursor:pointer; }
            #ng_modal form{ z-index:2048; position:sticky; background:#fff; border:3px solid #000; width:15rem; height:20rem; }
            #ng_modal form.ng_hidden{ display:none; }
            #ng_modal form > textarea{ display:inline-block; width:90%; height:12rem; }
            #ng_modal form > button{ display:block; width:50%; margin:1rem auto 0; }
        `
    });

    /** あぼーん設定の GM_***Value() を管理したい */
    class NGValues {
        #_key;
        #_values;
        #saveArray(str) { this.#_values = str.split("\n").filter(t => t.length > 0); }
        constructor(key) {
            this.#_key = key || 'hoge';
            this.#_values = [];
            let val = GM_getValue(key, '');
            if(0 < val.length) { this.#saveArray(val); }
        }
        #toString() { return this.#_values.join("\n"); }
        #saveStorage() { GM_setValue(this.#_key, this.#toString()); }
        get getAll() { return this.#_values; }
        get getAllString() { return this.#toString(); }
        setValues(value) {
            /** @param {String} value 保存するデータの文字列 */
            this.#saveArray(value);
            this.#saveStorage();
        }
    }

    //const ngUser = new NGValues('NGuserScreenName');
    GM_setValue('NGuserScreenName', null);
    const ngWord = new NGValues('TweetAbone_word');

    /** 設定モーダル？ */
    let hide_class = 'ng_hidden';
    var $modalBody = $('<div>').attr('id', 'ng_modal');
    var $modalForm = $('<form>').attr('method', 'GET').addClass(hide_class);
    var $modalFormLabel = $('<label>').attr('for', 'ngwords').text('単語');
    var $modalFormText = $('<textarea>').attr('id', 'ngwords').val(ngWord.getAllString);
    var $modalFormSubmit = $('<button>').attr('type', 'submit').text('保存');
    var $modalOpen = $('<button>').attr('type', 'button').text('設定ダイアログ');
    // ---
    $modalForm.append($modalFormLabel).append($modalFormText).append($modalFormSubmit);
    $modalBody.append($modalOpen).append($modalForm);
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        ngWord.setValues($(this).children('textarea').first().val());
        $(this).addClass(hide_class);
    });
    $modalOpen.on('click', function(e) {
        e.preventDefault();
        $(this).closest('#ng_modal').children('form').toggleClass(hide_class);
    });
    $('body').first().append($modalBody);

    var fn = function() {
        let nglist = ngWord.getAll;
        //console.log(nglist);
        let $tweets = $('article[data-testid="tweet"]');
        $.each($tweets, function(k, tw) {
            //console.log(tw);
            let $el = $(tw).find('div[data-testid="tweetText"]').filter(function() {
                let txt = $(this).text();
                return (ngWord.getAll.findIndex(v => txt.indexOf(v) != -1) != -1);
            });
            //console.log($el);
            $.each($el, function(k,tw) {
                let abClass = 'ng-abone';
                let $parent = $(tw).closest('[aria-labelledby]');
                //console.log(name +': '+ nglist.indexOf(name).toString());
                let hasWord = (ngWord.getAll.findIndex(v => $(tw).text().indexOf(v) != -1) != -1);
                if(hasWord) {
                    $parent.addClass(abClass);
                }
                if(!hasWord && $parent.hasClass(abClass)) {
                    $parent.removeClass(abClass);
                }
            });
        });
        //console.log('---');
    };
    var int_id;
    int_id = setInterval(fn, 800);

})(jQuery);