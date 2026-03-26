package com.trohd.backend;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "thong_bao")
public class ThongBao {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_thong_bao")
    private Integer maThongBao;

    @Column(name = "ma_nguoi_nhan")
    private Integer maNguoiNhan;

    @Column(name = "noi_dung")
    private String noiDung;

    @Column(name = "trang_thai_xem")
    private Integer trangThaiXem = 0;

    @Column(name = "ngay_tao", insertable = false, updatable = false)
    private Timestamp ngayTao;

    public Integer getMaThongBao() { return maThongBao; }
    public void setMaThongBao(Integer maThongBao) { this.maThongBao = maThongBao; }
    public Integer getMaNguoiNhan() { return maNguoiNhan; }
    public void setMaNguoiNhan(Integer maNguoiNhan) { this.maNguoiNhan = maNguoiNhan; }
    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }
    public Integer getTrangThaiXem() { return trangThaiXem; }
    public void setTrangThaiXem(Integer trangThaiXem) { this.trangThaiXem = trangThaiXem; }
    public Timestamp getNgayTao() { return ngayTao; }
}