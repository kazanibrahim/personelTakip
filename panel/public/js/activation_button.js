$( function () {
  function Activator ( dom ) {
    var child = dom.find( 'i' );
    var id = dom.attr( 'data-id' );
    var url = dom.attr( 'data-url' );

    $.ajax( {
      dataType: 'json',
      url: url,
      type: 'post',
      data: {name: 'activate', id: id, value: ''},
      context: document.body,
      error: function ( xhr, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      },
      success: function ( data, textStatus, xhr ) {
        if (data.OK == 0) {
          alert(data.msg);
          location.reload();
        } else {
          if (data.isActive) {
            dom.removeClass( 'btn-default' ).addClass( 'btn-success' );
            child.removeClass( 'fa-eye-slash' ).addClass( 'fa-eye' );
          } else {
            dom.addClass( 'btn-default' ).removeClass( 'btn-success' );
            child.addClass( 'fa-eye-slash' ).removeClass( 'fa-eye' );
          }
        }
      }
    } );
  }
  $( 'body' ).on( 'click', '.activator', function () {
    Activator( $( this ) );
  } );
} );