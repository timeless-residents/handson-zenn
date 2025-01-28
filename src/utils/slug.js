const crypto = require('crypto');

// 日付ベースのスラッグを生成
function generateDateBasedSlug(prefix = '') {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const hash = crypto.randomBytes(2).toString('hex');
    return `${prefix}${date}-${hash}`;
}

module.exports = {
    generateDateBasedSlug
};