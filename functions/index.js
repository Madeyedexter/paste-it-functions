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