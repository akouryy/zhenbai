'use strict';

if(!location.hash) location.hash = "#basic_words";

const WithTone = {
    a: ['a', 'ā', 'á', 'ǎ', 'à'],
    i: ['i', 'ī', 'í', 'ǐ', 'ì'],
    u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
    e: ['e', 'ē', 'é', 'ě', 'è'],
    o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
    v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
};

const $ = window.jQuery;

const HIDE = 0, SHOW = 1, ANS = 2;
const ShowFormats = [
    [SHOW, HIDE, HIDE],
    [ANS, ANS, ANS],
];

function ansWord(w) {
    let ans = ["", "", w[2]];
    const ms = w[1].scan(/([a-z]+)([0-5])(\/)?/g);
    let j = 0;
    ms.length.times(i => {
        const w0 = w[0][j], w1 = Array.from(ms[i][0]),
            tone = ms[i][1], slash = ms[i][2];

        let toneAdded = false;
        for(const vw of 'aeo') {
            const i = w1.indexOf(vw);
            if(i !== -1) {
                w1[i] = WithTone[vw][tone];
                toneAdded = true;
                break;
            }
        }
        if(!toneAdded) {
            const vws = Array.from('iuv');
            const is = vws.map(vw => w1.indexOf(vw));
            const i = Math.max(...is);
            const vw = vws[is.indexOf(i)];
            w1[i] = WithTone[vw][tone];
        }

        ans[0] += `<span class="tone-${tone}">${w0}</span>`;
        if(i !== 0 && ms[i-1][1] === tone && !ms[i-1][2]) {
            ans[1] += ' ';
        }
        ans[1] += `<span class="tone-${tone}">${w1.join('')}</span>`;
        if(slash) ans[1] += '/';

        for(j++; ['〜', '～'].includes(w[0][j]); j++) {
            ans[0] += w[0][j];
        }
    });
    return ans;
}

document.write(`
    <script src="cards/${location.hash.substr(1)}.js" charset="utf-8"></script>
`);

function buttonActions($b, short, long, threshold = 1000) {
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
        }
    });
}

$(() => {
    const $w = ShowFormats[0].length.times(i => $(`#card-w${i}`));
    const $dictLink = $('#dict-link');
    const settings = window.settings;
    const words = window.words;
    const anss = words.map(ansWord);
    let wi = 0, wj = 0;

    function changeWord(dwi, resetWj = true, view = true) {
        wi = (wi + dwi) % words.length;
        if(wi < 0) wi += words.length;
        if(resetWj && settings.prev_next_word_page === 'reset') wj = 0;
        if(view) updateView();
    }
    function changeWordInitial(dwi) {
        const c = words[wi][1][0];
        do { changeWord(dwi, true, false); } while(words[wi][1][0] === c);
        updateView();
    }

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
                throw new Error(`unreachable case: ${ShowFormats[wj][wk]}`);
            }
            $w[wk].css('transform', `scale(${
                Math.min(1, $(window).width() / $w[wk].width())
            })`);
        });
        $dictLink.data('url', `https://cjjc.weblio.jp/content/${words[wi][0]}`);
    }

    updateView();

    buttonActions($('#next-word'), _ => changeWord(1), _ => {
        switch(settings.prev_next_word_longtap) {
        case 'ten':
            changeWord(10);
            break;
        case 'initial':
            changeWordInitial(1);
            break;
        default:
            throw new Error(`unreachable case: ${settings.prev_next_word_longtap}`);
        }
    });
    buttonActions($('#prev-word'), _ => changeWord(-1), _ => {
        switch(settings.prev_next_word_longtap) {
        case 'ten':
            changeWord(-10);
            break;
        case 'initial':
            changeWordInitial(-1);
            break;
        default:
            throw new Error(`unreachable case: ${settings.prev_next_word_longtap}`);
        }
    });
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
                changeWord(1, false, false);
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
