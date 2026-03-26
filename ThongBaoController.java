package com.trohd.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class ThongBaoController {

    @Autowired
    private ThongBaoRepository repo;

    @GetMapping("/danh-sach-thong-bao/{maNguoiNhan}")
    public ResponseEntity<?> layThongBaoCuaNguoiDung(@PathVariable Integer maNguoiNhan) {
        try {
            List<ThongBao> danhSach = repo.findByMaNguoiNhanOrderByNgayTaoDesc(maNguoiNhan);
            return ResponseEntity.ok(danhSach);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("LOI");
        }
    }

    @PostMapping("/danh-dau-da-xem/{maThongBao}")
    public ResponseEntity<?> danhDauDaXem(@PathVariable Integer maThongBao) {
        try {
            ThongBao tb = repo.findById(maThongBao).orElse(null);
            if (tb != null) {
                tb.setTrangThaiXem(1);
                repo.save(tb);
                return ResponseEntity.ok("OK");
            }
            return ResponseEntity.badRequest().body("KHONG_THAY");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("LOI");
        }
    }
    
    @PostMapping("/gui-thong-bao-he-thong")
    public ResponseEntity<?> guiThongBao(@RequestBody ThongBao tb) {
        try {
            tb.setTrangThaiXem(0);
            repo.save(tb);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("LOI");
        }
    }
}