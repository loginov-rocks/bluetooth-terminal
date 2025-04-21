// Test file uses `require()` style imports because the BluetoothTerminal module is exported only as a CommonJS module.
/* eslint-disable @typescript-eslint/no-require-imports */
const BluetoothTerminal = require('./BluetoothTerminal');

describe('Logging', () => {
  // Using `any` type to access private members for testing purposes. This allows for thorough testing of the internal
  // state and behavior while maintaining strong encapsulation in the production code.
  let bt: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  beforeEach(() => {
    bt = new BluetoothTerminal();

    jest.spyOn(console, 'debug');
    jest.spyOn(console, 'log');
    jest.spyOn(console, 'info');
    jest.spyOn(console, 'warn');
    jest.spyOn(console, 'error');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('When setting the log level...', () => {
    it('should log all messages when the log level is set to "debug"', () => {
      bt.setLogLevel('debug');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).toHaveBeenCalledWith('[BluetoothTerminal][test] Debug message');
      expect(console.log).toHaveBeenCalledWith('[BluetoothTerminal][test] Log message');
      expect(console.info).toHaveBeenCalledWith('[BluetoothTerminal][test] Info message');
      expect(console.warn).toHaveBeenCalledWith('[BluetoothTerminal][test] Warning message');
      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Test Error"');
    });

    it('should log errors, warnings, info, and log messages when the log level is set to "log"', () => {
      bt.setLogLevel('log');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('[BluetoothTerminal][test] Log message');
      expect(console.info).toHaveBeenCalledWith('[BluetoothTerminal][test] Info message');
      expect(console.warn).toHaveBeenCalledWith('[BluetoothTerminal][test] Warning message');
      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Test Error"');
    });

    it('should log errors, warnings, and info messages when the log level is set to "info"', () => {
      bt.setLogLevel('info');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith('[BluetoothTerminal][test] Info message');
      expect(console.warn).toHaveBeenCalledWith('[BluetoothTerminal][test] Warning message');
      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Test Error"');
    });

    it('should log only errors and warnings when the log level is set to "warn"', () => {
      bt.setLogLevel('warn');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('[BluetoothTerminal][test] Warning message');
      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Test Error"');
    });

    it('should log only errors when the log level is set to "error"', () => {
      bt.setLogLevel('error');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Test Error"');
    });

    it('should not log any messages when the log level is set to "none"', () => {
      bt.setLogLevel('none');

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', new Error('Test Error'), (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('When logging errors...', () => {
    it('should convert non-Error objects to strings', () => {
      bt.setLogLevel('error');

      bt._logError('test', 'Not an Error Object', (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.error).toHaveBeenCalledWith('[BluetoothTerminal][test] Error: "Not an Error Object"');
    });
  });

  describe('When using the internal logging method...', () => {
    it('should throw an error when an unknown log level is provided', () => {
      expect(() => {
        bt._logGeneric('unknown', 'test', 'Test message');
      }).toThrow('Log level must be one of: "none", "error", "warn", "info", "log", "debug"');
    });
  });

  describe('When using the onLog callback...', () => {
    it('should invoke the onLog callback for all messages regardless of the log level set', () => {
      bt.setLogLevel('none');

      const error = new Error('Test Error');
      const onLogCallback = jest.fn();
      bt.onLog(onLogCallback);

      bt._logDebug('test', 'Debug message');
      bt._log('test', 'Log message');
      bt._logInfo('test', 'Info message');
      bt._logWarn('test', 'Warning message');
      bt._logError('test', error, (errorMessage: string) => `Error: "${errorMessage}"`);

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
      // The first callback invocation occurs within the `onLog()` method itself when registering the callback.
      expect(onLogCallback).toHaveBeenCalledTimes(6);
      expect(onLogCallback).toHaveBeenNthCalledWith(2, 'debug', 'test', 'Debug message', undefined);
      expect(onLogCallback).toHaveBeenNthCalledWith(3, 'log', 'test', 'Log message', undefined);
      expect(onLogCallback).toHaveBeenNthCalledWith(4, 'info', 'test', 'Info message', undefined);
      expect(onLogCallback).toHaveBeenNthCalledWith(5, 'warn', 'test', 'Warning message', undefined);
      expect(onLogCallback).toHaveBeenNthCalledWith(6, 'error', 'test', 'Error: "Test Error"', error);
    });

    it('should not invoke the onLog callback after it is removed', () => {
      const onLogCallback = jest.fn();
      bt.onLog(onLogCallback);

      bt._log('test', 'First log message');

      // The first callback invocation occurs within the `onLog()` method itself when registering the callback.
      expect(onLogCallback).toHaveBeenCalledTimes(2);
      expect(onLogCallback).toHaveBeenLastCalledWith('log', 'test', 'First log message', undefined);

      bt.onLog(null);

      bt._log('test', 'Second log message');

      expect(onLogCallback).toHaveBeenCalledTimes(2);
    });
  });
});
