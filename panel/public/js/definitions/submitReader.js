$( function () {

  function ReaderSubmitter () {

    var readerNameInput       = document.getElementById('readerName').value;
    var readerSerialInput     = document.getElementById('readerSerial').value;
    var readerPropInput       = document.getElementById('readerWorkingProp').value;
    var readerTypeInput       = document.getElementById('readerWorkingType').value;

    if(readerNameInput.length != 0){
      if(readerSerialInput.length != 0){
        if(readerPropInput != -3){
          if(readerTypeInput != -3){

            var post = {
              readerName          : readerNameInput,
              readerSerial        : readerSerialInput,
              readerProp          : readerPropInput,
              readerType          : readerTypeInput
            };

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
              var json = JSON.parse(xhr.responseText);
              if(!json.err){
                alert("Başarılı İşlem :)");
                location.reload();
              }else{
                alert(json.msg);
              }
            };
            xhr.open("POST", "/definitions/reader/create", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(post));

          }else{
            alert("Lütfen, Okuyucu Tipi Seçiniz !");
          }
        }else{
          alert("Lütfen, Okuyucu Özelliği Seçiniz !");
        }
      }else{
        alert("Lütfen, Okuyucu Seri Nosu Giriniz !");
      }
    }else{
      alert("Lütfen, Okuyucu İsmi Giriniz !");
    }
  }

  function ReaderEditter () {
    var readerId = document.getElementsByClassName('edit-reader');
    readerId = readerId[0].dataset.id;

    var readerNameInput       = document.getElementById('readerName').value;
    var readerSerialInput     = document.getElementById('readerSerial').value;
    var readerPropInput       = document.getElementById('readerWorkingProp').value;
    var readerTypeInput       = document.getElementById('readerWorkingType').value;

    if(readerNameInput.length != 0){
      if(readerSerialInput.length != 0){
        if(readerPropInput != -3){
          if(readerTypeInput != -3){

            var post = {
              readerName          : readerNameInput,
              readerSerial        : readerSerialInput,
              readerProp          : readerPropInput,
              readerType          : readerTypeInput
            };

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
              var json = JSON.parse(xhr.responseText);
              if(!json.err){
                alert("Başarılı İşlem :)");
                location.reload();
              }else{
                alert(json.msg);
              }
            };
            xhr.open("POST", "/definitions/reader/edit/"+readerId+"", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(post));

          }else{
            alert("Lütfen, Okuyucu Tipi Seçiniz !");
          }
        }else{
          alert("Lütfen, Okuyucu Özelliği Seçiniz !");
        }
      }else{
        alert("Lütfen, Okuyucu Seri Nosu Giriniz !");
      }
    }else{
      alert("Lütfen, Okuyucu İsmi Giriniz !");
    }
  }

  $( 'body' ).on( 'click', '.submit-reader', function () {
    ReaderSubmitter( $( this ) );
  } );

  $( 'body' ).on( 'click', '.edit-reader', function () {
    ReaderEditter( $( this ) );
  } );
  
  $('.selectpicker').selectpicker({});
} );