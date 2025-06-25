// Định nghĩa cấu hình widget cho TradingView ticker (hiển thị giá coin)
const widgetConfig1 = {
    // symbol: mã giao dịch trên sàn (ví dụ: BINANCE:BTCUSDT)
    "symbol": "BINANCE:BTCUSDT",
    // width: chiều rộng widget (100% chiều rộng cha)
    "width": "100%",
    // isTransparent: widget có nền trong suốt không
    "isTransparent": true,
    // colorTheme: chủ đề màu sắc (dark/light)
    "colorTheme": "dark",
    // locale: ngôn ngữ hiển thị
    "locale": "en"
};

// Định nghĩa cấu hình widget cho TradingView mini chart (biểu đồ giá)
const widgetConfig2 = {
    // symbols: danh sách mã giao dịch và khung thời gian (ví dụ: 1D = 1 ngày)
    "symbols": [
        ["BINANCE:BTCUSDT|1D"]
    ],
    // chartOnly: chỉ hiển thị biểu đồ, không hiển thị thông tin khác
    "chartOnly": false,
    // width: chiều rộng widget
    "width": "100%",
    // height: chiều cao widget
    "height": "100%",
    // locale: ngôn ngữ
    "locale": "en",
    // colorTheme: chủ đề màu sắc
    "colorTheme": "dark",
    // autosize: tự động điều chỉnh kích thước
    "autosize": true,
    // showVolume: hiển thị khối lượng giao dịch
    "showVolume": false,
    // showMA: hiển thị đường trung bình động (Moving Average)
    "showMA": false,
    // hideDateRanges: ẩn các lựa chọn khung thời gian
    "hideDateRanges": false,
    // hideMarketStatus: ẩn trạng thái thị trường
    "hideMarketStatus": false,
    // hideSymbolLogo: ẩn logo coin
    "hideSymbolLogo": true,
    // scalePosition: vị trí trục giá (right: bên phải)
    "scalePosition": "right",
    // scaleMode: chế độ trục giá (Normal: bình thường)
    "scaleMode": "Normal",
    // fontFamily: font chữ
    "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
    // fontSize: cỡ chữ
    "fontSize": "10",
    // noTimeScale: không hiển thị trục thời gian
    "noTimeScale": false,
    // valuesTracking: chế độ theo dõi giá trị
    "valuesTracking": "1",
    // changeMode: kiểu hiển thị thay đổi giá (giá và phần trăm)
    "changeMode": "price-and-percent",
    // chartType: kiểu biểu đồ (area: vùng)
    "chartType": "area",
    // maLineColor: màu đường MA
    "maLineColor": "#2962FF",
    // maLineWidth: độ dày đường MA
    "maLineWidth": 1,
    // maLength: số phiên tính MA
    "maLength": 9,
    // headerFontSize: cỡ chữ tiêu đề
    "headerFontSize": "medium",
    // backgroundColor: màu nền
    "backgroundColor": "rgba(14, 18, 24, 1)",
    // gridLineColor: màu đường lưới
    "gridLineColor": "rgba(76, 175, 80, 0.06)",
    // lineWidth: độ dày đường biểu đồ
    "lineWidth": 2,
    // lineType: kiểu đường biểu đồ
    "lineType": 0,
    // dateRanges: các khung thời gian lựa chọn
    "dateRanges": [
        "1d|15",
        "1m|30",
        "3m|60",
        "12m|1D",
        "60m|1W",
        "all|1M"
    ],
    // dateFormat: định dạng ngày tháng
    "dateFormat": "yyyy-MM-dd"
};

// Sự kiện DOMContentLoaded: khi tài liệu HTML đã load xong
document.addEventListener("DOMContentLoaded", () => {
    // Lấy tham số truy vấn trên URL (ví dụ: ?coin=bitcoin)
    const params = new URLSearchParams(window.location.search);
    const query = params.get('coin');

    // Nếu có tham số coin thì gọi hàm fetchCoinInfo để lấy thông tin coin
    if (query) {
        fetchCoinInfo(query);
    } else {
        // Nếu không có thì chuyển hướng về trang chủ
        window.location.href = "/../../index.html";
    }
});

// Hàm lấy thông tin coin từ API CoinGecko
async function fetchCoinInfo(query) {
    // Lấy phần tử hiển thị lỗi
    const coinInfoError = document.getElementById('coin-info-error');
    // Ẩn thông báo lỗi
    coinInfoError.style.display = 'none';
    // Tạo URL API lấy thông tin coin
    const apiUrl = `https://api.coingecko.com/api/v3/coins/${query}`;

    try {
        // Gọi API lấy dữ liệu coin (fetch trả về Promise)
        const response = await fetch(apiUrl);
        // Nếu response không thành công thì ném lỗi
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        // Chuyển dữ liệu về dạng JSON
        const data = await response.json();

        // Lấy symbol viết hoa (ví dụ: BTC)
        const baseSymbol = data.symbol?.toUpperCase() || '';
        let tradingViewSymbol = null;

        // Kiểm tra nếu có tickers (danh sách các sàn giao dịch)
        if (data.tickers && data.tickers.length > 0) {
            // Tìm ticker trên sàn Binance với cặp USDT
            const binanceTicker = data.tickers.find(
                ticker => ticker.market.identifier === 'binance' && ticker.target === 'USDT'
            );
            // Nếu tìm thấy thì tạo symbol cho TradingView
            if (binanceTicker) {
                tradingViewSymbol = `BINANCE:${binanceTicker.base}${binanceTicker.target}`;
            }
        }

        // Nếu không tìm thấy symbol hợp lệ thì báo lỗi
        if (!tradingViewSymbol) {
            throw new Error('No valid Binance USDT trading pair found for this coin.');
        }

        // In ra symbol sử dụng cho TradingView
        console.log("Using TradingView symbol:", tradingViewSymbol);

        // Cập nhật symbol cho widget
        widgetConfig1.symbol = tradingViewSymbol;
        widgetConfig2.symbols = [
            [`${tradingViewSymbol}|1D`]
        ];

        // Khởi tạo lại widget (forceReload = true)
        initializeWidget(true);
        // Hiển thị thông tin coin lên giao diện
        displayCoinInfo(data);
    } catch (error) {
        // Nếu có lỗi thì hiển thị thông báo lỗi
        console.error('Error fetching coin info:', error);
        coinInfoError.textContent = error.message || 'Failed to fetch coin information';
        coinInfoError.style.display = 'flex';
    }
}

// Hàm khởi tạo widget TradingView
function initializeWidget(forceReload = false) {
    try {
        // Lấy cấu hình theme (màu sắc) từ CSS và localStorage
        const themeConfig = getThemeConfig();

        // Cập nhật theme cho widget
        widgetConfig1.colorTheme = themeConfig.theme;
        widgetConfig2.colorTheme = themeConfig.theme;
        widgetConfig2.backgroundColor = themeConfig.backgroundColor;
        widgetConfig2.gridLineColor = themeConfig.gridColor;

        // Nếu forceReload = true thì xóa nội dung cũ của widget
        if (forceReload) {
            const tickerWidget = document.getElementById('ticker-widget');
            const chartWidget = document.getElementById('mini-chart-widget');
            if (tickerWidget) tickerWidget.innerHTML = '';
            if (chartWidget) chartWidget.innerHTML = '';
        }

        // Tạo widget ticker
        createWidget('ticker-widget', widgetConfig1,
            'https://s3.tradingview.com/external-embedding/embed-widget-single-quote.js');

        // Tạo widget mini chart
        createWidget('mini-chart-widget', widgetConfig2,
            'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js');

    } catch (error) {
        // Nếu có lỗi thì in ra console
        console.error('Error initializing widgets:', error);
    }
}

// Hàm hiển thị thông tin coin lên giao diện
function displayCoinInfo(coin) {
    try {
        // Lấy các phần tử DOM cần thiết
        const coinInfo = document.querySelector('.coin-info');
        const rightSec = document.querySelector('.coin-container .right-section');
        const coinDesc = document.getElementById('coin-desc-p');

        // Nếu thiếu phần tử thì báo lỗi
        if (!coinInfo || !rightSec || !coinDesc) {
            throw new Error('Required DOM elements not found');
        }

        // Lấy ảnh, symbol, thứ hạng vốn hóa thị trường
        const imageSrc = coin.image?.thumb || 'https://via.placeholder.com/20';
        const symbol = coin.symbol?.toUpperCase() || '';
        const marketCapRank = coin.market_cap_rank || '-';

        // Hiển thị thông tin cơ bản coin
        coinInfo.innerHTML = `
            <div class="logo">
            <img src="${imageSrc}" alt="${coin.name}" onerror="this.src='https://via.placeholder.com/20'">
            <h4>${coin.name} <span>(${symbol})</span></h4>
            <p>#${marketCapRank}</p>
            </div>
            <div class="status">
            ${createInfoItem('Market Cap', coin.market_data?.market_cap?.usd)} <!-- Gọi hàm tạo item, dùng optional chaining để lấy giá trị vốn hóa thị trường (usd) -->
            ${createInfoItem('Current Price', coin.market_data?.current_price?.usd)} <!-- Giá hiện tại -->
            ${createInfoItem('All Time High', coin.market_data?.ath?.usd)} <!-- Giá cao nhất mọi thời đại -->
            ${createInfoItem('All Time Low', coin.market_data?.atl?.usd)} <!-- Giá thấp nhất mọi thời đại -->
            ${createInfoItem('Total Volume', coin.market_data?.total_volume?.usd)} <!-- Tổng khối lượng giao dịch -->
            ${createInfoItem('Total Supply', coin.market_data?.total_supply)} <!-- Tổng cung -->
            ${createInfoItem('Max Supply', coin.market_data?.max_supply)} <!-- Cung tối đa -->
            ${createInfoItem('Circulating Supply', coin.market_data?.circulating_supply)} <!-- Cung lưu thông -->
            </div>
        `;
        // Giải thích:
        // - Sử dụng template string (``) để nhúng biến và hàm vào HTML.
        // - coinInfo là phần tử DOM, cập nhật thuộc tính innerHTML để hiển thị nội dung mới.
        // - Dùng optional chaining (?.) để tránh lỗi nếu thuộc tính không tồn tại.
        // - Gọi hàm createInfoItem để tạo từng dòng thông tin (label + value).
        // - Biến imageSrc, symbol, marketCapRank đã được lấy ở trên.
        // - onerror trong thẻ img: nếu ảnh lỗi thì thay bằng ảnh mặc định.

        // Hiển thị thông tin lịch sử, thị trường, liên kết
        rightSec.innerHTML = `
            <div class="status">
            <h3>Historical Info</h3>
            <div class="container">
                ${createInfoItem('ATH', coin.market_data?.ath?.usd)} <!-- Giá cao nhất mọi thời đại -->
                ${createInfoItem('ATL', coin.market_data?.atl?.usd)} <!-- Giá thấp nhất mọi thời đại -->
                ${createInfoItem('24h High', coin.market_data?.high_24h?.usd)} <!-- Giá cao nhất 24h -->
                ${createInfoItem('24h Low', coin.market_data?.low_24h?.usd)} <!-- Giá thấp nhất 24h -->
            </div>
            </div>
            ${createMarketsSection(coin)} <!-- Gọi hàm tạo phần Markets, truyền toàn bộ object coin -->
            ${createLinksSection(coin)} <!-- Gọi hàm tạo phần Info (liên kết website, cộng đồng), truyền toàn bộ object coin -->
        `;
        // Giải thích:
        // - rightSec là phần tử DOM, cập nhật innerHTML để hiển thị các phần thông tin phụ.
        // - Sử dụng template string để nhúng kết quả trả về từ các hàm tạo HTML.
        // - createMarketsSection và createLinksSection là các hàm trả về chuỗi HTML, nhận object coin làm tham số.
        // - Các hàm này dùng array, object, optional chaining, map, join để xử lý dữ liệu và tạo HTML động.
        // - Tất cả đều là thao tác DOM, template string, và xử lý dữ liệu object/array.

        // Hiển thị mô tả coin
        coinDesc.innerHTML = coin.description?.en || '<p class="red">Asset description not available!</p>';
    } catch (error) {
        // Nếu có lỗi thì in ra console
        console.error('Error displaying coin info:', error);
    }
}

// Hàm tạo 1 item thông tin (label + value)
function createInfoItem(label, value) {
    // Định dạng giá trị (nếu là số thì thêm $ và làm tròn)
    const formattedValue = value != null
        ? (typeof value === 'number'
            ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : value)
        : "N/A";

    // Trả về HTML của item
    return `
        <div class="item">
            <p class="str">${label}</p>
            <p class="num">${formattedValue}</p>
        </div>
    `;
}

// Hàm tạo phần thị trường (Markets)
function createMarketsSection(coin) {
    // Nếu không có tickers thì trả về chuỗi rỗng
    if (!coin.tickers || coin.tickers.length === 0) return '';

    // Lấy tối đa 3 ticker đầu tiên
    const tickersToShow = coin.tickers.slice(0, 3);

    // Trả về HTML phần Markets
    // Trả về HTML phần Markets, hiển thị tối đa 3 ticker đầu tiên
    return `
        <div class="status">
            <h3>Markets</h3>
            <div class="container">
                ${tickersToShow.map(ticker => `
                    <div class="item">
                        <!-- Tên sàn giao dịch (market.name): Chuỗi tên của sàn, loại bỏ chữ 'Exchange' nếu có -->
                        <p class="str">${ticker.market?.name?.replace('Exchange', '') || 'Unknown'}</p>
                        <div class="links">
                            <!-- trade_url: Đường dẫn đến trang giao dịch cặp coin này trên sàn, nếu có thì hiển thị nút Trade -->
                            ${ticker.trade_url ? `<a href="${ticker.trade_url}" target="_blank">Trade</a>` : ''}
                            <!-- trust_score: Mức độ tin cậy của ticker, thường là màu sắc (green/yellow/red), dùng làm màu nền cho chữ Trusted? -->
                            <p style="background-color: ${ticker.trust_score || 'gray'}">Trusted?</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Hàm tạo phần liên kết (Links)
function createLinksSection(coin) {
    // Trả về HTML phần Info (website, whitepaper, cộng đồng)
    // Trả về HTML phần Info (website, whitepaper, cộng đồng)
    return `
        <div class="status">
            <h3>Info</h3>
            <div class="container">
                <div class="item">
                    <p class="str">Website</p>
                    <div class="links">
                        ${
        // Nếu có link homepage thì hiển thị nút Visit
        coin.links?.homepage?.[0]
            ? `<a target="_blank" href="${coin.links.homepage[0]}">Visit</a>`
            : ''
        }
                        ${
        // Nếu có link whitepaper thì hiển thị nút Whitepaper
        coin.links?.whitepaper
            ? `<a target="_blank" href="${coin.links.whitepaper}">Whitepaper</a>`
            : ''
        }
                    </div>
                </div>
                <div class="item">
                    <p class="str">Community</p>
                    <div class="links">
                        ${
        // Nếu có twitter_screen_name thì hiển thị nút Twitter
        coin.links?.twitter_screen_name
            ? `<a target="_blank" href="https://x.com/${coin.links.twitter_screen_name}">Twitter</a>`
            : ''
        }
                        ${
        // Nếu có facebook_username thì hiển thị nút Facebook
        coin.links?.facebook_username
            ? `<a target="_blank" href="https://facebook.com/${coin.links.facebook_username}">Facebook</a>`
            : ''
        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Hàm lấy cấu hình theme (màu sắc) từ CSS và localStorage
function getThemeConfig() {
    try {
        // Lấy các biến CSS từ :root
        const root = getComputedStyle(document.documentElement);
        // Kiểm tra theme hiện tại (dark/light) từ localStorage
        const isDarkTheme = localStorage.getItem('theme') !== 'light-theme';

        // Trả về object theme, backgroundColor, gridColor
        return {
            theme: isDarkTheme ? 'dark' : 'light',
            backgroundColor: root.getPropertyValue(isDarkTheme ? '--chart-dark-bg' : '--chart-light-bg').trim(),
            gridColor: root.getPropertyValue(isDarkTheme ? '--chart-dark-border' : '--chart-light-border').trim()
        };
    } catch (error) {
        // Nếu có lỗi thì trả về giá trị mặc định
        console.error('Error getting theme config:', error);
        return {
            theme: 'dark',
            backgroundColor: 'rgba(14, 18, 24, 1)',
            gridColor: 'rgba(76, 175, 80, 0.06)'
        };
    }
}

// Hàm tạo widget TradingView (nhúng script vào DOM)
// Hàm này cần bổ sung để code hoàn chỉnh
function createWidget(containerId, config, scriptSrc) {
    // Xóa widget cũ nếu có
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    // Tạo thẻ script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = scriptSrc;
    // Gán cấu hình widget vào script
    script.innerHTML = JSON.stringify(config);
    // Thêm script vào container
    container.appendChild(script);
}
/** * Mô tả code:
 * - Định nghĩa cấu hình cho 2 widget TradingView: ticker và mini chart.
 * - Lắng nghe sự kiện DOMContentLoaded để lấy tham số coin từ URL.
 * - Nếu có tham số, gọi API CoinGecko để lấy thông tin coin.
 * - Cập nhật cấu hình widget dựa trên dữ liệu coin và khởi tạo widget.
 * - Hiển thị thông tin coin lên giao diện, bao gồm logo, symbol, giá trị thị trường, mô tả, v.v.
 * - Tạo các phần Markets và Info để hiển thị các liên kết và thông tin khác.
 *
**Các kiến thức sử dụng trong code:**
- **Object:** Lưu trữ dữ liệu dạng key-value, giúp gom nhóm các thuộc tính liên quan.
- **Array:** Lưu trữ danh sách các giá trị, ví dụ mảng symbols.
- **Event (Sự kiện):** Lắng nghe và xử lý các hành động của người dùng hoặc trình duyệt (ví dụ DOMContentLoaded).
- **URLSearchParams:** Đối tượng thao tác với query string trên URL, giúp lấy tham số truyền vào.
- **Điều kiện (if/else):** Kiểm tra điều kiện để quyết định luồng thực thi.
- **window.location.href:** Thay đổi đường dẫn trình duyệt, dùng để chuyển hướng trang.

Các kiến thức này giúp code:
- Quản lý cấu hình widget linh hoạt.
- Lấy dữ liệu động từ URL.
- Đảm bảo code chỉ chạy khi DOM đã sẵn sàng.
- Điều hướng người dùng hợp lý khi thiếu tham số.
 */