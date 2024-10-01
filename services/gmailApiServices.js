const { google } = require('googleapis');

// Function to list Gmail Labels (unchanged)
async function listOfLabels(auth) {
    const gmail = google.gmail({ version: 'v1', auth });
    const res = await gmail.users.labels.list({
        userId: 'me',
    });

    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
        console.log('No labels found!');
        return;
    }

    console.log('Labels:');
    labels.forEach((label) => {
        console.log(` - ${label.name}`);
    });

    return labels;
}

async function sendEmail(auth, content) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });
        const encodedMessage = Buffer.from(content)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');  // Corrected Base64 padding issue

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });

        console.log('Email sent:', res.data);
        return res.data.threadId; // Return the threadId here
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

async function getRepliesInThread(auth, threadId) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.threads.get({
            userId: 'me',
            id: threadId,
        });

        const messages = res.data.messages;
        console.log(`Found ${messages.length} messages in the thread.`);

        // Loop through the messages to find replies (messages that aren't from you)
        const replies = messages.filter((message) => {
            const fromHeader = message.payload.headers.find(h => h.name === 'From');
            return fromHeader && !fromHeader.value.includes('your-email@example.com');  // Replace with your email
        });

        if (replies.length === 0) {
            console.log('No replies found!');
            return null;
        }

        // Extract the content of the replies
        const replyMessages = replies.map((reply) => {
            const body = reply.payload.parts ? reply.payload.parts[0].body.data : reply.payload.body.data;
            const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
            return {
                from: reply.payload.headers.find(h => h.name === 'From').value,
                body: decodedBody,
            };
        });

        return replyMessages;
    } catch (error) {
        console.error('Error retrieving thread replies:', error);
    }
}



async function readReplies(auth, threadId) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: `threadId:${threadId}`, // This will search for messages in the specified thread
        });

        if (!res.data.messages || res.data.messages.length === 0) {
            console.log('No replies found!');
            return [];
        }

        // Fetch full message details for all messages in the thread
        const replies = [];
        for (const message of res.data.messages) {
            const messageDetail = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
            });

            const body = messageDetail.data.payload?.body?.data || '';
            const decodedBody = Buffer.from(body, 'base64').toString();
            const from = messageDetail.data.payload.headers.find(header => header.name === 'From');

            replies.push({
                id: message.id,
                from: from ? from.value : 'unknown',
                body: decodedBody,
            });
        }

        return replies;
    } catch (error) {
        console.error('Error reading replies:', error);
        return [];
    }
}


// Function to get the latest message in your inbox (unchanged)
async function getLatestMessage(auth) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1,
        });

        if (!res.data.messages || res.data.messages.length === 0) {
            console.log('No messages found!');
            return;
        }

        let latestMessageId = res.data.messages[0].id;
        console.log(`Latest message id is: ${latestMessageId}`);

        const messageContent = await gmail.users.messages.get({
            userId: 'me',
            id: latestMessageId,
        });

        const body = messageContent.data.payload.body.data || 'No body content found';
        console.log('Latest message body:', Buffer.from(body, 'base64').toString());
    } catch (error) {
        console.error('Error getting latest message:', error);
    }
}

module.exports = {
    listOfLabels,
    sendEmail,
    readReplies,
    getLatestMessage,
    getRepliesInThread
};
