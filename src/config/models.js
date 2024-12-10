/**
 * @typedef {Object} Main_Report
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
 * @type {Main_Report}
 */
const report_sample = {
    name: "John Doe",
    tg_username: "johndoe123",
    content_count: 10,
    photo_count: 5,
    video_count: 3,
    confirm_photo: 2,
    confirm_video: 1,
    photo: 4,
    video: 2,
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
        type: "Report",
        url: "http://example.com",
        yes: "Yes",
        no: "No",
        comment: "Great work!",
        link: "http://example.com/details",
        path: "/documents/reports",
    },
    1: {}
};
