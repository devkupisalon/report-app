import { constants } from '#config';
import logger from '#logger';

import gauth from './gauth.js';

const { docs, drive } = gauth();
const { DOCS_FOLDER_ID, GOOGLE_DOC_LINK } = constants;
const module = import.meta.filename;

const create_google_doc = async (title) => {
    try {
        const { data: { id } } = await drive.files.create({
            requestBody: {
                name: title,
                mimeType: 'application/vnd.google-apps.document',
                parents: [DOCS_FOLDER_ID]
            }
        });
        if (id) {
            await drive.permissions.create({
                fileId: id,
                requestBody: {
                    role: "reader",
                    type: "anyone"
                },
            });
            logger.success(`New google doc created successfully`, { module });
            return id;
        }
    } catch (error) {
        logger.error(`Error in create_google_doc: ${error}`, { module });
        return null;
    }
};

const add_report_to_document = async (data) => {
    logger.debug(JSON.stringify(data, null, 2));
    try {
        return Object.values(data).reduce(async (acc, { title, text }, i) => {
            if (text) {
                const documentId = await create_google_doc(title);
                const response = await docs.documents.batchUpdate({
                    documentId,
                    resource: {
                        requests: [
                            {
                                insertText: {
                                    text,
                                    location: {
                                        index: 1,
                                    },
                                },
                            },
                        ],
                    },
                });

                acc[i] = { link: GOOGLE_DOC_LINK(documentId) };

                if (response.data) {
                    logger.success(`Text successfully inserted in Google docs`, { module });
                }

            }

            return acc;
        }, {});
    } catch (error) {
        logger.error(`Error in add_report_to_document: ${error}`, { module });
        return false;
    }
};

export {
    add_report_to_document
};