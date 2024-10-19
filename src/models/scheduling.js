class Scheduling {
    constructor(category, days, time, entries) {
        this.entries = [];
        this.category = category;
        this.days = days;
        this.time = time;
        this.entries = entries;
    }

    addEntry(category, entry) {
        this.entries.push({
            category,
            entry,
            date: new Date(),
        });
    }

    getEntries() {
        return this.entries;
    }

    // Additional methods for managing scheduling can be added here
}
