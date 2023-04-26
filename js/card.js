"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Card {
    constructor(_suit, _number) {
        this.suit = _suit;
        this.number = _number;
    }
    str() {
        return this.suit + this.number;
    }
}
function* range(start, end, step) {
    if (end === undefined) {
        [start, end] = [0, start];
        if (end < 0) {
            end = 0;
        }
        step = 1;
    }
    else if (!step) {
        step = 1;
    }
    if (step > 0)
        for (let i = start; i < end; i += step) {
            yield i;
        }
    else
        for (let i = start; i > end; i += step) {
            yield i;
        }
}
const suits = ['红桃', '梅花', '方片', '黑桃'];
const numbers = ['A', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K'];
const prev = (e) => e == 'A' ? null : numbers[numbers.indexOf(e) - 1];
const next = (e) => e == 'K' ? null : numbers[numbers.indexOf(e) + 1];
let suitColor = {
    '红桃': 'red', '梅花': 'black', '方片': 'red', '黑桃': 'black'
};
let cardPos; // 主牌堆
let freePos; // 暂存牌堆
let endPos; // 结束牌堆
let held; // 鼠标正在拖动的牌
const GAME_SIZE = {
    canvas: [1200, 600],
    card: [100, Math.floor(100 * 170 / 120)],
    margin: [40, 40, 30, 30],
    window: [1200 - 40 - 40, 600 - 30 - 30]
};
const UP_PANNEL = {
    gap: Math.floor(GAME_SIZE.card[0] / 5),
    middle_gap: GAME_SIZE.window[0] - 8 * GAME_SIZE.card[0] - 6 * Math.floor(GAME_SIZE.card[0] / 5)
};
const DOWN_PANNEL = {
    up_down_gap: Math.floor(GAME_SIZE.card[0] * 0.3),
    gap: Math.floor((GAME_SIZE.canvas[0] - 8 * GAME_SIZE.card[0] - GAME_SIZE.margin[0] - GAME_SIZE.margin[1]) / 7),
    ver_gap: Math.floor(GAME_SIZE.card[0] * 0.3)
};
// TODO: 取代下面所有的全局变量，改用上面的。
// const SIZE: number[] = [800, 400];
// const CARD_SIZE: number[] = [85, Math.floor(85 * 170 / 120)]; // width, height
// const MARGIN: number[] = [20, 20, 30, 30];    // left, right, top, bottom
// const GAP: number = Math.floor((SIZE[0] - 8*CARD_SIZE[0] - MARGIN[0] - MARGIN[1])/7);          // 牌的水平间隔
// const VERTI_GAP = Math.floor(CARD_SIZE[0]*0.3);           // 牌的垂直间隔
let contx;
let canvas;
function shuffle(ls) {
    for (let i = ls.length - 1; i >= 0; --i) {
        let j = Math.floor(Math.random() * (i + 1));
        [ls[i], ls[j]] = [ls[j], ls[i]];
    }
}
function initCard() {
    let cards = new Array();
    for (let s of suits) {
        for (let n of numbers) {
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
    for (let i = 0; i < cardPos.length; ++i) {
        cardPos[i] = new Array();
    }
    freePos = [null, null, null, null];
    endPos = [null, null, null, null];
    for (let i = 0; i < cards.length; ++i) {
        cardPos[i % cardPos.length].push(cards[i]);
        // TODO: 发牌动画
    }
}
function moveCard(from, to) {
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
    let c;
    if (checkMove(from, to)) {
        switch (from.pos) {
            case 'card': {
                c = cardPos[from.num].pop();
                break;
            }
            case 'end': {
                c = endPos[from.num];
                let _num = prev(c.number);
                if (_num)
                    endPos[from.num] = new Card(c.suit, _num);
                else
                    endPos[from.num] = null;
                break;
            }
            case 'free': {
                c = freePos[from.num];
                freePos[from.num] = null;
                break;
            }
        }
        switch (to.pos) {
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
function checkMove(from, to) {
    // returns: true if the move can be done; false if cannot.
    let last = (ls) => ls[ls.length - 1];
    let c;
    switch (from.pos) {
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
    if (!c)
        return null;
    let allowed = true;
    switch (to.pos) {
        case 'card': {
            let lst = last(cardPos[to.num]);
            if (lst != null &&
                !(suitColor[c.suit] != suitColor[lst.suit] && c.number == prev(lst.number))) {
                allowed = false;
            }
            break;
        }
        case 'end': {
            to.num = suits.indexOf(c.suit);
            let lst = last(cardPos[to.num]);
            if (!lst) {
                if (c.number != 'A') {
                    allowed = false;
                }
            }
            else if (c.number != next(lst.number)) {
                allowed = false;
            }
            break;
        }
        case 'free': {
            if (freePos[to.num]) {
                allowed = false;
            }
            break;
        }
    }
    return allowed;
}
function autoMove(from) {
    // TODO: 实现单击时自动选择位置
    // 优先：1. 收牌；2. 移动到主牌堆的可行位置上；3. 移动到空缺位置上（主牌堆移动到暂存堆上或暂存堆移动到主牌堆上）
    switch (from.pos) {
        case 'end':
            return;
        case 'card': {
            if (checkMove(from, { pos: 'end', num: 0 })) {
                return { pos: 'end', num: 0 };
            }
            let weight = new Array();
            for (let i = 0; i < cardPos.length; ++i) {
                if (i == from.num) {
                    weight.push(0);
                    continue;
                }
                if (checkMove(from, { pos: 'card', num: i })) {
                    if (cardPos[i].length !== 0) {
                        weight.push(11);
                    }
                    else {
                        weight.push(10);
                    }
                }
                else {
                    weight.push(0);
                }
            }
            let i = weight.indexOf(11);
            if (i == -1) {
                i = weight.indexOf(10);
            }
            if (i != -1) {
                return { pos: 'card', num: i };
            }
            for (let i = 0; i < freePos.length; ++i) {
                if (freePos[i] == null) {
                    return { pos: 'free', num: i };
                }
            }
            return null;
        }
        case 'free': {
            if (checkMove(from, { pos: 'end', num: 0 })) {
                return { pos: 'end', num: 0 };
            }
            let weight = new Array();
            for (let i = 0; i < cardPos.length; ++i) {
                if (i == from.num) {
                    weight.push(0);
                    continue;
                }
                if (checkMove(from, { pos: 'card', num: i })) {
                    if (cardPos[i].length !== 0) {
                        weight.push(11);
                    }
                    else {
                        weight.push(10);
                    }
                }
                else {
                    weight.push(0);
                }
            }
            let i = weight.indexOf(11);
            if (i == -1) {
                i = weight.indexOf(10);
            }
            if (i != -1) {
                return { pos: 'card', num: i };
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
let imgMap;
// 位图Map
function initImg() {
    let img = new Image();
    let imgArray = new Array();
    let width = GAME_SIZE.card[0], height = GAME_SIZE.card[1];
    const promise = new Promise((resolve, reject) => {
        // There are two layer of promise here: one is load the img; the other is create bit map for the img.
        img.onload = () => {
            let promiseAr = new Array();
            for (let i = 0; i < 7; ++i) {
                for (let j = 0; j < 8; ++j) {
                    promiseAr.push(createImageBitmap(img, j * (48 + 130) + 1, i * (32 + 169) + 1, 131 - 4, 170 - 4, { resizeHeight: height, resizeWidth: width }));
                    // it is promise array.
                }
            }
            resolve(Promise
                .all(promiseAr)
                .then((ar) => {
                for (let i = 0; i < 7; ++i) {
                    imgArray[i] = new Array();
                    for (let j = 0; j < 8; ++j) {
                        imgArray[i][j] = ar[i * 8 + j];
                    }
                }
                console.log(imgArray);
                return imgArray;
            })
                .then((ar) => {
                console.log(ar);
                let imgMap = new Map();
                let left_column = [
                    'K', 'Q', 'J', 'A', 6, 5, 4
                ];
                let right_column = [
                    10, 9, 8, 7, 3, 2
                ];
                let suits = [
                    '红桃', '黑桃', '方片', '梅花'
                ];
                for (let i of range(left_column.length)) {
                    for (let j of range(4)) {
                        imgMap[suits[j] + left_column[i]] = imgArray[i][j];
                    }
                }
                for (let i of range(right_column.length)) {
                    for (let j of range(4)) {
                        imgMap[suits[j] + right_column[i]] = imgArray[i][j + 4];
                    }
                }
                // TODO: 把图像装到map里面
                return imgMap;
            }));
        };
        img.onerror = () => reject('fail to load img.');
        img.src = './fig/card.png';
    });
    return promise;
}
function initCanvas() {
    canvas = document.getElementById('game_canvas');
    if (canvas) {
        contx = canvas.getContext('2d');
        if (contx) {
            return true;
        }
    }
    return false;
}
function initAll() {
    return __awaiter(this, void 0, void 0, function* () {
        initGame();
        initCanvas();
        console.assert(contx != undefined);
        imgMap = yield initImg();
        drawCard();
        // imgs.then(
        //     (map) => {
        //         imgMap = map;
        //         // 添加控制键位
        //     },
        //     () => {
        //         console.log('failed to load the fig');
        //     }
        // )
    });
}
function drawCard() {
    // TODO: draw the cards.
    let path = roundRectPath(GAME_SIZE.card[0], GAME_SIZE.card[1], GAME_SIZE.card[0] / 10);
    for (let [i, c] of freePos.entries()) {
        if (c) {
            contx.drawImage(imgMap[c.str()], GAME_SIZE.margin[0] + i * (UP_PANNEL.gap + GAME_SIZE.card[0]), GAME_SIZE.margin[1]);
        }
        else {
            contx.save();
            contx.lineWidth = 5;
            contx.strokeStyle = 'green';
            contx.translate(GAME_SIZE.margin[0] + i * (UP_PANNEL.gap + GAME_SIZE.card[0]), GAME_SIZE.margin[1]);
            contx.stroke(path);
            contx.restore();
        }
    }
    for (let [i, c] of endPos.entries()) {
        // TODO: 调整位置
        if (c) {
            contx.drawImage(imgMap[c.str()], GAME_SIZE.margin[0] + i * (UP_PANNEL.gap + GAME_SIZE.card[0]), GAME_SIZE.margin[1] + GAME_SIZE.card[1] + 20);
        }
        else {
            contx.save();
            contx.lineWidth = 5;
            contx.strokeStyle = 'green';
            contx.translate(GAME_SIZE.canvas[0] - (GAME_SIZE.margin[1] + (3 - i) * (UP_PANNEL.gap + GAME_SIZE.card[0]) + GAME_SIZE.card[0]), GAME_SIZE.margin[1]);
            contx.stroke(path);
            contx.restore();
        }
    }
    console.log(cardPos);
    for (let [i, row] of cardPos.entries()) {
        if (row.length > 0)
            for (let [j, c] of row.entries()) {
                contx.drawImage(imgMap[c.str()], GAME_SIZE.margin[0] + (GAME_SIZE.card[0] + DOWN_PANNEL.gap) * i, GAME_SIZE.margin[2] + j * DOWN_PANNEL.ver_gap + GAME_SIZE.card[1] + DOWN_PANNEL.up_down_gap
                // TODO: 考虑牌过多时的情况
                );
                contx.save();
                contx.lineWidth = 3;
                contx.strokeStyle = 'brown';
                contx.translate(GAME_SIZE.margin[0] + (GAME_SIZE.card[0] + DOWN_PANNEL.gap) * i, GAME_SIZE.margin[2] + j * DOWN_PANNEL.ver_gap + GAME_SIZE.card[1] + DOWN_PANNEL.up_down_gap);
                contx.stroke(path);
                contx.restore();
            }
        else {
            contx.save();
            contx.lineWidth = 5;
            contx.strokeStyle = 'green';
            contx.translate(GAME_SIZE.margin[0] + (GAME_SIZE.card[0] + DOWN_PANNEL.gap) * i, GAME_SIZE.margin[2] + GAME_SIZE.card[1] + DOWN_PANNEL.up_down_gap);
            contx.stroke(path);
            contx.restore();
        }
    }
    //TODO: 
}
function roundRectPath(width, height, radius) {
    let path = new Path2D();
    path.moveTo(0, radius);
    path.arcTo(0, 0, radius, 0, radius);
    path.lineTo(width - radius, 0);
    path.arcTo(width, 0, width, radius, radius);
    path.lineTo(width, height - radius);
    path.arcTo(width, height, width - radius, height, radius);
    path.lineTo(radius, height);
    path.arcTo(0, height, 0, height - radius, radius);
    path.lineTo(0, radius);
    // path.lineTo()
    return path;
}
window.onload = initAll;
