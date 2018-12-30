$( function () {
  
  function ReaderSubmitter () {
    
    var isAp = false;
    var selectedReaderId      = [];
    var rGroupNameInput       = document.getElementById('rGroupName').value;
    var readerGroupAPBInput   = document.getElementById('readerGroupAPB');
    var checkedReaders        = document.getElementsByName("isChecked");
    readerGroupAPBInput.checked ? isAp = true : isAp =  false;
  
    for (var i = 0; i < checkedReaders.length; i++) {
      if (checkedReaders[i].checked) {
        selectedReaderId.push(checkedReaders[i].value);
      }
    }
    
    if(rGroupNameInput.length != 0){
      if((isAp && selectedReaderId.length >= 2) || (!isAp && selectedReaderId.length >= 1)) {
    
        var post = {
          readerGroupName     : rGroupNameInput,
          readerGroupAPB      : isAp,
          readersId           : selectedReaderId
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
        xhr.open("POST", "/definitions/rgroup/create", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(post));
    
      }else{
        alert("Lütfen, Okuyucu Seçiniz !");
      }
    }else{
      alert("Lütfen, Okuyucu Grup İsmi Giriniz !");
    }
  }
  
  function ReaderGroupEditter () {
    var rGroupId = document.getElementsByClassName('edit-rGroup');
    rGroupId = rGroupId[0].dataset.id;
    
    var isAp = false;
    var selectedReaderId      = [];
    
    var readerGroupNameInput  = document.getElementById('rGroupName').value;
    var readerGroupAPBInput   = document.getElementById('readerGroupAPB');
    var checkedReaders        = document.getElementsByName("isChecked");
    readerGroupAPBInput.checked ? isAp = true : isAp =  false;
    
    for (var i = 0; i < checkedReaders.length; i++) {
      if (checkedReaders[i].checked) {
        selectedReaderId.push(checkedReaders[i].value);
      }
    }
    
    if(readerGroupNameInput.length != 0){
      if((isAp && selectedReaderId.length >= 2) || (!isAp && selectedReaderId.length >= 1)){
        
        var post = {
          readerGroupName     : readerGroupNameInput,
          readerGroupAPB      : isAp,
          readersId           : selectedReaderId
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
        xhr.open("POST", "/definitions/rgroup/edit/"+rGroupId+"", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(post));
        
      }else{
        alert("Lütfen, Okuyucu Seçiniz !");
      }
    }else{
      alert("Lütfen, Okuyucu Grup İsmi Giriniz !");
    }
  }
  
  $( 'body' ).on( 'click', '.submit-rGroup', function () {
    ReaderSubmitter( $( this ) );
  } );
  
  $( 'body' ).on( 'click', '.edit-rGroup', function () {
    ReaderGroupEditter( $( this ) );
  } );
} );