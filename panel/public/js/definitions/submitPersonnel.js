$( function () {
  
  function PersonnelSubmitter () {
  
    var userPhoto = document.getElementById('imageUploader').dataset.name;
    if (typeof userPhoto === "undefined" || userPhoto === "") { userPhoto = "defaultimg.png";}
  
    var nameInput             = document.getElementById('name').value;
    var surnameInput          = document.getElementById('surname').value;
    var selectCardCodeInput   = document.getElementById('selectCardCode').value;
    var TCNoInput             = document.getElementById('TCNo').value;
    var registerNoInput       = document.getElementById('registerNo').value;
    var selectAccessGroupInput= document.getElementById('selectAccessGroup');
  
    if(HasEmptyInput(nameInput)){
      if(HasEmptyInput(surnameInput)){
        if(HasEmptyInput(selectCardCodeInput)){
          if(selectAccessGroupInput.selectedOptions.length != 0){
  
            var arraySelectedGroups = [];
  
            for (var i = 0; i < selectAccessGroupInput.length; i++) {
              if (selectAccessGroupInput[i].selected) {
                arraySelectedGroups.push(selectAccessGroupInput[i].value);
              }
            }
  
            var post = {
              image             : userPhoto,
              name              : nameInput,
              surname           : surnameInput,
              cardCode          : selectCardCodeInput,
              TCNo              : TCNoInput,
              registerNo        : registerNoInput,
              accessGroup       : arraySelectedGroups
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
            xhr.open("POST", "/definitions/personnel/create", true);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify(post));
            
          }else{
            alert("Lütfen Personel Geçiş Yetkisi Seçiniz !")
          }
        }else{
          alert("Lütfen Personel Kartı Seçiniz !")
        }
      }else {
        alert("Lütfen Personel Soyadı Giriniz !")
      }
    }else{
      alert("Lütfen Personel Adı Giriniz !")
    }

    
  }
  
  function PersonnelEditter () {
    var personnelId = document.getElementsByClassName('edit-personnel');
    personnelId = personnelId[0].dataset.id;
  
    var userPhoto = document.getElementById('imageUploader').dataset.name;
    if (typeof userPhoto === "undefined" || userPhoto === "") { userPhoto = "defaultimg.png";}
  
    var nameInput             = document.getElementById('name').value;
    var surnameInput          = document.getElementById('surname').value;
    var selectCardCodeInput   = document.getElementById('selectCardCode').value;
    var TCNoInput             = document.getElementById('TCNo').value;
    var registerNoInput       = document.getElementById('registerNo').value;
    var selectAccessGroupInput= document.getElementById('selectAccessGroup');
  
    if(HasEmptyInput(nameInput)){
      if(HasEmptyInput(surnameInput)){
          if(HasEmptyInput(selectCardCodeInput)){
            if(selectAccessGroupInput.selectedOptions.length != 0){
              var arraySelectedGroups = [];
  
              for (var i = 0; i < selectAccessGroupInput.length; i++) {
                if (selectAccessGroupInput[i].selected) {
                  arraySelectedGroups.push(selectAccessGroupInput[i].value);
                }
              }
  
              var post = {
                image             : userPhoto,
                name              : nameInput,
                surname           : surnameInput,
                cardCode          : selectCardCodeInput,
                TCNo              : TCNoInput,
                registerNo        : registerNoInput,
                accessGroup       : arraySelectedGroups
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
              xhr.open("POST", "/definitions/personnel/edit/"+personnelId, true);
              xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
              xhr.send(JSON.stringify(post));
            }else{
              alert("Lütfen Personel Geçiş Yetkisi Seçiniz !")
            }
          }else{
            alert("Lütfen Personel Kartı Seçiniz !")
          }
      }else {
        alert("Lütfen Personel Soyadı Giriniz !")
      }
    }else{
      alert("Lütfen Personel Adı Giriniz !")
    }
    
  }
  
  function HasEmptyInput(field) {
    if(typeof field === "null" ||typeof field === "undefined" || field === "" || field === "undefined" || field === "null" || field.length ==0){return false}else{return true}
  }
  
  $( 'body' ).on( 'click', '.submit-personnel', function () {
    PersonnelSubmitter( $( this ) );
  } );
  
  $( 'body' ).on( 'click', '.edit-personnel', function () {
    PersonnelEditter( $( this ) );
  } );
  
  $('.select2Cards').selectpicker({});
  $('.select2AccessGroup').selectpicker({
    selectAllText:"Hepsini Seç",
    deselectAllText:"Hepsini Sil"
  });
} );