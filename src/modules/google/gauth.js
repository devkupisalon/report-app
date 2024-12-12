import { __dirname } from '@config';
import { google } from 'googleapis';

const gauth = () => {
    const auth = new google.auth.GoogleAuth({
        keyFile: `${__dirname}/json/credentials.json`,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive.metadata.readonly'
        ],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const drive = google.drive({ version: 'v3', auth });
    const docs = google.docs({ version: 'v1', auth });
    return { sheets, drive, docs, access_token: auth.getCredentials.access_token };
};

export default gauth;