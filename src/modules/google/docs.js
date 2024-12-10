import { constants } from '../../config/constants.js';
import logger from '../../core/logger.js';
import gauth from './gauth.js';

const { docs, drive } = gauth();
const { DOCS_FOLDER_ID, GOOGLE_DOC_LINK } = constants;
const module = import.meta.filename;

const create_google_doc = async (title) => {
    try {
        const { data: { documentId } } = await docs.documents.create({
            resource: {
                title,
                parents: [DOCS_FOLDER_ID],
            },
            fields: 'documentId',
        });
        if (documentId) {
            await drive.permissions.create({
                fileId: documentId,
                requestBody: {
                    role: "reader",
                    type: "anyone"
                },
            });
            logger.success(`New google doc created successfully`, { module });
            return documentId;
        }
    } catch (error) {
        logger.error(`Error in create_google_doc: ${error}`, { module });
        return null;
    }
};

const add_report_to_document = async (data) => {
    try {
        return Object.values(data).reduce(async (acc, { title, text }, i) => {
            const documentId = await create_google_doc(title);
            const response = await docs.documents.batchUpdate({
                documentId,
                resource: {
                    requests: [
                        {
                            insertText: {
                                text,
                                location: {
                                    endIndex: 1,
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