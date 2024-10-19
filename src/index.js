const { google } = require('googleapis');
const authorize = require('../services/googleApiAuthService');
const { sendEmail, readReplies, getRepliesInThread } = require('../services/gmailApiServices');

// Fix for sendEmail declaration conflict
const sendEmailHelper = async (auth, recipient, prompt, subject = 'Test Email') => {
    const gmail = google.gmail({ version: 'v1', auth });

    console.log('Sending email to:', recipient);

  
    const rawMessage = [
      `To: <${recipient}>`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      '',
      prompt,
    ].join('\n');
  
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  
    try {
      const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      console.log('Email sent successfully!');
      return result.data.threadId;  // Return thread ID if needed for replies
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  };
  

const sendPrompt = async (recipient, prompt, subject) => {
    try {
      const auth = await authorize();
      const threadId = await sendEmailHelper(auth, recipient, prompt, subject);
      console.log(`Email sent in thread: ${threadId}`);
      return threadId;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  };
  

async function retrieveReplies(threadId) {
  try {
    const auth = await authorize();
    const replies = await getRepliesInThread(auth, threadId);

    if (replies && replies.length > 0) {
      //console.log('Replies received:');
      replies.forEach((reply, index) => {
        console.log(`Reply #${index + 1} from ${reply.from}:`);
        console.log(reply.body);
      });
    } else {
      console.log('No replies found.');
    }
    return replies;
  } catch (error) {
    console.error('Error retrieving replies:', error);
    throw new Error('Failed to retrieve replies');
  }
}

module.exports = {
    sendPrompt,
   retrieveReplies,
    getRepliesInThread,
    // other exports if necessary
};