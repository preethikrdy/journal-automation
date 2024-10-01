const authorize = require('../services/googleApiAuthService');
const { sendEmail, readReplies, getRepliesInThread } = require('../services/gmailApiServices');

async function testing() {
    try {
        let auth = await authorize();

        // Send an email and get the threadId
        let message = 'TO: reddy.preethu@gmail.com\n' +  // Replace with actual recipient
            'Subject: Test Email\n' +
            'Content-Type: text/html; charset=utf-8\n\n' +
            'Hello World!';
        
       // const threadId = await sendEmail(auth, message);
        //console.log(`Email sent in thread: ${threadId}`);

        // Wait for some time to get replies (you can adjust this as needed)

      //  Now check for replies in the thread
        const replies = await getRepliesInThread(auth, '19244201a4d1144c');
        if (replies && replies.length > 0) {
            console.log('Replies received:');
            replies.forEach((reply, index) => {
                console.log(`Reply #${index + 1} from ${reply.from}:`);
                console.log(reply.body);
            });
        } else {
            console.log('No replies found.');
        }
    } catch (error) {
        console.error(error);
    }
}

testing();


