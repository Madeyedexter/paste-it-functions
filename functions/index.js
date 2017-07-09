const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.createInitialTags = functions.auth.user().onCreate(event => {
	
var tagLabels = ['quote','random','article'];

for(var i=0; i<3; i++){
	console.log("UID is: "+event.data.uid);
	var ref = admin.database().ref('tags').child(event.data.uid).push();
	
	var id = ref.key;
	console.log("PushID is: "+id);
	ref.set({id: id, label: tagLabels[i]});
}
});


exports.deleteTags = functions.database.ref('/tags/{uid}/{tagId}')
    .onWrite(event => {
      // Only edit data when it is first created.
      if (event.data.previous.exists() && !event.data.exists()) {
              // Grab the current value of what was written to the Realtime Database.
      const original = event.data.val();
      console.log('Tag Removed: ', event.params.tagId);
      console.log('For user: ', event.params.uid);
      
      var uid = event.params.uid;
      var tagId = event.params.tagId;
      
      //get all the paste with tag as the tag that was deleted
      var ref = admin.database().ref('pastes/'+uid)
      ref.once('value').then(function(snapshot){
      	console.log(snapshot.val());
      	for(var key in snapshot.val()){
      		//key is the paste id
      		if(snapshot.val()[key].tags !== undefined)
      		for(var id in snapshot.val()[key].tags){
      			if(id == tagId){
      				admin.database().ref('pastes').child(uid).child(key).child('tags/'+id).set(null);
      			}
      		}
      	}
      });
      }
    });

    exports.incrementNoteCount = functions.database.ref('/pastes/{uid}/{pasteId}').onCreate(
      event => {
          var uid = event.params.uid;
          var ref = admin.database().ref('totals').child(uid).child("totalCount");
          ref.transaction(function(totalCount){
            return (totalCount||0) + 1;
          });
      });
    exports.decrementNoteAndArchiveCount = functions.database.ref('/pastes/{uid}/{pasteId}').onDelete(
      event => {
        //a note was deleted, won't happen with user interaction
          var uid = event.params.uid;
          var ref = admin.database().ref('totals').child(uid).child("totalCount");
          ref.transaction(function(totalCount){
            return (totalCount||0) - 1;
          });
          //check if the note was archived and decrement total archived count
          console.log(event.data.previous.val());
          if(event.data.previous.val().archived){
            var ref = admin.database().ref('totals').child(event.params.uid).child("totalArchivedCount");
            ref.transaction(function(totalArchivedCount){
              return totalArchivedCount-1;
            });
          }
      });

    exports.countArchivedNotes = functions.database.ref('pastes/{uid}/{pasteId}/archived').onUpdate(
      event => {
        //paste was archived
        var ref = admin.database().ref('totals').child(event.params.uid).child("totalArchivedCount");
        if(event.data.current.val()){
          ref.transaction(function(totalArchivedCount){
            return (totalArchivedCount||0) + 1;
          });
        }
        //paste was unarchived
        else{
         ref.transaction(function(totalArchivedCount){
            return totalArchivedCount - 1;
          }); 
        }
        console.log(event.data.current.val());

      }
      );