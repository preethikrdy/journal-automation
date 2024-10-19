class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.scheduling = []; // Composition
    }

    // Methods related to user actions
    saveEntry(category, entry) {
        this.scheduling.addEntry(category, entry);
    }

    getSchedulingEntries() {
        return this.scheduling.getEntries();
    }
}
