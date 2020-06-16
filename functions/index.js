const admin = require('firebase-admin')
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    database: 'https://momonga-8ec45.firebaseio.com/',
    storageBucket: 'gs://momonga-8ec45.appspot.com/'
})

// const serviceAccount = require('../momonga-credential.json')
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     database: 'https://momonga-8ec45.firebaseio.com/',
//     storageBucket: 'gs://momonga-8ec45.appspot.com/'
// })

const functions = require('firebase-functions')
const express = require('express')
const exp = express()

const db = admin.firestore()

exp.get('/api/*', (request, response, next) => {
    response.contentType('json')
    response.header('Access-Control-Allow-Origin', '*')
    next()
})

exp.post('/api/*', (request, response, next) => {
    response.contentType('json')
    response.header('Access-Control-Allow-Origin', '*')
    next()
})

exp.get('/api/likes', (request, response) => {
    const documents = db.collection('momonga')
    let array = []

    documents.get().then((snapshot) => {
        snapshot.forEach(doc => {
            const filter = request.query.filter
            if((!filter && filter !== "") || doc.id.includes(filter)){
                let item = { key: doc.id, count: doc.data().count }
                if(request.query.dates === "true"){
                    item.dates = doc.data().dates
                }
                array.push(item)
            }
        })
        response.send(array)
        return
    }).catch((err) => {
        console.warn(`message: ${err}, endpoint: /api/likes, key: ${request.params.key}`)
        response.status(401).send({
            'process': 'error', endpoint: '/api/likes',
            'message': err, key: request.params.key
        })
    })
})

exp.get('/api/likes/:key', (request, response) => {
    const docRef = db.collection('momonga').doc(request.params.key)
    docRef.get().then(doc => {
        let count = 0
        if(doc.exists){
            count = doc.data().count
        }
        response.send({'key': request.params.key, 'count': count, 'dates': doc.data().dates })
        return
    }).catch(err => {
        // response.status(401).send({
        //     'process': 'error', endpoint: `/api/likes/${request.params.key}`,
        //     'message': err, method: 'get', key: request.params.key
        // })
        response.send({key: request.params.key, count: 0, dates: []})
        return err
    })
})

exp.post('/api/likes/:key', (request, response) => {
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
        response.send({'process': 'success', 'key': request.params.key, 'count': count })
        return
    }).catch(err => {
        const data = {key: request.params.key, 'count': 1, 'dates': [ new Date() ]}
        docRef.set(data)
        data.process = 'success'
        response.send(data)
        return err
    })
})

exp.get('/api/downloadcount/:type', (request, response) => {
    const type = request.params.type
    const documents = db.collection(`momonga-${type}`)
    let array = []

    documents.get().then((snapshot) => {
        snapshot.forEach(doc => {
            const filter = request.query.filter
            if((!filter && filter !== "") || doc.id.includes(filter)){
                const data = doc.data()
                let item = { key: data.key, count: data.count }
                if(request.query.all === "true"){
                    item.dates = data.dates
                    item.addresses = data.addresses
                }
                array.push(item)
            }
        })
        response.send(array)
        return
    }).catch(err => {
        console.warn(`message: ${err}, endpoint: /api/downloadcoubnt/${type}`)
        response.status(401).send({
            'process': 'error', endpoint: `/api/downloadcount/${type}`,
            'message': err
        })
    })
})

const findDownloads = (type, request, response) => {
    const docRef = db.collection(`momonga-${type}`).doc(`${request.params.path}`)
    docRef.get().then(doc => {
        if(doc.exists){
            response.send({
                key: doc.data().key, count: doc.data().count,
                type: type, dates: doc.data().dates,
                addresses: doc.data().addresses
            })
        }
        else{
            response.send({
                key: request.params.path, count: 0, type: type, dates: [], addresses: []
            })
        }
        return
    }).catch(err => {
        console.warn(`key: ${request.params.path}, message: ${err}, endpoint: /api/downloadcoubnt/${type}/${request.params.path}`)
        response.status(401).send({
            'key': request.params.path, message: err,
            endpoint: `/api/downloadcount/${type}/${request.params.path}`
        })
    })
}

exp.get('/api/downloadcount/papers/:path', (request, response) => {
    findDownloads('papers', request, response)
})

exp.get('/api/downloadcount/samples/:path', (request, response) => {
    findDownloads('samples', request, response)
})

exp.get('/api/downloadcount/theses/:path', (request, response) => {
    findDownloads('theses', request, response)
})

exp.get('/api/downloadcount/posters/:path', (request, response) => {
    findDownloads('posters', request, response)
})

const getIP = (req) => {
    if (req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'];
    }
    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
    if (req.connection.socket && req.connection.socket.remoteAddress) {
        return req.connection.socket.remoteAddress;
    }
    if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress;
    }
    return '0.0.0.0';
};

const downloads = (type, request, response) => {
    const path = request.params.path
    const docRef = db.collection(`momonga-${type}`).doc(path)

    let ext = '.pdf'
    let count = 1
    docRef.get().then(doc => {
        if(doc.exists){
            count = doc.data().count + 1
            let array = doc.data().dates
            let addresses = doc.data().addresses
            array.push(new Date())
            addresses.push(getIP(request))
            docRef.set({key: path, count: count, dates: array, addresses: addresses})
        }
        else {
            docRef.set({key: path, count: 1, dates: [ new Date() ], addresses: [ getIP(request) ]})
        }
        if(request.query.ext !== undefined){
            ext = '.' + request.query.ext
        }
        const file = admin.storage().bucket().file(`${type}/${path}${ext}`)
        if(!file.exists){
            console.warn(`${path}${ext}: file not found, type: ${type}, path: ${path}`)
            response.status(404).send({
                'process': 'error', error: err,
                'message': `${path}${ext}: file not found`, 'key': path
            })
            return
        }
        file.getMetadata((api, metadata, apiResponse) => {
            response.append('Content-Disposition', `attachment; filename="${path}${ext}"`)
            response.contentType(metadata.contentType)
            const stream = file.createReadStream({ start: 0, end: metadata.size })
                  .on('data',     (data) => { response.write(data) })
                  .on('end',      ()     => { response.end() })
        })
        return
    }).catch(err => {
        console.warn(`message: ${err}, key: ${path}, path: /api/downloads/${type}/${path}${ext}`)
        response.status(401).send({
            'process': 'error', 'message': err, 'key': path,
            endpoint: `/api/downloads/${type}/${path}${ext}`
        })
    })
}

exp.get('/api/downloads/papers/:path', (request, response) => {
    downloads('papers', request, response)
})

exp.get('/api/downloads/posters/:path', (request, response) => {
    downloads('posters', request, response)
})

exp.get('/api/downloads/samples/:path', (request, response) => {
    downloads('samples', request, response)
})

exp.get('/api/downloads/theses/:path', (request, response) => {
    downloads('theses', request, response)
})

exports.momonga = functions.https.onRequest(exp);
