const fs = require('fs')
const auth = require('ibm-watson/auth');
const VR = require('ibm-watson/visual-recognition/v3');
const WA = require('ibm-watson/assistant/v2');
require('dotenv').config()

const vr = new VR({
    version: '2018-03-19',
    authenticator: new auth.IamAuthenticator({
        apikey: process.env.API_VR
    }),
    url: 'https://gateway.watsonplatform.net/visual-recognition/api',
    disableSslVerification: true
});

const msg = new WA({
    version: '2019-02-28',
    url: 'https://gateway.watsonplatform.net/assistant/api',
    authenticator: new auth.IamAuthenticator({
        apikey: process.env.API_WA
    }),
    disableSslVerification: true
})

let session = null;

exports.getWatson = (req, res) => {
    res.send('Method not allowed');
}

exports.postWatson = (req, res) => {
    console.log(req)
    if (req.files){
        vr.classify({
            imagesFile: new Buffer.from(req.file.buffer),
            owners: ['me'],
        }).then(data => {
            console.log(data);
            res.json({
                output: {
                    generic: [{
                        response_type: "text",
                        text: `Identifiquei que é um(a) ${data.result.images[0].classifiers[0].classes[0].class} com ${data.result.images[0].classifiers[0].classes[0].score}`
                    }]
                }
            })
        }).catch(err => {
            console.error(err);
            res.json({
                output: {
                    generic: [{
                        response_type: "text",
                        text: `Não consegui identificar a foto`
                    }]
                }
            });
        })
    }
    else {
        if (session == null) {
            msg.createSession({
                assistantId: process.env.assistant_id,
            }).then(sid => {
                session = sid.result.session_id
                msg.message({
                    assistantId: process.env.assistant_id,
                    sessionId: sid.result.session_id,
                    input: {
                        message_type: 'text',
                        text: req.body.input
                    }
                }).then(resp => {
                    res.json(resp);
                }).catch(error => {
                    console.error(error);
                    res.json(error);
                })
            }).catch(erro => {
                session = null
                res.send(erro)
            });
        }
        else {
            msg.message({
                assistantId: process.env.assistant_id,
                sessionId: session,
                input: {
                    message_type: 'text',
                    text: req.body.input
                }
            }).then(resp => {
                res.json(resp);
            }).catch(error => {
                console.error(error);
                res.json(error);
            })
        }
    }
}