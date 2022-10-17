# XIAO BLE で NeoPixel
XIAO BLE で NeoPixel を制御し、Web Bluetooth API でブラウザ上のWebアプリから操作します。

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/QY0mgwFXgrY/0.jpg)](https://www.youtube.com/watch?v=QY0mgwFXgrY)

## ハードウェア要件
- Seeed XIAO BLE nRF52840等、ArduinoBLEライブラリ対応Arduinoボード
- NeoPixel (WS2812B) または互換のシリアルLED
- Web Bluetooth API対応のブラウザ (Chrome等) が動作するPCやスマホ ( iOSは非対応)

## ファイル構成
- DecoLights/ : Arduinoスケッチ
- WebApp/ : Webアプリ

## Arduinoのボード選択
Seeed XIAO BLE nRF52840 の場合、ボードマネージャで「Seeed nRF52 mbed-enabled Boards」をインストールして、「Seeed XIAO BLE - nRF52840」を選択します。「Seeed nRF52 Boards」ではないことに注意してください。

参考記事：[Seeed XIAO BLE nRF52840を試す](https://lipoyang.hatenablog.com/entry/2022/09/18/163140)

## Arduinoの依存ライブラリ
- ArduinoBLE
- Adafruit_NeoPixel
- NanoBLEFlashPrefs

## 結線
- 既定では、D0ピンにNeoPixelを12個接続します。
- NeoPixelCtrl.h の LED_PIN および LED_MAX で変更できます。
- NeoPixelCtrl.h の POWER_ON_OFF を true にすると、NeoPixelの電源ON/OFFをFET等で制御できます。
- 電源制御ピンは POWER_PIN で指定します。



