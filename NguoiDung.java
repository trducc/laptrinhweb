package com.trohd.backend;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "nguoi_dung")
public class NguoiDung {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_nguoi_dung") 
    private Integer maNguoiDung;
    
    @Column(name = "ten_dang_nhap", nullable = false, unique = true)
    private String tenDangNhap;
    
    @Column(name = "mat_khau", nullable = false)
    private String matKhau;
    
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
    
    @Column(name = "so_dien_thoai")
    private String soDienThoai;
    
    @Column(name = "quyen_han")
    private String quyenHan;

    @Column(name = "trang_thai")
    private String trangThai = "HOAT_DONG"; // Tớ chuẩn hóa luôn viết hoa không dấu cho đồng bộ

    // Tớ đã XÓA cái (insertable = false) đi để Backend có quyền lưu ngày vào DB
    @Column(name = "ngay_tao")
    private Timestamp ngayTao;

    // Phép thuật của JPA: Tự động lấy giờ hiện tại GÁN vào ngayTao TRƯỚC KHI lưu xuống Database
    @PrePersist
    protected void onCreate() {
        if (this.ngayTao == null) {
            this.ngayTao = new Timestamp(System.currentTimeMillis());
        }
    }

    // --- GETTERS VÀ SETTERS ---

    public Integer getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(Integer maNguoiDung) { this.maNguoiDung = maNguoiDung; }

    public String getTenDangNhap() { return tenDangNhap; }
    public void setTenDangNhap(String tenDangNhap) { this.tenDangNhap = tenDangNhap; }

    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }

    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }

    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }

    public String getQuyenHan() { return quyenHan; }
    public void setQuyenHan(String quyenHan) { this.quyenHan = quyenHan; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Timestamp getNgayTao() { return ngayTao; }
    public void setNgayTao(Timestamp ngayTao) { this.ngayTao = ngayTao; }
}