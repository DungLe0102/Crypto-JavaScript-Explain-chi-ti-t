// Đối tượng lưu trạng thái load dữ liệu của các tab
// Kiến thức: Object trong JavaScript - dùng để lưu trữ dữ liệu dạng key-value
const tabDataLoaded = {
    tab1: false,  // Tab 1 chưa load dữ liệu
    tab2: false,  // Tab 2 chưa load dữ liệu
    tab3: false,  // Tab 3 chưa load dữ liệu
    tab4: false   // Tab 4 chưa load dữ liệu
};

// Hàm mở tab và load dữ liệu khi tab được chọn
// Kiến thức: 
// - DOM Event Handling: xử lý sự kiện click
// - DOM Manipulation: thao tác với các phần tử HTML
// - Asynchronous Programming: xử lý bất đồng bộ khi fetch dữ liệu
function openTab(event, tabName) {
    // Lấy tất cả các phần tử có class "tab-content" (nội dung các tab)
    const tabContent = document.querySelectorAll(".tab-content");

    // Lấy tất cả các phần tử có class "tab-button" (các nút tab)
    const tabButtons = document.querySelectorAll(".tab-button");

    // Ẩn tất cả nội dung tab
    // Kiến thức: forEach - duyệt qua tất cả phần tử trong NodeList
    tabContent.forEach(content => content.style.display = "none");

    // Xóa class "active" khỏi tất cả các nút tab
    tabButtons.forEach(button => button.classList.remove("active"));

    // Hiển thị nội dung tab được chọn
    // Kiến thức: style.display - thay đổi CSS display property
    document.getElementById(tabName).style.display = "block";

    // Thêm class "active" vào nút tab được click
    // Kiến thức: classList.add - thêm class vào phần tử
    event.currentTarget.classList.add("active");

    // Kiểm tra nếu dữ liệu tab chưa được load thì thực hiện fetch
    // Kiến thức: if statement - điều kiện kiểm tra
    if (!tabDataLoaded[tabName]) {
        // Kiến thức: switch-case - rẽ nhánh theo giá trị của tabName
        switch (tabName) {
            case 'tab1':
                // Fetch dữ liệu crypto và hiển thị
                // Kiến thức: API call với fetch
                fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true',
                    ['asset-list'],
                    displayAssets,
                    tabName,
                    'Crypto_Data'
                );
                break;
            case 'tab2':
                // Fetch dữ liệu exchanges và hiển thị
                fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/exchanges',
                    ['exchange-list'],
                    displayExchanges,
                    tabName,
                    'Exchanges_Data'
                );
                break;
            case 'tab3':
                // Fetch dữ liệu categories và hiển thị
                fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/coins/categories',
                    ['category-list'],
                    displayCategories,
                    tabName,
                    'Categories_Data'
                );
                break;
            case 'tab4':
                // Fetch dữ liệu companies và hiển thị
                fetchAndDisplay(
                    'https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin',
                    ['company-list'],
                    displayCompanies,
                    tabName,
                    'Companies_Data'
                );
                break;
        }
    }
}

// Sự kiện khi DOM được load hoàn tất
// Kiến thức: DOMContentLoaded - sự kiện khi HTML được load xong
document.addEventListener("DOMContentLoaded", () => {
    // Tự động click vào tab đầu tiên khi trang load
    document.querySelector(".tab-button").click();

    // Gọi hàm fetch dữ liệu ban đầu
    fetchData();
});

// Hàm fetch dữ liệu ban đầu khi trang load
// Kiến thức: async/await - xử lý bất đồng bộ
async function fetchData() {
    // Sử dụng Promise.all để fetch nhiều API cùng lúc
    await Promise.all([
        // Fetch dữ liệu trending coins và NFTs
        fetchAndDisplay(
            'https://api.coingecko.com/api/v3/search/trending',
            ['coins-list', 'nfts-list'],
            displayTrends,
            null,
            'Trending_data'
        ),
        // Fetch dữ liệu crypto assets
        fetchAndDisplay(
            'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true',
            ['asset-list'],
            displayAssets,
            null,
            'Crypto_Data'
        ),
    ]);
}

// Hàm chung để fetch dữ liệu và hiển thị
// Kiến thức: 
// - Hàm với nhiều tham số
// - Xử lý bất đồng bộ với async/await
// - Local Storage: lưu dữ liệu tạm thời trên trình duyệt
async function fetchAndDisplay(url, idsToToggle, displayFunction, tabName = null, localKey) {
    // Với mỗi id trong idsToToggle, ẩn thông báo lỗi và hiển thị spinner loading
    // Kiến thức: Array.forEach - duyệt qua mảng
    idsToToggle.forEach(id => {
        const errorElement = document.getElementById(`${id}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        // Gọi hàm toggleSpinner để hiển thị spinner loading
        toggleSpinner(id, `${id}-spinner`, true);
    });

    // Kiểm tra xem dữ liệu đã có trong Local Storage chưa
    const localData = getLocalStorageData(localKey);

    // Nếu có dữ liệu trong Local Storage
    if (localData) {
        // Ẩn spinner loading
        idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));

        // Gọi hàm hiển thị dữ liệu
        displayFunction(localData);

        // Nếu có tabName, đánh dấu tab đã load dữ liệu
        if (tabName) tabDataLoaded[tabName] = true;
    } else {
        // Nếu không có dữ liệu trong Local Storage, thực hiện fetch từ API
        try {
            // Fetch dữ liệu từ API
            const response = await fetch(url);

            // Nếu response không ok (status không phải 200-299), throw error
            if (!response.ok) throw new Error('API limit reached');

            // Parse dữ liệu JSON từ response
            const data = await response.json();

            // Ẩn spinner loading
            idsToToggle.forEach(id => toggleSpinner(id, `${id}-spinner`, false));

            // Gọi hàm hiển thị dữ liệu
            displayFunction(data);

            // Lưu dữ liệu vào Local Storage
            setLocalStorageData(localKey, data);

            // Nếu có tabName, đánh dấu tab đã load dữ liệu
            if (tabName) tabDataLoaded[tabName] = true;
        } catch (error) {
            // Nếu có lỗi, hiển thị thông báo lỗi và ẩn spinner
            idsToToggle.forEach(id => {
                toggleSpinner(id, `${id}-spinner`, false);
                document.getElementById(`${id}-error`).style.display = 'block';
            });

            // Nếu có tabName, đánh dấu tab chưa load dữ liệu
            if (tabName) tabDataLoaded[tabName] = false;
        }
    }
}

// Hàm hiển thị dữ liệu trending (coins và NFTs)
function displayTrends(data) {
    // Hiển thị trending coins (5 coin đầu tiên)
    displayTrendCoins(data.coins.slice(0, 5));

    // Hiển thị trending NFTs (5 NFT đầu tiên)
    displayTrendNfts(data.nfts.slice(0, 5));
}

// Hàm hiển thị danh sách trending coins
function displayTrendCoins(coins) {
    // Lấy phần tử DOM để hiển thị danh sách coins
    const coinsList = document.getElementById('coins-list');

    // Xóa nội dung cũ
    coinsList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột
    const table = createTable(['Coin', 'Price', 'Market Cap', 'Volume', '24h%']);

    // Duyệt qua từng coin và tạo hàng trong bảng
    coins.forEach(coin => {
        const coinData = coin.item;
        const row = document.createElement('tr');

        // Tạo nội dung hàng với dữ liệu coin
        row.innerHTML = `
            <td class="name-column table-fixed-column"><img src="${coinData.thumb}" alt="${coinData.name}"> ${coinData.name} <span>(${coinData.symbol.toUpperCase()})</span></td>
            <td>${parseFloat(coinData.price_btc).toFixed(6)}</td>
            <td>${coinData.data.market_cap}</td>
            <td>${coinData.data.total_volume}</td>
            <td class="${coinData.data.price_change_percentage_24h.usd >= 0 ? 'green' : 'red'}">${coinData.data.price_change_percentage_24h.usd.toFixed(2)}%</td>
        `;

        // Thêm sự kiện click để chuyển đến trang chi tiết coin
        row.onclick = () => window.location.href = `coin.html?coin=${coinData.id}`;

        // Thêm hàng vào bảng
        table.appendChild(row);
    });

    // Thêm bảng vào phần tử DOM
    coinsList.appendChild(table);
}

// Hàm hiển thị danh sách trending NFTs
function displayTrendNfts(nfts) {
    // Lấy phần tử DOM để hiển thị danh sách NFTs
    const nftsList = document.getElementById('nfts-list');

    // Xóa nội dung cũ
    nftsList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột
    const table = createTable(['NFT', 'Market', 'Price', '24h Vol', '24h%']);

    // Duyệt qua từng NFT và tạo hàng trong bảng
    nfts.forEach(nft => {
        const row = document.createElement('tr');

        // Tạo nội dung hàng với dữ liệu NFT
        row.innerHTML = `
            <td class="name-column table-fixed-column"><img src="${nft.thumb}" alt="${nft.name}"> ${nft.name} <span>(${nft.symbol.toUpperCase()})</span></td>
            <td>${nft.native_currency_symbol.toUpperCase()}</td>
            <td>${nft.data.floor_price}</td>
            <td>${nft.data.h24_volume}</td>
            <td class="${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change) >= 0 ? 'green' : 'red'}">${parseFloat(nft.data.floor_price_in_usd_24h_percentage_change).toFixed(2)}%</td>
        `;

        // Thêm hàng vào bảng
        table.appendChild(row);
    });

    // Thêm bảng vào phần tử DOM
    nftsList.appendChild(table);
}

// Hàm hiển thị danh sách crypto assets
function displayAssets(data) {
    // Lấy phần tử DOM để hiển thị danh sách assets
    const cryptoList = document.getElementById('asset-list');

    // Xóa nội dung cũ
    cryptoList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột (tham số 1 là số cột fixed)
    const table = createTable(['Rank', 'Coin', 'Price', '24h Price', '24h Price %', 'Total Vol', 'Market Cap', 'Last 7 Days'], 1);

    // Mảng lưu trữ dữ liệu sparkline để vẽ biểu đồ
    const sparklineData = [];

    // Duyệt qua từng asset và tạo hàng trong bảng
    data.forEach(asset => {
        const row = document.createElement('tr');

        // Tạo nội dung hàng với dữ liệu asset
        // Tạo nội dung hàng với dữ liệu asset
        // - Hiển thị thứ hạng market cap
        // - Hiển thị tên coin, logo, ký hiệu
        // - Hiển thị giá hiện tại (làm tròn 2 số thập phân)
        // - Hiển thị biến động giá 24h (giá trị tuyệt đối và phần trăm, đổi màu xanh/đỏ theo chiều tăng/giảm)
        // - Hiển thị tổng volume, market cap (dùng toLocaleString để phân tách hàng nghìn)
        // - Hiển thị biểu đồ sparkline 7 ngày (canvas)
        row.innerHTML = `
            <td class="rank">${asset.market_cap_rank}</td> <!-- Thứ hạng vốn hóa thị trường -->
            <td class="name-column table-fixed-column"><img src="${asset.image}" alt="${asset.name}"> ${asset.name} <span>(${asset.symbol.toUpperCase()})</span></td> <!-- Tên, logo, ký hiệu -->
            <td>${asset.current_price.toFixed(2)}</td> <!-- Giá hiện tại -->
            <td class="${asset.price_change_percentage_24h >= 0 ? 'green' : 'red'}">${asset.price_change_24h.toFixed(2)}</td> <!-- Biến động giá 24h -->
            <td class="${asset.price_change_percentage_24h >= 0 ? 'green' : 'red'}">${asset.price_change_percentage_24h.toFixed(2)}%</td> <!-- Biến động giá 24h (%) -->
            <td>${asset.total_volume.toLocaleString()}</td> <!-- Tổng volume -->
            <td>${asset.market_cap.toLocaleString()}</td> <!-- Market cap -->
            <td><canvas id="chart-${asset.id}" width="100" height="50"></canvas></td> <!-- Biểu đồ sparkline -->
        `;

        // Thêm hàng vào bảng
        table.appendChild(row);

        // Lưu dữ liệu sparkline để vẽ biểu đồ sau
        sparklineData.push({
            id: asset.id,
            sparkline: asset.sparkline_in_7d.price,
            color: asset.sparkline_in_7d.price[0] <= asset.sparkline_in_7d.price[asset.sparkline_in_7d.price.length - 1] ? 'green' : 'red'
        });

        // Thêm sự kiện click để chuyển đến trang chi tiết coin
        row.onclick = () => window.location.href = `coin.html?coin=${asset.id}`;
    });

    // Thêm bảng vào phần tử DOM
    cryptoList.appendChild(table);

    // Vẽ biểu đồ sparkline cho từng coin
    sparklineData.forEach(({ id, sparkline, color }) => {
        // Lấy context của canvas
        const ctx = document.getElementById(`chart-${id}`).getContext('2d');

        // Tạo biểu đồ với Chart.js
        new Chart(ctx, {
            type: 'line',  // Loại biểu đồ đường
            data: {
                labels: sparkline.map((_, index) => index),  // Tạo labels từ 0 đến length-1
                datasets: [
                    {
                        data: sparkline,  // Dữ liệu biểu đồ
                        borderColor: color,  // Màu đường (xanh/đỏ)
                        fill: false,  // Không tô màu dưới đường
                        pointRadius: 0,  // Ẩn các điểm
                        borderWidth: 1  // Độ rộng đường
                    }
                ]
            },
            options: {
                responsive: false,  // Tắt responsive
                scales: {
                    x: { display: false },  // Ẩn trục x
                    y: { display: false }   // Ẩn trục y
                },
                plugins: {
                    legend: { display: false },  // Ẩn chú thích
                    tooltip: { enabled: false }  // Tắt tooltip
                }
            }
        });
    });
}

// Hàm hiển thị danh sách exchanges
function displayExchanges(data) {
    // Lấy phần tử DOM để hiển thị danh sách exchanges
    const exchangeList = document.getElementById('exchange-list');

    // Xóa nội dung cũ
    exchangeList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột (tham số 1 là số cột fixed)
    const table = createTable(['Rank', 'Exchange', 'Trust Score', '24h Trade', '24h Trade (Normal)', 'Country', 'Website', 'Year'], 1);

    // Duyệt qua 20 exchanges đầu tiên và tạo hàng trong bảng
    data.slice(0, 20).forEach(exchange => {
        const row = document.createElement('tr');


        // Tạo nội dung hàng với dữ liệu exchange (có chú thích từng trường)
        row.innerHTML = `
            <td class="rank">${exchange.trust_score_rank}</td> <!-- Thứ hạng trust score -->
            <td class="name-column table-fixed-column"><img src="${exchange.image}" alt="${exchange.name}"> ${exchange.name}</td> <!-- Tên và logo sàn -->
            <td>${exchange.trust_score}</td> <!-- Trust score -->
            <td>${exchange.trade_volume_24h_btc.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} BTC</td> <!-- Volume 24h (BTC) -->
            <td>${exchange.trade_volume_24h_btc_normalized.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} BTC</td> <!-- Volume 24h normalized (BTC) -->
            <td class="name-column">${exchange.country || 'N/A'}</td> <!-- Quốc gia -->
            <td class="name-column"><a href="${exchange.url}" target="_blank">${exchange.url}</a></td> <!-- Website (link) -->
            <td>${exchange.year_established || 'N/A'}</td> <!-- Năm thành lập -->
        `;

        // Thêm hàng vào bảng
        table.appendChild(row);
    });

    // Thêm bảng vào phần tử DOM
    exchangeList.appendChild(table);
}

// Hàm hiển thị danh sách categories
function displayCategories(data) {
    // Lấy phần tử DOM để hiển thị danh sách categories
    const catagoriesList = document.getElementById('category-list');

    // Xóa nội dung cũ
    catagoriesList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột (tham số 1 là số cột fixed)
    const table = createTable(['Top Coins', 'Category', 'Market Cap', '24h Market Cap', '24h Volume'], 1);

    // Duyệt qua 20 categories đầu tiên và tạo hàng trong bảng
    data.slice(0, 20).forEach(category => {
        const row = document.createElement('tr');

        // Tạo nội dung hàng với dữ liệu category
        // Tạo nội dung hàng với dữ liệu category
        // - Hiển thị 3 coin top đầu của category (logo)
        // - Hiển thị tên category
        // - Hiển thị market cap (phân tách hàng nghìn, 3 số thập phân)
        // - Hiển thị market cap thay đổi 24h (màu xanh/đỏ theo chiều tăng/giảm)
        // - Hiển thị volume 24h (phân tách hàng nghìn, 3 số thập phân)
        row.innerHTML = `
            <td>${category.top_3_coins.map(coin => `<img src="${coin}" alt="coin">`).join('')}</td>
            <td class="name-column table-fixed-column">${category.name}</td>
            <td>${category.market_cap?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || 'N/A'}</td>
            <td class="${category.market_cap_change_24h >= 0 ? 'green' : 'red'}">${category.market_cap_change_24h?.toFixed(3) || "0"}%</td>
            <td>${category.volume_24h?.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }) || "N/A"}</td>
        `;

        // Thêm hàng vào bảng
        table.appendChild(row);
    });

    // Thêm bảng vào phần tử DOM
    catagoriesList.appendChild(table);
}

// Hàm hiển thị danh sách companies
function displayCompanies(data) {
    // Lấy phần tử DOM để hiển thị danh sách companies
    const companyList = document.getElementById('company-list');

    // Xóa nội dung cũ
    companyList.innerHTML = '';

    // Tạo bảng với các tiêu đề cột
    const table = createTable(['Company', 'Total BTC', 'Entry Value', 'Total Current Value', 'Total %']);

    // Duyệt qua từng company và tạo hàng trong bảng
    data.companies.forEach(company => {
        const row = document.createElement('tr');

        // Tạo nội dung hàng với dữ liệu company
        row.innerHTML = `
           <td class="name-column table-fixed-column">${company.name}</td>
            <td>${company.total_holdings}</td>
            <td>${company.total_entry_value_usd}</td>
            <td>${company.total_current_value_usd}</td>
            <td class="${company.percentage_of_total_supply >= 0 ? 'green' : 'red'}">${company.percentage_of_total_supply}%</td>
        `;

        // Thêm hàng vào bảng
        table.appendChild(row);
    });

    // Thêm bảng vào phần tử DOM
    companyList.appendChild(table);
}

