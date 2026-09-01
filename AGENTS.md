# Stagware EmDash

When using the `stagware_cms` MCP server, limit changes to the `mantle` entry in the `projects` collection.

1. Create every content change as a draft.
2. Compare the draft with the published version before requesting approval.
3. Obtain the user's explicit approval before publishing or deleting content.
4. Obtain the user's explicit approval before changing any entry, collection, or resource outside Mantle.

Keep the Stagware EmDash API token only in the `STAGWARE_EMDASH_MANTLE_TOKEN` environment variable. Never write its value to repository files, configuration, instructions, logs, or documentation.
