DROP DATABASE IF EXISTS laptrinhweb;
CREATE DATABASE laptrinhweb;
USE laptrinhweb;

-- 1. Bảng người dùng (Đã gộp cột trang_thai)
CREATE TABLE nguoi_dung (
    ma_nguoi_dung INT AUTO_INCREMENT PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(100) NOT NULL,
    so_dien_thoai VARCHAR(15),
    quyen_han ENUM('QUAN_TRI', 'CHU_TRO', 'SINH_VIEN') DEFAULT 'SINH_VIEN',
    trang_thai VARCHAR(20) DEFAULT 'Hoạt động',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng phòng trọ (Đã gộp cột luot_xem)
CREATE TABLE phong_tro (
    ma_phong INT AUTO_INCREMENT PRIMARY KEY,
    tieu_de VARCHAR(255) NOT NULL,
    gia_tien INT NOT NULL,
    dien_tich INT NOT NULL,
    dia_chi VARCHAR(255) NOT NULL,
    gan_truong VARCHAR(255),
    so_dien_thoai VARCHAR(15),
    gia_dien VARCHAR(50),
    gia_nuoc VARCHAR(50),
    gia_dich_vu VARCHAR(50),
    hinh_anh VARCHAR(255),
    vi_tri_dac_dia TEXT,
    khong_chung_chu TINYINT DEFAULT 0,
    ve_sinh_khep_kin TINYINT DEFAULT 0,
    co_dieu_hoa TINYINT DEFAULT 0,
    co_binh_nong_lanh TINYINT DEFAULT 0,
    co_cho_nau_an TINYINT DEFAULT 0,
    de_xe_mien_phi TINYINT DEFAULT 0,
    khoa_van_tay TINYINT DEFAULT 0,
    co_may_giat TINYINT DEFAULT 0,
    trang_thai ENUM('CHO_DUYET', 'DA_DUYET') DEFAULT 'CHO_DUYET',
    luot_xem INT DEFAULT 0,
    ma_nguoi_dung INT,
    ngay_dang TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_dung) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
);

-- 3. Bảng thông báo (Cấu hình chuẩn)
CREATE TABLE thong_bao (
    ma_thong_bao INT AUTO_INCREMENT PRIMARY KEY,
    ma_nguoi_nhan INT,
    noi_dung TEXT NOT NULL,
    trang_thai_xem TINYINT DEFAULT 0,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_nguoi_nhan) REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE
);

-- 4. Chèn dữ liệu Người dùng
-- Lưu ý: Nếu code Java dùng BCrypt, các tài khoản insert tay này có thể không đăng nhập được
INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau, ho_ten, so_dien_thoai, quyen_han) VALUES  
('admin', '123456', 'Trần Văn Đức', '0366604516', 'QUAN_TRI'),
('khach_duy', '123456', 'Đỗ Quang Duy', '0988123456', 'SINH_VIEN'),
('chutro_duc', '123456', 'Nguyễn Minh Đức', '0912345678', 'CHU_TRO'),
('chutro_diep', '123456', 'Hoàng Thị Ngọc Diệp', '0905111222', 'CHU_TRO'),
('chutro_linh', '123456', 'Đào Ngọc Linh', '0977333444', 'CHU_TRO'),
('khach_hue', '123456', 'Lưu Kim Huệ', '0344555666', 'SINH_VIEN'),
('khach_thanh', '123456', 'Hoàng Thị Hồng Thanh', '0355666777', 'SINH_VIEN'),
('khach_nam', '123456', 'Phạm Nhật Nam', '0388999000', 'SINH_VIEN'),
('khach_ha', '123456', 'Trương Thị Thu Hà', '0399888777', 'SINH_VIEN'),
('khach_quynh', '123456', 'Vũ Như Quỳnh', '0322111000', 'SINH_VIEN'),
('khach_mai', '123456', 'Trần Tuyết Mai', '0341112222', 'SINH_VIEN'),
('khach_hoang', '123456', 'Nguyễn Minh Hoàng', '0919998888', 'SINH_VIEN'),
('chutro_binh', '123456', 'Lương Thanh Bình', '0933555222', 'CHU_TRO'),
('khach_linh', '123456', 'Phan Khánh Linh', '0377444555', 'SINH_VIEN'),
('chutro_yen', '123456', 'Ngô Hải Yến', '0966777111', 'CHU_TRO'),
('khach_tung', '123456', 'Lê Sơn Tùng', '0388666777', 'SINH_VIEN'),
('chutro_cuong', '123456', 'Trần Quốc Cường', '0355000999', 'CHU_TRO'),
('khach_ngan', '123456', 'Bùi Thu Ngân', '0766111333', 'SINH_VIEN'),
('chutro_van', '123456', 'Đỗ Thúy Vân', '0900444666', 'CHU_TRO'),
('khach_quang', '123456', 'Đặng Hồng Quang', '0944222000', 'SINH_VIEN');

-- 5. Chèn dữ liệu Phòng trọ (20 phòng)
INSERT INTO phong_tro (tieu_de, gia_tien, dien_tich, dia_chi, gan_truong, so_dien_thoai, gia_dien, gia_nuoc, gia_dich_vu, vi_tri_dac_dia, hinh_anh, khong_chung_chu, ve_sinh_khep_kin, co_dieu_hoa, co_binh_nong_lanh, co_cho_nau_an, de_xe_mien_phi, khoa_van_tay, co_may_giat, trang_thai, ma_nguoi_dung)  
VALUES  
('Phòng trọ khép kín gần PTIT', 3500000, 25, 'Ngõ 5 Ao Sen, Mộ Lao', 'Học viện Công nghệ Bưu chính Viễn thông', '0366604516', '3.8k/số', '30k/khối', '50k/người', 'Cách PTIT 200m, gần chợ', 'phong1.jpg', 1, 1, 1, 1, 1, 1, 1, 1, 'DA_DUYET', 1),
('Trọ mới xây siêu thoáng', 2800000, 22, 'Đường Chiến Thắng, Văn Quán', 'Học viện An ninh nhân dân', '0912345678', '4k/số', '25k/khối', '100k/phòng', 'Gần chợ, an ninh tốt', 'phong2.jpg', 0, 1, 1, 1, 0, 1, 0, 0, 'DA_DUYET', 3),
('Chung cư mini gần chợ Phùng Khoang', 3700000, 35, 'Ngõ 159 Phùng Khoang, Mộ Lao', 'Học viện Y dược học cổ truyền Việt Nam', '0912345678', '4k/số', '100k/người', '100k/phòng', 'Gần siêu thị, đi lại thuận tiện', 'phong3.jpg', 0, 1, 0, 1, 1, 1, 1, 0, 'DA_DUYET', 4),
('Phòng trọ gần Phenikaa', 3000000, 28, 'Ngõ 10 Nguyễn Trác, Yên Nghĩa', 'Trường Đại học Phenikaa', '0912345678', '3.5k/số', '80k/người', '80k/phòng', 'Gần ngay Phenikaa, phòng mới', 'phong4.jpg', 1, 1, 0, 1, 1, 0, 1, 1, 'DA_DUYET', 5),
('Phòng trọ ban công thoáng Lê Lợi', 2100000, 18, 'Ngõ 4 Lê Lợi, Quang Trung', 'Trường Đại học Sư phạm Nghệ thuật Trung ương', '0977333444', '3.4k/số', '30k/khối', '80k/người', 'Ban công rộng, nhiều cây', 'phong5.jpg', 1, 1, 1, 1, 0, 1, 0, 0, 'DA_DUYET', 3),
('Trọ giá rẻ sinh viên Trần Phú', 1800000, 17, 'Ngõ 10 Trần Phú, Mộ Lao', 'Học viện Công nghệ Bưu chính Viễn thông', '0344555666', '3.5k/số', '25k/khối', '50k/phòng', 'Gần Hồ Gươm Plaza, đi bộ ra bus', 'phong6.jpg', 0, 0, 0, 1, 0, 1, 0, 1, 'DA_DUYET', 4),
('Trọ khóa vân tay Phùng Hưng', 2600000, 23, '291 Phùng Hưng, Mộ Lao', 'Học viện Quân Y', '0355666777', '3.8k/số', '28k/khối', '100k/người', 'An ninh tuyệt đối, camera 24/7', 'phong7.jpg', 1, 1, 1, 1, 1, 1, 1, 0, 'DA_DUYET', 5),
('Chung cư mini cao cấp Lê Trọng Tấn', 4100000, 40, '12 Lê Trọng Tấn, La Khê', 'Đại học Đại Nam', '0388999000', '4k/số', '100k/người', '150k/phòng', 'Phòng rộng như căn hộ, full đồ gỗ', 'phong8.jpg', 1, 1, 1, 1, 1, 1, 0, 1, 'DA_DUYET', 3),
('Phòng trọ dân trí cao Văn Khê', 2900000, 29, 'Ngõ 2 Văn Khê, Phú La', 'Trường Đại học Kiểm sát Hà Nội', '0399888777', '3.5k/số', '80k/người', '50k/phòng', 'Gần ga tàu, Free WiFi tốc độ cao', 'phong9.jpg', 1, 1, 1, 1, 1, 1, 0, 0, 'DA_DUYET', 4),
('Phòng trọ ngắm view hồ Văn Quán', 4500000, 35, 'Số 12 Đường 19/5, Văn Quán', 'Học viện An ninh nhân dân', '0988123456', '4k/số', '100k/người', '150k/phòng', 'View hồ cực thoáng, full đồ gỗ cao cấp', 'phong10.jpg', 1, 1, 1, 1, 1, 1, 1, 1, 'DA_DUYET', 12),
('Chung cư mini khép kín gần ĐH Kiến Trúc', 3200000, 25, 'Ngõ 19 Trần Phú, Mộ Lao', 'Đại học Kiến trúc Hà Nội', '0977222333', '3.8k/số', '30k/khối', '80k/người', 'Cách cổng trường Kiến Trúc 100m, đi bộ 2 phút', 'phong11.jpg', 1, 1, 1, 1, 0, 1, 0, 0, 'DA_DUYET', 8),
('Phòng trọ giá rẻ cho sinh viên Phenikaa', 2200000, 20, 'Ngõ 56 Yên Lộ, Yên Nghĩa', 'Trường Đại học Phenikaa', '0366999888', '3.5k/số', '25k/khối', '50k/người', 'Yên tĩnh, phù hợp học tập, gần trường', 'phong12.jpg', 0, 1, 0, 1, 1, 1, 0, 1, 'DA_DUYET', 5),
('Studio full đồ gần Học viện Quân Y', 3800000, 30, 'Ngõ 160 Phùng Hưng, Phúc La', 'Học viện Quân Y', '0344555111', '4k/số', '100k/người', '100k/phòng', 'Phòng mới toanh, khóa vân tay an toàn', 'phong13.jpg', 1, 1, 1, 1, 1, 1, 1, 1, 'DA_DUYET', 15),
('Phòng trọ diện tích lớn gần ĐH Đại Nam', 2500000, 28, 'Số 12 Xốm, Phú Lãm', 'Đại học Đại Nam', '0911222333', '3.5k/số', '28k/khối', '50k/phòng', 'Gần chợ Xốm, bến xe bus ngay cửa', 'phong14.jpg', 0, 1, 1, 1, 1, 1, 0, 0, 'DA_DUYET', 7),
('Phòng trọ khép kín ngõ Ao Sen', 3300000, 24, 'Ngõ 2 Ao Sen, Mộ Lao', 'Học viện Công nghệ Bưu chính Viễn thông', '0399000888', '3.8k/số', '30k/khối', '100k/người', 'Thánh địa ăn vặt, gần PTIT và Kiến Trúc', 'phong15.jpg', 1, 1, 1, 1, 0, 1, 1, 1, 'DA_DUYET', 20),
('Phòng trọ mini giá sinh viên Quang Trung', 2000000, 18, 'Ngõ 17 Nguyễn Viết Xuân, Quang Trung', 'Trường Cao đẳng Y tế Hà Đông', '0966444555', '3.4k/số', '25k/khối', '50k/người', 'Gần bệnh viện Đa khoa Hà Đông, tiện đi lại', 'phong16.jpg', 0, 1, 0, 1, 0, 1, 0, 0, 'DA_DUYET', 4),
('Căn hộ dịch vụ cao cấp Dương Nội', 5000000, 45, 'KĐT Dương Nội, Dương Nội', 'Trường Đại học Kiểm sát Hà Nội', '0322111444', '4k/số', '120k/người', '200k/phòng', 'Sang trọng, có thang máy, hầm để xe rộng', 'phong17.jpg', 1, 1, 1, 1, 1, 1, 1, 1, 'DA_DUYET', 10),
('Phòng trọ thoáng mát Ba La', 2400000, 22, 'Ngõ 4 Ba La, Phú Lãm', 'Đại học Đại Nam', '0988777666', '3.5k/số', '25k/khối', '80k/người', 'Gần ga tàu điện trên cao, cực tiện đi vào phố', 'phong18.jpg', 1, 1, 0, 1, 1, 1, 0, 0, 'DA_DUYET', 6),
('Chung cư mini cao cấp Vạn Phúc', 4200000, 38, 'Số 5 Phố Lụa, Vạn Phúc', 'Trường Đại học CMC', '0912000555', '4k/số', '30k/khối', '150k/phòng', 'Khu dân trí cao, gần làng lụa, cực thoáng mát', 'phong19.jpg', 1, 1, 1, 1, 1, 1, 1, 1, 'DA_DUYET', 11),
('Phòng trọ khép kín Phùng Khoang', 2700000, 22, 'Ngõ 1 Tô Hiệu, Hà Cầu', 'Trường Đại học Mở Hà Nội', '0388222999', '3.8k/số', '28k/khối', '100k/người', 'Thiên đường mua sắm sinh viên, cực tiện xe bus', 'phong20.jpg', 1, 1, 0, 1, 1, 1, 1, 0, 'DA_DUYET', 9);

-- Kiểm tra kết quả
SELECT * FROM nguoi_dung;
SELECT * FROM phong_tro;
SELECT * FROM thong_bao;
CREATE TABLE binh_luan (
    ma_binh_luan INT AUTO_INCREMENT PRIMARY KEY,
    ma_phong INT NOT NULL,
    ten_nguoi_dung VARCHAR(100) NOT NULL,
    noi_dung TEXT NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ma_phong) REFERENCES phong_tro(ma_phong) ON DELETE CASCADE
);
DROP TABLE IF EXISTS binh_luan;
ALTER TABLE ho_tro MODIFY COLUMN trang_thai INT DEFAULT 0;
ALTER TABLE phong_tro ADD COLUMN is_vip TINYINT DEFAULT 0;
SELECT 
    n.ma_nguoi_dung, 
    n.ho_ten, 
    n.so_dien_thoai, 
    COUNT(p.ma_phong) AS so_luong_phong_vip
FROM nguoi_dung n
JOIN phong_tro p ON n.ma_nguoi_dung = p.ma_nguoi_dung
WHERE p.is_vip = 1 
  AND p.trang_thai = 'DA_DUYET'
  AND n.quyen_han = 'CHU_TRO'
GROUP BY n.ma_nguoi_dung, n.ho_ten, n.so_dien_thoai
ORDER BY so_luong_phong_vip DESC
LIMIT 3;