/**
 * @typedef {Object} Middleware_Main_Report
 * @property {string} name
 * @property {string} tg_username
 * @property {number} content_count
 * @property {number} photo_count
 * @property {number} video_count
 * @property {number} confirm_photo
 * @property {number} confirm_video
 * @property {number} photo
 * @property {number} video
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
    confirmed_photo: 2,
    confirmed_video: 1,
    plan_photo: 4,
    plan_video: 2,
    range_link: "http://example.com"
};

/**
 * @typedef {Object} Detailed_Report
 * @property {string} name
 * @property {Date} date
 * @property {string} type
 * @property {string} url
 * @property {string} yes
 * @property {string} no
 * @property {string} comment
 * @property {string} link
 * @property {string} path
 */

/**
 * @type {Detailed_Report}
 */
const detailed_report_sample = {
    0: {
        name: "Alice",
        date: "2024-12-10",
        type: "Photo",
        google_link: "http://example.com",
        confirm: "Yes",
        not_accepted: "No",
        comment: "Great work!",
        yandex_link: "http://example.com/details",
        ynadex_path: "disk://documents/reports",
    },
    1: {/** others... */}
};
