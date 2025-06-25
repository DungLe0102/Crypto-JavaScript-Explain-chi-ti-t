// Hàm lấy cấu hình theme cho widget
function getThemeConfig() {
    // Lấy đối tượng CSSStyleDeclaration đại diện cho các biến CSS của phần tử gốc (document.documentElement)
    const root = getComputedStyle(document.documentElement);

    // Lấy theme từ localStorage (bộ nhớ cục bộ của trình duyệt), so sánh với 'light-theme'
    // localStorage: API lưu trữ dữ liệu dạng key-value trên trình duyệt
    // Toán tử 3 ngôi (ternary operator): điều kiện ? giá trị_đúng : giá trị_sai
    const isDarkTheme = localStorage.getItem('theme') === 'light-theme' ? false : true;

    // Lấy giá trị biến CSS cho màu nền dựa vào theme hiện tại
    // getPropertyValue: lấy giá trị biến CSS custom property
    // trim(): loại bỏ khoảng trắng ở đầu và cuối chuỗi
    const backgroundColor = root.getPropertyValue(isDarkTheme ? '--chart-dark-bg' : '--chart-light-bg').trim();

    // Lấy giá trị biến CSS cho màu viền lưới dựa vào theme hiện tại
    const gridColor = root.getPropertyValue(isDarkTheme ? '--chart-dark-border' : '--chart-light-border').trim();

    // Trả về một object (đối tượng) chứa cấu hình cho widget
    // Object literal: cú pháp khai báo đối tượng trong JS
    return {
        "autosize": true, // Tự động điều chỉnh kích thước
        "symbol": "BITSTAMP:BTCUSD", // Mã giao dịch
        "interval": "D", // Khung thời gian (D: ngày)
        "timezone": "Asia/Ho_Chi_Minh", // Múi giờ
        "theme": "dark", // Chủ đề (theme)
        "style": "1", // Kiểu hiển thị
        "locale": "vi_VN", // Ngôn ngữ
        "withdateranges": true, // Hiển thị dải ngày
        "allow_symbol_change": true, // Cho phép đổi mã giao dịch
        "details": true, // Hiển thị chi tiết
        "hotlist": true, // Hiển thị danh sách nóng
        "show_popup_button": true, // Hiện nút popup
        "popup_width": "1000", // Chiều rộng popup
        "popup_height": "650", // Chiều cao popup
        "support_host": "https://www.tradingview.com" // Host hỗ trợ
    };
}

// Hàm khởi tạo widget
function initializeWidget() {
    // Gọi hàm getThemeConfig để lấy cấu hình widget
    const widgetConfig = getThemeConfig();

    // Gọi hàm createWidget (giả định đã được định nghĩa ở nơi khác) để tạo widget
    // Truyền vào id, cấu hình, và đường dẫn script nhúng
    createWidget('chart-widget', widgetConfig, 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js');
}

// Gọi hàm initializeWidget để khởi tạo widget khi file được chạy
initializeWidget();