const admin = require('firebase-admin')
const serviceAccount = require('../momonga-8ec45-firebase-adminsdk-l2i2l-c091504c65.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  database: 'https://momonga-8ec45.firebaseio.com/'
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
      if(!request.query.filter || doc.id.includes(request.query.filter)){
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
    console.log({'key': request.params.key, 'count': count })
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

})

app.get('/api/downloads/:path', (request, response) => {

})

exports.momonga = functions.https.onRequest(app);
