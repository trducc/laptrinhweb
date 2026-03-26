package com.trohd.backend;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "phong_tro")
public class PhongTro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_phong")
    private Integer maPhong;

    @Column(name = "tieu_de")
    private String tieuDe;

    @Column(name = "gia_tien")
    private Integer giaTien;

    @Column(name = "dien_tich")
    private Integer dienTich;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "gan_truong")
    private String ganTruong; 

    @Column(name = "so_dien_thoai")
    private String soDienThoai;

    @Column(name = "gia_dien")
    private String giaDien;

    @Column(name = "gia_nuoc")
    private String giaNuoc;

    @Column(name = "gia_dich_vu")
    private String giaDichVu;

    @Column(name = "hinh_anh")
    private String hinhAnh;

    @Column(name = "vi_tri_dac_dia")
    private String viTriDacDia;

    @Column(name = "khong_chung_chu")
    private Integer khongChungChu;

    @Column(name = "ve_sinh_khep_kin")
    private Integer veSinhKhepKin;

    @Column(name = "co_dieu_hoa")
    private Integer coDieuHoa;

    @Column(name = "co_binh_nong_lanh")
    private Integer coBinhNongLanh;

    @Column(name = "co_cho_nau_an")
    private Integer coChoNauAn;

    @Column(name = "de_xe_mien_phi")
    private Integer deXeMienPhi;

    @Column(name = "khoa_van_tay")
    private Integer khoaVanTay;

    @Column(name = "co_may_giat")
    private Integer coMayGiat;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "ma_nguoi_dung")
    private Integer maNguoiDung;

    @Column(name = "ngay_dang", insertable = false, updatable = false)
    private Timestamp ngayDang;

    @Column(name = "luot_xem")
    private Integer luotXem = 0;
    @Column(name = "is_vip")
    private Integer isVip;

    public Integer getIsVip() { return isVip; }
    public void setIsVip(Integer isVip) { this.isVip = isVip; }

    @ManyToOne
    @JoinColumn(name = "ma_nguoi_dung", referencedColumnName = "ma_nguoi_dung", insertable = false, updatable = false)
    private NguoiDung chuTro;

    // --- GETTER VÀ SETTER ---
    public Integer getMaPhong() { return maPhong; }
    public void setMaPhong(Integer maPhong) { this.maPhong = maPhong; }
    public String getTieuDe() { return tieuDe; }
    public void setTieuDe(String tieuDe) { this.tieuDe = tieuDe; }
    public Integer getGiaTien() { return giaTien; }
    public void setGiaTien(Integer giaTien) { this.giaTien = giaTien; }
    public Integer getDienTich() { return dienTich; }
    public void setDienTich(Integer dienTich) { this.dienTich = dienTich; }
    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
    public String getGanTruong() { return ganTruong; }
    public void setGanTruong(String ganTruong) { this.ganTruong = ganTruong; }
    public String getSoDienThoai() { return soDienThoai; }
    public void setSoDienThoai(String soDienThoai) { this.soDienThoai = soDienThoai; }
    public String getGiaDien() { return giaDien; }
    public void setGiaDien(String giaDien) { this.giaDien = giaDien; }
    public String getGiaNuoc() { return giaNuoc; }
    public void setGiaNuoc(String giaNuoc) { this.giaNuoc = giaNuoc; }
    public String getGiaDichVu() { return giaDichVu; }
    public void setGiaDichVu(String giaDichVu) { this.giaDichVu = giaDichVu; }
    public String getHinhAnh() { return hinhAnh; }
    public void setHinhAnh(String hinhAnh) { this.hinhAnh = hinhAnh; }
    public String getViTriDacDia() { return viTriDacDia; }
    public void setViTriDacDia(String viTriDacDia) { this.viTriDacDia = viTriDacDia; }
    public Integer getKhongChungChu() { return khongChungChu; }
    public void setKhongChungChu(Integer khongChungChu) { this.khongChungChu = khongChungChu; }
    public Integer getVeSinhKhepKin() { return veSinhKhepKin; }
    public void setVeSinhKhepKin(Integer veSinhKhepKin) { this.veSinhKhepKin = veSinhKhepKin; }
    public Integer getCoDieuHoa() { return coDieuHoa; }
    public void setCoDieuHoa(Integer coDieuHoa) { this.coDieuHoa = coDieuHoa; }
    public Integer getCoBinhNongLanh() { return coBinhNongLanh; }
    public void setCoBinhNongLanh(Integer coBinhNongLanh) { this.coBinhNongLanh = coBinhNongLanh; }
    public Integer getCoChoNauAn() { return coChoNauAn; }
    public void setCoChoNauAn(Integer coChoNauAn) { this.coChoNauAn = coChoNauAn; }
    public Integer getDeXeMienPhi() { return deXeMienPhi; }
    public void setDeXeMienPhi(Integer deXeMienPhi) { this.deXeMienPhi = deXeMienPhi; }
    public Integer getKhoaVanTay() { return khoaVanTay; }
    public void setKhoaVanTay(Integer khoaVanTay) { this.khoaVanTay = khoaVanTay; }
    public Integer getCoMayGiat() { return coMayGiat; }
    public void setCoMayGiat(Integer coMayGiat) { this.coMayGiat = coMayGiat; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
    public Integer getMaNguoiDung() { return maNguoiDung; }
    public void setMaNguoiDung(Integer maNguoiDung) { this.maNguoiDung = maNguoiDung; }
    public Timestamp getNgayDang() { return ngayDang; }
    public void setNgayDang(Timestamp ngayDang) { this.ngayDang = ngayDang; }
    public Integer getLuotXem() { return luotXem; }
    public void setLuotXem(Integer luotXem) { this.luotXem = luotXem; }
    public NguoiDung getChuTro() { return chuTro; }
    public void setChuTro(NguoiDung chuTro) { this.chuTro = chuTro; }
}
