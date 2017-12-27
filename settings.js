'use strict';

const LSPrefix = 'zhenbai_';

(() => {
    const $ = window.jQuery;

    const ColorRegexp = /^#[0-9a-fA-F]{6}$/;

    $(() => {
        $('#open-settings').click(() => $('body').addClass('show-settings'));
        $('#close-settings').click(() => $('body').removeClass('show-settings'));

        $('#reset_tone_colors').click(() => (5).times(i => {
            const k = `tone${i}_color`;
            updateSettings(k, defaults[k], {updateForm: true});
        }));
    });

    const defaults = {
        prev_next_word_longtap: 'ten',
        prev_next_word_page: 'reset',
        tone0_color: '#999999',
        tone1_color: '#ff3333',
        tone2_color: '#33ff66',
        tone3_color: '#999900',
        tone4_color: '#3366ff',
    };

    if(window.settings === void 0) window.settings = {};
    const settings = window.settings;

    function updateSettings(k, v, {updateForm = false} = {}) {
        settings[k] = v;
        localStorage.setItem(LSPrefix + k, v);
        if(updateForm) $('#' + k).val(v);
    }

    for(const k in defaults) if({}.hasOwnProperty.call(defaults, k)) {
        settings[k] = localStorage.getItem(LSPrefix + k);
        if(!settings[k]) settings[k] = defaults[k];

        $(() => {
            const $s = $('#' + k);
            switch($s.tagName()) {
            case 'select':
                $s.val(settings[k]);
                $s.change(_ => updateSettings(k, $s.val()));
                break;
            case 'input':
                switch($s.attr('type')) {
                case 'color':
                    if(!ColorRegexp.test(settings[k])) {
                        throw new Error(`Invalid settings: ${k}: ${settings[k]}`);
                    }
                    $s.val(settings[k]);
                    $s.change(_ => {
                        if(!ColorRegexp.test($s.val())) {
                            throw new Error(`Invalid settings: ${k}: ${$s.val()}`);
                        }
                        updateSettings(k, $s.val());
                    });
                    break;
                default:
                    throw new Error(`Invalid input[type]: ${$s.attr('type')}`);
                }
                break;
            default:
                throw new Error(`Invalid tagname: ${$s.tagName()}`);
            }
        });
    }
})();
