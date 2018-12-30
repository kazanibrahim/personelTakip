function SingleImageUploader(dom) {
  var parent = dom;
  var url = parent.attr( 'data-url' );
  var click = parent.find( 'p' );
  var img = parent.find('img');
  var progress = parent.find( '.progress-bar' );

  var uploadFile = function ( file ) {
    var size = file.size;
    var xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.setRequestHeader( 'X-File-Name', file.name );
    xhr.setRequestHeader( 'X-File-Size', file.size );
    xhr.setRequestHeader( 'X-File-Type', file.type );

    xhr.onload = function (e) {
      progress.css( {
        'width': '100%'
      } ).removeClass( 'progress-bar-info progress-bar-danger' ).addClass( 'progress-bar-success' );
      var response = JSON.parse(e.target.response);
      var picUrl = response.id;
      img.attr( 'src', '/img/pers/'+picUrl);
      img.attr( 'data-name', picUrl );
      parent.removeClass( 'drop' );
    };

    xhr.onerror = function (e) {
      progress.css( {
        'width': '100%'
      } ).removeClass( 'progress-bar-info progress-bar-success' ).addClass( 'progress-bar-danger' );
      parent.removeClass( 'drop' );
    };

    xhr.upload.onprogress = function ( e ) {
      var percent = (e.loaded / size) * 100;
      progress.css( 'width', percent + '%' );
    };

    xhr.upload.onloadstart = function ( e ) {
      progress.css( {
        'width': '0%'
      } ).removeClass( 'progress-bar-danger progress-bar-success' ).addClass( 'progress-bar-info' );
    };

    xhr.send( file );
  };

  // Dragged over
  click.on( 'dragover', function ( e ) {
    e.preventDefault();
    parent.addClass( 'drop' );
  } );

  // Dragging left
  click.on( 'dragleave', function ( e ) {
    e.preventDefault();
    parent.removeClass( 'drop' );
  } );

  // Drop event
  click.on( 'drop', function ( e ) {
    e.preventDefault();
    e.stopPropagation();

    parent.removeClass( 'drop' );

    var files = event.dataTransfer.files;
    if (!files || !files.length) {
      return false;
    }

    var file = files[0];
    if (!(file.type === 'image/jpg' || file.type === 'image/jpeg' || file.type === 'image/png')) {
      // Not image file
      return false;
    }

    var reader = new FileReader();
    reader.onload = function ( e ) {
      img.attr( 'src', e.target.result );
      var r = this;
      setTimeout( function () {
        uploadFile( r.file );
      }, 250 );
    };

    reader.file = file;
    reader.readAsDataURL( file );

    return false;
  } );

  // On click start drop event
  click.on( 'click', function () {
    parent.find( 'input[type="file"]' ).remove();
    var input = $( '<input>' ).attr( {
      'type': 'file',
      'name': 'file',
      'style': 'visibility:hidden; width:0; height:0'
    } );

    input.on( 'change', function () {
      event = {
        dataTransfer: {}
      };
      event.dataTransfer.files = $( this ).get( 0 ).files;
      parent.append( input );
      click.trigger( 'drop' );
    } );
    input.trigger( 'click' );
  } );
}
$( function () {
  $( '.singleimageuploader' ).each( function () {
    new SingleImageUploader( $( this ) );
  } );
} );