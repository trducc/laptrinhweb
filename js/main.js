// ==========================================================
// 1. CẤU HÌNH CHUNG & CSS ANIMATION
// ==========================================================
const style = document.createElement('style');
style.innerHTML = `
    @keyframes ring-animation {
        0%, 100% { transform: rotate(0); }
        10%, 30%, 50% { transform: rotate(15deg); }
        20%, 40% { transform: rotate(-15deg); }
    }
    .bell-ringing i {
        animation: ring-animation 1.5s ease-in-out infinite;
        color: #dc3545 !important;
    }
    .back-to-top {
        position: fixed; bottom: 30px; right: 30px;
        width: 45px; height: 45px; background: #0d6efd;
        color: white; border: none; border-radius: 50%;
        display: none; align-items: center; justify-content: center;
        z-index: 1000; cursor: pointer; transition: 0.3s;
    }
    .back-to-top.show { display: flex; }
`;
document.head.appendChild(style);

let trangHienTai = 0;
const soPhongMoiTrang = 9;

if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

// ==========================================================
// 2. LOGIC ADMIN (QUẢN LÝ TIN ĐĂNG)
// ==========================================================
let loaiHanhDongAdmin = '';
let idPhongAdmin = null;

function taiDanhSachTinDang() {
    const statusFilter = document.getElementById('filterStatus').value;
    const container = document.getElementById('bang-tin-dang');

    if (!container) return;

    // Lấy tất cả về để lọc ở Frontend cho nhanh và mượt
    fetch(`http://127.0.0.1:9090/api/danh-sach-phong-tro?trangThai=TAT_CA`)
    .then(res => res.json())
    .then(data => {
        let filteredData = data;

        // --- FIX LOGIC LỌC: ĐẢM BẢO KHỚP 100% VỚI VALUE TRONG HTML ---
        if (statusFilter === 'DA_DUYET_VIP') {
            filteredData = data.filter(p => (p.trangThai || '').toUpperCase() === 'DA_DUYET' && p.isVip === 1);
        } 
        else if (statusFilter === 'CHO_DUYET_VIP') {
            // Logic quan trọng: Bài đang xin VIP là bài có isVip = 1 nhưng CHƯA ĐƯỢC DUYỆT LẠI
            filteredData = data.filter(p => p.isVip === 1 && (p.trangThai || '').toUpperCase() !== 'DA_DUYET');
        } 
        else if (statusFilter === 'DA_DUYET') {
            // Lọc bài đã duyệt thường: Trạng thái duyệt và KHÔNG phải VIP
            filteredData = data.filter(p => (p.trangThai || '').toUpperCase() === 'DA_DUYET' && (p.isVip === 0 || p.isVip === null));
        } 
        else if (statusFilter === 'CHO_DUYET') {
            // Lọc bài chờ duyệt thường: Trạng thái chờ và KHÔNG phải VIP
            filteredData = data.filter(p => (p.trangThai || '').toUpperCase() === 'CHO_DUYET' && (p.isVip === 0 || p.isVip === null));
        }

        // Ưu tiên đẩy các bài VIP hoặc đang xin VIP lên đầu bảng khi xem "Tất cả"
        if (statusFilter === 'TAT_CA') {
            filteredData.sort((a, b) => (b.isVip || 0) - (a.isVip || 0));
        }

        let html = '';
        filteredData.forEach(p => {
            let statusStr = (p.trangThai || '').toUpperCase();
            let isDuyet = statusStr === 'DA_DUYET';
            let isVip = p.isVip === 1;
            let badgeClass = '';
            let badgeText = '';

            // Render nhãn trạng thái đồng bộ với hệ thống
            if (isVip && !isDuyet) {
                badgeClass = 'bg-danger text-white border border-warning shadow-sm';
                badgeText = '<i class="fa-solid fa-star-half-stroke me-1"></i> Chờ duyệt VIP';
            } else if (isVip && isDuyet) {
                badgeClass = 'bg-success';
                badgeText = '<i class="fa-solid fa-crown text-warning me-1"></i> Đã duyệt (VIP)';
            } else if (!isVip && !isDuyet) {
                badgeClass = 'bg-warning text-dark';
                badgeText = 'Chờ duyệt';
            } else {
                badgeClass = 'bg-success';
                badgeText = 'Đã duyệt';
            }

            html += `
            <tr class="${isVip && !isDuyet ? 'table-warning' : ''}">
                <td class="fw-bold text-muted">#PT${p.maPhong}</td> 
                <td class="fw-medium text-truncate" style="max-width: 300px;">
                    ${isVip && !isDuyet ? '<span class="text-danger small fw-bold">[YÊU CẦU VIP]</span> ' : ''}${p.tieuDe}
                </td>
                <td class="text-danger fw-bold">${(p.giaTien || 0).toLocaleString()}đ</td>
                <td><span class="badge ${badgeClass} px-3 py-2 rounded-pill shadow-sm">${badgeText}</span></td>
                <td class="text-center">
                    ${(!isDuyet || (isVip && statusStr !== 'DA_DUYET')) ? 
                        `<button class="btn btn-sm btn-success fw-bold me-1 rounded-pill px-3 shadow-sm" onclick="moModalAdmin('DUYET', ${p.maPhong})">Duyệt ngay</button>` : ''}
                    <a href="javascript:void(0)" onclick="xemChiTiet(${p.maPhong})" class="btn btn-sm btn-info text-white me-1 rounded-circle shadow-sm" style="width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center;"><i class="fa-solid fa-eye"></i></a>
                    <button class="btn btn-sm btn-outline-danger rounded-circle shadow-sm" style="width: 32px; height: 32px;" onclick="moModalAdmin('XOA', ${p.maPhong})"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`;
        });
        
        container.innerHTML = html || '<tr><td colspan="5" class="text-center py-5 fw-bold text-muted">Không tìm thấy bài đăng nào phù hợp với bộ lọc.</td></tr>';
        
        // Cập nhật lại thống kê chung (chỉ khi xem tất cả để tránh lag)
        if (statusFilter === 'TAT_CA' && typeof taiThongKeChuan === "function") taiThongKeChuan();
    })
    .catch(err => {
        console.error("Lỗi Admin:", err);
        container.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-5">Lỗi kết nối máy chủ 9090!</td></tr>';
    });
}
function moModalAdmin(type, id) {
    loaiHanhDongAdmin = type;
    idPhongAdmin = id;
    const tieuDe = type === 'DUYET' ? 'Duyệt tin đăng' : 'Xóa tin đăng';
    const noiDung = type === 'DUYET' ? `Phê duyệt cho bài đăng #PT${id}?` : `Xác nhận xóa vĩnh viễn #PT${id}?`;
    
    hienThiThongBao(tieuDe, noiDung, "xacnhan", thucHienHanhDongAdmin);
}

function thucHienHanhDongAdmin() {
    const endpoint = loaiHanhDongAdmin === 'DUYET' ? 'duyet-phong' : 'xoa-phong';
    const method = loaiHanhDongAdmin === 'DUYET' ? 'PUT' : 'DELETE';
    
    fetch(`http://127.0.0.1:9090/api/${endpoint}/${idPhongAdmin}`, { method: method })
    .then(() => {
        hienThiThongBao("Thành công", "Thao tác đã được thực hiện!", "thanhcong");
        taiDanhSachTinDang(); 
    });
}
// ==========================================================
// 9. LOGIC ĐĂNG TIN PHÒNG TRỌ (CHỦ TRỌ)
// ==========================================================
function xuLyDangTin() {
    // 1. Lấy thông tin văn bản
    let tieuDe = document.getElementById('dt-tieuDe').value.trim();
    let diaChi = document.getElementById('dt-diaChi').value.trim();
    let giaTien = document.getElementById('dt-giaTien').value.trim();
    let dienTich = document.getElementById('dt-dienTich').value.trim();
    let ganTruong = document.getElementById('dt-ganTruong').value; 

    // 2. LOGIC ẢNH: Lấy tên file của ảnh ĐẦU TIÊN từ danh sách đã chọn
    const inputAnh = document.getElementById('dt-roomImages');
    let tenFileAnh = "";
    
    if (inputAnh.files && inputAnh.files.length > 0) {
        tenFileAnh = inputAnh.files[0].name; // Bắt cứng ảnh số 1 làm ảnh đại diện lưu vào DB
    } else {
        hienThiThongBao("Thiếu hình ảnh", "Vui lòng chọn ít nhất 1 hình ảnh làm ảnh đại diện!", "canhbao");
        return; // Dừng lại không gửi form
    }

    // 3. Kiểm tra thông tin bắt buộc
    if (!tieuDe || !diaChi || !giaTien || !dienTich || !ganTruong) {
        hienThiThongBao("Thông tin chưa đầy đủ", "Vui lòng chọn trường học và điền đầy đủ các thông tin bắt buộc (*).", "canhbao");
        return;
    }

    // 4. Đóng gói dữ liệu thành Object để gửi xuống API
    let duLieuPhong = {
        tieuDe: tieuDe,
        diaChi: diaChi,
        giaTien: parseInt(giaTien) * 1000000, // Đổi từ triệu VNĐ ra số nguyên
        dienTich: parseInt(dienTich),
        giaDien: document.getElementById('dt-giaDien').value,
        giaNuoc: document.getElementById('dt-giaNuoc').value,
        ganTruong: ganTruong,
        hinhAnh: tenFileAnh, // Đã chốt tên file ảnh đầu tiên
        
        // Checkbox tiện ích (có tích = 1, không tích = 0)
        khongChungChu: document.getElementById('dt-chungchu').checked ? 1 : 0,
        veSinhKhepKin: document.getElementById('dt-vesinh').checked ? 1 : 0,
        coChoNauAn: document.getElementById('dt-nauan').checked ? 1 : 0,
        coDieuHoa: document.getElementById('dt-dieuhoa').checked ? 1 : 0,
        coBinhNongLanh: document.getElementById('dt-nonglanh').checked ? 1 : 0,
        deXeMienPhi: document.getElementById('dt-dexe').checked ? 1 : 0,
        khoaVanTay: document.getElementById('dt-vantay').checked ? 1 : 0,
        coMayGiat: document.getElementById('dt-maygiat').checked ? 1 : 0,
        
        // Lấy mã người đăng từ phiên đăng nhập
        maNguoiDung: parseInt(localStorage.getItem("maNguoiDung")) 
    };

    // 5. Gọi API lưu vào Database
    fetch('http://127.0.0.1:9090/api/dang-tin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duLieuPhong)
    })
    .then(response => response.text())
    .then(ketQua => {
        if (ketQua === "THANH_CONG") {
            hienThiThongBao("Đăng tin thành công!", "Bài đăng của bạn đang chờ quản trị viên phê duyệt.", "thanhcong", () => {
                window.location.href = "index.html"; // Chuyển về trang chủ
            });
        } else {
            hienThiThongBao("Lỗi hệ thống", "Không thể lưu dữ liệu vào lúc này. Vui lòng thử lại sau.", "loi");
        }
    })
    .catch(error => {
        console.error("Lỗi đăng tin:", error);
        hienThiThongBao("Lỗi kết nối", "Hệ thống gặp sự cố kết nối máy chủ. Vui lòng liên hệ quản trị viên.", "loi");
    });
}
function xuLyHoTro(idHoTro) {
    const maAdmin = localStorage.getItem("maNguoiDung"); // Lấy ID admin đang dùng máy
    
    fetch(`http://127.0.0.1:9090/api/phan-hoi-ho-tro/${idHoTro}?maAdmin=${maAdmin}`, {
        method: 'POST'
    })
    .then(res => {
        if (res.status === 403) {
            hienThiThongBao("Lỗi bảo mật", "Bạn không có quyền xử lý mục này!", "loi");
            return;
        }
        hienThiThongBao("Thành công", "Đã đánh dấu xử lý yêu cầu hỗ trợ!", "thanhcong");
        // Gọi lại hàm load danh sách hỗ trợ để cập nhật UI
        if (typeof taiDanhSachHoTro === "function") taiDanhSachHoTro(); 
    });
}

// ==========================================================
// 3. THÔNG BÁO & TÀI KHOẢN
// ==========================================================
function hienThiThongBao(tieuDe, noiDung, loai, hanhDongDong) {
    let oldModal = document.getElementById('modalThongBaoChung');
    if (oldModal) oldModal.remove();

    let icon = loai === 'loi' ? '<i class="fa-solid fa-circle-xmark text-danger" style="font-size: 4rem;"></i>' :
               loai === 'canhbao' || loai === 'xacnhan' ? '<i class="fa-solid fa-triangle-exclamation text-warning" style="font-size: 4rem;"></i>' :
               '<i class="fa-solid fa-circle-check text-success" style="font-size: 4rem;"></i>';

    let btnHuy = loai === 'xacnhan' ? `<button type="button" class="btn btn-light fw-bold rounded-pill px-4" data-bs-dismiss="modal">Hủy</button>` : '';
    let textOK = loai === 'xacnhan' ? 'Đồng ý' : 'Đóng';
    let colorOK = loai === 'loi' ? 'btn-danger' : 'btn-primary';

    let html = `
    <div class="modal fade" id="modalThongBaoChung" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content rounded-4 border-0 shadow">
                <div class="modal-body text-center p-5">
                    <div class="mb-4">${icon}</div>
                    <h4 class="fw-bold mb-3">${tieuDe}</h4>
                    <p class="text-muted mb-4">${noiDung}</p>
                    <div class="d-flex justify-content-center gap-2">
                        ${btnHuy}
                        <button type="button" class="btn ${colorOK} fw-bold rounded-pill px-4" id="btnOkThongBao">${textOK}</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', html);
    let modalEl = document.getElementById('modalThongBaoChung');
    let modal = new bootstrap.Modal(modalEl);

    document.getElementById('btnOkThongBao').addEventListener('click', function() {
        modal.hide();
        if (typeof hanhDongDong === 'function') hanhDongDong();
    });
    modal.show();
}
function loadPhongVIP() {
    fetch('http://127.0.0.1:9090/api/danh-sach-vip')
    .then(res => res.json())
    .then(data => {
        const vipContainer = document.getElementById('danhSachVip');
        const khuVucVip = document.getElementById('khu-vuc-vip');
        if (!vipContainer) return;

        if (!data || data.length === 0) {
            if (khuVucVip) khuVucVip.style.display = 'none';
            return;
        }

        // Cuốn từ điển dịch tên trường để đồng bộ với phòng thường
        const tuDienTruong = {
            "HAU": "Đại học Kiến trúc Hà Nội",
            "PTIT": "Học viện Công nghệ Bưu chính Viễn thông",
            "ANND": "Học viện An ninh Nhân dân",
            "VMAT": "Học viện Quân Y",
            "PHK": "Đại học Phenikaa",
            "DNU": "Đại học Đại Nam"
        };

        let html = '';
        data.forEach(phong => {
            let anh = phong.hinhAnh ? `images/${phong.hinhAnh.split(',')[0]}` : 'images/phong1.jpg';
            let gia = phong.giaTien ? phong.giaTien.toLocaleString('vi-VN') : 'Thỏa thuận';
            
            // Dịch mã trường sang tiếng Việt đầy đủ
            let tenTruongDayDu = tuDienTruong[phong.ganTruong] || phong.ganTruong;

            html += `
            <div class="col-md-4 mb-4">
                <div class="card border-0 shadow h-100 position-relative" style="border: 2px solid #ffc107 !important; border-radius: 15px; overflow: hidden;">
                    <span class="badge bg-warning text-dark position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-bold z-3 shadow">
                        <i class="fa-solid fa-crown me-1"></i> VIP
                    </span>
                    <div class="ratio ratio-16x9">
                        <img src="${anh}" class="card-img-top object-fit-cover" onerror="this.src='images/phong1.jpg'">
                    </div>
                    <div class="card-body p-4 d-flex flex-column">
                        <h4 class="text-primary fw-bold mb-2">${gia} <span class="text-muted fs-6 fw-normal">đ/tháng</span></h4>
                        <p class="text-muted small mb-1 text-truncate"><i class="fa-solid fa-location-dot text-danger me-1"></i>${phong.diaChi}</p>
                        <p class="text-primary small mb-2 fw-bold text-truncate"><i class="fa-solid fa-graduation-cap me-1"></i>${tenTruongDayDu}</p>
                        <h6 class="card-title fw-bold mb-3" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3rem;">${phong.tieuDe}</h6>
                        
                        <div class="row g-2 text-muted small mb-4 mt-auto fw-medium">
                            <div class="col-6 text-truncate"><i class="fa-solid fa-ruler-combined me-1 text-warning"></i>${phong.dienTich}m²</div>
                            <div class="col-6 text-truncate"><i class="fa-solid fa-bolt me-1 text-warning"></i>${phong.giaDien || '3.5k'}</div>
                            <div class="col-6 text-truncate"><i class="fa-solid fa-droplet me-1 text-info"></i>${phong.giaNuoc || '30k'}</div>
                            <div class="col-6 text-truncate"><i class="fa-solid fa-broom me-1 text-success"></i>${phong.giaDichVu || 'Free'}</div>
                        </div>
                        
                        <a href="chitiet.html?id=${phong.maPhong}" class="btn btn-outline-primary w-100 fw-bold rounded-pill">Chi tiết phòng</a>
                    </div>
                </div>
            </div>`;
        });
        
        vipContainer.innerHTML = html;
        if (khuVucVip) khuVucVip.style.display = 'block';
    })
    .catch(err => console.error('Lỗi load VIP:', err));
}
loadPhongVIP();
        
       

function taiThongBao() {
    const maNguoiDung = localStorage.getItem("maNguoiDung");
    const badge = document.getElementById('badge-thong-bao');
    const container = document.getElementById('noi-dung-thong-bao');
    const bellBtn = document.getElementById('dropdownNotification');
    if (!container) return;

    if (!maNguoiDung || maNguoiDung === "null") {
        container.innerHTML = '<li class="text-center py-4 text-muted small">Vui lòng đăng nhập để xem thông báo</li>';
        if (badge) badge.classList.add('d-none');
        return;
    }

    fetch(`http://127.0.0.1:9090/api/danh-sach-thong-bao/${maNguoiDung}`)
        .then(res => res.json())
        .then(data => {
            const chuaXem = data.filter(t => t.trangThaiXem === 0).length;
            if (badge) {
                if (chuaXem > 0) {
                    badge.innerText = chuaXem;
                    badge.classList.remove('d-none');
                    if (bellBtn) bellBtn.classList.add('bell-ringing');
                } else {
                    badge.classList.add('d-none');
                    if (bellBtn) bellBtn.classList.remove('bell-ringing');
                }
            }
            if (data.length === 0) {
                container.innerHTML = '<li class="text-center py-4 text-muted small">Không có thông báo mới</li>';
                return;
            }
            container.innerHTML = data.map(t => `
                <li class="dropdown-item p-3 border-bottom ${t.trangThaiXem === 0 ? 'bg-light' : ''}" style="cursor: pointer; white-space: normal;" onclick="danhDauDaXem(${t.maThongBao})">
                    <p class="mb-1 small ${t.trangThaiXem === 0 ? 'fw-bold text-dark' : 'text-secondary'}">${t.noiDung}</p>
                    <span class="text-muted" style="font-size: 0.7rem;">${new Date(t.ngayTao).toLocaleString('vi-VN')}</span>
                </li>
            `).join('');
        })
        .catch(() => { if (badge) badge.classList.add('d-none'); });
}

function danhDauDaXem(id) {
    fetch(`http://127.0.0.1:9090/api/danh-dau-da-xem/${id}`, { method: 'POST' }).then(() => taiThongBao());
}

function xacNhanDangXuat() {
    hienThiThongBao("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống chứ?", "xacnhan", function() {
        localStorage.removeItem('taiKhoan');
        localStorage.removeItem('maNguoiDung');
        localStorage.removeItem('vaiTro');
        window.location.href = "dangnhap.html";
    });
}
function likeBinhLuan(id) {
    fetch(`http://localhost:9090/api/like-binh-luan/${id}`, {
        method: 'POST'
    })
    .then(res => {
        if(res.ok) {
            // Tăng số like trên màn hình ngay lập tức cho "keo"
            let likeSpan = document.getElementById(`like-count-${id}`);
            let currentLike = parseInt(likeSpan.innerText);
            likeSpan.innerText = currentLike + 1;
            
            // Đổi icon sang tim đỏ (nếu muốn)
            event.target.classList.replace('fa-regular', 'fa-solid');
        }
    })
    .catch(err => console.error("Lỗi like rồi Đức ơi:", err));
}

function capNhatMenu() {
    const taiKhoan = localStorage.getItem("taiKhoan");
    const vaiTro = (localStorage.getItem("vaiTro") || "").trim().toUpperCase(); 
    const menuDangTin = document.querySelector('a[href="dangtin.html"]') || document.querySelector('a[onclick="chuyenTrangDangTin(event)"]');
    const menuYeuThich = document.querySelector('a[href="yeuthich.html"]');
    const menuHoTro = document.querySelector('a[href="hotro.html"]');
    const menuAdmin = document.querySelector('.navbar-nav');
    
    let navQuanLyPhong = document.getElementById('nav-quan-ly-phong');

    if (vaiTro === 'QUAN_TRI') {
        if (menuDangTin) menuDangTin.parentElement.remove();
        if (menuYeuThich) menuYeuThich.parentElement.remove();
        if (menuHoTro) menuHoTro.parentElement.remove();
        
        const isNotAdminPage = !window.location.href.includes('admin.html');
        if (isNotAdminPage && !document.querySelector('a[href="admin.html"]')) {
    const li = document.createElement('li');
    li.className = 'nav-item';
    // Thêm icon fa-user-shield và badge thông báo vào đây
    li.innerHTML = `<a class="nav-link text-danger fw-bold position-relative" href="admin.html">
                        <i class="fa-solid fa-user-shield me-1"></i>Quản trị
                        <span id="badge-admin" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none" style="font-size: 0.6rem; padding: 4px 6px;">0</span>
                    </a>`;
    menuAdmin.appendChild(li);
    
    // Gọi hàm để lấy số lượng bài chờ duyệt hiển thị lên badge đỏ
    if (typeof taiBadgeAdmin === "function") taiBadgeAdmin();
}
    } else if (vaiTro === 'SINH_VIEN') {
        if (menuDangTin) menuDangTin.parentElement.style.display = 'none'; 
    } else if (vaiTro === 'CHU_TRO') {
        if (menuYeuThich) menuYeuThich.parentElement.style.display = 'none'; 
        
        if (navQuanLyPhong) {
            navQuanLyPhong.classList.remove('d-none');
            navQuanLyPhong.style.display = 'block';
        } else if (menuDangTin && menuDangTin.parentElement && !document.querySelector('a[href="quanliphong.html"]')) {
            const newLi = document.createElement('li');
            newLi.className = 'nav-item';
            newLi.id = 'nav-quan-ly-phong';
            newLi.innerHTML = '<a class="nav-link text-primary fw-bold" href="quanliphong.html">Quản lý phòng</a>';
            menuDangTin.parentElement.insertAdjacentElement('afterend', newLi);
        }
    }

    const authZone = document.getElementById('user-auth-zone');
    if (taiKhoan && authZone && !window.location.href.includes('dangnhap.html') && !window.location.href.includes('dangky.html')) {
        authZone.innerHTML = `
            <span class="fw-bold text-primary me-2" style="font-size: 16px;">Chào, ${taiKhoan}</span>
            <button class="btn btn-outline-danger btn-sm rounded-pill fw-bold px-3" onclick="xacNhanDangXuat()">Đăng xuất</button>
        `;
    }
}

// ==========================================================
// 4. LOGIC HIỂN THỊ PHÒNG & TĂNG VIEW
// ==========================================================
function xemChiTiet(maPhong) {
    if (!kiemTraVaEpDangNhap()) return;
    
    fetch(`http://127.0.0.1:9090/api/tang-view/${maPhong}`, { method: 'POST' })
    .then(() => {
        window.location.href = `chitiet.html?id=${maPhong}`;
    })
    .catch(() => {
        window.location.href = `chitiet.html?id=${maPhong}`;
    });
}

function kiemTraVaEpDangNhap() {
    const taiKhoan = localStorage.getItem("taiKhoan");
    if (!taiKhoan) {
        let modalEl = document.getElementById('modalYeuCauDangNhap');
        if (modalEl) {
            let modalDangNhap = new bootstrap.Modal(modalEl);
            modalDangNhap.show();
        } else {
            window.location.href = "dangnhap.html";
        }
        return false;
    }
    return true;
}

function chuyenTrangDangTin(event) {
    if(event) event.preventDefault();
    if (kiemTraVaEpDangNhap()) {
        const vaiTro = (localStorage.getItem('vaiTro') || "").trim().toUpperCase();
        if (vaiTro === 'SINH_VIEN') {
            alert('Chỉ chủ trọ mới có quyền đăng tin!');
            return;
        }
        window.location.href = 'dangtin.html';
    }
}

function taoCardHTML(phong, isTop = false) {
    let badge = isTop ? '<span class="position-absolute top-0 start-0 m-3 badge bg-danger shadow-sm" style="z-index: 10;"><i class="fa-solid fa-fire"></i> Hot</span>' : '';
    const dsYeuThich = JSON.parse(localStorage.getItem('yeuthich')) || [];
    const daThich = dsYeuThich.includes(phong.maPhong);
    const iconTim = daThich ? 'fa-solid fa-heart text-danger' : 'fa-regular fa-heart text-white';

    return `
    <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden card-phong position-relative">
            <div class="position-relative overflow-hidden">
                <img src="images/${phong.hinhAnh || 'phong1.jpg'}" class="card-img-top" style="height: 200px; object-fit: cover; cursor: pointer;" onclick="xemChiTiet(${phong.maPhong})">
                ${badge}
                <button class="btn btn-dark btn-sm rounded-circle position-absolute top-0 end-0 m-3 shadow-sm bg-opacity-50 border-0" 
                        style="width: 35px; height: 35px; z-index: 10; display: flex; align-items: center; justify-content: center;" 
                        onclick="toggleYeuThich(event, ${phong.maPhong}, ${phong.maNguoiDung}, '${phong.tieuDe}')">
                    <i class="${iconTim}" id="tim-${phong.maPhong}" style="transition: transform 0.2s ease; font-size: 1.1rem;"></i>
                </button>
            </div>
            <div class="card-body p-3">
                <h4 class="text-primary fw-bold mb-1">${(phong.giaTien || 0).toLocaleString()} <span class="fs-6 text-muted fw-normal">đ/tháng</span></h4>
                <p class="text-muted small text-truncate mb-1"><i class="fa-solid fa-location-dot"></i> ${phong.diaChi || 'Hà Đông'}</p>
                <h5 class="fs-6 fw-bold text-truncate mb-2">${phong.tieuDe}</h5>
                <div class="d-flex justify-content-between align-items-center border-top pt-2 mt-2 text-secondary flex-wrap" style="font-size: 0.8rem; row-gap: 5px;">
                    <span class="fw-bold text-dark"><i class="fa-solid fa-ruler-combined me-1"></i>${phong.dienTich}m²</span>
                    <span><i class="fa-solid fa-bolt text-warning me-1"></i>${phong.giaDien || '...'}</span>
                    <span><i class="fa-solid fa-droplet text-info me-1"></i>${phong.giaNuoc || '...'}</span>
                    <span><i class="fa-solid fa-broom text-secondary me-1"></i>${phong.giaDichVu || '...'}</span>
                </div>
                <button class="btn btn-outline-primary w-100 rounded-pill mt-3 fw-bold btn-sm py-2" onclick="xemChiTiet(${phong.maPhong})">Chi tiết phòng</button>
            </div>
        </div>
    </div>`;
}

function taiTrangDanhSach(page) {
    trangHienTai = page;
    const container = document.getElementById('khung-danh-sach');
    const nutPhanTrang = document.getElementById('cum-nut-phan-trang');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const truong = urlParams.get('truong'), khuVuc = urlParams.get('khuvuc'), gia = urlParams.get('gia');
    
    let urlFetch = (truong || khuVuc || gia) ? 
        `http://127.0.0.1:9090/api/tim-kiem?truong=${encodeURIComponent(truong || '')}&khu_vuc=${encodeURIComponent(khuVuc || '')}&muc_gia=${encodeURIComponent(gia || '')}` : 
        `http://127.0.0.1:9090/api/danh-sach-phong-phan-trang?page=${page}&size=${soPhongMoiTrang}`;
        
    fetch(urlFetch).then(res => res.json()).then(data => {
        let list = (truong || khuVuc || gia) ? data : data.content;
        let tongTrang = (truong || khuVuc || gia) ? 1 : data.totalPages;

        list = list.filter(p => (p.trangThai || '').toUpperCase() === 'DA_DUYET');

        if (!list || list.length === 0) {
            container.innerHTML = `<div class="col-12 text-center py-5"><p class="mt-3 text-muted fw-bold">Không tìm thấy phòng phù hợp.</p></div>`;
            if(nutPhanTrang) nutPhanTrang.innerHTML = '';
            return;
        }

        container.innerHTML = list.map(p => taoCardHTML(p)).join('');
        veCumNutPhanTrang(tongTrang);
        window.scrollTo({ top: 0, behavior: 'smooth' });

    }).catch(() => {
        container.innerHTML = '<div class="col-12 text-center text-danger py-5 fw-bold">Lỗi kết nối máy chủ 9090!</div>';
    });
}

function veCumNutPhanTrang(tongSoTrang) {
    const container = document.getElementById('cum-nut-phan-trang');
    if (!container) return;
    
    let html = '';
    html += `<li class="page-item ${trangHienTai === 0 ? 'disabled' : ''}">
                <a class="page-link border-0 shadow-sm mx-1 rounded-3" href="javascript:void(0)" onclick="taiTrangDanhSach(${trangHienTai - 1})">
                    <i class="fa-solid fa-chevron-left"></i>
                </a>
             </li>`;

    for (let i = 0; i < tongSoTrang; i++) {
        html += `<li class="page-item ${i === trangHienTai ? 'active' : ''}">
                    <a class="page-link border-0 shadow-sm mx-1 rounded-3 fw-bold" href="javascript:void(0)" onclick="taiTrangDanhSach(${i})">${i + 1}</a>
                 </li>`;
    }

    html += `<li class="page-item ${trangHienTai === tongSoTrang - 1 ? 'disabled' : ''}">
                <a class="page-link border-0 shadow-sm mx-1 rounded-3" href="javascript:void(0)" onclick="taiTrangDanhSach(${trangHienTai + 1})">
                    <i class="fa-solid fa-chevron-right"></i>
                </a>
             </li>`;

    container.innerHTML = html;
}

// ==========================================================
// 5. YÊU THÍCH & CHI TIẾT PHÒNG
// ==========================================================
function toggleYeuThich(event, maPhong, maChuTro, tieuDe) {
    event.stopPropagation();
    if (!kiemTraVaEpDangNhap()) return;

    const taiKhoan = localStorage.getItem("taiKhoan");
    const maNguoiDung = localStorage.getItem("maNguoiDung");
    
    let dsYeuThich = JSON.parse(localStorage.getItem('yeuthich')) || [];
    const icon = document.getElementById(`tim-${maPhong}`);
    if (dsYeuThich.includes(maPhong)) {
        dsYeuThich = dsYeuThich.filter(id => id !== maPhong);
        if (icon) icon.className = 'fa-regular fa-heart text-white';
    } else {
        dsYeuThich.push(maPhong);
        if (icon) {
            icon.className = 'fa-solid fa-heart text-danger';
            icon.style.transform = 'scale(1.5)';
            setTimeout(() => icon.style.transform = 'scale(1)', 200);
        }
        if (maChuTro && maChuTro !== parseInt(maNguoiDung)) {
            fetch('http://127.0.0.1:9090/api/gui-thong-bao-he-thong', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ maNguoiNhan: maChuTro, noiDung: `Người dùng ${taiKhoan} đã yêu thích phòng của bạn: ${tieuDe}` })
            });
        }
    }
    localStorage.setItem('yeuthich', JSON.stringify(dsYeuThich));
    if (document.getElementById('khung-yeu-thich')) taiTrangYeuThich();
}

function taiTrangYeuThich() {
    const container = document.getElementById('khung-yeu-thich');
    const textSoLuong = document.getElementById('text-so-luong-thich');
    if (!container) return;
    const dsId = JSON.parse(localStorage.getItem('yeuthich')) || [];
    if (textSoLuong) textSoLuong.innerHTML = dsId.length > 0 ? `Bạn đã yêu thích <b>${dsId.length}</b> phòng trọ.` : "Bạn chưa có phòng trọ yêu thích nào.";
    if (dsId.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5"><i class="fa-solid fa-heart-crack text-muted mb-3" style="font-size: 5rem; opacity: 0.2;"></i><h4 class="text-muted fw-bold">Danh sách đang trống</h4></div>`;
        return;
    }
    fetch('http://127.0.0.1:9090/api/danh-sach-phong-tro').then(res => res.json()).then(data => {
        const list = data.filter(p => dsId.includes(p.maPhong));
        container.innerHTML = list.map(p => taoCardHTML(p)).join('');
    });
}

function xoaTatCaYeuThich() {
    if ((JSON.parse(localStorage.getItem('yeuthich')) || []).length === 0) return;
    hienThiThongBao("Xác nhận", "Bạn muốn xóa sạch danh sách yêu thích chứ?", "xacnhan", function() {
        localStorage.removeItem('yeuthich');
        taiTrangYeuThich();
        hienThiThongBao("Thành công", "Đã dọn dẹp danh sách yêu thích!", "thanhcong");
    });
}

function taiChiTietPhong() {
    const urlParams = new URLSearchParams(window.location.search);
    const maPhong = urlParams.get('id');
    if (!maPhong || !document.getElementById('chi-tiet-tieu-de')) return;
    
    fetch(`http://127.0.0.1:9090/api/chi-tiet-phong/${maPhong}`).then(res => res.json()).then(phong => {
        if (!phong) return;
        document.getElementById('chi-tiet-tieu-de').innerText = phong.tieuDe;
        document.getElementById('chi-tiet-gia').innerText = (phong.giaTien || 0).toLocaleString() + " đ";
        document.getElementById('chi-tiet-dien-tich').innerText = phong.dienTich + "m²";
        document.getElementById('chi-tiet-dia-chi').innerText = phong.diaChi;
        document.getElementById('chi-tiet-truong').innerText = phong.ganTruong;
        document.getElementById('chi-tiet-sdt').innerText = phong.soDienThoai || "0366.xxx.xxx";
        document.getElementById('mo-ta-vi-tri').innerText = phong.viTriDacDia;
        document.getElementById('gia-dien').innerText = phong.giaDien || "Đang cập nhật";
        document.getElementById('gia-nuoc').innerText = phong.giaNuoc || "Đang cập nhật";
        document.getElementById('gia-dich-vu').innerText = phong.giaDichVu || "Đang cập nhật";

        const tienIchContainer = document.getElementById('danh-sach-tien-ich');
        if (tienIchContainer) {
            let htmlTienIch = '';
            if (phong.khongChungChu === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-user-slash text-success me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Không chung chủ</span></li>`;
            if (phong.veSinhKhepKin === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-toilet text-primary me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Vệ sinh khép kín</span></li>`;
            if (phong.coDieuHoa === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-snowflake text-info me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Điều hòa</span></li>`;
            if (phong.coBinhNongLanh === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-fire text-danger me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Bình nóng lạnh</span></li>`;
            if (phong.coChoNauAn === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-utensils text-warning me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Có chỗ nấu ăn</span></li>`;
            if (phong.deXeMienPhi === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-motorcycle text-secondary me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Để xe miễn phí</span></li>`;
            if (phong.khoaVanTay === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-lock text-dark me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Khóa vân tay</span></li>`;
            if (phong.coMayGiat === 1) htmlTienIch += `<li class="d-flex align-items-center mb-3"><i class="fa-solid fa-soap text-primary me-3" style="width: 25px; text-align: center; font-size: 1.2rem;"></i><span class="text-dark fw-medium">Máy giặt chung</span></li>`;
            
            tienIchContainer.innerHTML = htmlTienIch || '<li class="text-muted fst-italic small">Chưa cập nhật tiện ích</li>';
        }

        if (document.getElementById('chi-tiet-anh')) document.getElementById('chi-tiet-anh').src = "images/" + (phong.hinhAnh || 'phong1.jpg');
        
        const khungTuongTu = document.getElementById('khung-phong-tuong-tu');
        if (khungTuongTu) {
            fetch('http://127.0.0.1:9090/api/danh-sach-phong-tro').then(res => res.json()).then(data => {
                const truongHienTai = (phong.ganTruong || "").trim();
                const giaHienTai = phong.giaTien || 0;
                const dsTuongTu = data.filter(p => p.maPhong !== phong.maPhong && p.trangThai === 'DA_DUYET' && (p.ganTruong === truongHienTai) && (Math.abs(p.giaTien - giaHienTai) <= 1000000)).slice(0, 3);
                khungTuongTu.innerHTML = dsTuongTu.length > 0 ? dsTuongTu.map(p => taoCardHTML(p)).join('') : '<div class="col-12 text-center py-4 fst-italic text-muted">Không có phòng tương tự.</div>';
            });
        }
    });
}

function copySDT() {
    const sdt = document.getElementById('chi-tiet-sdt').innerText;
    navigator.clipboard.writeText(sdt).then(() => { hienThiThongBao("Thành công", "Đã sao chép: " + sdt, "thanhcong"); });
}

// ==========================================================
// 6. TOP NỔI BẬT & BÌNH LUẬN
// ==========================================================
function taiTopNoiBat() {
    const container = document.getElementById('khung-top-noi-bat');
    if (!container) return;
    fetch('http://127.0.0.1:9090/api/top-6-noi-bat').then(res => res.json()).then(data => {
        let listDaDuyet = data.filter(p => (p.trangThai || '').toUpperCase() === 'DA_DUYET');
        container.innerHTML = listDaDuyet.map(p => taoCardHTML(p, true)).join('');
    }).catch(() => {
        container.innerHTML = '<div class="col-12 text-center text-danger py-5 fw-bold">Không thể tải dữ liệu!</div>';
    });
}

function taiBinhLuan(maPhong) {
    const container = document.getElementById('danh-sach-binh-luan');
    if (!container) return;

    fetch(`http://127.0.0.1:9090/api/binh-luan-theo-phong/${maPhong}`)
        .then(res => res.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                container.innerHTML = '<p class="text-muted fst-italic py-3">Chưa có bình luận nào.</p>';
                return;
            }

            container.innerHTML = data.reverse().map(bl => {
                if (!bl || !bl.tenNguoiDung) return '';

                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(bl.tenNguoiDung)}&background=random&color=fff`;
                const thoiGian = bl.ngayTao ? new Date(bl.ngayTao).toLocaleString('vi-VN') : (bl.thoiGian || 'Vừa xong');

                return `
                <div class="d-flex gap-3 mb-4 border-bottom pb-3">
                    <img src="${avatarUrl}" class="rounded-circle shadow-sm" width="45" height="45">
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <span class="fw-bold text-dark">${bl.tenNguoiDung}</span>
                            <span class="text-muted" style="font-size: 0.75rem;">${thoiGian}</span>
                        </div>
                        <p class="mb-0 text-secondary small">${bl.noiDung}</p>
                        
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-danger border-0 p-0" onclick="likeBinhLuan(${bl.maBinhLuan})">
                                <i class="fa-regular fa-heart"></i> 
                                <span id="like-count-${bl.maBinhLuan}" class="ms-1">${bl.luotLike || 0}</span>
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('');
        })
        .catch(() => {
            container.innerHTML = '<p class="text-danger small">Lỗi tải bình luận!</p>';
        });
}
function khoiTaoSuKienBinhLuan() {
    const btnGuiBinhLuan = document.getElementById('btnGuiBinhLuan');
    const noiDungInput = document.getElementById('noiDungBinhLuan');
    const urlParams = new URLSearchParams(window.location.search);
    const maPhong = urlParams.get('id');

    if (btnGuiBinhLuan && noiDungInput && maPhong) {
        btnGuiBinhLuan.onclick = function() {
            const taiKhoan = localStorage.getItem('taiKhoan');
            const noiDung = noiDungInput.value.trim();

            if (!taiKhoan || taiKhoan === "null") {
                hienThiThongBao("Yêu cầu đăng nhập", "Bạn cần đăng nhập để tham gia bình luận nhé!", "canhbao", () => {
                    window.location.href = "dangnhap.html";
                });
                return;
            }

            if (!noiDung) {
                hienThiThongBao("Thông báo", "Vui lòng nhập nội dung bình luận!", "canhbao");
                return;
            }

            btnGuiBinhLuan.disabled = true;
            btnGuiBinhLuan.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Đang gửi...';

            fetch('http://127.0.0.1:9090/api/gui-binh-luan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    maPhong: Number(maPhong), 
                    tenNguoiDung: taiKhoan, 
                    noiDung: noiDung 
                })
            })
            .then(res => {
                if (res.ok) {
                    noiDungInput.value = ''; 
                    hienThiThongBao("Tuyệt vời!", "Thành công, cảm ơn bạn đã bình luận!", "thanhcong", () => {
                        taiBinhLuan(maPhong); 
                        taiThongBao(); 
                    });
                } else {
                    hienThiThongBao("Lỗi", "Hệ thống từ chối bình luận (Lỗi 400). Hãy kiểm tra lại file Java Entity!", "loi");
                }
            })
            .catch(err => {
                console.error("Lỗi:", err);
                hienThiThongBao("Lỗi kết nối", "Không thể gọi tới máy chủ Backend!", "loi");
            })
            .finally(() => {
                btnGuiBinhLuan.disabled = false;
                btnGuiBinhLuan.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Gửi bình luận';
            });
        };
    }
}
let danhSachFileAnh = []; // Biến toàn cục lưu danh sách ảnh đã chọn

function previewImages() {
    const input = document.getElementById('dt-roomImages');
    const container = document.getElementById('image-preview-container');
    container.innerHTML = ''; // Xóa sạch preview cũ mỗi lần chọn lại

    const files = input.files;
    if (files.length === 0) return;

    // Ép cắt đúng 5 file đầu tiên nếu người dùng chọn quá nhiều
    const filesToPreview = Array.from(files).slice(0, 5); 

    if (files.length > 5) {
        // Hàm thông báo xịn của cậu
        hienThiThongBao("Lưu ý", "Bạn chỉ được phép tải lên tối đa 5 ảnh. Hệ thống đã tự động lấy 5 ảnh đầu tiên làm preview.", "canhbao");
    }

    // Vẽ giao diện preview realtime
    filesToPreview.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Tạo khung chứa ảnh
            const wrapper = document.createElement('div');
            wrapper.className = 'position-relative';
            wrapper.style.cssText = 'width: 120px; height: 120px; transition: transform 0.2s;';
            wrapper.setAttribute('onmouseover', 'this.style.transform="scale(1.05)"');
            wrapper.setAttribute('onmouseout', 'this.style.transform="scale(1)"');

            // Tạo thẻ img
            const img = document.createElement('img');
            img.src = e.target.result;
            // Ảnh đầu tiên (index 0) tô viền xanh đậm, ảnh sau viền xám
            const borderClass = index === 0 ? 'border-primary border-4' : 'border-secondary';
            img.className = `w-100 h-100 object-fit-cover rounded-3 border ${borderClass} shadow-sm`;

            wrapper.appendChild(img);

            // Đóng mác "Ảnh đại diện" màu đỏ cho ảnh đầu tiên
            if (index === 0) {
                const badge = document.createElement('span');
                badge.className = 'badge bg-danger position-absolute top-0 start-0 m-1 shadow-sm';
                badge.innerHTML = '<i class="fa-solid fa-star me-1"></i>Ảnh đại diện';
                wrapper.appendChild(badge);
            }

            container.appendChild(wrapper);
        }
        reader.readAsDataURL(file);
    });
}
// ==========================================================
// 7. LOGIC THỐNG KÊ ADMIN & BIỂU ĐỒ
// ==========================================================
let myChart1, myChart2;

async function taiDuLieuThongKeAdmin() {
    if (!document.getElementById('chartNguoiDung')) return;
    
    try {
        const [resStat, resTop] = await Promise.all([
            fetch('http://127.0.0.1:9090/api/thong-ke'),
            fetch('http://127.0.0.1:9090/api/top-6-noi-bat')
        ]);
        const data = await resStat.json();
        const topPhong = await resTop.json();
        
        if(document.getElementById('stat-user')) document.getElementById('stat-user').innerText = data.tongUser || 0;
        if(document.getElementById('stat-phong')) document.getElementById('stat-phong').innerText = data.tongPhong || 0;
        if(document.getElementById('stat-view')) document.getElementById('stat-view').innerText = (data.tongView || 0).toLocaleString();
        if(document.getElementById('totalUserCenter')) document.getElementById('totalUserCenter').innerText = data.tongUser || 0;

        const ctx1 = document.getElementById('chartNguoiDung').getContext('2d');
        if(myChart1) myChart1.destroy();
        myChart1 = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['Chủ trọ', 'Sinh viên'],
                datasets: [{
                    data: [data.chuTro || 0, data.sinhVien || 0],
                    backgroundColor: ['#87CEFA', '#00BFFF'],
                    borderWidth: 5,
                    borderColor: '#ffffff'
                }]
            },
            options: { cutout: '80%', plugins: { legend: { position: 'bottom' } }, maintainAspectRatio: false }
        });

        const ctx2 = document.getElementById('chartTopPhong').getContext('2d');
        if(myChart2) myChart2.destroy();
// Tìm đến đoạn này trong main.js
        myChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: topPhong.map(p => `#PT${p.maPhong}`),
                datasets: [{
                    label: 'Lượt xem',
                    data: topPhong.map(p => p.luotXem || 0),
                    backgroundColor: '#87CEFA',
                    borderRadius: 8
                }]
            },
            // Tìm đến dòng khoảng 370 trong main.js của cậu
options: {
    scales: { 
        y: { 
            beginAtZero: true,
            ticks: {
                // Bước nhảy là 1 đơn vị
                stepSize: 1,
                // Hàm này ép trục Y chỉ in ra những giá trị là số nguyên
                callback: function(value) {
                    if (value % 1 === 0) {
                        return value;
                    }
                }
            }
        } 
    },
    plugins: { legend: { display: false } },
    maintainAspectRatio: false
}
        });    } catch (err) { console.error("Lỗi load dữ liệu thống kê:", err); }
}

// ==========================================================
// 8. KHỞI TẠO KHI TẢI TRANG
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    capNhatMenu();
    taiTopNoiBat();
    taiChiTietPhong();
    taiThongBao();

    const urlParams = new URLSearchParams(window.location.search);
    const maPhong = urlParams.get('id');
    if(maPhong) { taiBinhLuan(maPhong); khoiTaoSuKienBinhLuan(); }
    
    if (document.getElementById('bang-tin-dang')) taiDanhSachTinDang();
    if (document.getElementById('chartNguoiDung')) taiDuLieuThongKeAdmin();
    if (document.getElementById('khung-danh-sach')) taiTrangDanhSach(0);
    if (document.getElementById('khung-yeu-thich')) taiTrangYeuThich();

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }
    // Thêm vào cuối file main.js
const formSupport = document.getElementById('supportForm');
if (formSupport) {
    formSupport.addEventListener('submit', function(e) {
        e.preventDefault(); // CHỐT CHẶN: Ngăn load lại trang gây lỗi dấu ?

        const data = {
            hoTen: document.getElementById('ht-hoTen').value,
            lienHe: document.getElementById('ht-lienHe').value,
            noiDung: document.getElementById('ht-noiDung').value,
            ngayGui: new Date() // Tự thêm ngày gửi cho chuyên nghiệp
        };

        // Nhớ check đúng Port Backend của cậu (9090 hay 9091 nhé)
        fetch('http://127.0.0.1:9090/api/gui-ho-tro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.text())
        .then(ketQua => {
            // Hiện Modal thành công đã có sẵn trong HTML của cậu
            const myModal = new bootstrap.Modal(document.getElementById('modalHoTro'));
            myModal.show();
            formSupport.reset(); // Xóa trắng form
        })
        .catch(err => {
            console.error("Lỗi rồi Đức ơi:", err);
            hienThiThongBao("Lỗi", "Backend chưa chạy hoặc sai đường dẫn API!", "loi");
        });
    });
}

    const btnBackToTop = document.createElement('button');
    btnBackToTop.innerHTML = '<i class="fa-solid fa-chevron-up"></i>';
    btnBackToTop.className = 'back-to-top';
    document.body.appendChild(btnBackToTop);
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) btnBackToTop.classList.add('show');
        else btnBackToTop.classList.remove('show');
    });
    btnBackToTop.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

    const btnTim = document.getElementById('btn-tim-kiem');
    if (btnTim) {
        btnTim.addEventListener('click', () => {
            const truong = document.getElementById('filter-truong').value;
            const khuVuc = document.getElementById('filter-khu-vuc').value;
            const gia = document.getElementById('filter-gia').value;
            window.location.href = `danhsach.html?truong=${encodeURIComponent(truong)}&khuvuc=${encodeURIComponent(khuVuc)}&gia=${encodeURIComponent(gia)}`;
        });
    }
    setInterval(taiThongBao, 30000);
});