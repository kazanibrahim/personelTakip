$( function () {
  function Deleter ( dom ) {
    var parent = dom.closest( '.deletable' );
    var id = dom.attr( 'data-id' );
    var url = dom.attr( 'data-url' );

    var conf = confirm( "Silme işlemini onaylıyor musunuz ?" );
    if (!conf) return;

    $.ajax( {
      dataType: 'json',
      url: url,
      type: 'post',
      data: {name: 'delete', id: id, value: ''},
      context: document.body,
      error: function ( xhr, textStatus, errorThrown ) {
        console.log( textStatus, errorThrown );
      },
      success: function ( data, textStatus, xhr ) {
        console.log( data );
        if (data.OK != 1) {
          alert(data.msg)
        } else {
          if (data.OK == 1) {
            parent.remove();
          }
        }
      }
    } );
  }

  $( 'body' ).on( 'click', '.deleter', function () {
    Deleter( $( this ) );
  } );
} );