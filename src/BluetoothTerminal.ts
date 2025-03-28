/**
 * Bluetooth Terminal class.
 */
export default class BluetoothTerminal {
  /**
   * Buffer containing not separated data.
   */
  private _receiveBuffer: string = '';
  /**
   * Max characteristic value length.
   */
  private _maxCharacteristicValueLength: number = 20;

  private _boundHandleDisconnection: EventListenerOrEventListenerObject;
  private _boundHandleCharacteristicValueChanged: EventListenerOrEventListenerObject;

  private _serviceUuid: number | string = 0xFFE0;
  private _characteristicUuid: number | string = 0xFFE1;
  private _receiveSeparator: string = '\n';
  private _sendSeparator: string = '\n';
  private _onConnected: (() => void) | null = null;
  private _onDisconnected: (() => void) | null = null;

  /**
   * Device object cache.
   */
  private _device: BluetoothDevice | null = null;
  /**
   * Characteristic object cache.
   */
  private _characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  /**
   * Create preconfigured Bluetooth Terminal instance.
   * @param [serviceUuid]         Optional service UUID as an integer (16-bit or 32-bit) or a string (128-bit UUID)
   * @param [characteristicUuid]  Optional characteristic UUID as an integer (16-bit or 32-bit) or a string (128-bit
   *                                UUID)
   * @param [receiveSeparator]    Optional receive separator with length equal to one character
   * @param [sendSeparator]       Optional send separator with length equal to one character
   * @param [onConnected]         Optional callback for connection completion
   * @param [onDisconnected]      Optional callback for disconnection
   */
  public constructor(
      serviceUuid: number | string = 0xFFE0,
      characteristicUuid: number | string = 0xFFE1,
      receiveSeparator: string = '\n',
      sendSeparator: string = '\n',
      onConnected?: () => void,
      onDisconnected?: () => void,
  ) {
    // Bound functions used to add and remove appropriate event handlers.
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this._boundHandleCharacteristicValueChanged = this._handleCharacteristicValueChanged.bind(this);

    // Configure with specified parameters.
    this.setServiceUuid(serviceUuid);
    this.setCharacteristicUuid(characteristicUuid);
    this.setReceiveSeparator(receiveSeparator);
    this.setSendSeparator(sendSeparator);
    this.setOnConnected(onConnected);
    this.setOnDisconnected(onDisconnected);
  }

  /**
   * Set number or string representing service UUID used.
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
   * Set number or string representing characteristic UUID used.
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
   * Set a listener that will be called after the device is fully connected and ready for communication.
   * @param [listener] Callback for connection completion; omit or pass null/undefined to remove
   */
  public setOnConnected(listener?: (() => void) | null): void {
    this._onConnected = listener || null;
  }

  /**
   * Set a listener that will be called after the device is disconnected.
   * @param [listener] Callback for disconnection; omit or pass null/undefined to remove
   */
  public setOnDisconnected(listener?: (() => void) | null): void {
    this._onDisconnected = listener || null;
  }

  /**
   * Launch Bluetooth device chooser and connect to the selected device.
   * @returns Promise which will be fulfilled when notifications will be started or rejected if something went wrong.
   */
  public async connect(): Promise<void> {
    await this._connectToDevice(this._device);

    if (this._onConnected) {
      this._onConnected();
    }
  }

  /**
   * Disconnect from the connected device.
   */
  public disconnect(): void {
    this._disconnectFromDevice(this._device);

    if (this._characteristic) {
      this._characteristic.removeEventListener('characteristicvaluechanged',
          this._boundHandleCharacteristicValueChanged);
      this._characteristic = null;
    }

    this._device = null;

    if (this._onDisconnected) {
      this._onDisconnected();
    }
  }

  /**
   * Data receiving handler which called whenever the new data comes from the connected device, override it to handle
   * incoming data.
   * @param data Data
   */
  public receive(data: string): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Handle incoming data.
  }

  // TODO: Improve readability and consistency by refactoring to async/await.
  /**
   * Send data to the connected device.
   * @param data Data
   * @returns Promise which will be fulfilled when data will be sent or rejected if something went wrong.
   */
  public send(data: string): Promise<void> {
    // Convert data to the string using global object.
    data = String(data || '');

    // Return rejected promise immediately if data is empty.
    if (!data) {
      return Promise.reject(new Error('Data must be not empty'));
    }

    data += this._sendSeparator;

    // Split data to chunks by max characteristic value length.
    const chunks = this.constructor._splitByLength(data, this._maxCharacteristicValueLength);

    // Return rejected promise immediately if there is no connected device.
    if (!this._characteristic) {
      return Promise.reject(new Error('There is no connected device'));
    }

    // Write first chunk to the characteristic immediately.
    let promise = this._writeToCharacteristic(this._characteristic, chunks[0]);

    // Iterate over chunks if there are more than one of it.
    for (let i = 1; i < chunks.length; i++) {
      // Chain new promise.
      promise = promise.then(() => new Promise((resolve, reject) => {
        // Reject promise if the device has been disconnected.
        if (!this._characteristic) {
          reject(new Error('Device has been disconnected'));

          return;
        }

        // Write chunk to the characteristic and resolve the promise.
        this._writeToCharacteristic(this._characteristic, chunks[i]).
            then(() => {
              resolve();
            }).
            catch((error) => {
              reject(error);
            });
      }));
    }

    return promise;
  }

  /**
   * Get the connected device name.
   * @returns Device name or empty string if not connected.
   */
  public getDeviceName(): string {
    if (!this._device || !this._device.name) {
      return '';
    }

    return this._device.name;
  }

  // TODO: Improve readability and consistency by refactoring to async/await.
  /**
   * Connect to device.
   * @param device Device
   * @returns Promise.
   */
  private _connectToDevice(device: BluetoothDevice): Promise<void> {
    return (device ? Promise.resolve(device) : this._requestBluetoothDevice()).
        then((device) => this._connectDeviceAndCacheCharacteristic(device)).
        then((characteristic) => this._startNotifications(characteristic)).
        catch((error) => {
          this._log(error);

          return Promise.reject(error);
        });
  }

  /**
   * Disconnect from device.
   * @param device Device
   */
  private _disconnectFromDevice(device: BluetoothDevice): void {
    if (!device) {
      return;
    }

    if (!device.gatt) {
      throw new Error('GATT is missing');
    }

    this._log('Disconnecting from "' + device.name + '" bluetooth device...');

    device.removeEventListener('gattserverdisconnected', this._boundHandleDisconnection);

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

    this._device = device; // Remember device.
    this._device.addEventListener('gattserverdisconnected', this._boundHandleDisconnection);

    return this._device;
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

    characteristic.addEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
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

    characteristic.removeEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
  }

  // TODO: Improve readability and consistency by refactoring to async/await.
  /**
   * Handle disconnection.
   * @param event Event
   */
  private _handleDisconnection(event: Event): void {
    const device = event.target;

    this._log('"' + device.name + '" bluetooth device disconnected, trying to reconnect...');

    if (this._onDisconnected) {
      this._onDisconnected();
    }

    this._connectDeviceAndCacheCharacteristic(device).
        then((characteristic) => this._startNotifications(characteristic)).
        then(() => {
          if (this._onConnected) {
            this._onConnected();
          }
        }).
        catch((error) => {
          this._log(error);
        });
  }

  /**
   * Handle characteristic value changed.
   * @param event Event
   */
  private _handleCharacteristicValueChanged(event: Event): void {
    const value = new TextDecoder().decode(event.target.value);

    for (const c of value) {
      if (c === this._receiveSeparator) {
        const data = this._receiveBuffer.trim();
        this._receiveBuffer = '';

        if (data) {
          this.receive(data);
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
  private _log(...messages: string[]): void {
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
