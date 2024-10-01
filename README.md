# Email Automation Web Application

## Overview

This project is a web application that allows users to log in, select email prompts, and receive emails daily. Users can respond to the emails, and their replies will be saved in the application. The application utilizes the Gmail API for sending and reading emails and MongoDB for user data storage.

## Features

- User Authentication (Sign Up / Login)
- Email Sending Functionality
- Reply Tracking for Emails
- User-Friendly Dashboard
- Scheduling Emails

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Email API**: Gmail API
- **Frontend**: HTML, CSS, Handlebars (HBS)

## File Structure

```
/project-root
├── /public
│   ├── home.css
│   ├── login.css
│   └── signup.css
├── /services
│   ├── googleApiAuthService.js
│   └── gmailApiServices.js
├── /src
│   ├── findex.js         # Main server file
│   └── mongodb.js        # MongoDB connection and schema
├── /templates
│   ├── home.hbs
│   ├── login.hbs
│   └── signup.hbs
└── index.js              # Initial testing file
```

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB server running locally or accessible via a URI.
- Gmail API credentials (Refer to [Gmail API Documentation](https://developers.google.com/gmail/api/quickstart/nodejs) to obtain your `credentials.json`).

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Install the required dependencies:

   ```bash
   npm install
   ```

3. Set up your Gmail API credentials:
   - Place your `credentials.json` file in the project root directory.
   - When you first run the application, it will prompt you to authorize access and generate `token.json`.

### Running the Application

1. Start the server:

   ```bash
   node src/findex.js
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. You can now sign up and log in to the application.

## Current Status

Please note that this project is still a work in progress. I am currently focusing on connecting the frontend with the backend to ensure a seamless user experience. Some functionalities may not be fully implemented yet, and further improvements will be made over time.

## Usage

- Upon logging in, users can select various email functionalities.
- Users can receive email prompts daily and respond to them.
- Replies to emails will be tracked and saved in the application.

## Important Notes

- Ensure you have configured the appropriate OAuth 2.0 credentials in the Google Developer Console.
- The `token.json` file will be generated automatically upon first authentication and should be kept private.
- Make sure to set the necessary OAuth scopes in your `googleApiAuthService.js`.

## Contributing

Contributions are welcome! Please create an issue or submit a pull request if you would like to contribute to the project.
