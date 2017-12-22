/* global jQuery:false */
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

const HIDE = 0, SHOW = 1, ANS = 2;
const ShowFormats = [
    [SHOW, HIDE],
    [ANS, ANS],
];

function ansWord(w) {
    let ans = ["", ""];
    const ms = w[1].scan(/([a-z]+)([0-5])(\/)?/g);
    ms.length.times(i => {
        const w0 = w[0][i], w1 = Array.from(ms[i][0]),
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
    });
    return ans;
}

document.write(`<script src="cards/${location.hash.substr(1)}.js"></script>`);
jQuery($ => {
    const $w = ShowFormats[0].length.times(i => $(`#card-w${i}`));
    const $dictLink = $('#dict-link');
    const words = window.words;
    const anss = words.map(ansWord);
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
                throw new Error(`unreachable case: ${ShowFormats[wj][wk]}`);
            }
            $w[wk].css('transform', `scale(${
                Math.min(1, $(window).width() / $w[wk].width())
            })`);
        });
        $dictLink.data('url', `https://cjjc.weblio.jp/content/${words[wi][0]}`);
    }

    updateView();

    $('#next-word').click(() => {
        wi++;
        if(wi === words.length) wi = 0;
        wj = 0;
        updateView();
    });
    $('#prev-word').click(() => {
        wi--;
        if(wi === -1) wi = words.length - 1;
        wj = 0;
        updateView();
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
                wi++;
                if(wi === words.length) {
                    wi = wj = 0;
                    clearInterval(autoPlayTimer);
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
