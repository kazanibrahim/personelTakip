/**
 * BCC CALCULATE = Constant ^ Length_H ^ Length_L ^ Command_1 ^ Command_2 ^Data
 | START  | CONSTANT | LENGTH | COMMAND | DATA   | Bcc_High | Bcc_Low |  STOP  |
 |-------- ---------- -------- --------- -------- ---------- --------- --------|
 | 1 BYTE | 1 BYTE   | 2 BYTE | 2 BYTE  | n BYTE | 1 BYTE   | 1 BYTE  | 1 BYTE |
 */

var calculateBcc4Received   = function(receivedData){
  //var xor = 0xf6^0x00^0x17^0x48^0x31^0x30^0x30^0x30^0x30^0x30^0x30^0x30^0x30^0x36^0x30^0x31^0x31^0x36^0x31^0x34^0x00^0x72^0x79^0x00^0x10^0x09;
  var zero = "0";
  var bcc;
  var bccH;
  var bccL;
  var result;
  var hl = '0x'+receivedData[2].toString(16);
  var ll = '0x'+receivedData[3].toString(16);

  var data = receivedData.slice(4,receivedData.length-3);

  var xor = '0x'+commands.CONSTANT.toString(16) ^ hl ^ ll;

  for (var i = 0; i < data.length; i++) {xor = xor ^ '0x'+data[i].toString(16);}

  if(xor < 16){
    bcc = xor.toString(16).toUpperCase().split("");
    bccH = zero.charCodeAt(0).toString(16);
    bccL = bcc[0].charCodeAt(0).toString(16);
  }else{
    bcc = xor.toString(16).toUpperCase().split("");
    bccH = bcc[0].charCodeAt(0).toString(16);
    bccL = bcc[1].charCodeAt(0).toString(16);
  }


  result = {
    h: bccH,
    l: bccL
  };


  return result; //typeof hex
};

var calculateBcc4Send       = function(c1,c2,data){
  var buf = new Buffer(2);
  var bufBccH = new Buffer(1);
  var bufBccL = new Buffer(1);
  var total;
  var lh_H;
  var lh_L;
  var bcc;
  var bcc_H;
  var bcc_L;

// <editor-fold "Calculate Length">
  total = c1.length + c2.length + data.length;

  buf.writeInt16BE(total);

  lh_H = buf.slice(0, 1);
  lh_L = buf.slice(1, buf.length);
// </editor-fold>

// <editor-fold "Calculate Bcc">
  var xor = '0x'+commands.CONSTANT.toString(16) ^'0x'+lh_H[0].toString(16) ^ '0x'+lh_L[0].toString(16) ^ '0x'+c1[0].toString(16) ^ '0x'+ c2[0].toString(16);

  for (var i = 0; i < data.length; i++) {xor = xor ^ '0x'+data[i].toString(16);}

  bcc = xor.toString(16).toUpperCase().split("");

  bcc_H = "0x" + bcc[0].charCodeAt(0).toString(16);
  bcc_L = "0x" + bcc[1].charCodeAt(0).toString(16);

  bufBccH.writeInt8(bcc_H);
  bufBccL.writeInt8(bcc_L);
// </editor-fold>

// <editor-fold "Prepare Data for Send">
  var array = [new Buffer([commands.START]),
    new Buffer([commands.CONSTANT]),
    lh_H,
    lh_L,
    c1,
    c2,
    data,
    bufBccH,
    bufBccL,
    new Buffer([commands.STOP])
  ];
  var total_length = data.length + 9;
  return Buffer.concat(array, total_length);
// </editor-fold>
};

module.exports = {
  calculateBcc4Received   : calculateBcc4Received,
  calculateBcc4Send       : calculateBcc4Send
};