// Lấy phần tử DOM có id là 'coins-list' để hiển thị kết quả tìm kiếm coins
const coinsList = document.getElementById('coins-list'); // getElementById: lấy phần tử theo id, giúp thao tác với phần tử HTML cụ thể
const exchangesList = document.getElementById('exchanges-list'); // Lấy phần tử hiển thị exchanges
const nftsList = document.getElementById('nfts-list'); // Lấy phần tử hiển thị nfts

// Lắng nghe sự kiện khi toàn bộ nội dung trang đã được tải xong
document.addEventListener('DOMContentLoaded', () => { // DOMContentLoaded: sự kiện báo hiệu DOM đã sẵn sàng để thao tác
    const params = new URLSearchParams(window.location.search); // URLSearchParams: tiện ích để lấy tham số trên URL
    const query = params.get('query'); // Lấy giá trị tham số 'query' từ URL

    if (query) { // Nếu có query thì thực hiện tìm kiếm
        fetchSearchResult(query, ['coins-list', 'exchanges-list', 'nfts-list']);
    } else { // Nếu không có query thì hiển thị thông báo
        const searchHeading = document.getElementById('searchHeading');
        const searchContainer = document.querySelector('.search-container'); // querySelector: lấy phần tử đầu tiên khớp selector
        searchContainer.innerHTML = '<p style="color: red; text-align: center; margin-bottom: 8px">Nothing To Show...</p>';
        searchHeading.innerText = 'Please search something...';
    }
});

// Hàm fetchSearchResult: gọi API và xử lý kết quả tìm kiếm
function fetchSearchResult(param, elementIds) {
    const searchHeading = document.getElementById('searchHeading');
    searchHeading.innerText = `Searching for "${param}"...`; // Hiển thị trạng thái đang tìm kiếm

    elementIds.forEach(id => { // Duyệt qua từng id của các danh sách
        const errorElement = document.getElementById(`${id}-error`); // Lấy phần tử hiển thị lỗi nếu có
        if (errorElement) {
            errorElement.style.display = 'none'; // Ẩn thông báo lỗi trước khi tìm kiếm mới
        }
        toggleSpinner(id, `${id}-spinner`, true); // Hiện spinner loading
    });

    coinsList.innerHTML = ''; // Xóa kết quả cũ
    exchangesList.innerHTML = '';
    nftsList.innerHTML = '';

    const url = `https://api.coingecko.com/api/v3/search?query=${param}`; // Tạo URL API
    const options = { method: 'GET', headers: { accept: 'application/json' } }; // Thiết lập options cho fetch

    fetch(url, options) // fetch: hàm gọi API trả về Promise
        .then(response => { // Xử lý response trả về
            if (!response.ok) { // Nếu response lỗi thì throw error
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json(); // Chuyển response thành json
        })
        .then(data => { // Xử lý dữ liệu trả về từ API
            elementIds.forEach(id => toggleSpinner(id, `${id}-spinner`, false)); // Ẩn spinner

            // Lọc các kết quả có hình ảnh hợp lệ
            let coins = (data.coins || []).filter(coin => coin.thumb !== "missing_thumb.png");
            let exchanges = (data.exchanges || []).filter(ex => ex.thumb !== "missing_thumb.png");
            let nfts = (data.nfts || []).filter(nf => nf.thumb !== "missing_thumb.png");

            const coinsCount = coins.length; // Đếm số lượng kết quả
            const exchangesCount = exchanges.length;
            const nftsCount = nfts.length;

            let minCount = Math.min(coinsCount, exchangesCount, nftsCount); // Lấy số lượng nhỏ nhất để đồng bộ hiển thị

            if (coinsCount > 0 && exchangesCount > 0 && nftsCount > 0) {
                coins = coins.slice(0, minCount); // Cắt mảng theo số lượng nhỏ nhất
                exchanges = exchanges.slice(0, minCount);
                nfts = nfts.slice(0, minCount);
            }

            coinsResult(coins); // Hiển thị kết quả coins
            if (typeof exchangesResult === 'function') { // Kiểm tra hàm exchangesResult có tồn tại không
                exchangesResult(exchanges); // Hiển thị kết quả exchanges
            }
            nftsResult(nfts); // Hiển thị kết quả nfts

            // Nếu không có kết quả thì hiển thị thông báo
            if (coins.length === 0) {
                coinsList.innerHTML = '<p style="color: red; text-align: center;">No results found for coins.</p>';
            }
            if (exchanges.length === 0) {
                exchangesList.innerHTML = '<p style="color: red; text-align: center;">No results found for exchanges.</p>';
            }
            if (nfts.length === 0) {
                nftsList.innerHTML = '<p style="color: red; text-align: center;">No results found for nfts.</p>';
            }

            searchHeading.innerText = `Search results for "${param}"`; // Cập nhật tiêu đề kết quả
        })
        .catch(error => { // Bắt lỗi khi fetch thất bại
            elementIds.forEach(id => {
                toggleSpinner(id, `${id}-spinner`, false); // Ẩn spinner
                const errorElement = document.getElementById(`${id}-error`);
                if (errorElement) {
                    errorElement.style.display = 'block'; // Hiện thông báo lỗi
                }
            });
            console.error('Error fetching data:', error); // Ghi log lỗi ra console
        });
}

// Hàm hiển thị kết quả coins dưới dạng bảng
function coinsResult(coins) {
    coinsList.innerHTML = ''; // Xóa nội dung cũ

    const table = document.createElement('table'); // Tạo bảng mới
    table.innerHTML = `
        <thead>
            <tr>
                <th>Rank</th>
                <th>Coin</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody'); // Tạo phần thân bảng
    coins.forEach(coin => { // Duyệt qua từng coin
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${coin.market_cap_rank ?? '-'}</td> <!-- Hiển thị rank, nếu không có thì là '-' -->
            <td class="name-column">
                <img src="${coin.thumb}" alt="${coin.name}" /> ${coin.name} <span>(${coin.symbol.toUpperCase()})</span>
            </td>
        `;
        if (coin.id) { // Nếu có id thì cho phép click để chuyển trang
            row.onclick = () => {
                window.location.href = `coin.html?coin=${coin.id}`;
            };
            row.style.cursor = 'pointer'; // Đổi con trỏ chuột khi hover
        }
        tbody.appendChild(row); // Thêm dòng vào bảng
    });

    table.appendChild(tbody); // Thêm tbody vào table
    coinsList.appendChild(table); // Thêm bảng vào DOM
}

// Lấy phần tử bọc ô tìm kiếm
const searchWrapper = document.querySelector('.search');
searchWrapper.style.position = 'relative'; // Đặt vị trí tương đối để suggestions box định vị tuyệt đối

// Tạo suggestions box để hiển thị gợi ý tìm kiếm
const suggestionsBox = document.createElement('div'); // Tạo một thẻ div mới để chứa danh sách gợi ý
suggestionsBox.className = 'suggestions-box'; // Gán class để dễ CSS (nếu có dùng ngoài CSS)
suggestionsBox.style.position = 'absolute'; // Đặt vị trí tuyệt đối để có thể "nằm chồng" lên layout
suggestionsBox.style.top = '100%'; // Hiển thị ngay phía dưới ô input (tức ngay sau thẻ cha)
suggestionsBox.style.left = '0'; // Căn trái với phần tử cha (searchWrapper)
suggestionsBox.style.width = '100%'; // Rộng bằng phần tử cha
suggestionsBox.style.background = '#fff'; // Nền trắng
suggestionsBox.style.border = '1px solid #ccc'; // Viền mỏng màu xám nhạt
suggestionsBox.style.borderTop = 'none'; // Không có viền trên (để nối liền với input)
suggestionsBox.style.maxHeight = '200px'; // Giới hạn chiều cao tối đa 200px
suggestionsBox.style.overflowY = 'auto'; // Nếu nội dung vượt quá thì hiện thanh cuộn dọc
suggestionsBox.style.zIndex = '1000'; // Ưu tiên hiển thị trên các phần tử khác
suggestionsBox.style.display = 'none'; // Mặc định ẩn đi cho đến khi có dữ liệu gợi ý
suggestionsBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'; // Đổ bóng nhẹ để nổi bật
suggestionsBox.style.marginTop = '2px'; // Cách ô input một chút (tạo khoảng cách)

searchWrapper.appendChild(suggestionsBox); // Thêm suggestionsBox vào trong phần tử bao quanh ô tìm kiếm (DOM)

// Khai báo biến timeout để dùng debounce (trì hoãn gọi API nếu đang gõ)
let suggestionTimeout;

// Lắng nghe sự kiện người dùng nhập vào ô tìm kiếm
document.getElementById('searchInput').addEventListener('input', function () {
    const query = this.value.trim(); // Lấy giá trị người dùng nhập, loại bỏ khoảng trắng 2 đầu
    clearTimeout(suggestionTimeout); // Nếu trước đó có timeout chưa kịp chạy thì hủy

    if (query.length === 0) { // Nếu người dùng xóa hết text
        suggestionsBox.style.display = 'none'; // Ẩn suggestions box
        suggestionsBox.innerHTML = ''; // Xóa hết nội dung gợi ý
        return; // Không làm gì nữa
    }

    // Đợi 300ms sau khi ngừng gõ mới gọi API (tránh gọi quá nhiều lần)
    suggestionTimeout = setTimeout(() => {
        fetch(`https://api.coingecko.com/api/v3/search?query=${query}`) // Gọi API từ CoinGecko, tìm kiếm theo query
            .then(response => response.json()) // Chuyển response thành đối tượng JSON
            .then(data => {
                const coins = (data.coins || []).slice(0, 5); // Lấy tối đa 5 kết quả đầu tiên
                showSuggestions(coins); // Gọi hàm hiển thị danh sách gợi ý
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error); // In lỗi ra console nếu fetch thất bại
            });
    }, 300); // Chờ 300ms mới thực hiện
});

// Hàm dùng để hiển thị danh sách gợi ý tìm kiếm
function showSuggestions(coins) {
    suggestionsBox.innerHTML = ''; // Xóa nội dung gợi ý cũ nếu có

    if (coins.length === 0) { // Nếu API không trả về gợi ý nào
        suggestionsBox.style.display = 'none'; // Ẩn suggestions box
        return; // Không hiển thị gì cả
    }

    coins.forEach(coin => { // Duyệt qua từng coin trong danh sách gợi ý
        const item = document.createElement('div'); // Tạo một phần tử div cho mỗi gợi ý
        item.style.padding = '8px 12px'; // Tạo khoảng cách bên trong
        item.style.cursor = 'pointer'; // Khi hover thì hiện icon tay
        item.style.display = 'flex'; // Dùng flex để icon và text nằm ngang
        item.style.alignItems = 'center'; // Căn giữa theo chiều dọc
        item.style.gap = '8px'; // Khoảng cách giữa ảnh và chữ
        item.style.transition = 'background 0.2s'; // Hiệu ứng mượt khi hover

        item.innerHTML = `
            <img src="${coin.thumb}" alt="${coin.name}" width="20" height="20"> 
            <span>${coin.name} (${coin.symbol.toUpperCase()})</span>
        `; // Tạo nội dung gợi ý gồm logo coin và tên + mã viết hoa

        item.addEventListener('mouseover', () => {
            item.style.background = '#f1f1f1'; // Khi rê chuột vào thì đổi màu nền
        });
        item.addEventListener('mouseout', () => {
            item.style.background = 'transparent'; // Khi rời chuột thì trở lại như cũ
        });

        item.addEventListener('click', () => {
            window.location.href = `coin.html?coin=${coin.id}`; // Khi click, chuyển tới trang chi tiết coin
        });

        suggestionsBox.appendChild(item); // Thêm phần tử gợi ý vào trong box
    });

    suggestionsBox.style.display = 'block'; // Sau khi có nội dung thì hiển thị box
}

// Khi click ra ngoài phần tử searchWrapper thì ẩn suggestions box
document.addEventListener('click', function (e) {
    if (!searchWrapper.contains(e.target)) { // Nếu phần tử được click không nằm trong vùng ô tìm kiếm
        suggestionsBox.style.display = 'none'; // Ẩn suggestions
    }
});
/**
 * createElement('div'): Tạo một thẻ <div> bằng JavaScript.

appendChild(...): Chèn phần tử con vào DOM.

addEventListener('input', callback): Gọi hàm khi người dùng gõ chữ.

setTimeout(..., 300): Đợi 300ms rồi mới chạy tiếp (kỹ thuật debounce để tránh gọi API quá nhiều).

fetch(url): Gửi yêu cầu đến server (API).

.then(...): Xử lý khi nhận được phản hồi từ server.

.catch(...): Bắt lỗi nếu fetch thất bại.

forEach(...): Duyệt qua từng phần tử trong mảng.

window.location.href = ...: Chuyển trang tới URL mới.

contains(...): Kiểm tra một phần tử DOM có nằm bên trong phần tử khác không.
 */