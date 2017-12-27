'use strict';
(({jQuery, NoCaseError, frozen, unfrozen, settings}) => {
const $ = jQuery;

if(!location.hash) location.hash = "#basic_words";

const WithTone = frozen(new Map([
  ['a', ['a', 'ā', 'á', 'ǎ', 'à']],
  ['i', ['i', 'ī', 'í', 'ǐ', 'ì']],
  ['u', ['u', 'ū', 'ú', 'ǔ', 'ù']],
  ['e', ['e', 'ē', 'é', 'ě', 'è']],
  ['o', ['o', 'ō', 'ó', 'ǒ', 'ò']],
  ['v', ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']],
]));
const AllowedChars = frozen(['〜', '～']);

const HIDE = 0, SHOW = 1, ANS = 2;
const ShowFormats = frozen([
  [SHOW, HIDE, HIDE],
  [ANS, ANS, ANS],
]);

function ansWord(w) {
  const ans = unfrozen(["", "", w[2]]),
        ms  = frozen(w[1].scan(/([a-z]+)([0-5])(\/)?/g));
  let j = 0;
  for(; AllowedChars.includes(w[0][j]); j++) {
    ans[0] += w[0][j];
  }

  ms.length.times(i => {
    const w0    = w[0][j],
          w1    = unfrozen(Array.from(ms[i][0])),
          tone  = ms[i][1],
          slash = ms[i][2];

    let toneAdded = false;
    for(const vw of 'aeo') {
      const i = w1.indexOf(vw);
      if(i !== -1) {
        w1[i] = WithTone.get(vw)[tone];
        toneAdded = true;
        break;
      }
    }
    if(!toneAdded) {
      const vws = frozen(Array.from('iuv')),
            is  = frozen(vws.map(vw => w1.indexOf(vw))),
            i   = Math.max(...is),
            vw  = vws[is.indexOf(i)];
      w1[i] = WithTone.get(vw)[tone];
    }

    ans[0] += `<span class="tone-${tone}">${w0}</span>`;
    if(i !== 0 && ms[i-1][1] === tone && !ms[i-1][2]) {
      ans[1] += ' ';
    }
    ans[1] += `<span class="tone-${tone}">${w1.join('')}</span>`;
    if(slash) ans[1] += '/';

    for(j++; AllowedChars.includes(w[0][j]); j++) {
      ans[0] += w[0][j];
    }
  });
  return frozen(ans);
}

document.write(
  `<script src="cards/${location.hash.substr(1)}.js" charset="utf-8"></script>`
);

function buttonActions($b, {short, long, threshold = 1000}) {
  let touching = false, long_touch = false;
  $b.on({
    'touchstart mousedown': e => {
      if(!touching) {
        touching = true;
        long_touch = false;
        $b.longTimeout = setTimeout(() => {
          long_touch = true;
          long();
        }, threshold);
      }
      e.preventDefault();
    },
    'touchend mouseup mouseout': e => {
      if(touching && !long_touch) short();
      touching = false;
      clearInterval($b.longTimeout);
      e.preventDefault();
    },
  });
}

$(() => {
  const $w        = ShowFormats[0].length.times(i => $(`#card-w${i}`)),
        $dictLink = $('#dict-link'),
        words     = frozen(window.words),
        anss      = frozen(words.map(ansWord));
  let wi = 0, wj = 0;

  function updateView() {
    ShowFormats[wj].length.times(wk => {
      switch(ShowFormats[wj][wk]) {
      case HIDE:
        $w[wk].text("");
        break;
      case SHOW:
        $w[wk].text(words[wi][wk]);
        break;
      case ANS:
        $w[wk].html(anss[wi][wk]);
        break;
      default:
        throw new NoCaseError('format', ShowFormats[wj][wk]);
      }
      $w[wk].css('transform', `scale(${
        Math.min(1, $(window).width() / $w[wk].width())
      })`);
    });
    (5).times(i => {
      $(`.tone-${i}`).css('color', settings[`tone${i}_color`]);
    });
    $dictLink.data('url', `https://cjjc.weblio.jp/content/${words[wi][0]}`);
  }

  updateView();

  function chWord(dwi,
                  {
                    resetPage = settings.pn_word_page === 'reset',
                    view = true,
                  } = {}) {
    wi = (wi + dwi) % words.length;
    if(wi < 0) wi += words.length;
    if(resetPage) wj = 0;
    if(view) updateView();
  }
  function chWordInitial(dwi) {
    const c = words[wi][1][0];
    do chWord(dwi, {view: false}); while(words[wi][1][0] === c);
    updateView();
  }
  function chWordLong(dwi) {
    switch(settings.pn_word_longtap) {
    case 'ten':
      chWord(10 * dwi);
      break;
    case 'initial':
      chWordInitial(dwi);
      break;
    default:
      throw new NoCaseError('pn_word_longtap', settings.pn_word_longtap);
    }
  }

  buttonActions($('#next-word'), {short: _ => chWord(1), long: _ => chWordLong(1)});
  buttonActions($('#prev-word'), {short: _ => chWord(-1), long: _ => chWordLong(-1)});
  $('#next-page').click(() => {
    wj++;
    if(wj === ShowFormats.length) wj = 0;
    updateView();
  });

  $('#shuffle').click(() => {
    const n = words.length;
    n.times(i => {
      const r = Math.floor(Math.random() * (n - i)) + i;
      [words[i], words[r]] = [words[r], words[i]];
      [anss[i], anss[r]] = [anss[r], anss[i]];
    });
    wi = 0;
    updateView();
  });

  let autoPlayTimer = null;
  const $autoPlay = $('#auto-play');

  function stopAutoPlay() {
    clearInterval(autoPlayTimer);
    autoPlayTimer = null;
    $autoPlay.text("自動");
  }

  $autoPlay.click(() => {
    if(autoPlayTimer === null) {
      autoPlayTimer = setInterval(() => {
        chWord(1, {resetPage: false, view: false});
        if(wi === 0) {
          stopAutoPlay();
          wj = 0;
        }
        updateView();
      }, 1500);
      $autoPlay.text("停止");
    } else {
      stopAutoPlay();
    }
  });

  $dictLink.click(() => {
    window.open($dictLink.data('url'), '_blank');
    if(autoPlayTimer !== null) stopAutoPlay();
  });
});
})(window);
