/*
eslint no-restricted-syntax: ["error",
  "BinaryExpression[operator='in']",
  "ForInStatement",
  "WithStatement",
  "VariableDeclaration[kind='var']",
  "MemberExpression[computed='true']>Identifier.property[name=/^w[ij]$/]",
]
*/
'use strict';

(({jQuery, NoCaseError, MInt, frozen, unfrozen, settings}) => {
const $ = jQuery;

if(!location.hash) location.hash = `#basic_words`;

const WithTone = frozen(new Map([
  [`a`, [`a`, `ā`, `á`, `ǎ`, `à`]],
  [`i`, [`i`, `ī`, `í`, `ǐ`, `ì`]],
  [`u`, [`u`, `ū`, `ú`, `ǔ`, `ù`]],
  [`e`, [`e`, `ē`, `é`, `ě`, `è`]],
  [`o`, [`o`, `ō`, `ó`, `ǒ`, `ò`]],
  [`v`, [`ü`, `ǖ`, `ǘ`, `ǚ`, `ǜ`]],
]));
const ToneVowelRegexps = frozen([/a/, /[eo]/, /[iuv](?=[^iuv]*$)/]);
const AllowedChars = frozen([`〜`, `～`]);

const HIDE = 0,
      SHOW = 1,
      ANS = 2;
const ShowFormats = frozen([
  [SHOW, HIDE, HIDE],
  [ANS, ANS, ANS],
]);

function ansWord(w) {
  const ans = unfrozen([``, ``, w[2]]),
        ms  = frozen(w[1].scan(/([a-z]+)([0-5])(\/)?/g));
  let j = 0;
  for(; AllowedChars.includes(w[0][j]); j++) {
    ans[0] += w[0][j];
  }

  ms.length.times(i => {
    const w0    = w[0][j],
          w1    = ms[i][0],
          w1Arr = unfrozen(Array.from(w1)),
          tone  = ms[i][1],
          slash = ms[i][2];

    for(const reg of ToneVowelRegexps) {
      const i = w1.search(reg);
      if(i !== -1) {
        w1Arr[i] = WithTone.get(w1[i])[tone];
        break;
      }
    }

    ans[0] += `<span class="tone-${tone}">${w0}</span>`;
    if(i !== 0 && ms[i - 1][1] === tone && !ms[i - 1][2]) {
      ans[1] += ` `;
    }
    ans[1] += `<span class="tone-${tone}">${w1Arr.join(``)}</span>`;
    if(slash) ans[1] += `/`;

    for(j++; AllowedChars.includes(w[0][j]); j++) {
      ans[0] += w[0][j];
    }
  });
  return frozen(ans);
}

document.write(
  `<script src="cards/${location.hash.substr(1)}.js" charset="utf-8"></script>`
);

$(() => {
  const $w        = ShowFormats[0].length.times(i => $(`#card-w${i}`)),
        $dictLink = $(`#dict-link`),
        words     = frozen(window.words),
        anss      = frozen(words.map(ansWord));
  let wi = new MInt(0, words.length);
  let wj = new MInt(0, ShowFormats.length);

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
    (5).times(i => {
      $(`.tone-${i}`).css(`color`, settings[`tone${i}_color`]);
    });
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
