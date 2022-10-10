#include "BleNeoPixel.h"

// BLEサービス
BLEService svcNeoPixel("446FF1A9-5023-26F0-1065-3AA7A53A8483");

// BLEキャラクタリスティック
typedef BLEByteCharacteristic           CHR_U8;
typedef BLEUnsignedShortCharacteristic  CHR_U16;

CHR_U8  chrBrightness("8C9C438A-ED7E-1538-488C-FC98E4312F55", BLERead | BLEWrite);
CHR_U16 chrH1        ("602C80A4-B3C0-79A4-8FCE-51B5322BAF8B", BLERead | BLEWrite);
CHR_U8  chrS1        ("962CC211-E355-7B44-EB55-D2503E14B83F", BLERead | BLEWrite);
CHR_U16 chrH2        ("AC2A3C37-5EEC-862C-6B75-97335387531C", BLERead | BLEWrite);
CHR_U8  chrS2        ("1685F91C-ADDA-6B15-496B-039DCBF642DC", BLERead | BLEWrite);
CHR_U16 chrT_2color  ("9D5FD8C0-9DE3-16E4-E89C-DAC40B2F81A2", BLERead | BLEWrite);
CHR_U16 chrT_fade    ("F61AE49D-D036-CD18-F3BA-025D7B93CC6B", BLERead | BLEWrite);
CHR_U16 chrT_round   ("66070B87-2B7F-001B-663F-E1110C37F642", BLERead | BLEWrite);
CHR_U16 chrT_fluct   ("5587D9AB-1927-A85C-A9C1-114DFC660496", BLERead | BLEWrite);
CHR_U8  chrDC        ("6EA7F285-3202-F28A-C609-C48CD759AB90", BLERead | BLEWrite);
CHR_U8  chrDV        ("81765DA4-71CF-79BC-8E1E-A23130995444", BLERead | BLEWrite);
CHR_U8  chrPattern   ("7D5C1067-D1A7-A8E8-9DD0-41CBE5E25F0A", BLERead | BLEWrite);

// 初期化
void BleNeoPixel::begin(NeoPixelCtrl& controller)
{
    isConnected = false;
    
    // NeoPixelコントローラの設定値を取得
    this->controller = &controller;
    
    uint8_t brightness;
    uint16_t H1, H2;
    uint8_t  S1, S2;
    int T_2color, T_fade, T_round, T_fluct;
    float dC, dV;
    Iluminetion pattern;
    
    this->controller->getParams(
        brightness,
        H1, S1, H2, S2,
        T_2color, T_fade, T_round, T_fluct,
        dC, dV,
        pattern
        );
    
    uint8_t bDC = (uint8_t)(dC * 100.0F + 0.5F);
    uint8_t bDV = (uint8_t)(dV * 100.0F + 0.5F);
    
    // BLEの開始
    if (!BLE.begin()) {
        Serial.println("ERROR: starting BLE module failed!");
        while (1);
    }
    
    // アドバタイズするローカル名とサービスを設定
    BLE.setLocalName("NeoPixel");
    BLE.setAdvertisedService(svcNeoPixel);

    // サービスにキャラクタリスティックを追加
    svcNeoPixel.addCharacteristic(chrBrightness);
    svcNeoPixel.addCharacteristic(chrH1        );
    svcNeoPixel.addCharacteristic(chrS1        );
    svcNeoPixel.addCharacteristic(chrH2        );
    svcNeoPixel.addCharacteristic(chrS2        );
    svcNeoPixel.addCharacteristic(chrT_2color  );
    svcNeoPixel.addCharacteristic(chrT_fade    );
    svcNeoPixel.addCharacteristic(chrT_round   );
    svcNeoPixel.addCharacteristic(chrT_fluct   );
    svcNeoPixel.addCharacteristic(chrDC        );
    svcNeoPixel.addCharacteristic(chrDV        );
    svcNeoPixel.addCharacteristic(chrPattern   );
    
    // サービスを追加
    BLE.addService(svcNeoPixel);

    // キャラクタリスティックの初期値を設定
    chrBrightness.writeValue(brightness);
    chrH1        .writeValue(H1);
    chrS1        .writeValue(S1);
    chrH2        .writeValue(H2);
    chrS2        .writeValue(S2);
    chrT_2color  .writeValue((uint16_t)T_2color);
    chrT_fade    .writeValue((uint16_t)T_fade);
    chrT_round   .writeValue((uint16_t)T_round);
    chrT_fluct   .writeValue((uint16_t)T_fluct);
    chrDC        .writeValue(bDC);
    chrDV        .writeValue(bDV);
    chrPattern   .writeValue((uint8_t)pattern);
    
    // アドバタイズ開始
    BLE.advertise();
}

// タスク
void BleNeoPixel::task()
{
    if(!isConnected){
        central = BLE.central();
        if (central)
        {
            isConnected = true;
            Serial.print("BLE Connected to central: ");
            Serial.println(central.address());
        }
    }else{
        if(central.connected())
        {
            // キャラクタリスティックへのWRITEがあれば処理
            
            // 明るさ
            if (chrBrightness.written())
            {
                uint8_t brightness = chrBrightness.value();
                controller->setBrightness(brightness);
            }
            // 色1
            if (chrH1.written() || chrS1.written())
            {
                uint16_t H1 = chrH1.value();
                uint8_t  S1 = chrS1.value();
                controller->setColor1(H1, S1);
            }
            // 色2
            if (chrH2.written() || chrS2.written())
            {
                uint16_t H2 = chrH2.value();
                uint8_t  S2 = chrS2.value();
                controller->setColor2(H2, S2);
            }
            // ふたいろの周期
            if (chrT_2color.written())
            {
                int T_2color = chrT_2color.value();
                controller->setT_2color(T_2color);
            }
            // ほたるの周期
            if (chrT_fade.written())
            {
                int T_fade = chrT_fade.value();
                controller->setT_fade(T_fade);
            }
            // ぐるぐるの周期
            if (chrT_round.written())
            {
                int T_round = chrT_round.value();
                controller->setT_round(T_round);
            }
            // ゆらめきの更新周期
            if (chrT_fluct.written())
            {
                int T_fluct = chrT_fluct.value();
                controller->setT_fluct(T_fluct);
            }
            // ゆらぎ
            if (chrDC.written() || chrDV.written())
            {
                int c = chrDC.value();
                int v = chrDV.value();
                controller->setFluctuation(c, v);
            }
            // 発光パターン
            if (chrPattern.written())
            {
                uint8_t bPattern = chrPattern.value();
                Iluminetion pattern = (Iluminetion)bPattern;
                controller->setPattern(pattern);
            }
            
        }else{
            isConnected = false;
            Serial.print(F("BLE Disconnected from central: "));
            Serial.println(central.address());
        }
    }
}
