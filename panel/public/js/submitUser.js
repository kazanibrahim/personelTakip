$( function () {
  
  function UserSubmitter () {
        
    var nameInput          = document.getElementById('name').value;
    var surnameInput       = document.getElementById('surname').value;
    var usernameInput      = document.getElementById('username').value;
    var pwdInput           = document.getElementById('pwd').value;
 
    if(nameInput.length != 0){
      if(surnameInput.length != 0){
        if(usernameInput.length !=0 ){
          if(pwdInput.length !=0){
  
            var post = {
              name:  nameInput,
              surname: surnameInput,
              username:  usernameInput,
              pwd: pwdInput
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
            xhr.open("POST", "/user/create", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(post));
            
          }else{
            alert("Lütfen Şifre Giriniz !")
          }
        }else {
          alert("Lütfen Rumuz Giriniz !")
        }
      }else{
        alert("Lütfen Kullanıcı Soyadı Giriniz !")
      }
    }else{
      alert("Lütfen Kullanıcı Adı Giriniz !")
    }
  }
  
  function UserEditter () {
    var userId = document.getElementsByClassName('edit-user');
    userId = userId[0].dataset.id;
    
    var nameInput          = document.getElementById('name').value;
    var surnameInput       = document.getElementById('surname').value;
    var usernameInput      = document.getElementById('username').value;
    var pwdInput           = document.getElementById('pwd').value;
  
    if(nameInput.length != 0){
      if(surnameInput.length != 0){
        if(usernameInput.length !=0 ){
          if(pwdInput.length !=0){
          
            var post = {
              name:  nameInput,
              surname: surnameInput,
              username:  usernameInput,
              pwd: pwdInput
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
            xhr.open("POST", "/user/edit/"+userId, true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(post));
          
          }else{
            alert("Lütfen Şifre Giriniz !")
          }
        }else {
          alert("Lütfen Rumuz Giriniz !")
        }
      }else{
        alert("Lütfen Kullanıcı Soyadı Giriniz !")
      }
    }else{
      alert("Lütfen Kullanıcı Adı Giriniz !")
    }
  }
  
  $( 'body' ).on( 'click', '.submit-user', function () {
    UserSubmitter( $( this ) );
  } );
  
  $( 'body' ).on( 'click', '.edit-user', function () {
    UserEditter( $( this ) );
  } );
  
} );