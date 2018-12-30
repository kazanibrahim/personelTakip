$(function () {
  
  function CreateReportButton() {
    
    var inputStartDate = document.getElementById('reportDateRange').value;
    var slctDepartInput = document.getElementById('selectPersonnel').value;
    
    
    if (inputStartDate.length >= 35) {
      if (HasEmptyInput(slctDepartInput)) {
        
        var post = {
          dateRange   : inputStartDate,
          personnelId : slctDepartInput
        };
        
        BindWait();
        
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
          var json = JSON.parse(xhr.responseText);
          if (!json.err) {
            PrepareReport(json.data);
          } else {
            alert(json.msg)
          }
        };
        xhr.open("POST", "/reports/personnel", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              DestroyWait()
            }
            else if (xhr.status == 404) {
              alert("Request URL does not exist");
              location.reload()
            }
            else {
              alert("Error: status code is " + xhr.status);
              location.reload()
            }
          }
        };
        xhr.send(JSON.stringify(post));
        
      } else {
        alert("Lütfen Personel Departmanı Seçiniz !")
      }
    } else {
      alert("Lütfen Tarih Seçiniz !")
    }
    
  }
  
  function ExportReportExcelButton() {
    
    var inputStartDate = document.getElementById('reportDateRange').value;
    var slctDepartInput = document.getElementById('selectPersonnel').value;
    
    if (inputStartDate.length >= 35) {
      if (HasEmptyInput(slctDepartInput)) {
        
        var aTag = document.getElementById('exportReportExcelButton');
        aTag.setAttribute("target", "_blank");
        aTag.setAttribute("href", "/reports/personnel/exportReport?dateRange=" + inputStartDate + "&perId=" + slctDepartInput);
        
      } else {
        alert("Lütfen Personel Departmanı Seçiniz !")
      }
    } else {
      alert("Lütfen Tarih Seçiniz !")
    }
    
  }
  
  function PrepareReport(data) {
    
    $('#dataTable').DataTable({
      bDestroy: true,
      data: data,
      columns: [
        {data: "name"},
        {data: "surname"},
        {data: "passportNumber"},
        {data: "registerNumber"},
        {data: "departmentName"},
        {data: "positionName"},
        {data: "reader.name"},
        {data: "message"},
        {data: "screenDate"}
      ],
      language: {
        "search": "Arama",
        "infoEmpty": "Kayıt Bulunamadı !",
        "zeroRecords": "Üzgünüz! Kayıt Bulunamadı.",
        "lengthMenu": "Sayfada _MENU_ kayıt gösteriliyor",
        "info": "Gösterilen _START_ - _END_ Toplam: _TOTAL_ ",
        "paginate": {
          previous: "Geri",
          next: "İleri"
        }
      }
    });
    
  }
  
  function BindWait() {
    var body = document.querySelector('body');
    
    var modal = document.createElement('div');
    modal.className = 'wait-modal';
    var modalBox = document.createElement('div');
    modalBox.className = 'wait-modal-box';
    modalBox.style.top = "143px";
    var modalBoxContent = document.createElement('div');
    modalBoxContent.className = 'wait-modal-box__content';
    var modalBoxContentElement = document.createElement("h2");
    modalBoxContentElement.innerHTML = "Rapor Oluşturuluyor, Lütfen Bekleyiniz !!!";
    
    modalBoxContent.appendChild(modalBoxContentElement)
    modalBox.appendChild(modalBoxContent);
    modal.appendChild(modalBox);
    
    document.body.insertBefore(modal, document.body.firstChild);
    return;
  }
  
  function DestroyWait() {
    var el = document.querySelector('.wait-modal');
    el.parentNode.removeChild(el);
    return;
  }
  
  function HasEmptyInput(field) {
    if (typeof field === "null" || typeof field === "undefined" || field === "" || field === "undefined" || field === "null" || field.length == 0) {
      return false
    } else {
      return true
    }
  }
  
  $('body').on('click', '#createReportButton', function () {
    CreateReportButton($(this));
  });
  
  $('body').on('click', '#exportReportExcelButton', function () {
    ExportReportExcelButton($(this));
  });
  
  $('.select2Personnel').selectpicker({});
  
  $('#reportDateRange').daterangepicker({
    opens: "right",
    timePicker12Hour: false,
    timePicker: true,
    timePickerIncrement: 15,
    format: 'YYYY/MM/DD HH:mm',
    locale: {
      monthNames: [
        "Oca",
        "Şub",
        "Mar",
        "Nis",
        "May",
        "Haz",
        "Tem",
        "Ağu",
        "Eyl",
        "Eki",
        "Kas",
        "Ara"
      ],
      daysOfWeek: [
        "Paz",
        "Pzt",
        "Sal",
        "Çar",
        "Per",
        "Cum",
        "Cmt"
      ],
      applyLabel: "Seç",
      cancelLabel: "İptal",
      fromLabel: "Başlangıç",
      toLabel: "Bitiş"
    }
  });
  
});
