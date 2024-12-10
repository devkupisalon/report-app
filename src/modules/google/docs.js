import { constants } from '../../config/constants.js';
import logger from '../../core/logger.js';
import gauth from './gauth.js';

const { docs } = gauth();
const { DOCS_FOLDER_ID } = constants;
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
        const { title, text } = data;
        const documentId = await create_google_doc(title);
        const { data } = await docs.documents.batchUpdate({
            documentId,
            resource: {
                requests: [
                    {
                        insertText: {
                            text: text,
                            location: {
                                endIndex: 1,
                            },
                        },
                    },
                ],
            },
        });
        if (data) {
            logger.success(`Text successfully inserted in Google docs`, { module });
        }
    } catch (error) {
        logger.error(`Error in add_report_to_document: ${error}`, { module });
        return false;
    }
};

export {
    add_report_to_document
};