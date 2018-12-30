$( function () {
  
  function CardSubmitter () {
    
    var cardIDInput   = document.getElementById('cardID').value;
    var cardCodeInput = document.getElementById('cardCode').value;
  
    if(cardIDInput.length == 8){
      if(cardCodeInput.length != 0){
        var post = {
          cardID    : cardIDInput,
          cardCode  : cardCodeInput,
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
        xhr.open("POST", "/definitions/card/create", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(post));
      }else{
        alert("Lütfen Kart Kodu Giriniz !")
      }
    }else{
      alert("Lütfen Kart ID Giriniz !")
    }
    
  }
  
  function CardEditter () {
    var cardId = document.getElementsByClassName('edit-card');
    cardId = cardId[0].dataset.id;
    
    var cardIDInput = document.getElementById('cardID').value;
    var cardCodeInput = document.getElementById('cardCode').value;

    if(cardIDInput.length == 8){
      if(cardCodeInput.length != 0){
        var post = {
          cardID    : cardIDInput,
          cardCode  : cardCodeInput,
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
        xhr.open("POST", "/definitions/card/edit/"+cardId+"", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(post));
      }else{
        alert("Lütfen Kart Kodu Giriniz !")
      }
    }else{
      alert("Lütfen Kart ID Giriniz !")
    }
    
  }
  
  function GetCardId() {
    
    var checkedReader       = document.getElementsByName("isChecked");
    var selectedReaderId    = [];
    
    for (var i = 0; i < checkedReader.length; i++) {
      if (checkedReader[i].checked) {
        selectedReaderId.push(checkedReader[i].value);
      }
    }
    
    if(selectedReaderId.length != 0 && selectedReaderId.length == 1){
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var json = JSON.parse(xhr.responseText);
        if (!json.err) {
          if(typeof json.newCardId != "undefined"){
            document.getElementById('cardID').value = json.newCardId;
          }else{
            alert(json.msg+"\nLütfen, Önce Kart Okutunuz")
          }
        } else {
          if (json.status == 0) {
            alert("Bağlantı Hatası ! \nLütfen Okuyucu Programını Kontrol Ediniz !")
          }else if(json.status == 2){
            alert(json.msg+"\nLütfen, Başka Kart Okutunuz")
          } else {
            alert(json.msg+"\nLütfen, Önce Kart Okutunuz")
          }
        }
      };
      xhr.open("GET", "/definitions/card/getCardId/"+selectedReaderId+"", true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.send();
    }else {
      alert("Lütfen Tanım Okuyucusu Seçiniz !")
    }
  }
  
  $( 'body' ).on( 'click', '.submit-card', function () {
    CardSubmitter( $( this ) );
  } );
  
  $( 'body' ).on( 'click', '.edit-card', function () {
    CardEditter( $( this ) );
  } );
  
  $('body').on('click', '.getCardID', function () {
    GetCardId($(this));
  });
} );