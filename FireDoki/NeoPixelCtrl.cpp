#include <stdlib.h>
#include "NeoPixelCtrl.h"
#include "PollingTimer.h"

#define DELTA_T     30  // 更新周期[ms]

// コンストラクタ
NeoPixelCtrl::NeoPixelCtrl() : 
    pixels( Adafruit_NeoPixel(LED_MAX, LED_PIN, NEO_GRB + NEO_KHZ800) )
{
    // 初期値
    brightness = 32; // 明るさ (マスター)
    H1 = 0x0000;     // 色1の色相
    S1 = 255;        // 色1の彩度
    H2 = 0x1000;     // 色2の色相
    S2 = 255;        // 色2の彩度
    T_2color = 4000; // ふたいろの周期
    T_fade   = 4000; // ほたるの周期
    T_round  = 2000; // ぐるぐるの周期
    T_fluct  = 30;   // ゆらめきの更新周期
//  dH = 0.02;       // 色相のゆらめき
//  dS = 0.05;       // 彩度のゆらめき
    dC = 0.5F;       // 色のゆらめき
    dV = 0.4F;       // 明度のゆらめき
    pattern = PTN_ONE_COLOR; // 発光パターン
}

// 明るさの設定 (0-255)
void NeoPixelCtrl::setBrightness(uint8_t brightness)
{
    pixels.setBrightness(brightness);
    this->brightness = brightness;
}

// 色1の設定 (色相 0x0000-0xFFFF, 彩度 0-255)
void NeoPixelCtrl::setColor1(uint16_t h, uint8_t s)
{
    H1 = h;
    S1 = s;
}

// 色2の設定 (色相 0x0000-0xFFFF, 彩度 0-255)
void NeoPixelCtrl::setColor2(uint16_t h, uint8_t s)
{
    H2 = h;
    S2 = s;
}

// ふたいろの周期の設定 [ms]
void NeoPixelCtrl::setT_2color(int ms)
{
    if(ms > 0 && ms <= 10000) T_2color = ms;
}

// ほたるの周期の設定 [ms]
void NeoPixelCtrl::setT_fade  (int ms)
{
    if(ms > 0 && ms <= 10000) T_fade = ms; 
}

// ぐるぐるの周期の設定 [ms]
void NeoPixelCtrl::setT_round (int ms)
{
    if(ms > 0 && ms <= 10000) T_round = ms;
}

// ゆらめきの更新周期の設定 [ms]
void NeoPixelCtrl::setT_fluct (int ms)
{
    if(ms > 0 && ms <= 10000) T_fluct = ms;
}

//// ゆらめきの設定(色相 0-50%, 彩度 0-100%, 明度 0-100%)
//void NeoPixelCtrl::setFluctuation(int h, int s, int v)
// ゆらめきの設定(色 0-100%, 明るさ 0-100%)
void NeoPixelCtrl::setFluctuation(int c, int v)
{
//  if(h >= 0 && h <= 100) dH = (float)h / 100.0F;
//  if(s >= 0 && s <= 100) dS = (float)s / 100.0F;
    if(c >= 0 && c <= 100) dC = (float)c / 100.0F;
    if(v >= 0 && v <= 100) dV = (float)v / 100.0F;
}

// 発光パターンの設定
void NeoPixelCtrl::setPattern (Iluminetion pattern)
{
    n_cnt = 0;
    this->pattern = pattern;
}

// 初期化
void NeoPixelCtrl::begin()
{
    // NeoPixelの初期化
    pixels.begin();
    pixels.setBrightness(brightness);
    
    // ゆらぎ発生器の初期化
    for(int i=0;i<LED_MAX;i++){
        for(int j=0;j<F_HSV;j++){
            fluct[i][j].init();
        }
    }
    // 周期タイマの初期化
    interval.set(DELTA_T);
}

// タスク
void NeoPixelCtrl::task()
{
    // 更新周期ごとに処理
    if(interval.elapsed())
    {
        switch(pattern){
        case PTN_OFF:
            patternOff();       // けす
            break;
        case PTN_ONE_COLOR:
            patternOneColor();  // ひといろ
            break;
        case PTN_TWO_COLOR:
            patternTwoColor();  // ふたいろ
            break;
        case PTN_FADE:
            patternFade();      // ほたる
            break;
        case PTN_ROUND:
            patternRound();     // ぐるぐる
            break;
        case PTN_FLUCTUATION:
            patternFluction();  // ゆらめき
            break;
        }
        // LEDの色更新
        pixels.show();
        // 回数カウント
        n_cnt++;
    }
}

// けす
void NeoPixelCtrl::patternOff()
{
    for(int i=0;i<LED_MAX;i++){
        pixels.setPixelColor(i, pixels.Color(0,0,0));
    }
}

// ひといろ
void NeoPixelCtrl::patternOneColor()
{
    for(int i=0;i<LED_MAX;i++){
        pixels.setPixelColor(i, pixels.ColorHSV(H1,S1,255));
    }
}

// ふたいろ
void NeoPixelCtrl::patternTwoColor()
{
    // ratio = 256 ～ 0 ～ 256 (周期 T_2color)
    int ratio = abs(-256 + 512 * ((DELTA_T * n_cnt) % T_2color) / T_2color);
    
    // 2色の中間色
    int h = (H1*ratio + H2*(256 - ratio)) / 256;
    int s = (S1*ratio + S2*(256 - ratio)) / 256;
    
    for(int i=0;i<LED_MAX;i++){
        pixels.setPixelColor(i, pixels.ColorHSV(h,s,255));
    }
}

// ほたる
void NeoPixelCtrl::patternFade()
{
    // fade = 255 ～ 0 ～ 255 (周期 T_fade)
    int fade = abs(-255 + 510 * ((DELTA_T * n_cnt) % T_fade) / T_fade);
    
    for(int i=0;i<LED_MAX;i++){
        pixels.setPixelColor(i, pixels.ColorHSV(H1,S1,fade));
    }
}

// ぐるぐる
void NeoPixelCtrl::patternRound()
{
#if 0
    // offset = 0 ～ LED_MAX-1 (周期 T_round)
    int offset = LED_MAX * ((DELTA_T * n_cnt) % T_round) / T_round;
    
    for(int i=0;i<LED_MAX;i++){
        
        int ratio = abs(2 * ((i + offset) % LED_MAX) - LED_MAX);
        
        // 2色の中間色
        int h = (H1*ratio + H2*(LED_MAX - ratio)) / LED_MAX;
        int s = (S1*ratio + S2*(LED_MAX - ratio)) / LED_MAX;
        pixels.setPixelColor(i, pixels.ColorHSV(h,s,255));
    }
#else
    // ratio = 256 ～ 0 ～ 256 (周期 T_round)
    int ratio = abs(-256 + 512 * ((DELTA_T * n_cnt) % T_round) / T_round);
    
    for(int i=0;i<LED_MAX;i++){
        
        // ratio = 256 ～ 0 ～ 256 (周期 T_round)
        int offset = (T_round * i) / LED_MAX;
        int ratio = abs(-256 + 512 * ((DELTA_T * n_cnt + offset) % T_round) / T_round);
        
        // 2色の中間色
        int h = (H1*ratio + H2*(256 - ratio)) / 256;
        int s = (S1*ratio + S2*(256 - ratio)) / 256;
        pixels.setPixelColor(i, pixels.ColorHSV(h,s,255));
    }
#endif
}

// ゆらめき
void NeoPixelCtrl::patternFluction()
{
    static int cnt = 0;
    cnt++;
    if(cnt >= T_fluct / DELTA_T){
        cnt = 0;
        for(int i=0;i<LED_MAX;i++){
            
            // ゆらぎの計算
//          float fh = fluct[i][F_HUE].calc() * 2.0 - 1.0; // -1.0 ～ 1.0
//          float fs = fluct[i][F_SAT].calc(); // 0.0 ～ 1.0
            float fc = fluct[i][F_COL].calc(); // 0.0 ～ 1.0
            float fv = fluct[i][F_VAL].calc(); // 0.0 ～ 1.0
            
//          uint16_t h = H1 + (int)((float)0x10000 * dH * fh);
//          int s = (int)((float)S1 * (1.0 - dS * fs));
            int h = (int)((float)H1 * (1.0F - dC * fc) + (float)H2 * dC * fc);
            int s = (int)((float)S1 * (1.0F - dC * fc) + (float)S2 * dC * fc);
            int v = (int)( 255.0F   * (1.0F - dV * fv));
            
            pixels.setPixelColor(i, pixels.ColorHSV(h,s,v));
        }
    }
}

// 設定の取得
void NeoPixelCtrl::getParams(
    uint8_t &brightness,
    uint16_t &H1, uint8_t &S1,
    uint16_t &H2, uint8_t &S2,
    int &T_2color, int &T_fade, int &T_round, int &T_fluct,
    float &dC, float &dV,
    Iluminetion &pattern
    )
{
    brightness  = this->brightness;
    H1          = this->H1;
    S1          = this->S1;
    H2          = this->H2;
    S2          = this->S2;
    T_2color    = this->T_2color;
    T_fade      = this->T_fade;
    T_round     = this->T_round;
    T_fluct     = this->T_fluct;
    dC          = this->dC;
    dV          = this->dV;
    pattern     = this->pattern;
}
