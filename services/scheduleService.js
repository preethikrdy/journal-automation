// services/scheduleService.js
const schedule = require('node-schedule');
const { sendEmail } = require('./gmailApiServices');

function scheduleEmail(auth, emailContent, scheduleTime) {
    const job = schedule.scheduleJob(scheduleTime, async function() {
        try {
            await sendEmail(auth, emailContent);
            console.log('Email sent successfully!');
        } catch (error) {
            console.error('Error sending scheduled email:', error);
        }
    });

    return job; // Return the job for reference if needed later
}

module.exports = {
    scheduleEmail
};
