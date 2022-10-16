#include "NeoPixelCtrl.h"
#include "BleNeoPixel.h"

NeoPixelCtrl neoPixelCtrl;
BleNeoPixel bleNeoPixel;

// 初期化
void setup()
{
    Serial.begin(115200);
    delay(100);
    
    neoPixelCtrl.begin();
    
    bleNeoPixel.begin(neoPixelCtrl);
}

// メインループ
void loop()
{
    neoPixelCtrl.task();
    bleNeoPixel.task();
    
    // デバッグ用
    if(Serial.available() > 0)
    {
        char c = Serial.read();
        
        switch(c){
            case '0': neoPixelCtrl.setPattern(PTN_OFF);         break;
            case '1': neoPixelCtrl.setPattern(PTN_ONE_COLOR);   break;
            case '2': neoPixelCtrl.setPattern(PTN_TWO_COLOR);   break;
            case '3': neoPixelCtrl.setPattern(PTN_FADE);        break;
            case '4': neoPixelCtrl.setPattern(PTN_ROUND);       break;
            case '5': neoPixelCtrl.setPattern(PTN_FLUCTUATION); break;
        }
    }
}
