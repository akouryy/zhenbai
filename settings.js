'use strict';

const LSPrefix = 'zhenbai_';

(() => {
    const $ = window.jQuery;

    $(() => {
        $('#open-settings').click(() => $('body').addClass('show-settings'));
        $('#close-settings').click(() => $('body').removeClass('show-settings'));
    });

    const defaults = {
        prev_next_word_longtap: 'ten',
        prev_next_word_page: 'reset',
    };

    if(window.settings === void 0) window.settings = {};
    const settings = window.settings;

    function updateSettings(k, v) {
        settings[k] = v;
        localStorage.setItem(LSPrefix + k, v);
    }

    for(const k in defaults) if({}.hasOwnProperty.call(defaults, k)) {
        settings[k] = localStorage.getItem(LSPrefix + k);
        if(!settings[k]) settings[k] = defaults[k];

        $(() => {
            const $s = $('#' + k);
            $s.val(settings[k]);
            $s.change(_ => updateSettings(k, $s.val()));
        });
    }
})();
