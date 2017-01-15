var Pages = mongoose.model( 'StaticPage' );
var l = require('winston');

exports.renderIndex = function ( req, res ){
  // res.render( 'admin/pages', {});
  Pages.find( {}, function ( err, pages ){
    if(err) {
      l.log('info', err);
    } else {
      res.render( 'admin/pages', {items: pages} );
      res.end();
    }
  });
};

exports.renderCreate = function ( req, res ){
  // the first param is the path to the file
  res.render( 'admin/pages-new', {});
};


exports.create = function ( req, res ){
  new Pages( req.body ).save( function( err, todo, count ){
    if (err) {
      console.log(err);
    } else {
      res.redirect( '/admin/pages' );
    }
  });
};

exports.renderEdit = function ( req, res ) {
  Pages.findOne({ '_id': req.params.id}, function ( err, item ){
    if (err) {
      console.log(err);
    } else {
      res.render( 'admin/pages-edit', {items: item});
    }
  });
};

exports.update = function ( req, res ){
  Pages.findOneAndUpdate( {'_id': req.params.id }, req.body, { upsert:true }, function ( err, doc ){
    if (err) {
      l.log('info', err);
    } else {
      res.redirect( '/admin/pages' );
      res.end()
    }
  });
};

exports.destroy = function ( req, res ) {
  Pages.findByIdAndRemove( req.params.id, function ( err, page ){
    if(err) {
      l.log('info', err);
    } else {
      res.redirect( '/admin/pages' );
      res.end();
    }
  });
};

exports.renderPageById = function ( req, res ){
  Pages.findOne({'_id': req.params.id}, function ( err, pages ){
    if(err) {
      l.log('info', err);
      res.end();
    } else {
      res.render( 'pages-template', {items: pages});
    }
  });
};
