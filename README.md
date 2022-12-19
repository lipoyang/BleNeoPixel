# XIAO BLE で NeoPixel
XIAO BLE で NeoPixel を制御し、Web Bluetooth API でブラウザ上のWebアプリから操作します。

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/lPSR9VkZBbk/0.jpg)](https://www.youtube.com/watch?v=lPSR9VkZBbk)

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
- NeoPixelの制御ピンは、NeoPixelCtrl.h の LED_PIN で設定します。(既定は D0 ピン)
- NeoPixelの個数は、NeoPixelCtrl.h の LED_MAX で設定します。 (既定は16個)
- NeoPixelCtrl.h で POWER_ON_OFF を定義すると、NeoPixelの電源をFET等で制御できます。(既定で有効) 
- 電源制御ピンは NeoPixelCtrl.h の POWER_PIN で指定します。 (既定は D1 ピン)
- DecoLights.ino の PIN_VBUS で設定したピンでVBUSを検出します。 (既定は D2 ピン)
- VBUSを検出した場合はシリアルポート接続を待機します。
