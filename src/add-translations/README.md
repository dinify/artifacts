# Add Translations Script

This script needs a GCP `service-account.json` file.
The sheet must be shared with the email account connected with this service account.

## Add translations strings

In order to save translations strings, you first need to authorize a Google auth client by calling `const client = await authorizeClient();`;

The `saveTransaltions(auth)` takes thsi client as argument.
The sheet used is specified as `SHEET_ID` const.
The translations will be saved to `./translations/{lang}/{fileKey}.js` directory.

## Add ingredients translations
