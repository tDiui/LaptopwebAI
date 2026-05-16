// Giả lập dữ liệu nền ban đầu để biểu đồ có hình dáng đẹp
let dashboardChartData = [
    { name: 'T2', traffic: 120, aiRequests: 45 },
    { name: 'T3', traffic: 150, aiRequests: 60 },
    { name: 'T4', traffic: 180, aiRequests: 85 },
    { name: 'T5', traffic: 160, aiRequests: 70 },
    { name: 'T6', traffic: 210, aiRequests: 95 },
    { name: 'T7', traffic: 250, aiRequests: 120 },
    { name: 'CN', traffic: 200, aiRequests: 90 },
];

// Hàm tăng lượt đếm (Sẽ gọi khi Chatbot trả lời)
const trackAiRequest = () => {
    let today = new Date().getDay(); // 0 là CN, 1 là T2...
    let index = today === 0 ? 6 : today - 1; // Đưa CN xuống cuối mảng

    dashboardChartData[index].aiRequests += 1; // Tăng 1 lượt AI
    dashboardChartData[index].traffic += 2;    // Tăng nhẹ 2 lượt truy cập

    console.log(`📈 [TRACKER] Đã ghi nhận 1 lượt gọi AI vào hôm nay! (Tổng: ${dashboardChartData[index].aiRequests})`);
};

// Hàm lấy dữ liệu (Sẽ gọi khi Dashboard cần vẽ biểu đồ)
const getChartData = () => {
    return dashboardChartData;
};

module.exports = { trackAiRequest, getChartData };