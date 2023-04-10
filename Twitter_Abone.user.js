// ==UserScript==
// @name         Twitter Abone
// @namespace    http://example.net/
// @version      0.1
// @description  Twitterの「@～」部分を入れると非表示
// @author       ---
// @match        https://twitter.com/search?q=*
// @grant        GM_addElement
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.4.slim.min.js
// ==/UserScript==

(function() {
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
        #saveArray(str) { this.#_values = str.split("\n"); }
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

    const ngUser = new NGValues('NGuserScreenName');

    /** 設定モーダル？ */
    let hide_class = 'ng_hidden';
    var $modalBody = $('<div>').attr('id', 'ng_modal');
    var $modalForm = $('<form>').attr('method', 'GET').addClass(hide_class);
    var $modalFormLabel = $('<label>').attr('for', 'ngusers').text('ID（スクリーンネーム）');
    var $modalFormText = $('<textarea>').attr('id', 'ngusers').val(ngUser.getAllString);
    var $modalFormSubmit = $('<button>').attr('type', 'submit').text('保存');
    var $modalOpen = $('<button>').attr('type', 'button').text('設定ダイアログ');
    // ---
    $modalForm.append($modalFormLabel).append($modalFormText).append($modalFormSubmit);
    $modalBody.append($modalOpen).append($modalForm);
    $modalForm.on('submit', function(e) {
        e.preventDefault();
        ngUser.setValues($(this).children('textarea').first().val());
        $(this).addClass(hide_class);
    });
    $modalOpen.on('click', function(e) {
        e.preventDefault();
        $(this).closest('#ng_modal').children('form').toggleClass(hide_class);
    });
    $('body').first().append($modalBody);

    const r = /^@\w+$/;
    var fn = function() {
        let nglist = ngUser.getAll;
        //console.log(nglist);
        let $tweets = $('article[data-testid="tweet"]');
        $.each($tweets, function(k, tw) {
            //console.log(tw);
            let $el = $(tw).find('div[data-testid="User-Name"] span').filter(function() {
                return r.test($(this).text().trim());
            });
            //console.log($el);
            $.each($el, function(k,tw) {
                let abClass = 'ng-abone';
                let name = $(tw).text().replace('@', '');
                let $parent = $(tw).closest('[aria-labelledby]');
                //console.log(name +': '+ nglist.indexOf(name).toString());
                if(0 <= nglist.indexOf(name)) {
                    $parent.addClass(abClass);
                }
                if(nglist.indexOf(name) < 0 && $parent.hasClass(abClass)) {
                    $parent.removeClass(abClass);
                }
            });
        });
        //console.log('---');
    };
    var int_id;
    int_id = setInterval(fn, 800);

})();