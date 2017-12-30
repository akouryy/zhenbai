'use strict';

(({jQuery, NoCaseError, yun}) => {
const $ = jQuery;

const LSPrefix = `zhenbai_`;
const ColorRegexp = yun.frozen(/^#[0-9a-fA-F]{6}$/);

$(() => {
  $(`#open-settings`).click(_ => $(`body`).addClass(`show-settings`));
  $(`#close-settings`).click(_ => $(`body`).removeClass(`show-settings`));

  $(`#reset_tone_colors`).click(_ => {
    (5).times(i => {
      const k = `tone${i}_color`;
      updateSettings(k, defaults.get(k), {updateForm: true});
    });
  });
});

const defaults = yun.frozen(new Map([
  [`pn_word_longtap`, `ten`],
  [`pn_word_page`, `reset`],
  [`tone0_color`, `#999999`],
  [`tone1_color`, `#ff3333`],
  [`tone2_color`, `#33ff66`],
  [`tone3_color`, `#999900`],
  [`tone4_color`, `#3366ff`],
  [`r_highlight`, false],
]));

if(window.settings === void 0) window.settings = {};
const settings = yun.unfrozen(window.settings);
settings.events = {};

settings.onChange = function onChange(k, f) {
  settings.events[k] = settings.events[k] || [];
  settings.events[k].push(f);
};

function updateSettings(k, v, {updateForm = false} = {}) {
  settings[k] = v;
  localStorage.setItem(LSPrefix + k, v);
  if(updateForm) $(`#` + k).val(v);
  if(settings.events[k]) for(const f of settings.events[k]) f(v);
}

for(const [k, df] of defaults) {
  settings[k] = localStorage.getItem(LSPrefix + k);
  if(!settings[k]) settings[k] = df;

  $(() => {
    const $s = $(`#` + k);
    switch($s.tagName()) {
    case `select`:
      $s.val(settings[k]);
      $s.change(_ => updateSettings(k, $s.val()));
      break;
    case `input`:
      switch($s.attr(`type`)) {
      case `checkbox`:
        if(typeof settings[k] === `string`)
          settings[k] = settings[k] !== `false`;
        $s.prop(`checked`, settings[k]);
        $s.change(_ => {
          updateSettings(k, $s.prop(`checked`));
        });
        break;
      case `color`:
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
        throw new NoCaseError(`type of input`, $s.attr(`type`));
      }
      break;
    default:
      throw new NoCaseError(`tagName`, $s.tagName());
    }
  });
}
})(window);
