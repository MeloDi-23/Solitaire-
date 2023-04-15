type Suits = '红桃'|'梅花'|'方片'|'黑桃'
type Num = 'A'|2|3|4|5|6|7|8|9|10|'J'|'Q'|'K';
class Card {
    suit: Suits
    number: Num
    constructor(_suit: Suits, _number: Num) {
        this.suit = _suit;
        this.number = _number;
    }
    str() {
        return this.suit + this.number;
    }
}
type CardS = Card|null|undefined;
type Pos = 'card'|'free'|'end';
let suits: Suits[] = ['红桃', '梅花', '方片', '黑桃'];
let numbers: Num[] = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
let prev = (e: Num) => e == 'A'? null: numbers[numbers.indexOf(e) - 1];
let next = (e: Num) => e == 'K'? null: numbers[numbers.indexOf(e) + 1];
let suitColor = {
    '红桃': 'red', '梅花': 'black', '方片': 'red', '黑桃': 'black'
};
let cardPos: CardS[][];         // 主牌堆
let freePos: CardS[];           // 暂存牌堆
let endPos: CardS[];            // 结束牌堆
let held: CardS;                // 鼠标正在拖动的牌

function shuffle(ls: any[]) {
    for(let i = ls.length - 1; i >= 0; --i) {
        let j = Math.floor(Math.random()*(i + 1));
        ls[i], ls[j] = [ls[j], ls[i]];
    }
}

function initCard() {
    let cards: Card[] = new Array();
    
    for(let s of suits) {
        for(let n of numbers) {
            cards.push(new Card(s, n));
        }
    }
    return cards;
}

function initGame() {
    // 准备牌堆与放牌处
    let cards = initCard();
    shuffle(cards);
    cardPos = new Array(8);
    for(let i = 0; i < cardPos.length; ++i) {
        cardPos[i] = new Array();
    }
    freePos = [null, null, null, null];
    endPos = [null, null, null, null];

    for(let i = 0; i < cards.length; ++i) {
        cardPos[i % cardPos.length].push(cards[i]);
        // TODO: 发牌动画
    }
}

function moveCard(from: {pos: Pos, num: number}, to: {pos: Pos, num: number}) {
    /**
     * move the card
     * `pos` is 'card'(from the main cards), 'end'(from the restored part), 'free'(from the free zone)
     * `num` is the column of the card
     * if `pos` is 'end', then `num` is not important, since we can infer its position through the card's suit.
     *  e.g. if the suit is '红桃'(heart), it will go to first column.
     */
    // let c: CardS;
    // switch(from.pos) {
    //     case 'card': {
    //         c = cardPos[from.num].pop();
    //         break;
    //     }
    //     case 'end': {
    //         c = endPos[from.num];
    //         break;
    //     }
    //     case 'free': {
    //         c = freePos[from.num];
    //         break;
    //     }
    // }
    // if(!c)
    //     return false;
    // let allowed = false;
    // let last = (ls) => ls[ls.length - 1]
    // switch(to.pos) {
    //     case 'card': {
    //         let lst = last(cardPos[to.num]) as CardS;
    //         if(!lst) {
    //             allowed = true;
    //             cardPos[to.num].push(c);
    //         } else if(suitColor[c.suit] != suitColor[lst.suit] && c.number == prev(lst.number)) {
    //             cardPos[to.num].push(c);
    //             allowed = true;
    //         } else {
    //             allowed = false;
    //         }
    //         break;
    //     }
    //     case 'end': {
    //         to.num = suits.indexOf(c.suit);
    //         let lst = last(cardPos[to.num]) as CardS;
    //         if(!lst) {
    //             if(c.number == 'A') {
    //                 endPos[to.num] = c;
    //                 allowed = true;
    //             }
    //         } else if(c.number == next(lst.number)) {
    //             endPos[to.num] = c;
    //             allowed = true;
    //         } else {
    //             allowed = false;
    //         }
    //         break;
    //     }
    //     case 'free': {
    //         if(!freePos[to.num]) {
    //             freePos[to.num] = c;
    //             allowed = true;
    //         } else {
    //             allowed = false;
    //         }
    //         break;
    //     }
    // }
    let c: Card;
    if(checkMove(from, to)) {
        switch(from.pos) {
            case 'card': {
                c = cardPos[from.num].pop() as Card;
                break;
            }
            case 'end': {
                c = endPos[from.num] as Card;
                let _num = prev(c.number);
                if(_num)
                    endPos[from.num] = new Card(c.suit, _num);
                else
                    endPos[from.num] = null;
                break;
            }
            case 'free': {
                c = freePos[from.num] as Card;
                freePos[from.num] = null;
                break;
            }
        }
        switch(to.pos) {
            case 'card':
                cardPos[to.num].push(c);
                break;
            case 'end':
                console.assert(to.num == suits.indexOf(c.suit));
                endPos[to.num] = c;
                break;
            case 'free':
                freePos[to.num] = c;
                break;
        }
    }
        
}

function checkMove(from: {pos: Pos, num: number}, to: {pos: Pos, num: number}) {
    // returns: true if the move can be done; false if cannot.
    let last = (ls) => ls[ls.length - 1]

    let c: CardS;
    switch(from.pos) {
        case 'card': {
            c = last(cardPos[from.num]);
            break;
        }
        case 'end': {
            c = endPos[from.num];
            break;
        }
        case 'free': {
            c = freePos[from.num];
            break;
        }
    }
    if(!c)
        return null;
    let allowed = true;
    switch(to.pos) {
        case 'card': {
            let lst = last(cardPos[to.num]) as CardS;
            if(lst != null && 
                !(suitColor[c.suit] != suitColor[lst.suit] && c.number == prev(lst.number))) {
                allowed = false;
            }
            break;
        }
        case 'end': {
            to.num = suits.indexOf(c.suit);
            let lst = last(cardPos[to.num]) as CardS;
            if(!lst) {
                if(c.number != 'A') {
                    allowed = false;
                }
            } else if(c.number != next(lst.number)) {
                allowed = false;
            }
            break;
        }
        case 'free': {
            if(freePos[to.num]) {
                allowed = false;
            }
            break;
        }
    }
    return allowed;
}

function autoMove(from: {pos: Pos, num: number}) {
    // TODO: 实现单击时自动选择位置
    // 优先：1. 收牌；2. 移动到主牌堆的可行位置上；3. 移动到空缺位置上（主牌堆移动到暂存堆上或暂存堆移动到主牌堆上）
    switch(from.pos) {
        case 'end':
            return;
        case 'card':{
            if(checkMove(from, {pos: 'end', num: 0})) {
                return {pos: 'end', num: 0};
            }
            let weight = new Array();
            for(let i = 0; i < cardPos.length; ++i) {
                if(i == from.num) {
                    weight.push(0)
                    continue;
                }
                if(checkMove(from, {pos: 'card', num: i})) {
                    if(cardPos[i].length !== 0) {
                        weight.push(11);
                    } else {
                        weight.push(10);
                    }
                } else {
                    weight.push(0);
                }
            }
            let i = weight.indexOf(11);
            if(i == -1) {
                i = weight.indexOf(10);
            }
            if(i != -1) {
                return {pos: 'card', num: i};
            }
            for(let i = 0; i < freePos.length; ++i) {
                if(freePos[i] == null) {
                    return {pos: 'free', num: i};
                }
            }
            return null;
        }
        case 'free': {
            if(checkMove(from, {pos: 'end', num: 0})) {
                return {pos: 'end', num: 0};
            }
            let weight = new Array();
            for(let i = 0; i < cardPos.length; ++i) {
                if(i == from.num) {
                    weight.push(0)
                    continue;
                }
                if(checkMove(from, {pos: 'card', num: i})) {
                    if(cardPos[i].length !== 0) {
                        weight.push(11);
                    } else {
                        weight.push(10);
                    }
                } else {
                    weight.push(0);
                }
            }
            let i = weight.indexOf(11);
            if(i == -1) {
                i = weight.indexOf(10);
            }
            if(i != -1) {
                return {pos: 'card', num: i};
            }
            return null;
        }
    }
}

// TODO: 处理图像与动画（暂时先canvas转位图）
// 图像预先画好储存在字典中，以Card.str()的返回值作为键。
// TODO: 处理点击与拖动
/**
 * 计算放牌位置；
 * 计算判定位置；
 * 判定点击（按与放的时间差） => auto，自动播放动画
 * 判定拖动 => 实时调整位置，放鼠标时播放动画
 */

let imgMap: Map<string, ImageBitmap>;
// 位图Map
function initImg() {
    imgMap = new Map();
    let img = new Image();
    let imgArray: ImageBitmap[][] = new Array();
    let width = 100, height = Math.floor(100*170/131);

    const promise: Promise<ImageBitmap[][]> = new Promise((resolve, reject) => {
        img.onload = () => {
            let promiseAr = new Array();
            for(let i = 0; i < 7; ++i) {
                for(let j = 0; j < 8; ++j) {
                    promiseAr.push(createImageBitmap(
                        img, i*(48 + 130), j*(32 + 169), 131, 170
                         , {resizeHeight: height, resizeWidth: width}
                    ));
                }
            }
            resolve(Promise.all(promiseAr).then((ar) => {
                for(let i = 0; i < 7; ++i) {
                    imgArray[i] = new Array();
                    for(let j = 0; j < 8; ++j) {
                        imgArray[i][j] = ar[i*8+j];
                    }
                }
                console.log(imgArray);
                return imgArray;
            }));
        };
        img.onerror = () => reject();
        img.src = './fig/card.png';
    });
    return promise;
}

function initAll() {
    initCard();
    initGame();
    let imgs = initImg();
    imgs.then(
        (ar) => {
            imgMap
            // TODO: 把图像装到map里面
            // 添加控制键位
        },
        () => {
            console.log('failed to load the fig');
        }
    )
}

function drawCard() {
    // TODO: draw the cards.
}
window.onload = initImg;