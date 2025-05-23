import ICommunicationMethod from './ICommunicationMethod.js';
import { SerialPort, ReadlineParser } from 'serialport';

class SerialCommunication extends ICommunicationMethod {
  constructor(callback) {
    super(callback);
    this.connected = false;
    this.baudRate = 115200; // Corrected common baud rate
    this.port = null;
    this.parser = null;
    this.callback = callback;

    // List available ports and connect to Arduino
    SerialPort.list().then((ports) => {
      const portObject = ports.find(
        (port) => port.manufacturer && port.manufacturer.includes('Arduino')
      );
      if (!portObject) {
        console.error('No Arduino device found.');
        return;
      }
      this.port = new SerialPort({
        path: portObject.path,
        baudRate: this.baudRate,
        autoOpen: false,
      });

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      this.port.on('open', () => {
        this.connected = true;
        console.log(`Serial port opened: ${portObject.path}`);
        if (this.callback) this.callback('connected');
      });

      this.port.on('error', (err) => {
        this.connected = false;
        console.error('Serial port error:', err.message);
        if (this.callback) this.callback('error', err.message);
      });

      this.port.on('close', () => {
        this.connected = false;
        console.log('Serial port closed');
        if (this.callback) this.callback('disconnected');
      });

      this.parser.on('data', (data) => {
        console.log('Received from serial:', data.trim());
        if (this.callback) this.callback('data', data.trim());
      });

      this.port.open((err) => {
        if (err) {
          console.error('Failed to open serial port:', err.message);
        }
      });
    });
  }

  connect() {
    if (this.port && !this.port.isOpen) {
      this.port.open((err) => {
        if (err) {
          console.error('Error opening port:', err.message);
        }
      });
    }
  }

  checkConnection() {
    return this.connected;
  }

  write(data) {
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        return reject(new Error('Serial port not open'));
      }
      const dataToSend = typeof data === 'string' ? data : JSON.stringify(data);
      this.port.write(dataToSend + '\n', (err) => {
        if (err) {
          console.error('Error writing to serial:', err.message);
          return reject(err);
        }
        resolve({ description: 'Writing to Serial', value: dataToSend });
      });
    });
  }

  writeRaw(dataString) {
    return this.write(dataString);
  }

  read() {
    // Reading is event-driven; use the callback to handle incoming data.
    // Optionally, you could implement a Promise that resolves on next data event.
    return Promise.resolve({
      description: 'Read is event-driven. Listen for "data" events.',
      value: '',
    });
  }

  async closePort() {
    if (this.port && this.port.isOpen) {
      return new Promise((resolve, reject) => {
        this.port.close((err) => {
          if (err) {
            console.error('Error closing serial port:', err.message);
            return reject(err);
          }
          resolve();
        });
      });
    }
  }

  // Event handlers for compatibility
  onSerialErrorOccurred(error) {
    console.error('Serial error:', error);
  }

  onSerialConnectionOpened() {
    console.log('Serial connection opened');
  }

  onDisconnected() {
    console.log('Serial connection closed');
  }

  receive(eventSender, newData) {
    // Custom handler for received data if needed
    console.log('Received:', newData);
  }
}

export default SerialCommunication;