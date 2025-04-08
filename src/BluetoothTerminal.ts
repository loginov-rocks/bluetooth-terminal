/**
 * Bluetooth Terminal class.
 */
class BluetoothTerminal {
  private _serviceUuid: number | string = 0xFFE0;
  private _characteristicUuid: number | string = 0xFFE1;
  private _receiveSeparator: string = '\n';
  private _sendSeparator: string = '\n';
  private _onConnectCallback: (() => void) | null = null;
  private _onDisconnectCallback: (() => void) | null = null;
  private _onReceiveCallback: ((data: string) => void) | null = null;

  /**
   * Characteristic object cache.
   */
  private _characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Characteristic value size.
   */
  private _characteristicValueSize: number = 20;

  /**
   * Device object cache.
   */
  private _device: BluetoothDevice | null = null;

  /**
   * Buffer containing not separated data.
   */
  private _receiveBuffer: string = '';

  private _boundCharacteristicValueChangedListener: EventListenerOrEventListenerObject;
  private _boundGattServerDisconnectedListener: EventListenerOrEventListenerObject;

  /**
   * Create preconfigured Bluetooth Terminal instance.
   * @param [serviceUuid]           Optional service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)
   * @param [characteristicUuid]    Optional characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit
   *                                  UUID)
   * @param [receiveSeparator]      Optional receive separator with length equal to one character
   * @param [sendSeparator]         Optional send separator with length equal to one character
   * @param [onConnectCallback]     Optional callback for connection completion
   * @param [onDisconnectCallback]  Optional callback for disconnection
   */
  public constructor(
      serviceUuid: number | string = 0xFFE0,
      characteristicUuid: number | string = 0xFFE1,
      receiveSeparator: string = '\n',
      sendSeparator: string = '\n',
      onConnectCallback?: () => void,
      onDisconnectCallback?: () => void,
  ) {
    // Bind listeners to this instance.
    this._boundCharacteristicValueChangedListener = this._characteristicValueChangedListener.bind(this);
    this._boundGattServerDisconnectedListener = this._gattServerDisconnectedListener.bind(this);

    // Configure with specified parameters.
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);
    this.setReceiveSeparator(receiveSeparator);
    this.setSendSeparator(sendSeparator);
    this.onConnect(onConnectCallback);
    this.onDisconnect(onDisconnectCallback);
  }

  /**
   * Set integer or string representing service UUID used.
   * @param uuid Service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BluetoothUUID
   */
  public setServiceUuid(uuid: number | string): void {
    if (!Number.isInteger(uuid) && typeof uuid !== 'string') {
      throw new Error('Service UUID must be either an integer or a string');
    }

    if (uuid === 0) {
      throw new Error('Service UUID cannot be zero');
    }

    if (typeof uuid === 'string' && uuid.trim() === '') {
      throw new Error('Service UUID cannot be an empty string');
    }

    this._serviceUuid = uuid;
  }

  /**
   * Set integer or string representing characteristic UUID used.
   * @param uuid Characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/BluetoothUUID
   */
  public setCharacteristicUuid(uuid: number | string): void {
    if (!Number.isInteger(uuid) && typeof uuid !== 'string') {
      throw new Error('Characteristic UUID must be either an integer or a string');
    }

    if (uuid === 0) {
      throw new Error('Characteristic UUID cannot be zero');
    }

    if (typeof uuid === 'string' && uuid.trim() === '') {
      throw new Error('Characteristic UUID cannot be an empty string');
    }

    this._characteristicUuid = uuid;
  }

  /**
   * Set characteristic value size.
   * @param size Characteristic value size as a positive integer
   */
  public setCharacteristicValueSize(size: number): void {
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error('Characteristic value size must be a positive integer');
    }

    this._characteristicValueSize = size;
  }

  /**
   * Set character representing separator for data coming from the connected device, end of line for example.
   * @param separator Receive separator with length equal to one character
   */
  public setReceiveSeparator(separator: string): void {
    if (typeof separator !== 'string') {
      throw new Error('Receive separator must be a string');
    }

    if (separator.length !== 1) {
      throw new Error('Receive separator length must be equal to one character');
    }

    this._receiveSeparator = separator;
  }

  /**
   * Set string representing separator for data coming to the connected device, end of line for example.
   * @param separator Send separator with length equal to one character
   */
  public setSendSeparator(separator: string): void {
    if (typeof separator !== 'string') {
      throw new Error('Send separator must be a string');
    }

    if (separator.length !== 1) {
      throw new Error('Send separator length must be equal to one character');
    }

    this._sendSeparator = separator;
  }

  /**
   * Set a callback that will be called after the device is fully connected and communication has started.
   * @deprecated
   * @param [callback] Callback for successful connection; omit or pass null/undefined to remove
   */
  public setOnConnected(callback?: (() => void) | null): void {
    this.onConnect(callback);
  }

  /**
   * Set a callback that will be called after the device is fully connected and communication has started.
   * @param [callback] Callback for successful connection; omit or pass null/undefined to remove
   */
  public onConnect(callback?: (() => void) | null): void {
    this._onConnectCallback = callback || null;
  }

  /**
   * Set a callback that will be called after the device is disconnected.
   * @deprecated
   * @param [callback] Callback for disconnection; omit or pass null/undefined to remove
   */
  public setOnDisconnected(callback?: (() => void) | null): void {
    this.onDisconnect(callback);
  }

  /**
   * Set a callback that will be called after the device is disconnected.
   * @param [callback] Callback for disconnection; omit or pass null/undefined to remove
   */
  public onDisconnect(callback?: (() => void) | null): void {
    this._onDisconnectCallback = callback || null;
  }

  /**
   * Set a callback that will be called when incoming data from the connected device received.
   * @param [callback] Callback for incoming data; omit or pass null/undefined to remove
   */
  public onReceive(callback?: ((data: string) => void) | null): void {
    this._onReceiveCallback = callback || null;
  }

  /**
   * Launch the browser Bluetooth device picker, connect to the selected device, and start communication.
   * If set, the `onConnected()` callback function will be executed after the connection starts.
   * @returns Promise that resolves when the device is fully connected and communication started, or rejects if an
   *   error occurs.
   */
  public async connect(): Promise<void> {
    if (!this._device) {
      this._device = await this._requestBluetoothDevice();
    }

    this._device.addEventListener('gattserverdisconnected', this._boundGattServerDisconnectedListener);

    await this._connectToDevice(this._device);

    if (this._onConnectCallback) {
      this._onConnectCallback();
    }
  }

  /**
   * Disconnect from the currently connected device.
   * If set, the `onDisconnected()` callback function will be executed after the disconnection.
   */
  public disconnect(): void {
    if (!this._device) {
      return;
    }

    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged',
          this._boundCharacteristicValueChangedListener);
      this._characteristic = null;
    }

    this._device = null;

    if (this._onDisconnectCallback) {
      this._onDisconnectCallback();
    }
  }

  /**
   * Handler for incoming data from the connected device. Override this method to process data received from the
   * connected device.
   * @deprecated
   * @param data String data received from the connected device
   */
  public receive(data: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Handle incoming data.
  }

  /**
   * Send data to the connected device. The data is automatically split into chunks if it exceeds the characteristic
   * value size.
   * @param data String data to be sent to the connected device
   * @returns Promise that resolves when all data has been sent, or rejects if an error occurs
   */
  public async send(data: string): Promise<void> {
    // Convert data to the string using global object.
    data = String(data || '');

    // Return rejected promise immediately if data is empty.
    if (!data) {
      throw new Error('Data must be not empty');
    }

    data += this._sendSeparator;

    // Split data to chunks by characteristic value size.
    const chunks = BluetoothTerminal._splitByLength(data, this._characteristicValueSize);

    // Return rejected promise immediately if there is no connected device.
    if (!this._characteristic) {
      throw new Error('There is no connected device');
    }

    // Write first chunk to the characteristic immediately.
    await this._writeToCharacteristic(this._characteristic, chunks[0]);

    // Iterate over chunks if there are more than one of it.
    for (let i = 1; i < chunks.length; i++) {
      // Reject promise if the device has been disconnected.
      if (!this._characteristic) {
        throw new Error('Device has been disconnected');
      }

      // Write chunk to the characteristic and resolve the promise.
      await this._writeToCharacteristic(this._characteristic, chunks[i]);
    }
  }

  /**
   * Get the name of the currently connected device.
   * @returns Name of the connected device or an empty string if no device is connected
   */
  public getDeviceName(): string {
    if (!this._device || !this._device.name) {
      return '';
    }

    return this._device.name;
  }

  /**
   * Connect to device.
   * @param device Device
   * @returns Promise.
   */
  private async _connectToDevice(device: BluetoothDevice): Promise<void> {
    try {
      const characteristic = await this._connectDeviceAndCacheCharacteristic(device);
      // `await` is required here so errors from `_startNotifications` are caught in the try/catch block.
      await this._startNotifications(characteristic);
    } catch (error) {
      this._log(error);

      throw error;
    }
  }

  /**
   * Disconnect from device.
   * @param device Device
   */
  private _disconnectFromDevice(device: BluetoothDevice): void {
    if (!device.gatt) {
      throw new Error('GATT is missing');
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected', this._boundGattServerDisconnectedListener);

    if (!device.gatt.connected) {
      this._log('"' + device.name + '" bluetooth device is already disconnected');

      return;
    }

    device.gatt.disconnect();

    this._log('"' + device.name + '" bluetooth device disconnected');
  }

  /**
   * Request bluetooth device.
   * @returns Promise.
   */
  private async _requestBluetoothDevice(): Promise<BluetoothDevice> {
    this._log('Requesting bluetooth device...');

    const device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [this._serviceUuid],
      }],
    });

    this._log('"' + device.name + '" bluetooth device selected');

    return device;
  }

  /**
   * Connect device and cache characteristic.
   * @param device Device
   * @returns Promise.
   */
  private async _connectDeviceAndCacheCharacteristic(
      device: BluetoothDevice,
  ): Promise<BluetoothRemoteGATTCharacteristic> {
    if (!device.gatt) {
      throw new Error('GATT is missing');
    }

    // Check remembered characteristic.
    if (device.gatt.connected && this._characteristic) {
      return this._characteristic;
    }

    this._log('Connecting to GATT server...');

    const server = await device.gatt.connect();

    this._log('GATT server connected', 'Getting service...');

    const service = await server.getPrimaryService(this._serviceUuid);

    this._log('Service found', 'Getting characteristic...');

    const characteristic = await service.getCharacteristic(this._characteristicUuid);

    this._log('Characteristic found');

    this._characteristic = characteristic; // Remember characteristic.

    return this._characteristic;
  }

  /**
   * Start notifications.
   * @param characteristic Characteristic
   * @returns Promise.
   */
  private async _startNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
    this._log('Starting notifications...');

    await characteristic.startNotifications();

    this._log('Notifications started');

    characteristic.addEventListener('characteristicvaluechanged', this._boundCharacteristicValueChangedListener);
  }

  /**
   * Stop notifications.
   * @param characteristic Characteristic
   * @returns Promise.
   */
  private async _stopNotifications(characteristic: BluetoothRemoteGATTCharacteristic): Promise<void> {
    this._log('Stopping notifications...');

    await characteristic.stopNotifications();

    this._log('Notifications stopped');

    characteristic.removeEventListener('characteristicvaluechanged', this._boundCharacteristicValueChangedListener);
  }

  /**
   * Handle disconnection.
   * @param event Event
   */
  private _gattServerDisconnectedListener(event: Event): void {
    // `event.target` will be `BluetoothDevice` when event triggered with this listener.
    const device = event.target as BluetoothDevice;

    this._log('"' + device.name + '" bluetooth device disconnected, trying to reconnect...');

    if (this._onDisconnectCallback) {
      this._onDisconnectCallback();
    }

    // Using IIFE to leverage async/await while maintaining the void return type required by the event handler
    // interface.
    (async () => {
      try {
        const characteristic = await this._connectDeviceAndCacheCharacteristic(device);
        await this._startNotifications(characteristic);
      } catch (error) {
        this._log(error);

        return;
      }

      if (this._onConnectCallback) {
        this._onConnectCallback();
      }
    })();
  }

  /**
   * Handle characteristic value changed.
   * @param event Event
   */
  private _characteristicValueChangedListener(event: Event): void {
    // `event.target` will be `BluetoothRemoteGATTCharacteristic` when event triggered with this listener.
    const value = new TextDecoder().decode((event.target as BluetoothRemoteGATTCharacteristic).value);

    for (const c of value) {
      if (c === this._receiveSeparator) {
        const data = this._receiveBuffer.trim();
        this._receiveBuffer = '';

        if (data) {
          this.receive(data);

          if (this._onReceiveCallback) {
            this._onReceiveCallback(data);
          }
        }
      } else {
        this._receiveBuffer += c;
      }
    }
  }

  /**
   * Write to characteristic.
   * @param characteristic Characteristic
   * @param data Data
   * @returns Promise.
   */
  private async _writeToCharacteristic(characteristic: BluetoothRemoteGATTCharacteristic, data: string): Promise<void> {
    await characteristic.writeValue(new TextEncoder().encode(data));
  }

  /**
   * Log.
   * @param messages Messages
   */
  private _log(...messages: unknown[]): void {
    console.log(...messages);
  }

  /**
   * Split by length.
   * @param string String
   * @param length Length
   * @returns Array.
   */
  private static _splitByLength(string: string, length: number): string[] {
    const matches = string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));

    if (!matches) {
      return [];
    }

    return matches;
  }
}

// Conditionally export the class as CommonJS module for browser vs Node.js compatibility.
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = BluetoothTerminal;
}
