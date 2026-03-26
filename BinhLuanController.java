package com.trohd.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class BinhLuanController {

    @Autowired
    private BinhLuanRepository binhLuanRepo;

    @Autowired
    private PhongTroRepository phongTroRepo;

    @Autowired
    private ThongBaoRepository thongBaoRepo;

    // 1. LẤY DANH SÁCH BÌNH LUẬN (Theo phòng)
    @GetMapping("/binh-luan-theo-phong/{maPhong}")
    public ResponseEntity<List<BinhLuan>> layBinhLuan(@PathVariable Integer maPhong) {
        try {
            List<BinhLuan> danhSach = binhLuanRepo.findByMaPhongOrderByMaBinhLuanDesc(maPhong);
            return new ResponseEntity<>(danhSach, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 2. GỬI BÌNH LUẬN & THÔNG BÁO CHO CHỦ TRỌ
    @PostMapping("/gui-binh-luan")
    public ResponseEntity<String> guiBinhLuan(@RequestBody BinhLuanRequest yeuCau) {
        try {
            BinhLuan blMoi = new BinhLuan();
            blMoi.setMaPhong(yeuCau.maPhong);
            blMoi.setTenNguoiDung(yeuCau.tenNguoiDung);
            blMoi.setNoiDung(yeuCau.noiDung);
            
            // Dùng cách gọi tuyệt đối này để dập tắt lỗi đỏ lòm Timestamp
       
            
            binhLuanRepo.save(blMoi);

            // Bắn thông báo cho chủ trọ
            Optional<PhongTro> phongOpt = phongTroRepo.findById(yeuCau.maPhong);
            if (phongOpt.isPresent()) {
                PhongTro phong = phongOpt.get();
                if (phong.getMaNguoiDung() != null) {
                    ThongBao tb = new ThongBao();
                    tb.setMaNguoiNhan(phong.getMaNguoiDung());
                    tb.setNoiDung("Người dùng [" + yeuCau.tenNguoiDung + "] đã bình luận bài: " + phong.getTieuDe());
                    tb.setTrangThaiXem(0);
                    thongBaoRepo.save(tb);
                }
            }
            return new ResponseEntity<>("OK", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 3. LIKE BÌNH LUẬN (Tính năng nghịch thêm để demo)
    @PostMapping("/like-binh-luan/{id}")
    public ResponseEntity<?> likeBinhLuan(@PathVariable Integer id) {
        try {
            Optional<BinhLuan> blOpt = binhLuanRepo.findById(id);
            if (blOpt.isPresent()) {
                BinhLuan bl = blOpt.get();
                // Nếu cột luotLike bị null thì set về 0 trước khi cộng
                int likeHienTai = (bl.getLuotLike() == null) ? 0 : bl.getLuotLike();
                bl.setLuotLike(likeHienTai + 1);
                binhLuanRepo.save(bl);
                return ResponseEntity.ok("Đã Like!");
            }
            return ResponseEntity.badRequest().body("Không tìm thấy bình luận");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống");
        }
    }
}