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

app.get('/api/downloads/:type', (request, response) => {
    const type = request.params.type
    const documents = db.collection('momonga-${type}')
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

const findDownloads = (type, request, response) => {
    const docRef = db.collection(`momonga-${type}`).doc(`${request.params.path}`)
    console.log(`downloads ${type}: ${request.params.path}`)
    docRef.get().then(doc => {
        let count = 0
        let array = []
        if(doc.exists){
            count = doc.data().count
            array = doc.data().dates
        }
        response.send({'key': request.params.path, 'count': count, 'dates': array })
    })
}

app.get('/api/downloadcount/papers/:path', (request, response) => {
    findDownloads('papers', request, response)
})

app.get('/api/downloadcount/posters/:path', (request, response) => {
    findDownloads('posters', request, response)
})

const downloads = (type, request, response) => {
    const path = request.params.path
    const docRef = db.collection(`momonga-${type}`).doc(path)
    
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
        const file = admin.storage().bucket().file(`${type}/${path}`)
        if(!file.exists()){
            response.status(404).send({'process': 'error',
                                       'message': `${path}: file not found`, 'key': path})
            return
        }
        file.getMetadata((api, metadata, apiResponse) => {
            response.contentType(metadata.contentType)
            response.append('Content-Disposition', `attachment; filename="${path}"`)
            const stream = file.createReadStream({ start: 0, end: metadata.size })
                  .on('data',     (data) => { response.write(data) })
                  .on('end',      ()     => { response.end() })
        })
    }).catch(err => {
        response.status(401).send({'process': 'error', 'message': err, 'key': path })
    })
}

app.get('/api/downloads/papers/:path', (request, response) => {
    downloads('papers', request, response)
})
app.get('/api/downloads/posters/:path', (request, response) => {
    downloads('posters', request, response)
})

exports.momonga = functions.https.onRequest(app);
