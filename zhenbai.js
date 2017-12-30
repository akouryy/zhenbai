/*
eslint no-restricted-syntax: ["error",
  "BinaryExpression[operator='in']",
  "ForInStatement",
  "WithStatement",
  "VariableDeclaration[kind='var']",
  "MemberExpression[computed='true']>Identifier.property[name=/^w[ij]$/]",
  "BinaryExpression>Identifier.left[name=/^w[ij]$/]",
  "BinaryExpression>Identifier.right[name=/^w[ij]$/]",
  "AssignmentExpression[operator!='=']>Identifier.left[name=/^w[ij]$/]",
  "AssignmentExpression[operator!='=']>Identifier.right[name=/^w[ij]$/]",
  "UnaryExpression[operator!='+']>Identifier.argument[name=/^w[ij]$/]",
]
*/
'use strict';

(({jQuery, NoCaseError, MInt, yun, settings}) => {
const $ = jQuery;

if(!location.hash) location.hash = `#basic_words`;

const WithTone = yun.frozen(new Map([
  [`a`, [`a`, `ā`, `á`, `ǎ`, `à`]],
  [`i`, [`i`, `ī`, `í`, `ǐ`, `ì`]],
  [`u`, [`u`, `ū`, `ú`, `ǔ`, `ù`]],
  [`e`, [`e`, `ē`, `é`, `ě`, `è`]],
  [`o`, [`o`, `ō`, `ó`, `ǒ`, `ò`]],
  [`v`, [`ü`, `ǖ`, `ǘ`, `ǚ`, `ǜ`]],
]));
const ToneVowelRegexps = yun.frozen([/a/, /[eo]/, /[iuv](?=[^iuv]*$)/]);
const AllowedChars = yun.frozen([`〜`, `～`]);
const FayinClasses = yun.frozen(new Map([
  [`fayin-r`, /[csz]h/],
]));

const HIDE = 0,
      SHOW = 1,
      ANS = 2;
const ShowFormats = yun.frozen([
  [SHOW, HIDE, HIDE],
  [ANS, ANS, ANS],
]);

function ansWord(w) {
  const ans = yun.unfrozen([``, ``, w[2]]),
        ms  = yun.frozen(w[1].scan(/([a-z]+)([0-5])(\/)?/g)),
        MS_BASE = 0,
        MS_TONE = 1,
        MS_SEP = 2;

  let j = 0;
  for(; AllowedChars.includes(w[0][j]); j++) {
    ans[0] += w[0][j];
  }

  ms.length.times(i => {
    const w0    = w[0][j],
          w1    = ms[i][MS_BASE],
          w1Arr = yun.unfrozen(Array.from(w1)),
          tone  = ms[i][MS_TONE],
          slash = ms[i][MS_SEP];

    for(const reg of ToneVowelRegexps) {
      const i = w1.search(reg);
      if(i !== -1) {
        w1Arr[i] = WithTone.get(w1[i])[tone];
        break;
      }
    }

    const classes = `tone-${tone} ` +
                    Array.from(FayinClasses.keys())
                      .filter(k => FayinClasses.get(k).test(w1))
                      .join(` `);

    ans[0] += `<span class="${classes}">${w0}</span>`;

    if(ms.dig(i - 1, MS_TONE) === tone && !ms[i - 1][MS_SEP]) {
      ans[1] += ` `;
    }
    ans[1] += `<span class="${classes}">${w1Arr.join(``)}</span>`;
    if(slash) ans[1] += `/`;

    for(j++; AllowedChars.includes(w[0][j]); j++) {
      ans[0] += w[0][j];
    }
  });
  return yun.frozen(ans);
}

document.write(
  `<script src="cards/${location.hash.substr(1)}.js" charset="utf-8"></script>`
);

$(() => {
  const $body     = $(`body`),
        $w        = ShowFormats[0].length.times(i => $(`#card-w${i}`)),
        $dictLink = $(`#dict-link`),
        words     = yun.unfrozen(window.words), // unfrozen to shuffle
        anss      = yun.unfrozen(words.map(ansWord)); // unfrozen to shuffle
  let wi = new MInt(0, words.length);
  let wj = new MInt(0, ShowFormats.length);

  {
    const fn = b => $body.toggleClass(`r-highlight`, b);
    settings.onChange(`r_highlight`, fn);
    fn();
  }

  function updateViewColor() {
    (5).times(i => {
      $(`.tone-${i}`).css(`color`, settings[`tone${i}_color`]);
    });
  }

  (5).times(i => settings.onChange(`tone${i}_color`, _ => updateViewColor()));

  function updateView() {
    ShowFormats[+wj].length.times(wk => {
      switch(ShowFormats[+wj][wk]) {
      case HIDE:
        $w[wk].text(``);
        break;
      case SHOW:
        $w[wk].text(words[+wi][wk]);
        break;
      case ANS:
        $w[wk].html(anss[+wi][wk]);
        break;
      default:
        throw new NoCaseError(`format`, ShowFormats[+wj][wk]);
      }
      $w[wk].css(`transform`, `scale(${
        Math.min(1, $(window).width() / $w[wk].width())
      })`);
    });
    updateViewColor();
    $dictLink.data(`url`, `https://cjjc.weblio.jp/content/${words[+wi][0]}`);
  }

  updateView();

  function chWord(dwi,
                  {
                    resetPage = settings.pn_word_page === `reset`,
                    view = true,
                  } = {}) {
    wi = wi.add(dwi);
    if(resetPage) wj = new MInt(0, wj.mod);
    if(view) updateView();
  }

  function chWordInitial(dwi) {
    const c = words[+wi][1][0];
    do chWord(dwi, {view: false}); while(words[+wi][1][0] === c);
    updateView();
  }

  function chWordLong(dwi) {
    switch(settings.pn_word_longtap) {
    case `ten`:
      chWord(10 * dwi);
      break;
    case `initial`:
      chWordInitial(dwi);
      break;
    default:
      throw new NoCaseError(`pn_word_longtap`, settings.pn_word_longtap);
    }
  }

  $(`#next-word`).buttonActions({short: _ => chWord(1), long: _ => chWordLong(1)});
  $(`#prev-word`).buttonActions({short: _ => chWord(-1), long: _ => chWordLong(-1)});
  $(`#next-page`).click(() => {
    wj = wj.add(1);
    updateView();
  });

  $(`#shuffle`).click(() => {
    const n = words.length;
    n.times(i => {
      const r = Math.floor(Math.random() * (n - i)) + i;
      [words[i], words[r]] = [words[r], words[i]];
      [anss[i], anss[r]] = [anss[r], anss[i]];
    });
    wi = new MInt(0, wi.mod);
    updateView();
  });

  let autoPlayTimer = null;
  const $autoPlay = $(`#auto-play`);

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    $autoPlay.text(`自動`);
  }

  $autoPlay.click(() => {
    if(autoPlayTimer === null) {
      autoPlayTimer = setInterval(() => {
        chWord(1, {resetPage: false, view: false});
        if(+wi === 0) {
          stopAutoPlay();
          wj = new MInt(0, wj.mod);
        }
        updateView();
      }, 1500);
      $autoPlay.text(`停止`);
    } else {
      stopAutoPlay();
    }
  });

  $dictLink.click(() => {
    window.open($dictLink.data(`url`), `_blank`);
    if(autoPlayTimer !== null) stopAutoPlay();
  });
});
})(window);
