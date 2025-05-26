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
        console.log('attempting to reconnect');
        this.port.open((err) => {
          if (err) {
            console.error('Error opening port:', err.message);
          }
        });

      });

      this.port.on('close', () => {
        this.connected = false;
        console.log('Serial port closed');
        if (this.callback) this.callback('disconnected');
      });

      this.parser.on('data', (data) => {
        this.receive(data)
      })

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
        return reject(new Error('Serial port not open, trying to reconnect'));
      }
      const dataToSend = "" + data.name + "" + data.value;
      console.log('Writing to serial:', dataToSend);
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
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        return reject(new Error('Serial port not open'));
      }
      const dataToSend = dataString;
      console.log('Writing to serial:', dataToSend);
      this.port.write(dataToSend + '\n', (err) => {
        if (err) {
          console.error('Error writing to serial:', err.message);
          return reject(err);
        }
        resolve({ description: 'Writing to Serial', value: dataToSend });
      });
    });
  }

  read() {
    console.log("waiting for read response");
    // Reading is event-driven; use the callback to handle incoming data.
    // Optionally, you could implement a Promise that resolves on next data event.
    return new Promise((resolve, reject) => {
      if (!this.port || !this.port.isOpen) {
        return reject(new Error('Serial port not open'));
      }
      const dataToSend = "" + data.name;
      console.log('Writing to serial:', dataToSend);
      this.port.write(dataToSend + '\n', (err) => {
        if (err) {
          console.error('Error writing to serial:', err.message);
          return reject(err);
        }
        resolve({ description: 'Writing to Serial', value: dataToSend });
      });
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

  receive(newData) {
    console.log("new serial communication")
    console.log(newData)

    const parts = newData.split(':');

    if (parts.length === 2) {
      const commandName = parts[0];
      const value = parts[1].trimEnd();

      let updateObject = {
        description: commandName,
        value: value,
        // type: notifyObject.type,
      }

      try {
        console.log(updateObject)
        this.callback(JSON.stringify(updateObject));
      } catch (error) {
        console.log(error)
      }
    }
  }
}



export default SerialCommunication;