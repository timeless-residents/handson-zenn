// 日本時間でのスラッグを生成
function generateDateBasedSlug(prefix = '') {
    const now = new Date();
    // JSTに変換 (+9時間)
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    
    // YYYYMMDD形式の日付
    const date = jst.toISOString().slice(0, 10).replace(/-/g, '');
    
    // 時刻部分 (HHmmss形式)
    const time = jst.toISOString().slice(11, 19).replace(/:/g, '');
    
    return `${prefix}-${date}-${time}`;
}

module.exports = {
    generateDateBasedSlug
};