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