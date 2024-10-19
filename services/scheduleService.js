// services/scheduleService.js
const schedule = require('node-schedule');
const { sendPrompt } = require('../src/index');  // Assuming sendPrompt is in index.js

function scheduleEmail(recipient, prompt, scheduleTime) {
    const job = schedule.scheduleJob(scheduleTime, async function() {
        try {
            // Call the sendPrompt function with recipient and prompt
            const threadId = await sendPrompt(recipient, prompt);
            console.log(`Scheduled email sent in thread: ${threadId}`);
        } catch (error) {
            console.error('Error sending scheduled email:', error);
        }
    });

    return job; // Return the job for reference if needed later
}

module.exports = {
    scheduleEmail
};
