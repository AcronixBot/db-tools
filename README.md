# MongoDB Tools

This Repo includes some tools to make the work easer with MongoDB. Whether you're safeguarding your data with backups, restoring from previous backups, synchronizing local schemas with your MongoDB database, or updating entries in collections based on local schemas, this repository should provide a versatile set of tools to simplify your workflow.

### Key Features:

- **Backup Utility**: Efficiently create backups of MongoDB databases with just a simple command. Protect your valuable data and ensure its availability in case of unforeseen circumstances.

- **Restore Tool** _(Planned)_: Seamlessly restore databases from previously created backups. Quickly recover from data loss or corruption incidents with minimal downtime.

- **Schema Synchronization** _(Planned)_: Compare and synchronize local schemas with your MongoDB database effortlessly. Ensure consistency and integrity across your data infrastructure with ease.

- **Collection Entry Update** _(Planned)_: Update entries in collections within your MongoDB database based on local schemas. Keep your data up-to-date and in sync with your application requirements without manual intervention.

## Create a Backup

To Create a backup you only need to build the javascript and run the cli.

1. `npm install` to install all required packages
2. `npm run build` creates the javascript code
3. `npm run db-backup` starts the backup process.

By default the CLI trys to read the configuration from the json file in `config/db.config.json`

- The json schema

```json
{
  "connectionString": "mongodb+srv://<myDatabaseUser>:<D1fficultP%40ssw0rd>@cluster0.example.mongodb.net/<database>?retryWrites=true&w=majority",
  "zip": true
}
```

- `zip` -> Either create a zip or leave it in the temp dir
- `connectionString` Your connection string to the database you want to backup

The Backup will be safed in a .zip in `backup` when `zip` is `true`. Or the json will be safed in `temp` if `zip` is `false`

## Bugs

⚠️ I know there a some bugs in the Database Backup but these tools are in an early Development!

## TODOS

- [ ] DatabaseRestore Command
- [ ] DatabaseCompare Command
- [ ] Rewort the CLI file and create a better command handler

## Contribute

If you want to contribute something i am open for it
