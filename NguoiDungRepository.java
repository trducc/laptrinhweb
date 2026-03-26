package com.trohd.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    
    NguoiDung findByTenDangNhap(String tenDangNhap);
    
    NguoiDung findByTenDangNhapAndMatKhau(String tenDangNhap, String matKhau);
    
    boolean existsByTenDangNhap(String tenDangNhap);

    List<NguoiDung> findByQuyenHan(String quyenHan);

    List<NguoiDung> findByTrangThai(String trangThai);

    List<NguoiDung> findByQuyenHanAndTrangThai(String quyenHan, String trangThai);
}