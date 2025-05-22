import ICommunicationMethod from './ICommunicationMethod.js';
import { SerialPort } from 'serialport'

class SerialCommunication extends ICommunicationMethod {
  constructor(callback) {
    super(callback);
    this.connected = false;
    this.pendingReadPromise = null;
    this.pendingReadResolve = null;
    this.baudRate = 11520;

    this.port = null;

    console.log("SerialPort.list());");
    //this.port = new SerialPort({ path: '/dev/robot', baudRate: this.baudRate })
    SerialPort.list().then((response) => {
      console.log(response);
      // Create a port
      // look for manufacturer: 'Arduino (www.arduino.cc)', in the response list, and get path
      const portObject = response.find(port => port.manufacturer === 'Arduino (www.arduino.cc)');

      let path = portObject.path;
      try {
        this.port = new SerialPort({
          path: path,
          baudRate: this.baudRate,
        })
      } catch (error) {
        console.error('Error creating SerialPort:', error);
      }

    });


  }

  connect() {
    let returnObject = {
      description: "Connected",
      value: true,
    }
    return new Promise((resolve, reject) => {
      console.log('Requesting Serial Device...');
      if (!this.serial.isOpen()) {
        this.serial.connectAndOpen(null, this.serialOptions).then(() => {
          // todo: this.serial.isOpen returns null at this point
          returnObject.value = this.serial.isOpen();
          resolve(returnObject);
        }).catch(error => {
          returnObject.description = "Error";
          returnObject.value = error;
          resolve(returnObject);
        });
      } else {
        this.serial.autoConnectAndOpenPreviouslyApprovedPort(this.serialOptions).then(() => {
          resolve(returnObject);
        }).catch(error => {
          returnObject.description = "Error";
          returnObject.value = error;
          resolve(returnObject);

        });
      }
    });
  }

  checkConection() {

  }
  serialConnectec() {

  }

  write(data) {
    let returnObject = {
      description: "Writing to Serial",
      value: "",
    }

    //
    console.log("write data", data);

    let dataToSend = "" + data.name + "" + data.value;

    return new Promise((resolve, reject) => {

      resolve(returnObject);
    });
  }

  writeRaw(DataString) {
    let returnObject = {
      description: "Writing to Serial",
      value: "",
    }

    //
    console.log("write data", DataString);

    let dataToSend = DataString;

    return new Promise((resolve, reject) => {

      resolve(returnObject);
    });
  }

  read(data) {
    console.log("waiting for read response");
    // todo: need to make a time out incase there is not response!
    let returnObject = {
      description: "",
      value: "",
    }

    data.resolved = false; // use this for keeping track of resolution 
    //

    let dataToSend = "" + data.name;

    return new Promise((resolve, reject) => {

    });
  }

  async closePort() {

  }
  /// 
  onSerialErrorOccurred() {
    //console.log("onSerialErrorOccurred");
    //console.log(error);
  }

  onSerialConnectionOpened(eventSender) {

  }

  onDisconnected(eventSender) {

  }

  receive(eventSender, newData) {

  }
}

export default SerialCommunication;