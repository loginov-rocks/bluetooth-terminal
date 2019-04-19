/**
 * Bluetooth Terminal class.
 */
export default class BluetoothTerminal {
  /**
   * Create preconfigured Bluetooth Terminal instance.
   *
   * @param {!(number|string)} [serviceUuid=0xFFE0] - Service UUID.
   * @param {!(number|string)} [characteristicUuid=0xFFE1] - Characteristic UUID.
   * @param {string} [receiveSeparator='\n'] - Receive separator.
   * @param {string} [sendSeparator='\n'] - Send separator.
   * @param {Function|undefined} [onConnected=undefined] - Listener for connected event.
   * @param {Function|undefined} [onDisconnected=undefined] - Listener for disconnected event.
   */
  public constructor(serviceUuid = 0xFFE0, characteristicUuid = 0xFFE1, receiveSeparator = '\n', sendSeparator = '\n',
    onConnected = undefined, onDisconnected = undefined) {
    // Used private variables.
    this._receiveBuffer = ''; // Buffer containing not separated data.
    this._maxCharacteristicValueLength = 20; // Max characteristic value length.
    this._device = null; // Device object cache.
    this._characteristic = null; // Characteristic object cache.

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
   *
   * @param {!(number|string)} uuid - Service UUID.
   */
  public setServiceUuid(uuid): void {
    if (!Number.isInteger(uuid) && !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._serviceUuid = uuid;
  }

  /**
   * Set number or string representing characteristic UUID used.
   *
   * @param {!(number|string)} uuid - Characteristic UUID.
   */
  public setCharacteristicUuid(uuid): void {
    if (!Number.isInteger(uuid) && !(typeof uuid === 'string' || uuid instanceof String)) {
      throw new Error('UUID type is neither a number nor a string');
    }

    if (!uuid) {
      throw new Error('UUID cannot be a null');
    }

    this._characteristicUuid = uuid;
  }

  /**
   * Set character representing separator for data coming from the connected device, end of line for example.
   *
   * @param {string} separator - Receive separator with length equal to one character.
   */
  public setReceiveSeparator(separator): void {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._receiveSeparator = separator;
  }

  /**
   * Set string representing separator for data coming to the connected device, end of line for example.
   *
   * @param {string} separator - Send separator.
   */
  public setSendSeparator(separator): void {
    if (!(typeof separator === 'string' || separator instanceof String)) {
      throw new Error('Separator type is not a string');
    }

    if (separator.length !== 1) {
      throw new Error('Separator length must be equal to one character');
    }

    this._sendSeparator = separator;
  }

  /**
   * Set a listener to be called after a device is connected.
   *
   * @param {Function|undefined} listener - Listener for connected event.
   */
  public setOnConnected(listener): void {
    this._onConnected = listener;
  }

  /**
   * Set a listener to be called after a device is disconnected.
   *
   * @param {Function|undefined} listener - Listener for disconnected event.
   */
  public setOnDisconnected(listener): void {
    this._onDisconnected = listener;
  }

  /**
   * Launch Bluetooth device chooser and connect to the selected device.
   *
   * @returns {Promise} Promise which will be fulfilled when notifications will be started or rejected if something went
   * wrong.
   */
  public connect(): Promise<void> {
    return this._connectToDevice(this._device).
      then(() => {
        if (this._onConnected) {
          this._onConnected();
        }
      });
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
   *
   * @param {string} data - Data.
   */
  public receive(data): void { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Handle incoming data.
  }

  /**
   * Send data to the connected device.
   *
   * @param {string} data - Data.
   * @returns {Promise} Promise which will be fulfilled when data will be sent or rejected if something went wrong.
   */
  public send(data): Promise<void> {
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
        }

        // Write chunk to the characteristic and resolve the promise.
        this._writeToCharacteristic(this._characteristic, chunks[i]).
          then(resolve).
          catch(reject);
      }));
    }

    return promise;
  }

  /**
   * Get the connected device name.
   *
   * @returns {string} Device name or empty string if not connected.
   */
  public getDeviceName(): string {
    if (!this._device) {
      return '';
    }

    return this._device.name;
  }

  /**
   * Connect to device.
   *
   * @param {Object} device - Device.
   * @returns {Promise} Promise.
   * @private
   */
  public _connectToDevice(device): Promise<void> {
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
   *
   * @param {Object} device - Device.
   * @returns {undefined} Undefined.
   * @private
   */
  public _disconnectFromDevice(device): void {
    if (!device) {
      return;
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
   *
   * @returns {Promise} Promise.
   * @private
   */
  public _requestBluetoothDevice(): Promise<BluetoothDevice> {
    this._log('Requesting bluetooth device...');

    return navigator.bluetooth.requestDevice({
      filters: [{services: [this._serviceUuid]}],
    }).
      then((device) => {
        this._log('"' + device.name + '" bluetooth device selected');

        this._device = device; // Remember device.
        this._device.addEventListener('gattserverdisconnected', this._boundHandleDisconnection);

        return this._device;
      });
  }

  /**
   * Connect device and cache characteristic.
   *
   * @param {Object} device - Device.
   * @returns {Promise} Promise.
   * @private
   */
  public _connectDeviceAndCacheCharacteristic(device): Promise<BluetoothRemoteGATTCharacteristic> {
    // Check remembered characteristic.
    if (device.gatt.connected && this._characteristic) {
      return Promise.resolve(this._characteristic);
    }

    this._log('Connecting to GATT server...');

    return device.gatt.connect().
      then((server) => {
        this._log('GATT server connected', 'Getting service...');

        return server.getPrimaryService(this._serviceUuid);
      }).
      then((service) => {
        this._log('Service found', 'Getting characteristic...');

        return service.getCharacteristic(this._characteristicUuid);
      }).
      then((characteristic) => {
        this._log('Characteristic found');

        this._characteristic = characteristic; // Remember characteristic.

        return this._characteristic;
      });
  }

  /**
   * Start notifications.
   *
   * @param {Object} characteristic - Characteristic.
   * @returns {Promise} Promise.
   * @private
   */
  public _startNotifications(characteristic): Promise<void> {
    this._log('Starting notifications...');

    return characteristic.startNotifications().
      then(() => {
        this._log('Notifications started');

        characteristic.addEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
      });
  }

  /**
   * Stop notifications.
   *
   * @param {Object} characteristic - Characteristic.
   * @returns {Promise} Promise.
   * @private
   */
  public _stopNotifications(characteristic): Promise<void> {
    this._log('Stopping notifications...');

    return characteristic.stopNotifications().
      then(() => {
        this._log('Notifications stopped');

        characteristic.removeEventListener('characteristicvaluechanged', this._boundHandleCharacteristicValueChanged);
      });
  }

  /**
   * Handle disconnection.
   *
   * @param {Object} event - Event.
   * @returns {undefined} Undefined.
   * @private
   */
  public _handleDisconnection(event): void {
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
      catch((error) => this._log(error));
  }

  /**
   * Handle characteristic value changed.
   *
   * @param {Object} event - Event.
   * @private
   */
  public _handleCharacteristicValueChanged(event): void {
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
   *
   * @param {Object} characteristic - Characteristic.
   * @param {string} data - Data.
   * @returns {Promise} Promise.
   * @private
   */
  public _writeToCharacteristic(characteristic, data): Promise<void> {
    return characteristic.writeValue(new TextEncoder().encode(data));
  }

  /**
   * Log.
   *
   * @param {Array} messages - Messages.
   * @private
   */
  public _log(...messages): void {
    console.log(...messages); // eslint-disable-line no-console
  }

  /**
   * Split by length.
   *
   * @param {string} string - String.
   * @param {number} length - Length.
   * @returns {Array} Array.
   * @private
   */
  public static _splitByLength(string, length): string[] {
    return string.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
  }
}
