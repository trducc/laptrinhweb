package com.trohd.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "binh_luan")
public class BinhLuan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_binh_luan")
    private Integer maBinhLuan;

    @Column(name = "ma_phong")
    private Integer maPhong;

    @Column(name = "ten_nguoi_dung")
    private String tenNguoiDung;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @Column(name = "luot_like")
    private Integer luotLike = 0; // Mặc định là 0 khi mới tạo

    // --- GETTERS VÀ SETTERS ---

    public Integer getMaBinhLuan() { return maBinhLuan; }
    public void setMaBinhLuan(Integer maBinhLuan) { this.maBinhLuan = maBinhLuan; }

    public Integer getMaPhong() { return maPhong; }
    public void setMaPhong(Integer maPhong) { this.maPhong = maPhong; }

    public String getTenNguoiDung() { return tenNguoiDung; }
    public void setTenNguoiDung(String tenNguoiDung) { this.tenNguoiDung = tenNguoiDung; }

    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }

    public LocalDateTime getNgayTao() { return ngayTao; }
    public void setNgayTao(LocalDateTime ngayTao) { this.ngayTao = ngayTao; }

    public Integer getLuotLike() { return luotLike; }
    public void setLuotLike(Integer luotLike) { this.luotLike = luotLike; }
}