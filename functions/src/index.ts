import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-the-best-game.firebaseio.com"
});

const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
    response.json({
        message: "Hello from Firebase!"
    });
});

export const getTBG = functions.https.onRequest(async(request, response) => {
    // let param = request.query.name || 'Unknown';
    const dbDoc = db.collection('tbg');
    const docsSnapshot = await dbDoc.get();
    const games = docsSnapshot.docs.map(doc => doc.data());

    response.json(games);
});

// Express
const app = express();
app.use(cors({ origin: true }));

app.get('/tbg', async(request, response) => {
    const dbDoc = db.collection('tbg');
    const docsSnapshot = await dbDoc.get();
    const games = docsSnapshot.docs.map(doc => doc.data());

    response.json(games);
});

app.post('/tbg/:id', async(request, response) => {
    const id = request.params.id;
    const gameRef = db.collection('tbg').doc(id);
    const gameSnapshot = await gameRef.get();

    if (! gameSnapshot.exists) {
        response.status(404).json({
            success: false,
            message: 'Invalid game'
        });
    } else {
        const before = gameSnapshot.data() || { votes: 0 };

        await gameRef.update({
            votes: before.votes + 1
        });

        response.json({
            success: true,
            message: `You have voted for ${ before.name }. Thank you!`,
        });
    }
});

export const api = functions.https.onRequest(app);