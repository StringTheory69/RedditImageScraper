const request = require('request-promise');
const download = require('image-downloader')
const uuidv4 = require('uuid/v4');

var options = {
    uri: 'https://www.reddit.com/r/memes.json?t=day',
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
};

// Download to a directory and save with an another filename
var admin = require("firebase-admin");

var serviceAccount = require(");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "",

});

var bucket = admin.storage().bucket();

const db = admin.firestore();

const filenames = []

request(options)
.then(function (body) {
        const memes = body.data.children
        var promises = [] 
        memes.forEach( meme => {
            const url = meme.data.url
            if (url.includes('.jpg') || url.includes('.png')) {
                            console.log(url)
//                urls.push(url)
                // upload each url to firebase storage with uuid as name
                // store uuid in database with user details 
                const random = uuidv4()
                const imageOptions = {
                    url: url,
                    dest: `./images/${random}.jpg` ,
                    extractFilename: false
                }

                filenames.push(random)

                promises.push( 
                    download.image(imageOptions)
                    .then(({ filename, image }) => {
                        console.log('Saved to', filename)  // Saved to /path/to/dest/photo.jpg
                    })
                )
            }
            
        })
        
        return Promise.all(promises)

    })
.then(function () {
    console.log("FILENAME", filenames)
        // upload images to firebase storage
        var promises = []
        // Create a reference 
        filenames.forEach( name => {
            // var imageRef = bucket.child();
            promises.push(
                bucket.upload(`./images/${name}.jpg`)
                .then(function(snapshot) {
                    console.log('Uploaded a blob or file!');
                  })
            )
            
        })

        return Promise.all(promises)


        // save to memeDb and accountDB
    //     "uid": userID,
    // "username": userID,
    // "timestamp": Timestamp(date: Date()),
    // "votes": 1,
    // "earnings": 0,
})
.then( function () {
    var uid = "redditbot"
    var promises = [] 
    filenames.forEach( name => {
        // var imageRef = bucket.child();
        var meme = {
            "uid": uid,
            "username": uid,
            // "timestamp": admin.firestore.FieldValue.serverTimestamp(),
            "votes": 1,
            "earnings": 0
        }

        const memeData = { 
            [name] : {
                "uid": uid,
                "username": uid,
                // "timestamp": admin.firestore.FieldValue.serverTimestamp(),
                "votes": 1,
                "earnings": 0
            }            
        }
        promises.push(
            db.collection('accounts').doc(uid).update({
                [`memes.${name}`] : {
                    "uid": uid,
                    "username": uid,
                    // "timestamp": admin.firestore.FieldValue.serverTimestamp(),
                    "votes": 1,
                    "earnings": 0
                }        

            })
        )
        
    })

    return Promise.all(promises)
})
.then( function () {
    var uid = "redditbot"
    var promises = [] 
    filenames.forEach( name => {
        // var imageRef = bucket.child();
        promises.push(
            db.collection('memes').doc(name).set({
                "uid": uid,
                "username": uid,
                "timestamp": admin.firestore.FieldValue.serverTimestamp(),
                "votes": 1,
                "earnings": 0,
            })
        )
        
    })

    return Promise.all(promises)
})
.catch(function (err) {
           console.log(err)
        // API call failed...
});
