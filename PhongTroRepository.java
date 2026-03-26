package com.trohd.backend;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PhongTroRepository extends JpaRepository<PhongTro, Integer> {

    // 1. TĂNG LƯỢT XEM: Dùng COALESCE để tránh lỗi nếu luot_xem đang bị NULL
    @Modifying
    @Transactional
    @Query("UPDATE PhongTro p SET p.luotXem = COALESCE(p.luotXem, 0) + 1 WHERE p.maPhong = :id")
    void tangLuotXem(@Param("id") Integer id);

    // 2. TÌM KIẾM NÂNG CAO: Khớp với các mã trường PTIT, HAU... mà mình đã chuẩn hóa
    @Query("SELECT p FROM PhongTro p WHERE p.trangThai = 'DA_DUYET' " +
           "AND (:truong IS NULL OR p.ganTruong LIKE %:truong%) " +
           "AND (:khuVuc IS NULL OR p.diaChi LIKE %:khuVuc%) " +
           "AND (:giaMin IS NULL OR p.giaTien >= :giaMin) " +
           "AND (:giaMax IS NULL OR p.giaTien <= :giaMax) " +
           "ORDER BY p.maPhong DESC")
    List<PhongTro> timKiemPhongTro(
            @Param("truong") String truong,
            @Param("khuVuc") String khuVuc,
            @Param("giaMin") Integer giaMin,
            @Param("giaMax") Integer giaMax);

    // 3. LẤY THEO TRẠNG THÁI (Dùng cho Admin lọc bài CHO_DUYET/DA_DUYET)
    // Hàm này đã sửa tên để khớp 100% với Controller, không còn lỗi 500 nữa!
    List<PhongTro> findByTrangThaiOrderByMaPhongDesc(String trangThai);

    // 4. LẤY PHÒNG THEO CHỦ TRỌ (Sắp xếp phòng mới nhất lên đầu)
    List<PhongTro> findByMaNguoiDungOrderByMaPhongDesc(Integer maNguoiDung);

    // 5. PHÂN TRANG CHO TRANG CHỦ
    Page<PhongTro> findByTrangThai(String trangThai, Pageable pageable);
}