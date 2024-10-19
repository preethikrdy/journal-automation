const express = require("express");
const session = require("express-session");
const path = require("path");
const hbs = require("hbs");
const collection = require("./mongodb");
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { sendEmail } = require('../services/scheduleService');  // Assuming you have a function to send emails
const { sendPrompt } = require('../src/index'); // Make sure this points to your updated index.js file
const promptCategories = require('../data/prompt');  // Import prompts
const { signup, login, router: userRouter } = require('../services/userController'); // Import userController

const app = express();
const templatePath = path.join(__dirname, '../templates');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "hbs");
app.set("views", templatePath);

// Configure session middleware
app.use(session({
    secret: 'yourSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to log session data for debugging
app.use((req, res, next) => {
    console.log("Session Data:", req.session); // Log the session data
    next();
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", signup); // Use the signup function from userController

app.post("/login", async (req, res) => {
    try {
        // Assuming login logic to validate the user
        const { userName, password } = req.body; // Make sure you are using 'userName' in your form
        const user = await collection.findOne({ userName });

        if (!user) {
            return res.status(400).send("User not found");
        }

        // You should verify the password here (using bcrypt or other)
        // Assuming password is correct, set the username in the session
        req.session.username = user.userName;
        console.log("Username stored in session:", req.session.username); // Check if username is correctly stored
        console.log("email stored in session", req.session.email);

        // Redirect to home with user's first and last name
        res.redirect(`/home?firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}`);
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Error occurred during login");
    }
});

app.get("/home", (req, res) => {
    const firstName = req.query.firstName;
    const lastName = req.query.lastName;
    const username = req.session.username; // Access the username from session

    console.log("Accessed username from session in /home:", username); // Debugging log

    if (!username) {
        return res.redirect("/"); // Redirect to login if session is missing
    }

    res.render("home", { firstName, lastName, username });
});

app.post("/schedule", async (req, res) => {
    try {
        const { category, scheduledDays, scheduledTime, scheduledDate } = req.body;
        const userEmail = req.session.email;
        console.log(req.body);

        const username = req.session.username;

        if (!username) {
            return res.status(400).json({ message: 'User not logged in' });
        }

        // Find the user by username
        const user = await collection.findOne({ userName: username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Received category:', category);

        // Check if the category is valid
        if (!promptCategories[category]) {
            return res.status(400).json({ message: 'Invalid category specified' });
        }

        const availablePrompts = promptCategories[category];

        // Check if availablePrompts is not empty
        if (!availablePrompts || availablePrompts.length === 0) {
            return res.status(400).json({ message: 'No prompts available for the selected category' });
        }

        // Select a random prompt
        const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

        // Create a new journal prompt entry
        const newEntry = {
            prompt: randomPrompt,
            scheduledDays: scheduledDays,
            scheduledTime: scheduledTime,
            scheduledDate: new Date(scheduledDate),
            response: null,
            sent: false
        };

        // Add the new entry to the user's journalPrompts array
        user.journalPrompts.push(newEntry);

        // Save the updated user document
        await user.save();

        // Immediately send the email with the random prompt
        const threadId = await sendPrompt(email, randomPrompt, "jot journal entry");
        console.log(`Prompt "${randomPrompt}" sent to ${email} in thread: ${threadId}`);

        // Optionally update the user document to mark the prompt as sent
        newEntry.sent = true; // Mark as sent
        await user.save(); // Save the updated user document

        res.json({ message: 'Email sent successfully! Your prompt has been sent.' });
    } catch (error) {
        console.error("Error in /schedule:", error);
        res.status(500).json({ message: 'An error occurred while sending the email.' });
    }
});



// app.post("/schedule", async (req, res) => {
//     try {
//         const { category, scheduledDays, scheduledTime, scheduledDate, email } = req.body;

//         const username = req.session.username;

//         if (!username) {
//             return res.status(400).json({ message: 'User not logged in' });
//         }

//         // Find the user by username
//         const user = await collection.findOne({ userName: username });

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         console.log('Received category:', category);

//         // Check if the category is valid
//         if (!promptCategories[category]) {
//             return res.status(400).json({ message: 'Invalid category specified' });
//         }

//         const availablePrompts = promptCategories[category];



//         // Check if availablePrompts is not empty
//         if (!availablePrompts || availablePrompts.length === 0) {
//             return res.status(400).json({ message: 'No prompts available for the selected category' });
//         }

//         // Select a random prompt
//         const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];

//         // Create a new journal prompt entry
//         const newEntry = {
//             prompt: randomPrompt,
//             scheduledDays: scheduledDays,
//             scheduledTime: scheduledTime,
//             scheduledDate: new Date(scheduledDate),
//             response: null,
//             sent: false
//         };

//         // Add the new entry to the user's journalPrompts array
//         user.journalPrompts.push(newEntry);

//         // Save the updated user document
//         await user.save();

//         // Now, schedule the email to be sent at the specified time using cron
//         const [hour, minute] = scheduledTime.split(':');  // Assuming 'HH:MM' format
//         const cronDays = scheduledDays.join(',');         // Convert days to a cron-friendly format like '1,3,5' for Mon, Wed, Fri

//         // Create a cron schedule based on the user-specified days and time
//         cron.schedule(`${minute} ${hour} * * ${cronDays}`, async () => {
//             try {
//                 // Call your email sending function here
//                 const threadId = await sendPrompt(email, randomPrompt);
//                 console.log(`Prompt "${randomPrompt}" sent to ${email} in thread: ${threadId}`);

//                 // Optionally update the user document to mark the prompt as sent
//                 user.journalPrompts.forEach(prompt => {
//                     if (prompt.prompt === randomPrompt && !prompt.sent) {
//                         prompt.sent = true;
//                     }
//                 });
//                 await user.save();

//             } catch (error) {
//                 console.error("Error sending email:", error);
//             }
//         });

//         res.json({ message: 'Scheduling successful! Your prompt will be sent based on your schedule.' });
//     } catch (error) {
//         console.error("Error in /schedule:", error);
//         res.status(500).json({ message: 'An error occurred while scheduling.' });
//     }
// });


app.get("/retrieve-replies/:threadId", async (req, res) => {
    try {
        const { threadId } = req.params;

        // Call the retrieveReplies function and return the results
        const replies = await retrieveReplies(threadId);

        if (replies && replies.length > 0) {
            res.json({ replies });
        } else {
            res.json({ message: 'No replies found.' });
        }
    } catch (error) {
        console.error("Error retrieving replies:", error);
        res.status(500).json({ message: 'Failed to retrieve replies' });
    }
});



app.use(userRouter);

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
