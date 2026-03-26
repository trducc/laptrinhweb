package com.trohd.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HoTroController {

    @Autowired
    private HoTroRepository hoTroRepository;

    @Autowired
    private NguoiDungRepository nguoiDungRepository; // Cần thêm cái này để check quyền Admin

    // API nhận yêu cầu từ trang hotro.html của Sinh viên
    @PostMapping("/gui-ho-tro")
    public ResponseEntity<String> tiepNhanHoTro(@RequestBody HoTro hoTro) {
        try {
            // Mặc định là 0 (Chờ xử lý). Đảm bảo HoTro.java đã đổi sang Integer trangThai
            hoTro.setTrangThai(0); 
            hoTroRepository.save(hoTro);
            return ResponseEntity.ok("THANH_CONG");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("LOI_HE_THONG");
        }
    }

    // API lấy danh sách yêu cầu hỗ trợ cho Admin
    @GetMapping("/danh-sach-ho-tro")
    public List<HoTro> layDanhSachHoTro() {
        // Trả về toàn bộ để Admin lọc hoặc thống kê
        return hoTroRepository.findAll();
    }

    // API dành cho Admin để xử lý (ĐÃ FIX: Thêm maAdmin và Check quyền)
    @PostMapping("/phan-hoi-ho-tro/{id}")
    public ResponseEntity<String> phanHoiHoTro(@PathVariable Integer id, @RequestParam Integer maAdmin) {
        // Bước 1: Kiểm tra xem người đang thao tác có phải Admin thật không
        return nguoiDungRepository.findById(maAdmin).map(user -> {
            if (!"QUAN_TRI".equals(user.getQuyenHan())) {
                return ResponseEntity.status(403).body("BAN_KHONG_CO_QUYEN");
            }

            // Bước 2: Nếu đúng là Admin thì mới cho xử lý yêu cầu hỗ trợ
            return hoTroRepository.findById(id).map(ht -> {
                ht.setTrangThai(1); // 1: Đã giải quyết xong
                hoTroRepository.save(ht);
                return ResponseEntity.ok("THANH_CONG");
            }).orElse(ResponseEntity.notFound().build());
            
        }).orElse(ResponseEntity.status(401).body("ADMIN_KHONG_TON_TAI"));
    }
}