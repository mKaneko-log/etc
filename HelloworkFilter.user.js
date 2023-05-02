// ==UserScript==
// @name         Filtering to Place
// @namespace    http://example.net/
// @version      0.1
// @description  ハローワーク求人の「就業場所」でフィルタリング
// @author       ---
// @match        https://www.hellowork.mhlw.go.jp/kensaku/*
// @require      https://cdn.jsdelivr.net/npm/umbrellajs/umbrella.min.js
// @grant        GM_addElement
// ==/UserScript==

(function(u) {
    'use strict';

    // Your code here...
    GM_addElement(document.getElementsByTagName('head')[0], 'style', {textContent: `
        article#filtering { position: fixed; top: 0; right: 0; width: 8rem; z-index: 90000; margin: 0; padding: 0; display: flex; flex-direction: column; font-size: .9rem; }
        article#filtering > button#toggle_form { border-radius: 0; border: 1px solid #000; }
        article#filtering > div { background-color: #fffa; }
        article#filtering section { display: flex; flex-direction: column; }
        article#filtering section textarea#pref_filter { height: 50vh; border-radius: 0; border: 1px dashed #000; }
        article#filtering section button { border-radius: 0; border: 1px solid #000; background: #000; color: #fff; }
        .nowLoading { overflow: hidden; }
        .filter_disabled { display: none; }
    `});
    
    class Storage {
        #_key = 'hoge';
        #_value = '';
        get key() { return this.#_key; }
        get value() { return this.#_value; }
        set value(v) {
            this.#_value = v;
            sessionStorage.setItem(this.key, v);
        }
        constructor(key) {
            if(key.length != 0) { this.#_key = key; }
            this.value = sessionStorage.getItem(this.key) ?? '';
        }
    }
    const storage = new Storage('prefFilter');
    
    let cls_disabled = 'filter_disabled';
    let $area = u('<textarea>').attr({id: 'pref_filter', placeholder: '残したい「就業場所」の単語を改行区切りで'});
    let $enter = u('<button>').attr({id: 'filtering_button'}).text('実行').handle('click', function(e) {
        let filters = u('#pref_filter').nodes[0].value.split("\n").filter(t => t.length > 0);
        storage.value = filters.join("\n");
        u('table.kyujin').removeClass(cls_disabled).each(function($table) {
            if(filters.length != 0) {
                let $data = u($table).find('tr.kyujin_body table.noborder').first();
                let $title = u($data).find('td[class]').filter(function(n) { return (u(n).text().indexOf('就業場所') != -1); });
                let place = $title.siblings('td:not([class])').text();
                if(filters.findIndex(t => place.indexOf(t) != -1) == -1) { u($table).addClass(cls_disabled); }
            }
        });
    });
    let $form = u('<div>').append(u('<section>').append($area).append($enter));
    let $toggle = u('<button>').attr({id: 'toggle_form'}).text('フィルター').handle('click', function(e) { u('#filtering > div').toggleClass(cls_disabled); });
    let $div = u('<article>').attr({id: 'filtering'}).append($toggle).append($form);
    
    let intId;
    intId = setInterval(function() {
        if(u('#filtering').length == 0) {
            u('body').append($div);
            u('#pref_filter').nodes[0].value = storage.value;
        }
    }, 800);
    
})(u);
