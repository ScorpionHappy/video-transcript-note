// LICENSE : MIT
"use strict";
import {translateWord} from "./en-ja-translator";
function isEmptyText(text) {
    return /^\s*$/.test(text);
}
/**
 * if check node can ruby?
 * @param {Node} node textNode
 * @returns {boolean}
 */
function canTranslateNode(node) {
    var nameReg = /^(#text|PRE|CODE|SPAN|A|RUBY|RT)$/;
    var text = node.textContent;
    if (isEmptyText(text)) {
        return false;
    }
    var parentNodeName = node.parentNode.nodeName;
    if (nameReg.test(parentNodeName)) {
        return false;
    }
    if (text.length <= 2) {
        return false;
    }
    return true;
}
export function rubyTranslate(text) {
    var speRegExp = /([\s,.;:=@#<>\[\]{}()`'"!\/])/g;
    var fragment = document.createDocumentFragment();
    var match, last_idx = 0;
    while (match = speRegExp.exec(text)) {
        var matchSeparator = match[0];
        var word = text.slice(last_idx, speRegExp.lastIndex - matchSeparator.length);
        last_idx = speRegExp.lastIndex;
        if (word.length === 0) {
            fragment.appendChild(document.createTextNode(matchSeparator));
            continue;
        }
        if (isEmptyText(word)) {
            fragment.appendChild(document.createTextNode(word));
            continue;
        }
        if (word.length > 4) {
            var jaWords = translateWord(word);
            if (jaWords && jaWords.length > 0) {
                fragment.appendChild(wrapRuby(word, jaWords[0]));
            } else {
                fragment.appendChild(wrapNonRuby(word));
            }
        } else {
            fragment.appendChild(wrapNonRuby(word));
        }
        fragment.appendChild(document.createTextNode(matchSeparator));
    }
    var lastWord = text.slice(last_idx);
    fragment.appendChild(wrapNonRuby(lastWord));
    return fragment;
}
function wrapNonRuby(text) {
    var span = document.createElement("span");
    span.className = "non-ruby-translator";
    span.appendChild(document.createTextNode(text));
    return span;
}
function wrapRuby(text, annotation) {
    var span = document.createElement("span");
    span.className = "ruby-translator";
    var ruby = document.createElement("ruby");
    var rt = document.createElement("rt");
    rt.appendChild(document.createTextNode(annotation));
    ruby.appendChild(document.createTextNode(text));
    ruby.appendChild(rt);
    span.appendChild(ruby);
    return span;
}