// ==UserScript==
// @name         Filtering to Place
// @namespace    http://example.net/
// @version      0.2
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
        article#filtering { position: fixed; top: 0; right: 0; width: 10rem; z-index: 90000; margin: 0; padding: 0; display: flex; flex-direction: column; font-size: .9rem; }
        article#filtering > button#toggle_form { border-radius: 0; border: 3px double #000; background-color: #fffa; font-weight: bold; }
        article#filtering > div { background-color: #fff; }
        article#filtering label { dislpay: block; padding: .3rem; border:solid #000; border-width: 0 1px; }
        article#filtering label.selected { font-weight: bold; color: #fff; background: #000; }
        article#filtering label.selected::before { content: "＞"; }
        article#filtering label input[type="radio"] { visibility: hidden; }
        article#filtering section { display: flex; flex-direction: column; }
        article#filtering section textarea#pref_filter { height: 40vh; border-radius: 0; border: 1px dashed #000; }
        article#filtering section button { border-radius: 0; border: 1px solid #000; background: #000; color: #fff; }
        article#filtering section button#filtering_reset { background-color: #c00; }
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
    const filterType = new Storage('filterType');

    let cls_disabled = 'filter_disabled';
    let $area = u('<textarea>').attr({id: 'pref_filter', placeholder: '「就業場所」の単語を改行区切りで'});
    let $enter = u('<button>').attr({id: 'filtering_button'}).text('実行').handle('click', function(e) {
        u('table.kyujin').removeClass(cls_disabled);
        let filters = u('#pref_filter').nodes[0].value.split("\n").filter(t => t.length > 0);
        let isWhite = (u('#filtering input[type="radio"][name="fil_type"]:checked').attr('value') == 'white');
        storage.value = filters.join("\n");
        u('table.kyujin').each(function($table) {
            if(filters.length != 0) {
                let $data = u($table).find('tr.kyujin_body table.noborder').first();
                let $title = u($data).find('td[class]').filter(function(n) { return (u(n).text().indexOf('就業場所') != -1); });
                let place = $title.siblings('td:not([class])').text();
                let notFound = (filters.findIndex(t => place.indexOf(t) != -1) != -1);
                // JavaScriptは XOR を短絡で指定できない…
                if((isWhite || notFound) && !(isWhite && notFound)) { u($table).addClass(cls_disabled); }
            }
        });
    });
    let $reset = u('<button>').attr({id: 'filtering_reset'}).text('解除').handle('click', function(e) { u('table.kyujin').removeClass(cls_disabled); });
    let $_select = u('<label>').append(u('<input>').attr({name: 'fil_type', type: 'radio'}));
    $_select.find('input').handle('change', function(e) {
        let $this = u(e.currentTarget);
        let $that = u('#filtering label > input[type="radio"]').filter(function(n) { return (u(n).attr('value') != $this.attr('value')); });
        if($this.nodes[0].checked) {
            $this.closest('label').addClass('selected');
            $that.closest('label').removeClass('selected');
            filterType.value = $this.attr('value');
        } else {
            $this.closest('label').removeClass('selected');
            $that.closest('label').addClass('selected');
            filterType.value = $that.attr('value');
        }
    });
    let $white = $_select.clone().append('含む');
    $white.find('input').attr({value: 'white'});
    let $black = $_select.clone().append('含まない');
    $black.find('input').attr({value: 'black'});
    if(filterType.value == 'black') {
        $black.addClass('selected');
        $black.find('input').nodes[0].checked = true;
    } else {
        $white.addClass('selected');
        $white.find('input').nodes[0].checked = true;
        filterType.value = 'white';
    }

    let $form = u('<div>').append(u('<section>').append($white).append($black).append($area).append($enter).append($reset));
    let $toggle = u('<button>').attr({id: 'toggle_form'}).text('場所フィルター').handle('click', function(e) { u('#filtering > div').toggleClass(cls_disabled); });
    let $div = u('<article>').attr({id: 'filtering'}).append($toggle).append($form);

    let intId;
    intId = setInterval(function() {
        if(u('#filtering').length == 0) {
            u('body').append($div);
            u('#pref_filter').nodes[0].value = storage.value;
        }
    }, 800);

})(u);
