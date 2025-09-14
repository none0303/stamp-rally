async function getStamp() {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }], // micro:bit のデフォルト名
      optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] // UARTサービスUUID
    });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e");

    // TXキャラクタリスティック（micro:bit → スマホ）
    const txChar = await service.getCharacteristic("6e400003-b5a3-f393-e0a9-e50e24dcca9e");
    // RXキャラクタリスティック（スマホ → micro:bit）
    const rxChar = await service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");

    // データ受信イベント設定
    txChar.addEventListener("characteristicvaluechanged", event => {
      const value = new TextDecoder().decode(event.target.value);
      console.log("受信:", value);
      markStamp(value.trim());
    });
    await txChar.startNotifications();

    // micro:bit に「getId\n」を送る
    await rxChar.writeValue(new TextEncoder().encode("getId\n"));

  } catch (error) {
    console.error(error);
    alert("スタンプ取得に失敗しました: " + error);
  }
}

function markStamp(shopId) {
  const el = document.getElementById(shopId);
  if (el) {
    el.classList.add("stamped");
  } else {
    alert("未知のスタンプID: " + shopId);
  }
}
