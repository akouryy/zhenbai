if(!location.hash) location.hash = "#basic_words";

const WithTone = {
    a: ['a', 'ā', 'á', 'ǎ', 'à'],
    i: ['i', 'ī', 'í', 'ǐ', 'ì'],
    u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
    e: ['e', 'ē', 'é', 'ě', 'è'],
    o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
    v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
}

function ansWord(w) {
    let ans = ["", ""];
    const ms = w[1].match(/[a-z]+[0-5]/g);
    for(let i = 0; i < ms.length; i++) {
        const w0 = w[0][i], w1 = Array.from(ms[i]);
        const tone = w1.pop();

        let toneAdded = false;
        for(const vw of 'aeo') {
            const i = w1.indexOf(vw);
            if(i != -1) {
                w1[i] = WithTone[vw][tone];
                toneAdded = true;
                break;
            }
        }
        if(!toneAdded) {
            const vws = Array.from('iuv')
            const is = vws.map(vw => w1.indexOf(vw));
            const i = Math.max(...is);
            const vw = vws[is.indexOf(i)];
            w1[i] = WithTone[vw][tone];
        }

        ans[0] += `<span class="tone-${tone}">${w0}</span>`
        ans[1] += `<span class="tone-${tone}">${w1.join('')}</span>`
    }
    ans[1] = ans[0] + '<br/>' + ans[1]
    return ans;
}

document.write(`<script src="cards/${location.hash.substr(1)}.js"></script>`);
jQuery($ => {
    const $cardArea = $('#card-area');
    const words = window.words;
    let wi = 0, wj = 0;

    function updateView() {
        let word = words[wi];
        if(wj != 0) word = ansWord(word);
        $cardArea.html(word[wj]);
    }

    updateView();

    $('#next-word').click(() => {
        wi++;
        if(wi == words.length) wi = 0;
        wj = 0;
        updateView();
    })
    $('#prev-word').click(() => {
        wi--;
        if(wi == -1) wi = words.length - 1;
        wj = 0;
        updateView();
    })
    $('#next-page').click(() => {
        wj++;
        if(wj == words[wi].length) wj = 0;
        updateView();
    })
});
