const admin = require('firebase-admin')
const serviceAccount = require('../momonga-credential.json')

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    database: 'https://momonga-8ec45.firebaseio.com/',
    storageBucket: 'momonga-8ec45.appspot.com/'
})

const functions = require('firebase-functions')
const express = require('express')
const app = express()

const db = admin.firestore()

app.get('/api/*', (request, response, next) => {
    response.contentType('json')
    response.header('Access-Control-Allow-Origin', '*')
    next()
})

app.get('/api/hello', (request, response) => {
    response.send('Hello World')
})

app.get('/api/likes', (request, response) => {
    const documents = db.collection('momonga')
    let array = []

    documents.get().then((snapshot) => {
        snapshot.forEach(doc => {
            const filter = request.query.filter
            if((!filter && filter != "") || doc.id.includes(filter)){
                array.push({'key': doc.id, 'count': doc.data().count, 'dates': doc.data().dates })
            }
        })
        response.send(array)
    })
})

app.get('/api/likes/:key', (request, response) => {
    const docRef = db.collection('momonga').doc(request.params.key)
    docRef.get().then(doc => {
        let count = 0
        if(doc.exists){
            count = doc.data().count
        }
        response.send({'key': request.params.key, 'count': count, 'dates': doc.data().dates })
    })
})

app.post('/api/likes/:key', (request, response) => {
    const docRef = db.collection('momonga').doc(request.params.key)
    let count = 1
    docRef.get().then(doc => {
        if (!doc.exists) {
            docRef.set({'key': request.params.key, 'count': 1, 'dates': [ new Date() ]})
        }
        else{
            count = doc.data().count + 1
            let array = doc.data().dates
            array.push(new Date())
            docRef.set({'key': request.params.key, 'count': count, 'dates': array})
        }
        console.log({'process': 'success', 'key': request.params.key, 'count': count })
        response.send({'process': 'success', 'key': request.params.key, 'count': count })
    }).catch(err => {
        response.status(401).send({'process': 'error', 'message': err, key: request.params.key })
    })
})

app.get('/api/downloads', (request, response) => {
  const documents = db.collection('momongadl')
  let array = []

  documents.get().then((snapshot) => {
      snapshot.forEach(doc => {
          const filter = request.query.filter
          if((!filter && filter != "") || doc.id.includes(filter)){
              array.push({'key': doc.key, 'count': doc.data().count, 'dates': doc.data().dates })
          }
      })
      response.send(array)
  })
})

app.get('/api/downloads/:path', (request, response) => {
    const docRef = db.collection('momongadl').doc(request.params.path)
    docRef.get().then(doc => {
        let count = 0
        if(doc.exists){
            count = doc.data().count
        }
        response.send({'key': request.params.path, 'count': count, 'dates': doc.data().dates })
    })
})

app.post('/api/downloads/:path', (request, response) => {
    const path = request.params.path
    const docRef = db.collection('momongadl').doc(path)
    
    let count = 1
    docRef.get().then(doc => {
        if (!doc.exists) {
            docRef.set({'key': path, 'count': 1, 'dates': [ new Date() ]})
        }
        else{
            count = doc.data().count + 1
            let array = doc.data().dates
            array.push(new Date())
            docRef.set({'key': path, 'count': count, 'dates': array})
        }
        admin.storage().bucket()
        // response.redirect(``)
    }).catch(err => {
        response.status(401).send({'process': 'error', 'message': err, 'key': path })
    })
})

exports.momonga = functions.https.onRequest(app);
