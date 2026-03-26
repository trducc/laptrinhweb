package com.trohd.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class PhongTroController {

    @Autowired
    private PhongTroRepository phongTroRepo;

    @Autowired
    private ThongBaoRepository thongBaoRepo;

    @Autowired
    private NguoiDungRepository nguoiDungRepo;

    @Autowired
    private HoTroRepository hoTroRepo;

    // 1. LẤY DANH SÁCH PHÒNG PHÂN TRANG (Trang chủ)
    @GetMapping("/danh-sach-phong-phan-trang")
    public ResponseEntity<Page<PhongTro>> layPhongPhanTrang(
            @RequestParam(defaultValue = "0") int page, 
            @RequestParam(defaultValue = "9") int size) {
        Page<PhongTro> ketQua = phongTroRepo.findByTrangThai("DA_DUYET", 
                PageRequest.of(page, size, Sort.by("maPhong").descending()));
        return ResponseEntity.ok(ketQua);
    }

    // 2. TOP 6 NỔI BẬT (Biểu đồ và trang chủ)
    @GetMapping("/top-6-noi-bat")
    public List<PhongTro> layTop6NoiBat() {
        return phongTroRepo.findAll(Sort.by(Sort.Direction.DESC, "luotXem"))
                .stream().limit(6).toList();
    }

    // 3. CHI TIẾT PHÒNG
    @GetMapping("/chi-tiet-phong/{id}")
    public ResponseEntity<PhongTro> layChiTietPhong(@PathVariable Integer id) {
        return phongTroRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. TĂNG LƯỢT XEM
    @PostMapping("/tang-view/{id}")
    public ResponseEntity<String> tangView(@PathVariable Integer id) {
        try {
            phongTroRepo.tangLuotXem(id);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("ERROR");
        }
    }

    // 5. CHỦ TRỌ ĐĂNG TIN
    @PostMapping("/dang-tin")
    public String dangTin(@RequestBody PhongTroRequest req) {
        // Kiểm tra quyền hạn
        if (req.maNguoiDung != null) {
            NguoiDung user = nguoiDungRepo.findById(req.maNguoiDung).orElse(null);
            if (user != null && "SINH_VIEN".equalsIgnoreCase(user.getQuyenHan())) {
                return "LOI_QUYEN_HAN";
            }
        }
        
        PhongTro phong = new PhongTro();
        phong.setTieuDe(req.tieuDe);
        phong.setDiaChi(req.diaChi);
        phong.setGiaTien(req.giaTien);
        phong.setDienTich(req.dienTich);
        phong.setGiaDien(req.giaDien);
        phong.setGiaNuoc(req.giaNuoc);
        phong.setGanTruong(req.ganTruong); 
        phong.setHinhAnh(req.hinhAnh);
        phong.setMaNguoiDung(req.maNguoiDung);
        
        // Gán tiện ích
        phong.setKhongChungChu(req.khongChungChu);
        phong.setVeSinhKhepKin(req.veSinhKhepKin);
        phong.setCoChoNauAn(req.coChoNauAn);
        phong.setCoDieuHoa(req.coDieuHoa);
        phong.setCoBinhNongLanh(req.coBinhNongLanh);
        phong.setDeXeMienPhi(req.deXeMienPhi);
        phong.setKhoaVanTay(req.khoaVanTay);
        phong.setCoMayGiat(req.coMayGiat);

        phong.setTrangThai("CHO_DUYET");
        phong.setLuotXem(0);
        
        // --- CHÚ Ý: Đăng tin mới thì mặc định chưa phải là VIP ---
        phong.setIsVip(0); 
        
        phongTroRepo.save(phong);
        return "THANH_CONG";
    }

    // 6. ADMIN DUYỆT PHÒNG
    @PutMapping("/duyet-phong/{id}")
    public ResponseEntity<String> duyetPhong(@PathVariable Integer id, @RequestParam Integer maAdmin) {
        NguoiDung admin = nguoiDungRepo.findById(maAdmin).orElse(null);
        if (admin == null || !"QUAN_TRI".equalsIgnoreCase(admin.getQuyenHan())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("KHONG_CO_QUYEN");
        }

        return phongTroRepo.findById(id).map(p -> {
            p.setTrangThai("DA_DUYET");
            phongTroRepo.save(p);
            
            // --- LOGIC MỚI: Báo hỉ cho Chủ trọ ---
            if (p.getMaNguoiDung() != null) {
                ThongBao tbChuTro = new ThongBao();
                tbChuTro.setMaNguoiNhan(p.getMaNguoiDung());
                tbChuTro.setNoiDung("🎉 Tin đăng '" + p.getTieuDe() + "' của bạn đã được Admin phê duyệt!");
                tbChuTro.setTrangThaiXem(0);
                thongBaoRepo.save(tbChuTro);
            }

            // --- LOGIC CŨ: Thông báo cho tất cả sinh viên ---
            nguoiDungRepo.findAll().stream()
                .filter(u -> "SINH_VIEN".equalsIgnoreCase(u.getQuyenHan()))
                .forEach(sv -> {
                    ThongBao tb = new ThongBao();
                    tb.setMaNguoiNhan(sv.getMaNguoiDung());
                    tb.setNoiDung("Có phòng mới vừa duyệt: " + p.getTieuDe());
                    tb.setTrangThaiXem(0);
                    thongBaoRepo.save(tb);
                });
            return ResponseEntity.ok("OK");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 7. XÓA BÀI ĐĂNG
    @DeleteMapping("/xoa-phong/{id}")
    public ResponseEntity<String> xoaPhong(@PathVariable Integer id, @RequestParam Integer maAdmin) {
        NguoiDung admin = nguoiDungRepo.findById(maAdmin).orElse(null);
        if (admin == null || !"QUAN_TRI".equalsIgnoreCase(admin.getQuyenHan())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("KHONG_CO_QUYEN");
        }

        if (phongTroRepo.existsById(id)) {
            phongTroRepo.deleteById(id);
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.notFound().build();
    }

    // 8. LẤY TOÀN BỘ DANH SÁCH (Admin quản lý)
    @GetMapping("/danh-sach-phong-tro")
    public List<PhongTro> layTatCa(@RequestParam(required = false) String trangThai) {
        if (trangThai != null && !"TAT_CA".equals(trangThai)) {
            return phongTroRepo.findByTrangThaiOrderByMaPhongDesc(trangThai);
        }
        return phongTroRepo.findAll(Sort.by(Sort.Direction.DESC, "maPhong"));
    }

    // 9. PHÒNG CỦA RIÊNG 1 CHỦ TRỌ
    @GetMapping("/phong-tro/chu-tro/{userId}")
    public List<PhongTro> layPhongCuaChuTro(@PathVariable Integer userId) {
        return phongTroRepo.findByMaNguoiDungOrderByMaPhongDesc(userId);
    }

    // 10. API THỐNG KÊ DASHBOARD
    @GetMapping("/thong-ke")
    public Map<String, Object> layThongKe() {
        Map<String, Object> stats = new HashMap<>();
        List<PhongTro> listPhong = phongTroRepo.findAll();
        List<NguoiDung> listUser = nguoiDungRepo.findAll();

        stats.put("tongUser", listUser.size());
        stats.put("tongPhong", listPhong.size());
        stats.put("choDuyet", listPhong.stream().filter(p -> "CHO_DUYET".equals(p.getTrangThai())).count());
        stats.put("chuTro", listUser.stream().filter(u -> "CHU_TRO".equalsIgnoreCase(u.getQuyenHan())).count());
        stats.put("sinhVien", listUser.stream().filter(u -> "SINH_VIEN".equalsIgnoreCase(u.getQuyenHan())).count());
        
        long tongView = listPhong.stream()
                .mapToLong(p -> p.getLuotXem() != null ? p.getLuotXem() : 0).sum();
        stats.put("tongView", tongView);

        return stats;
    }

    // 11. TÌM KIẾM NÂNG CAO
    @GetMapping("/tim-kiem")
    public List<PhongTro> timKiemPhong(
            @RequestParam(required = false) String truong,
            @RequestParam(required = false) String khu_vuc,
            @RequestParam(required = false) String muc_gia) {
        
        Integer giaMin = null; 
        Integer giaMax = null;

        if (muc_gia != null && muc_gia.contains("-")) {
            try {
                String[] parts = muc_gia.split("-");
                giaMin = Integer.parseInt(parts[0].trim());
                giaMax = Integer.parseInt(parts[1].trim());
            } catch (Exception ignored) {}
        }

        return phongTroRepo.timKiemPhongTro(truong, khu_vuc, giaMin, giaMax);
    }

    // ==========================================
    // TÍNH NĂNG MỚI: ĐẨY PHÒNG VIP (PROMOTE)
    // ==========================================

    // 12. API ĐẨY VIP (Chủ trọ bấm)
    // 12. API ĐẨY VIP (Chủ trọ bấm)
    @PutMapping("/promote/{id}")
    public ResponseEntity<String> promotePhong(@PathVariable Integer id) {
        return phongTroRepo.findById(id).map(p -> {
            p.setIsVip(1); // Đánh dấu là muốn lên VIP
            p.setTrangThai("CHO_DUYET"); // BẮT BUỘC QUAY VỀ TRẠNG THÁI CHỜ DUYỆT ĐỂ ADMIN THẤY
            phongTroRepo.save(p);
            return ResponseEntity.ok("OK");
        }).orElse(ResponseEntity.notFound().build());
    }

    // 13. API LẤY PHÒNG VIP (Hiện lên Trang chủ)
    @GetMapping("/danh-sach-vip")
    public List<PhongTro> layPhongVip() {
        // Chỉ lấy những phòng Đã Duyệt và có is_vip = 1
        return phongTroRepo.findAll().stream()
            .filter(p -> "DA_DUYET".equals(p.getTrangThai()) && p.getIsVip() != null && p.getIsVip() == 1)
            .toList();
    }
}