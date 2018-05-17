var awsIot = require('aws-iot-device-sdk');
var SerialPort = require("serialport");
var serialPort = new SerialPort('/dev/ttyS0', {
baudRate: 9600});

var clientTokenUpdate;
var sessionidnumber;
var local_sessionid = "46";//tam thoi

var thingShadows = awsIot.thingShadow({
   keyPath: './certs/ef21fe66d7-private.pem.key',
  certPath: './certs/ef21fe66d7-certificate.pem.crt',
    caPath: './certs/root-CA.crt',
  clientId: 'nameThang',
      host: 'aupu5tnzgckec.iot.ap-southeast-1.amazonaws.com'

});


var i = 0;
var buffer = {
    "container": {
      "action": "turn on",
      "device": "light",
      "id": "01",
      "room": "living room",
      "mode": "set",
      "sessionid": "1",
      "lux": "100"
    }
  }


// lang nghe thingShadow

thingShadows.on('delta',
    function(thingName, stateObject) {
       console.log('SSID: '+ JSON.stringify(stateObject.state.Data.container.sessionid)); // dang string
       console.log('SSID2: '+ stateObject.state.Data.container.sessionid); // dang json
       sessionid = stateObject.state.Data.container.sessionid;
       sessionidnumber = Number(sessionid);
       sessionidnumber = sessionidnumber + 1;
       buffer.container.sessionid = sessionidnumber;

       if(sessionid == null)
       {
         console.log("Error: SSID rong~");
       }
       else {
          if(sessionid != local_sessionid ) //Neu SSID Thay doi
          {
            // convent
            serialPort.write('@')


            if (stateObject.state.Data.container.device == 'Light') {
              serialPort.write('L')
              serialPort.write(stateObject.state.Data.container.id)
            }
            if (stateObject.state.Data.container.device == 'Fan') {
              serialPort.write('F')
              serialPort.write(stateObject.state.Data.container.id)
            }
            if (stateObject.state.Data.container.device == 'TV') {
              serialPort.write('V')
              serialPort.write(stateObject.state.Data.container.id)
            }

            //console.log(stateObject.state.Data.container.room);
            if (stateObject.state.Data.container.room == 'Bed Room') {
              serialPort.write('B')
            }
            if (stateObject.state.Data.container.room == 'Kitchen') {
              serialPort.write('K')
            }
            if (stateObject.state.Data.container.room == 'Living Room') {
              serialPort.write('R')
            }

            //console.log(buffer.container.action);
            if (stateObject.state.Data.container.action == 'Turn On') {
              serialPort.write('X')
            }
            if (stateObject.state.Data.container.action == 'Turn Off') {
              serialPort.write('Y')
            }

            //console.log(buffer.container.mode);
            if (stateObject.state.Data.container.mode == 'Auto') {
              serialPort.write('A')
            }
            if (stateObject.state.Data.container.mode == 'SET') {
              serialPort.write('S')
            }
              serialPort.write('x')

            //updat firmware
            console.log('OK');
          }
          else {
            console.log('Error 2: SSID trung`');
          }
       }
       // console.log('received delta on '+thingName+': '+
       //             JSON.stringify(stateObject));
    });
// Nhan serial PORT tu device
serialPort.on('open',onOpen);
serialPort.on('data',onData);

function onOpen(){
  console.log("Open connected serialport");
}

var _data ='';
var i = 0;
//ham nay la ham nhan du lieu, dung co dung vao
function onData(data){
 
	if(String.fromCharCode(data[String(data).length-1])=='x'){
		data=String(data);
		_data=_data+data;
		convertdata(_data);
	}

	if(String(data[0])=='64'){

		_data = '';
	}
	
	data=String(data);
	_data=_data+data;
	

}

//ham nay la ham convert data 
//mac dinh __data nhan duoc co typeof = String
function convertdata (__data){
	
	console.log("_________");
	console.log(__data);

	dosomething(_data);
	
}
thingShadows.register('Thang-Test', {}, function () {
})


function dosomething(fdata){
  //switch - case is here !!!
  //data = String(data);
  console.log('Data receive: '+fdata); // show buff nhan duoc
  //console.log(fdata[0]);
  //-----------------@L1OLS100----------------------------
  var n = 9;
  for (var i = 0; i < n; i++) {
    switch (fdata[i]) {
      case '@':
        if(i == 0)
        break;

      case 'F':

        if (i == 1) {
          i++;
          buffer.container.device = 'Fan';
          buffer.container.id=fdata[i];
          break;
        }

      case 'L':

        if (i == 1) {
          i++;
          buffer.container.device = 'Light';
          buffer.container.id=fdata[i];
          break;
        }
      case 'V':

        if (i == 1) {
          i++;
          buffer.container.device = 'TV';
          buffer.container.id=fdata[i];
          break;
        }

      case 'B':
        if(i ==3){
            buffer.container.room = 'Bed Room';
            break;
        }
      case 'K':
        if(i ==3){
            buffer.container.room = 'Kitchen Room';
            break;
        }
      case 'R':
        if(i ==3){
            buffer.container.room = 'Living Room';
            break;
            }

      case 'X':
        if(i ==4){
            buffer.container.action = 'Turn On'; // 1 la bat
            break;
        }
      case 'Y':
        if(i ==4){
            buffer.container.action = 'Turn Off'; // 0 la tat
            break;
        }
      case 'S':
        if(i ==5){
            buffer.container.mode = 'SET';
            for( i = 6; i< 9; i++)
            {
              buffer.container.lux=fdata[6]+fdata[7]+fdata[8];
            }
            break;
        }
      case 'A':
        if(i ==5){
            buffer.container.mode = 'Auto';
            for( i = 6; i< 9; i++)
            {
              buffer.container.lux=fdata[6]+fdata[7]+fdata[8];
            }

            break;
        }

      default:
        i = n - 1;
        console.log('SAI HET ROI, NHAP LAI CHUOI');
        break;
    }
  }

  var updateshadow = {"state":{"desired":{"Data": buffer}}}
    clientToken = thingShadows.update('Thang-Test', updateshadow);

      if (clientToken === null)
      {
        console.log('Update error');
      }
      else {
        console.log('Update successfull: '+clientToken);
      }
  console.log(buffer);
  }