// ==================== PHẦN 1: LẤY CÁC PHẦN TỬ DOM ====================
// DOM (Document Object Model) là cách JavaScript tương tác với HTML
// document.getElementById() là phương thức để chọn phần tử HTML bằng id
const coinsCount = document.getElementById('coins-count'); // Lấy phần tử hiển thị số lượng coin
const exchangesCount = document.getElementById('exchanges-count'); // Lấy phần tử hiển thị số lượng sàn giao dịch
const marketCap = document.getElementById('marketCap'); // Lấy phần tử hiển thị tổng vốn hóa thị trường
const marketCapChangeElement = document.getElementById('marketCapChange'); // Lấy phần tử hiển thị % thay đổi vốn hóa
const volume = document.getElementById('volume'); // Lấy phần tử hiển thị khối lượng giao dịch
const dominance = document.getElementById('dominance'); // Lấy phần tử hiển thị tỷ lệ thống trị của BTC và ETH

// ==================== PHẦN 2: SỰ KIỆN KHI TRANG ĐƯỢC TẢI XONG ====================
// DOMContentLoaded là sự kiện xảy ra khi HTML đã được tải và phân tích xong
document.addEventListener("DOMContentLoaded", () => {
    // Lấy các phần tử liên quan đến chức năng chuyển đổi giao diện (theme)
    const themeToggle = document.getElementById('theme-toggle'); // Nút chuyển đổi theme
    const body = document.body; // Thẻ body của trang

    // Kiểm tra nếu đã lưu theme trong localStorage (bộ nhớ trình duyệt)
    // localStorage giúp lưu dữ liệu ngay cả khi đóng trình duyệt
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.id = savedTheme; // Áp dụng theme đã lưu
        updateIcon(savedTheme); // Cập nhật biểu tượng tương ứng
    }

    // ==================== PHẦN 3: XỬ LÝ CHUYỂN ĐỔI THEME ====================
    // Thêm sự kiện click cho nút chuyển đổi theme
    themeToggle.addEventListener('click', () => {
        // Kiểm tra theme hiện tại để chuyển đổi
        if (body.id === 'light-theme') {
            body.id = 'dark-theme'; // Chuyển sang dark theme
            localStorage.setItem('theme', 'dark-theme'); // Lưu vào localStorage
            updateIcon('dark-theme'); // Cập nhật biểu tượng
        } else {
            body.id = 'light-theme'; // Chuyển sang light theme
            localStorage.setItem('theme', 'light-theme'); // Lưu vào localStorage
            updateIcon('light-theme'); // Cập nhật biểu tượng
        }

        // Nếu có hàm initializeWidget thì gọi lại để cập nhật widget theo theme mới
        if (typeof initializeWidget === 'function') {
            initializeWidget();
        }
    });

    // Hàm cập nhật biểu tượng theme (mặt trời/trăng)
    function updateIcon(currentTheme) {
        if (currentTheme === 'light-theme') {
            // Sử dụng classList để thêm/xóa class CSS
            themeToggle.classList.remove('ri-moon-line'); // Xóa icon mặt trăng
            themeToggle.classList.add('ri-sun-line'); // Thêm icon mặt trời
        } else {
            themeToggle.classList.remove('ri-sun-line'); // Xóa icon mặt trời
            themeToggle.classList.add('ri-moon-line'); // Thêm icon mặt trăng
        }
    }

    // ==================== PHẦN 4: XỬ LÝ FORM TÌM KIẾM ====================
    const form = document.getElementById('searchForm');
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Ngăn form gửi theo cách thông thường

        const query = document.getElementById('searchInput').value.trim(); // Lấy giá trị từ input
        if (!query) return; // Nếu rỗng thì không làm gì

        window.location.href = `search.html?query=${query}`; // Chuyển hướng đến trang tìm kiếm
    });

    // ==================== PHẦN 5: XỬ LÝ MENU DI ĐỘNG ====================
    const openMenuBtn = document.getElementById('openMenu');
    const overlay = document.querySelector('.overlay'); // Lớp phủ mờ khi menu mở
    const closeMenuBtn = document.getElementById('closeMenu');

    // Mở menu khi click nút mở
    openMenuBtn.addEventListener('click', () => {
        overlay.classList.add('show'); // Thêm class 'show' để hiển thị
    });

    // Đóng menu khi click nút đóng
    closeMenuBtn.addEventListener('click', () => {
        overlay.classList.remove('show'); // Xóa class 'show' để ẩn
    });

    // Đóng menu khi click vào overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) { // Kiểm tra click chính xác vào overlay
            overlay.classList.remove('show');
        }
    });

    // Gọi hàm fetch dữ liệu toàn cục khi trang tải xong
    fetchGlobal();
});

// ==================== PHẦN 6: QUẢN LÝ LOCALSTORAGE ====================
// Hàm lấy dữ liệu từ localStorage với kiểm tra thời gian hết hạn (5 phút)
function getLocalStorageData(key) {
    const storedData = localStorage.getItem(key); // Lấy dữ liệu từ localStorage
    if (!storedData) return null; // Nếu không có thì trả về null

    const parsedData = JSON.parse(storedData); // Chuyển từ chuỗi JSON thành object
    const currentTime = Date.now(); // Thời gian hiện tại (milliseconds)

    // Kiểm tra nếu dữ liệu cũ hơn 5 phút (300000ms) thì xóa và trả về null
    if (currentTime - parsedData.timestamp > 300000) {
        localStorage.removeItem(key);
        return null;
    }
    return parsedData.data; // Trả về dữ liệu nếu còn hạn
}

// Hàm lưu dữ liệu vào localStorage kèm timestamp
function setLocalStorageData(key, data) {
    const storedData = {
        timestamp: Date.now(), // Lưu thời gian hiện tại
        data: data // Dữ liệu cần lưu
    };
    localStorage.setItem(key, JSON.stringify(storedData)); // Lưu dưới dạng chuỗi JSON
}

// ==================== PHẦN 7: FETCH DỮ LIỆU TỪ API ====================
function fetchGlobal() {
    const localStorageKey = 'Global_Data'; // Key để lưu vào localStorage
    const localData = getLocalStorageData(localStorageKey); // Thử lấy dữ liệu đã lưu

    if (localData) {
        // Nếu có dữ liệu trong localStorage thì hiển thị
        displayGlobalData(localData);
    } else {
        // Nếu không có thì gọi API để lấy dữ liệu mới
        const options = { method: 'GET', headers: { accept: 'application/json' } };

        // Sử dụng Fetch API để gọi đến CoinGecko API
        fetch('https://api.coingecko.com/api/v3/global', options)
            .then(response => response.json()) // Chuyển response thành JSON
            .then(data => {
                const globalData = data.data; // Lấy phần data từ response
                displayGlobalData(data); // Hiển thị dữ liệu
                setLocalStorageData(localStorageKey, globalData); // Lưu vào localStorage
            })
            .catch(error => {
                // Xử lý lỗi nếu có
                coinsCount.textContent = 'N/A';
                exchangesCount.textContent = 'N/A';
                marketCap.textContent = 'N/A';
                marketCapChangeElement.textContent = 'N/A';
                volume.textContent = 'N/A';
                dominance.textContent = 'BTC N/A% - ETH N/A%';
                console.error(error); // Log lỗi ra console
            });
    }
}

// ==================== PHẦN 8: HIỂN THỊ DỮ LIỆU ====================
function displayGlobalData(globalData) {
    // Hiển thị số lượng coin đang hoạt động
    coinsCount.textContent = globalData.active_cryptocurrencies || 'N/A';

    // Hiển thị số lượng sàn giao dịch
    exchangesCount.textContent = globalData.markets || 'N/A';

    // Hiển thị tổng vốn hóa thị trường (đơn vị nghìn tỷ USD)
    marketCap.textContent = globalData.total_market_cap?.usd
        ? `$${(globalData.total_market_cap.usd / 1e12).toFixed(3)}T`
        : 'N/A';

    // Lấy % thay đổi vốn hóa 24h
    const marketCapChange = globalData.market_cap_change_percentage_24h_usd;

    if (marketCapChange !== undefined) {
        const changeText = `${marketCapChange.toFixed(1)}%`; // Làm tròn 1 chữ số thập phân

        // Tạo HTML với icon mũi tên lên/xuống tùy theo giá trị
        marketCapChangeElement.innerHTML = `${changeText} <i class="${marketCapChange < 0 ? 'red' : 'green'
            } ri-arrow-${marketCapChange < 0 ? 'down' : 'up'
            }-s-fill"></i>`;

        // Đổi màu text tùy theo giá trị
        marketCapChangeElement.style.color = marketCapChange < 0 ? 'red' : 'green';
    } else {
        marketCapChangeElement.textContent = 'N/A';
    }

    // Hiển thị tổng khối lượng giao dịch (đơn vị tỷ USD)
    volume.textContent = globalData.total_volume?.usd
        ? `$${(globalData.total_volume.usd / 1e9).toFixed(3)}B`
        : 'N/A';

    // Hiển thị tỷ lệ thống trị của BTC và ETH
    const btcDominance = globalData.market_cap_percentage?.btc
        ? `${globalData.market_cap_percentage.btc.toFixed(1)}%`
        : 'N/A';
    const ethDominance = globalData.market_cap_percentage?.eth
        ? `${globalData.market_cap_percentage.eth.toFixed(1)}%`
        : 'N/A';
    dominance.textContent = `BTC ${btcDominance} - ETH ${ethDominance}`;
}

// ==================== PHẦN 9: CÁC HÀM TIỆN ÍCH ====================
// Hàm bật/tắt spinner loading và ẩn/hiện danh sách
function toggleSpinner(listId, spinnerId, show) {
    const listElement = document.getElementById(listId);
    const spinnerElement = document.getElementById(spinnerId);

    if (spinnerElement) {
        spinnerElement.style.display = show ? 'block' : 'none';
    }
    if (listElement) {
        listElement.style.display = show ? 'none' : 'block';
    }
}

// Hàm tạo bảng với các tiêu đề và cột cố định
function createTable(headers, fixedIndex = 0) {
    const table = document.createElement('table'); // Tạo thẻ table
    const thead = document.createElement('thead'); // Tạo phần header của table
    table.appendChild(thead);

    const headerRow = document.createElement('tr'); // Tạo hàng tiêu đề
    headers.forEach((header, index) => {
        const th = document.createElement('th'); // Tạo ô tiêu đề
        th.textContent = header;
        if (index === fixedIndex) {
            th.classList.add('table-fixed-column'); // Thêm class cho cột cố định
        }
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    return table;
}

// Hàm tạo widget TradingView
function createWidget(containerId, widgetConfig, widgetSrc) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Xóa nội dung cũ

    const widgetDiv = document.createElement('div');
    widgetDiv.classList.add('tradingview-widget-container__widget');
    container.appendChild(widgetDiv);

    // Tạo thẻ script để tải widget
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = widgetSrc;
    script.async = true; // Tải không đồng bộ
    script.innerHTML = JSON.stringify(widgetConfig);
    container.appendChild(script);

    // Sau 5 giây thì hiện copyright (nếu có)
    setTimeout(() => {
        const copyright = document.querySelector('.tradingview-widget-copyright');
        if (copyright) {
            copyright.classList.remove('hidden');
        }
    }, 5000);
}

// ==================== PHẦN 10: NÚT CUỘN LÊN ĐẦU TRANG ====================
const scrollTopBtn = document.getElementById("scrollTop");

// Thêm sự kiện scroll để kiểm tra khi nào hiện nút
window.onscroll = () => {
    scrollFunction();
}

function scrollFunction() {
    // Nếu cuộn xuống quá 20px thì hiện nút, ngược lại thì ẩn
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
}

// Hàm cuộn lên đầu trang
function scrollToTop() {
    // Tương thích với nhiều trình duyệt
    document.body.scrollTop = 0; // Safari
    document.documentElement.scrollTop = 0; // Chrome, Firefox, IE, Opera
}
/**
 * 1. DOM Selection (Chọn phần tử HTML)
document.getElementById(): Chọn phần tử duy nhất bằng ID

document.querySelector(): Chọn phần tử đầu tiên phù hợp với CSS selector

Các biến được lưu vào constant để đảm bảo không bị gán lại

2. DOMContentLoaded Event
Sự kiện này đảm bảo code chỉ chạy sau khi HTML đã tải xong

Tất cả code xử lý chính được đặt trong này để tránh lỗi khi chưa tải xong DOM

3. Theme Toggle (Chuyển đổi giao diện)
Sử dụng localStorage để lưu theme preference của người dùng

classList để thêm/xóa class CSS, thay đổi icon mặt trời/trăng

Khi click sẽ kiểm tra theme hiện tại và chuyển đổi

4. Form Search (Tìm kiếm)
event.preventDefault() ngăn form submit theo cách thông thường

Lấy giá trị input, kiểm tra không rỗng thì chuyển hướng trang

5. Mobile Menu (Menu di động)
Sử dụng overlay (lớp phủ mờ) để hiển thị menu

Thêm/xóa class 'show' để điều khiển hiển thị

Đóng menu khi click vào overlay hoặc nút đóng

6. LocalStorage Management
getLocalStorageData: Lấy dữ liệu và kiểm tra thời gian hết hạn (5 phút)

setLocalStorageData: Lưu dữ liệu kèm timestamp

Giúp giảm số lần gọi API bằng cách cache dữ liệu

7. Fetch API Data
Sử dụng Fetch API để lấy dữ liệu từ CoinGecko

Kiểm tra localStorage trước, nếu có dữ liệu còn hạn thì dùng, không thì gọi API

Xử lý lỗi bằng catch để hiển thị 'N/A' khi có lỗi

8. Display Data
Định dạng số liệu (tỷ, nghìn tỷ) và làm tròn

Hiển thị icon mũi tên và màu sắc tùy theo giá trị tăng/giảm

Optional chaining (?.) để tránh lỗi khi thuộc tính không tồn tại

9. Utility Functions
toggleSpinner: Hiển thị/ẩn spinner loading

createTable: Tạo bảng HTML động với các tiêu đề

createWidget: Tạo widget TradingView bằng JavaScript động

10. Scroll to Top
Hiển thị nút khi cuộn xuống quá 20px

scrollToTop cuộn lên đầu trang, tương thích nhiều trình duyệt

Các khái niệm JavaScript quan trọng được sử dụng:
DOM Manipulation: Thao tác với HTML qua JavaScript

Event Handling: Xử lý sự kiện click, submit, scroll

Fetch API: Gọi API bất đồng bộ để lấy dữ liệu

LocalStorage: Lưu trữ dữ liệu phía client

Template Literals: Tạo chuỗi với biến và biểu thức

Arrow Functions: Cú pháp hàm ngắn gọn

Optional Chaining (?.): Truy cập thuộc tính an toàn

Ternary Operator: If-else ngắn gọn

Async/Await (Promise): Xử lý bất đồng bộ

Dynamic Element Creation: Tạo phần tử HTML bằng JavaScript
 */