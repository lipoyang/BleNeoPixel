/********** UIの要素 ***********/
// ボタン
const btn_connect = document.getElementById('btn_connect'); // 接続
const btn_one     = document.getElementById('btn_one');   // ひといろ
const btn_two     = document.getElementById('btn_two');   // ふたいろ
const btn_fade    = document.getElementById('btn_fade');  // ほたる
const btn_round   = document.getElementById('btn_round'); // ぐるぐる
const btn_fluct   = document.getElementById('btn_fluct'); // ゆらめき
const btn_off     = document.getElementById('btn_off');   // けす
const btn_setting = document.getElementById('btn_setting'); // せってい
const btn_disconnect = document.getElementById('btn_disconnect');  // きる
const btn_save    = document.getElementById('btn_save');  // セーブ
const btn_reset   = document.getElementById('btn_reset'); // リセット
const btn_back    = document.getElementById('btn_back');  // もどる
// スライダー
const slider_H1 = document.getElementById('slider_H1');   // いろみ1
const slider_S1 = document.getElementById('slider_S1');   // しろさ1
const slider_H2 = document.getElementById('slider_H2');   // いろみ2
const slider_S2 = document.getElementById('slider_S2');   // しろさ2
const slider_T_2color = document.getElementById('slider_T_2color'); // じかん(ふたいろ)
const slider_T_fade   = document.getElementById('slider_T_fade');   // じかん(ほたる)
const slider_T_round  = document.getElementById('slider_T_round');  // じかん(ぐるぐる)
const slider_T_fluct  = document.getElementById('slider_T_fluct');  // じかん(ゆらめき)
const slider_dC = document.getElementById('slider_dC');   // ゆらめき(いろ)
const slider_dV = document.getElementById('slider_dV');   // ゆらめき(あかるさ)
const slider_bright   = document.getElementById('slider_bright');   // あかるさ(すべて)
// 色表示
const div_C1 = document.getElementById('div_C1');
const div_C2 = document.getElementById('div_C2');
// 表示領域
const panel_connect = document.getElementById('panel_connect');
const panel_main    = document.getElementById('panel_main');
const panel_C2      = document.getElementById('panel_C2');
const panel_2color  = document.getElementById('panel_2color');
const panel_fade    = document.getElementById('panel_fade');
const panel_round   = document.getElementById('panel_round');
const panel_fluct   = document.getElementById('panel_fluct');
const panel_setting = document.getElementById('panel_setting');
// 接続時のメッセージ
const text_connect = document.getElementById('text_connect');

/********** BLEの定数 ***********/
// BLEサービスのUUID
const UUID_NeoPixel   = "446ff1a9-5023-26f0-1065-3aa7a53a8483";
// BLEキャラクタリスティックのUUID
const UUID_Brightness = "8c9c438a-ed7e-1538-488c-fc98e4312f55";
const UUID_H1         = "602c80a4-b3c0-79a4-8fce-51b5322baf8b";
const UUID_S1         = "962cc211-e355-7b44-eb55-d2503e14b83f";
const UUID_H2         = "ac2a3c37-5eec-862c-6b75-97335387531c";
const UUID_S2         = "1685f91c-adda-6b15-496b-039dcbf642dc";
const UUID_T_2color   = "9d5fd8c0-9de3-16e4-e89c-dac40b2f81a2";
const UUID_T_fade     = "f61ae49d-d036-cd18-f3ba-025d7b93cc6b";
const UUID_T_round    = "66070b87-2b7f-001b-663f-e1110c37f642";
const UUID_T_fluct    = "5587d9ab-1927-a85c-a9c1-114dfc660496";
const UUID_DC         = "6ea7f285-3202-f28a-c609-c48cd759ab90";
const UUID_DV         = "81765da4-71cf-79bc-8e1e-a23130995444";
const UUID_Pattern    = "7d5c1067-d1a7-a8e8-9dd0-41cbe5e25f0a";
// 発光パターン
const PTN_OFF   = 0x00; // けす
const PTN_ONE   = 0x01; // ひといろ
const PTN_TWO   = 0x02; // ふたいろ
const PTN_FADE  = 0x03; // ほたる
const PTN_ROUND = 0x04; // ぐるぐる
const PTN_FLUCT = 0x05; // ゆらめき

/********** BLEの変数 ***********/
// BLEデバイス
let bleDevice = null;
// BLEキャラクタリスティック
let chrBrightness; // 明るさ(全体) (0-255) // TODO const
let chrH1;         // 色1の色相 (0-255)
let chrS1;         // 色1の彩度 (0-255)
let chrH2;         // 色2の色相 (0-255)
let chrS2;         // 色2の彩度 (0-255)
let chrT_2color;   // ふたいろの周期 [ms]
let chrT_fade;     // ほたるの周期 [ms]
let chrT_round;    // ぐるぐるの周期 [ms]
let chrT_fluct;    // ゆらめきの更新周期 [ms]
let chrDC;         // 色のゆらめき     (0.0 - 1.0)
let chrDV          // 明るさのゆらめき (0.0 - 1.0)
let chrPattern;    // 発光パターン

/********** その他の定数・変数 (BLE通信の保留処理のため) ***********/
// スライダの番号
const INDEX = {
  Brightness:0, H1:1, S1:2, H2:3, S2:4,
  T_2color:5, T_fade:6, T_round:7, T_fluct:8,
  DC:9, DV:10,
  ALL:11
};
// キャラクタリスティックの型の番号
const CHARTYPE = {
  UINT8:0, UINT16:1
};
// 前回送信時刻
let last_time = Array(INDEX.ALL).fill(0);
// 送信保留フラグ
let pending = Array(INDEX.ALL).fill(false);
// 時間
const SEND_INTERVAL = 50;  // [msec] これ未満の間隔での送信は保留する
const SEND_DELAY    = 50; // [msec] これだけ待って再送信する  

/********** UIのイベントハンドラ ***********/
// 「せつぞく」ボタン
btn_connect.addEventListener('click', async function () {
  try {
    // デバイスを取得 (サービスのUUIDでフィルタ)
    console.log("Requesting Bluetooth Device...");
    bleDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: [UUID_NeoPixel] }],
    });
    // 切断時イベントハンドラの登録
    bleDevice.addEventListener('gattserverdisconnected', onDisconnected);
    // デバイスに接続
    text_connect.innerText = "接続中...";
    console.log("Connecting to GATT Server...");
    const server = await bleDevice.gatt.connect();
    // サービスを取得
    text_connect.innerText = "デバイス情報取得中...";
    console.log("Getting Service...");
    const service = await server.getPrimaryService(UUID_NeoPixel);
    // キャラクタリスティックを取得
    console.log("Getting Characteristics...");
    chrBrightness = await service.getCharacteristic(UUID_Brightness);
    chrH1         = await service.getCharacteristic(UUID_H1);
    chrS1         = await service.getCharacteristic(UUID_S1);
    chrH2         = await service.getCharacteristic(UUID_H2);
    chrS2         = await service.getCharacteristic(UUID_S2);
    chrT_2color   = await service.getCharacteristic(UUID_T_2color);
    chrT_fade     = await service.getCharacteristic(UUID_T_fade);
    chrT_round    = await service.getCharacteristic(UUID_T_round);
    chrT_fluct    = await service.getCharacteristic(UUID_T_fluct);
    chrDC         = await service.getCharacteristic(UUID_DC);
    chrDV         = await service.getCharacteristic(UUID_DV);
    chrPattern    = await service.getCharacteristic(UUID_Pattern);
    // キャラクタリスティックのREAD
    text_connect.innerText = "データ受信中...";
    console.log("Reading Characteristics...");
    await chrBrightness.readValue().then(value => {
      const b = value.getUint8(0);
      slider_bright.value = b;
      console.log("Brightness = " + b); 
    });
    await chrH1.readValue().then(value => {
      const h = value.getUint16(0, true); // true:リトルエンディアン
      slider_H1.value = h / 256;
      console.log("H1 = " + h);
    });
    await chrS1.readValue().then(value => {
      const s = value.getUint8(0);
      slider_S1.value = 255 - s;
      DisplayColor1();
      console.log("S1 = " + s);
    });
    await chrH2.readValue().then(value => {
      const h = value.getUint16(0, true); // true:リトルエンディアン
      slider_H2.value = h / 256;
      console.log("H2 = " + h);
    });
    await chrS2.readValue().then(value => {
      const s = value.getUint8(0);
      slider_S2.value = 255 - s;
      DisplayColor2();
      console.log("S2 = " + s);
    });
    await chrT_2color.readValue().then(value => {
      const t = value.getUint16(0, true); // true:リトルエンディアン
      slider_T_2color.value = t / 100;
      console.log("chrT_2color = " + t);
    });
    await chrT_fade.readValue().then(value => {
      const t = value.getUint16(0, true); // true:リトルエンディアン
      slider_T_fade.value = t / 100;
      console.log("slider_T_fade = " + t);
    });
    await chrT_round.readValue().then(value => {
      const t = value.getUint16(0, true); // true:リトルエンディアン
      slider_T_round.value = t / 100;
      console.log("slider_T_round = " + t);
    });
    await chrT_fluct.readValue().then(value => {
      const t = value.getUint16(0, true); // true:リトルエンディアン
      slider_T_fluct.value = t / 10;
      console.log("slider_T_fluct = " + t);
    });
    await chrDC.readValue().then(value => {
      const d = value.getUint8(0);
      slider_dC.value = d;
      console.log("dD = " + d);
    });
    await chrDV.readValue().then(value => {
      const d = value.getUint8(0);
      slider_dV.value = d;
      console.log("dV = " + d);
    });
    await chrPattern.readValue().then(value => {
      const pattern = value.getUint8(0);
      console.log("pattern = " + pattern);
      // 画面表示切替
      SwitchControlPanel(pattern);
      panel_connect.style.display = "none";
      panel_main.style.display = "block";
    });
  } catch (error) {
    console.log("ERROR! " + error);
    bleDevice = null;
  }
});

// 「ひといろ」ボタン
btn_one.addEventListener('click', function () {
  SwitchControlPanel(PTN_ONE);
  sendPattern(PTN_ONE);
});
// 「ふたいろ」ボタン
btn_two.addEventListener('click', function () {
  SwitchControlPanel(PTN_TWO);
  sendPattern(PTN_TWO);
});
// 「ほたる」ボタン
btn_fade.addEventListener('click', function () {
  SwitchControlPanel(PTN_FADE);
  sendPattern(PTN_FADE);
});
// 「ぐるぐる」ボタン
btn_round.addEventListener('click', function () {
  SwitchControlPanel(PTN_ROUND);
  sendPattern(PTN_ROUND);
});
// 「ゆらめき」ボタン
btn_fluct.addEventListener('click', function () {
  SwitchControlPanel(PTN_FLUCT);
  sendPattern(PTN_FLUCT);
});
// 「けす」ボタン
btn_off.addEventListener('click', function () {
  SwitchControlPanel(PTN_OFF);
  sendPattern(PTN_OFF);
});

// 「せってい」ボタン
btn_setting.addEventListener('click', function (){
  panel_main.style.display = "none";
  panel_setting.style.display = "block";
});
// 「きる」ボタン
btn_disconnect.addEventListener('click', function (){
    if(bleDevice != null){
      bleDevice.gatt.disconnect();
    }
});

// 「セーブ」ボタン
btn_save.addEventListener('click', function (){
  // TODO
});
// 「リセット」ボタン
btn_reset.addEventListener('click', function (){
  // TODO
});
// 「もどる」ボタン
btn_back.addEventListener('click', function (){
  panel_main.style.display = "block";
  panel_setting.style.display = "none";
});

async function sendSliderVal(index, func, chr, type, val)
{
  const now = Date.now();
  const elapsed = now - last_time[index];
  if(elapsed < SEND_INTERVAL){
    if(pending[index] == false) setTimeout(func, SEND_DELAY);
    pending[index] = true;
    return;
  }
  last_time[index] = now;
  pending[index] = false;
  let buff;
  if(type == CHARTYPE.UINT8){
    buff = new Uint8Array([val]);
  }else if(type == CHARTYPE.UINT16){
    buff = new Uint16Array([val]);
  }
  await chr.writeValue(buff).then(() => {
    console.log('send:' + val);
  }).catch(()=>{
    if(pending[index] == false) setTimeout(func, SEND_DELAY);
    pending[index] = true;
  });
}

// いろみ1 スライダー
slider_H1.addEventListener('input', sendH1);
async function sendH1(){
  const H1 = Number(slider_H1.value) * 256;
  DisplayColor1();
  sendSliderVal(INDEX.H1, sendH1, chrH1, CHARTYPE.UINT16, H1);
}

// しろさ1 スライダー
slider_S1.addEventListener('input', function(){
  const S1 = 255 - Number(slider_S1.value);
  DisplayColor1();
  chrS1.writeValue(new Uint8Array([S1])); // TODO
});
// いろみ2 スライダー
slider_H2.addEventListener('input', function(){
  const H2 = Number(slider_H2.value) * 256;
  DisplayColor2();
  chrH2.writeValue(new Uint16Array([H2])); // TODO
});
// しろさ2 スライダー
slider_S2.addEventListener('input', function(){
  const S2 = 255 - Number(slider_S2.value);
  DisplayColor2();
  chrS2.writeValue(new Uint8Array([S2])); // TODO
});

// じかん(ふたいろ) スライダー
slider_T_2color.addEventListener('input', function(){
  const t = Number(slider_T_2color.value) * 100;
  chrT_2color.writeValue(new Uint16Array([t])); // TODO
});
// じかん(ほたる) スライダー
slider_T_fade.addEventListener('input', function(){
  const t = Number(slider_T_fade.value) * 100;
  chrT_fade.writeValue(new Uint16Array([t])); // TODO
});
// じかん(ぐるぐる) スライダー
slider_T_round.addEventListener('input', function(){
  const t = Number(slider_T_round.value) * 100;
  chrT_round.writeValue(new Uint16Array([t])); // TODO
});
// じかん(ゆらめき) スライダー
slider_T_fluct.addEventListener('input', function(){
  const t = Number(slider_T_fluct.value) * 10;
  chrT_fluct.writeValue(new Uint16Array([t])); // TODO
});

// ゆらめき(いろ) スライダー
slider_dC.addEventListener('input', function(){
  const dC = Number(slider_dC.value);
  chrDC.writeValue(new Uint8Array([dC])); // TODO
});
// ゆらめき(あかるさ) スライダー
slider_dV.addEventListener('input', function(){
  const dV = Number(slider_dV.value);
  chrDV.writeValue(new Uint8Array([dV])); // TODO
});

// あかるさ(すべて) スライダー
slider_bright.addEventListener('input', function(){
  const b = Number(slider_bright.value);
  chrBrightness.writeValue(new Uint8Array([b])); // TODO
});

/********** BLEのイベントハンドラ ***********/
// 切断時
function onDisconnected(event) {
  const device = event.target;
  console.log(`Device ${device.name} is disconnected.`);
  bleDevice = null;
  // 画面表示切替
  text_connect.innerText = "";
  panel_main.style.display = "none";
  panel_connect.style.display = "block";
}

/********** サブルーチン ***********/
// 操作パネルの表示切替
function SwitchControlPanel(pattern){
  btn_off.className = "btn btn-primary btn-block rounded-pill";
  btn_one.className = "btn btn-primary btn-block rounded-pill";
  btn_two.className = "btn btn-primary btn-block rounded-pill";
  btn_fade.className = "btn btn-primary btn-block rounded-pill";
  btn_round.className = "btn btn-primary btn-block rounded-pill";
  btn_fluct.className = "btn btn-primary btn-block rounded-pill";
  switch(pattern){
    case PTN_OFF:
      btn_off.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="none";
      panel_2color.style.display ="none";
      panel_fade.style.display ="none";
      panel_round.style.display ="none";
      panel_fluct.style.display ="none";
      break;
    case PTN_ONE:
      btn_one.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="none";
      panel_2color.style.display ="none";
      panel_fade.style.display ="none";
      panel_round.style.display ="none";
      panel_fluct.style.display ="none";
      break;
    case PTN_TWO:
      btn_two.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="block";
      panel_2color.style.display ="block";
      panel_fade.style.display ="none";
      panel_round.style.display ="none";
      panel_fluct.style.display ="none";
      break;
    case PTN_FADE:
      btn_fade.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="none";
      panel_2color.style.display ="none";
      panel_fade.style.display ="block";
      panel_round.style.display ="none";
      panel_fluct.style.display ="none";
      break;
    case PTN_ROUND:
      btn_round.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="block";
      panel_2color.style.display ="none";
      panel_fade.style.display ="none";
      panel_round.style.display ="block";
      panel_fluct.style.display ="none";
    break;
    case PTN_FLUCT:
      btn_fluct.className = "btn btn-warning btn-warning rounded-pill";
      panel_C2.style.display ="block";
      panel_2color.style.display ="none";
      panel_fade.style.display ="none";
      panel_round.style.display ="none";
      panel_fluct.style.display ="block";
      break;
    default:
      console.log("ERROR! Unexpected pattern " + pattern);
      panel_C2.style.display ="none";
      panel_2color.style.display ="none";
      panel_fade.style.display ="none";
      panel_round.style.display ="none";
      panel_fluct.style.display ="none";
      break;
  }
}

// 発光パターンの送信 TODO
function sendPattern(pattern) {
  chrPattern.writeValue(new Uint8Array([pattern])).then(() => {
    console.log('sendPattern:' + pattern);
  });
}

// いろ1の表示
function DisplayColor1()
{
  const H1 = Number(slider_H1.value) * 256;
  const S1 = 255 - Number(slider_S1.value);
  let r,g,b;
  [r,g,b] = ColorHSV(H1, S1, 255);
  const c = "RGB(" + r + "," + g + "," + b + ")"; // TODO ${}
  div_C1.style.backgroundColor = c;
}
// いろ2の表示
function DisplayColor2()
{
  const H2 = Number(slider_H2.value) * 256;
  const S2 = 255 - Number(slider_S2.value);
  let r,g,b;
  [r,g,b] = ColorHSV(H2, S2, 255);
  const c = "RGB(" + r + "," + g + "," + b + ")";
  div_C2.style.backgroundColor = c;
}

// HSV → RGB 変換
// h: 0-65535
// s,v: 0-255
// r,g,b: 0-255
function ColorHSV(hue, sat, val)
{
  hue = Math.floor((hue * 1530 + 32768) / 65536);
  
  let r,g,b;
  if (hue < 510) { // Red to Green-1
    b = 0;
    if (hue < 255) { //   Red to Yellow-1
      r = 255;
      g = hue;       //     g = 0 to 254
    } else {         //   Yellow to Green-1
      r = 510 - hue; //     r = 255 to 1
      g = 255;
    }
  } else if (hue < 1020) { // Green to Blue-1
    r = 0;
    if (hue < 765) { //   Green to Cyan-1
      g = 255;
      b = hue - 510;  //     b = 0 to 254
    } else {          //   Cyan to Blue-1
      g = 1020 - hue; //     g = 255 to 1
      b = 255;
    }
  } else if (hue < 1530) { // Blue to Red-1
    g = 0;
    if (hue < 1275) { //   Blue to Magenta-1
      r = hue - 1020; //     r = 0 to 254
      b = 255;
    } else { //   Magenta to Red-1
      r = 255;
      b = 1530 - hue; //     b = 255 to 1
    }
  } else { // Last 0.5 Red (quicker than % operator)
    r = 255;
    g = b = 0;
  }

  // Apply saturation and value to R,G,B, pack into 32-bit result:
  const v1 = 1 + val;  // 1 to 256; allows >>8 instead of /255
  const s1 = 1 + sat;  // 1 to 256; same reason
  const s2 = 255 - sat; // 255 to 0

  const R = (((((r * s1) >> 8) + s2) * v1) & 0xff00) >> 8;
  const G = (((((g * s1) >> 8) + s2) * v1) & 0xff00) >> 8;
  const B = (((((b * s1) >> 8) + s2) * v1) & 0xff00) >> 8;        
  return [R, G, B];
}
