var net = require("net");
var Reader = require(__dirname + "/reader");

var PORT = config.tcp.port;

module.exports = function () {
  net.createServer(function (socket) {
    var reader = new Reader(socket);
    readerService.readerDTO.push(reader);
  }).on("end", function () {
    logger.error("end!");
  }).on("close", function () {
    logger.error("DISCONNECTED!");
  }).on("listening", function () {
    logger.info("TCP\t" + "[" + PORT + "]");
  }).on("error", function (err) {
    logger.error(err);
  }).listen({
    host: "0.0.0.0",
    port: PORT
  });
};
