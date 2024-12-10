/**
 * @typedef {Object} Middleware_Main_Report
 * @property {string} name
 * @property {string} tg_username
 * @property {number} content_count
 * @property {number} photo_count
 * @property {number} video_count
 * @property {number} photo_accpet
 * @property {number} video_accept
 * @property {number} photo_plan
 * @property {number} video_plan
 * @property {string} range_link
 */

/**
 * @type {Middleware_Main_Report}
 */
const report_sample = {
    name: "John Doe",
    tg_username: "johndoe123",
    all_content_count: 10,
    photo_count: 5,
    video_count: 3,
    photo_accept: 2,
    video_accept: 1,
    photo_plan: 4,
    video_plan: 2,
    range_link: "http://example.com"
};

/**
 * @typedef {Object} Detailed_Report
 * @property {string} name
 * @property {string} username
 * @property {Date} date
 * @property {string} type
 * @property {string} goole_url
 * @property {string} accept
 * @property {string} reject
 * @property {string} comment
 * @property {string} yandex_link
 * @property {string} yandex_path
 */

/**
 * @type {Detailed_Report}
 */
const detailed_report_sample = {
    0: {
        name: "Alice",
        username: "AliceTouch",
        date: "2024-12-10",
        type: "Photo",
        google_link: "http://example.com",
        confirm: "TRUE",
        not_accepted: "FALSE",
        comment: "Great work!",
        yandex_link: "http://example.com/details",
        ynadex_path: "disk://documents/reports",
    },
    /** others... */
};
