package com.trohd.backend;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "ho_tro")
public class HoTro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ma_ho_tro")
    private Integer maHoTro;
    
    @Column(name = "ho_ten")
    private String hoTen;
    
    @Column(name = "lien_he")
    private String lienHe;
    
    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;
    
    @Column(name = "thoi_gian")
    private String thoiGian;
    
    @Column(name = "trang_thai")
    private Integer trangThai; 

    // CHỐT CHẶN QUAN TRỌNG: Tự động tạo giờ và trạng thái mặc định khi user gửi form
    @PrePersist 
    protected void onCreate() {
        if (this.thoiGian == null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");
            this.thoiGian = LocalDateTime.now().format(formatter);
        }
        if (this.trangThai == null) {
            this.trangThai = 0; // 0: Chờ xử lý
        }
    }

    // --- GETTER & SETTER ---
    public Integer getMaHoTro() { return maHoTro; }
    public void setMaHoTro(Integer maHoTro) { this.maHoTro = maHoTro; }
    
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    
    public String getLienHe() { return lienHe; }
    public void setLienHe(String lienHe) { this.lienHe = lienHe; }
    
    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }
    
    public String getThoiGian() { return thoiGian; }
    public void setThoiGian(String thoiGian) { this.thoiGian = thoiGian; }
    
    public Integer getTrangThai() { return trangThai; }
    public void setTrangThai(Integer trangThai) { this.trangThai = trangThai; }
}