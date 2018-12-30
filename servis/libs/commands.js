/**
 | START  | CONSTANT | LENGTH | COMMAND | DATA   | Bcc_High | Bcc_Low |  STOP  |
 |-------- ---------- -------- --------- -------- ---------- --------- --------|
 | 1 BYTE | 1 BYTE   | 2 BYTE | 2 BYTE  | n BYTE | 1 BYTE   | 1 BYTE  | 1 BYTE |
 */


module.exports = {
  START: 0x02,
  CONSTANT: 0xF6,
  ZERO: new Buffer([0x00]),
  STOP: 0x03,
  POSITIVE: 0x6F,
  NEGATIVE: 0x6E,
  EMPTY: new Buffer(0),

  /**
   * CheckReader
   * getTime
   * getSettings
   * GetEthernetSettings
   * GetDate
   * GetSerialNumber
   * EnableShowTCPSettings
   * DisableEnableShowTCPSettings
   * SetBuzzerOn
   * SetBuzzerOff
   * SetReaderType
   * EnableWorkOffline
   * DisableWorkOffline
   * HandshakeResponse **
   */
  READER_FUNCTION_COMMAND_C1: new Buffer([0x4B]),
  READER_WORKING_PARAMETERS: new Buffer([0x57]),


  /**
   * WriteCardID **
   * DeleteCardID
   * DeleteCardIDs
   * ControlCardID
   * ReadCardList
   * GetCardCount
   */
  CARD_COMMAND_C1: new Buffer([0x43]),

  /**
   * for answer to cardId received from reader
   */
  CARD_ANSWER_COMMAND_C1: new Buffer([0x4B]),

  /**
   * for numeric pass
   */
  KEY_COMMAND_C1: new Buffer([0x53]),

  SET_PASS_SIGNAL_WAIT: new Buffer([0x47]),
  GET_ETHERNET_SETTINGS: new Buffer([0x45]),
  HANDSHAKE_RESPONSE_COMMAND_C2: new Buffer(2).fill(0),
  BUZZER_ON_COMMAND_C2: new Buffer([0x4A]),
  BUZZER_OFF_COMMAND_C2: new Buffer([0x4B]),
  WRITE_CARD_ID_COMMAND_C2: new Buffer([0x41]),
  CHECK_READER_COMMAND_C2: new Buffer([0x41]),
  DELETE_CARD_ID_COMMAND_C2: new Buffer([0x42]),
  CARD_ANSWER_COMMAND_C2: new Buffer([0x42]),
  LOG_POSITIVE_COMMAND: new Buffer([0x6F]),
  SET_DATE_COMMAND_C2: new Buffer([0x44]),
  CONTROL_CARDID_COMMAND_C2: new Buffer([0x44]),
  SET_READERTYPE_COMMAND_C2: new Buffer([0x42]),
  WRITE_KEY_COMMAND_C2: new Buffer([0x41]),
  DELETE_KEY_COMMAND_C2: new Buffer([0x42]),
  CONTROL_KEY_COMMAND_C2: new Buffer([0x44]),

  /**
   * commands received from reader
   */
  CFR_HANDSHAKE: 0x48,//command from reader
  CFR_SEND_ETHERNET_SETTINGS: 0x65,
  CFR_SEND_CARD_ID: 0x78,
  CFR_SEND_PASSWORD: 0x58,
  CFR_SEND_FINGER_ID: 0x62,
  CFR_SEND_LOG_DATA: 0x79,
  CFR_SEND_LOG_DATA_CARD: 0x30,
  CFR_SEND_LOG_DATA_KEY: 0x32,
  CFR_SEND_LOG_DATA_EMERGENCY: 0x44,
  CFR_CLOCK_ERROR: 0x7A,
  CFR_DATA_POSSITIVIE:0x6F,
  CFR_DATA_NEGATIVE:0x6E,
  DOOR_CLOSED_PERSON_NACCESS: 0x51,
  DOOR_CLOSED_PERSON_ACCESS: 0x52,
  DOOR_OPENED_PERSON_NACCESS: 0x61,
  DOOR_OPENED_PERSON_ACCESS: 0x62,
  READER_STORAGE_FULL: 0x44,
  EMERGENCY_STATE_INFORMATION:0x5A
};