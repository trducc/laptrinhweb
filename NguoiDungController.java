package com.trohd.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Date;


@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class NguoiDungController {

    @Autowired
    private NguoiDungRepository khoLuuTru;

    @PostMapping("/dang-nhap")
    public ResponseEntity<?> dangNhap(@RequestBody DangNhapRequest yeuCau) {
        if (yeuCau.tenDangNhap == null || yeuCau.matKhau == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("SAI");
        }
        NguoiDung nguoiDung = khoLuuTru.findByTenDangNhapAndMatKhau(yeuCau.tenDangNhap, yeuCau.matKhau);
        if (nguoiDung != null) {
            if ("BI_KHOA".equals(nguoiDung.getTrangThai()) || "Đã khóa".equals(nguoiDung.getTrangThai())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("BI_KHOA");
            }
            return ResponseEntity.ok(nguoiDung);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("SAI");
    }

@PostMapping("/dang-ky")
    public ResponseEntity<?> dangKy(@RequestBody DangKyRequest yeuCau) {
        if (yeuCau.tenDangNhap == null || yeuCau.tenDangNhap.isEmpty()) {
            return ResponseEntity.badRequest().body("LOI_DU_LIEU");
        }
        try {
            NguoiDung nguoiDungCu = khoLuuTru.findByTenDangNhap(yeuCau.tenDangNhap);
            if (nguoiDungCu != null) {
                return ResponseEntity.badRequest().body("TRUNG_TEN");
            }
            
            NguoiDung nguoiDungMoi = new NguoiDung();
            nguoiDungMoi.setTenDangNhap(yeuCau.tenDangNhap);
            nguoiDungMoi.setMatKhau(yeuCau.matKhau);
            nguoiDungMoi.setHoTen(yeuCau.hoTen);
            nguoiDungMoi.setSoDienThoai(yeuCau.soDienThoai);
            
            if (yeuCau.quyenHan == null || yeuCau.quyenHan.isEmpty()) {
                nguoiDungMoi.setQuyenHan("SINH_VIEN");
            } else {
                nguoiDungMoi.setQuyenHan(yeuCau.quyenHan);
            }
            
            nguoiDungMoi.setTrangThai("Hoạt động");
            
            
            khoLuuTru.saveAndFlush(nguoiDungMoi);
            return ResponseEntity.ok("THANH_CONG");
        } catch (Exception loi) {
            loi.printStackTrace(); // Dòng này bắt NetBeans in log đỏ lòm ra Console
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi thực sự là: " + loi.getMessage()); // Dòng này in lỗi lên Swagger
        }
    }
    @GetMapping("/danh-sach-tai-khoan")
    public List<NguoiDung> layTatCaTaiKhoan(
            @RequestParam(required = false) String quyenHan,
            @RequestParam(required = false) String trangThai) {
        boolean coLocQuyen = quyenHan != null && !quyenHan.isEmpty() && !"TAT_CA".equals(quyenHan);
        boolean coLocTrangThai = trangThai != null && !trangThai.isEmpty() && !"TAT_CA".equals(trangThai);
        
        if (coLocQuyen && coLocTrangThai) {
            return khoLuuTru.findByQuyenHanAndTrangThai(quyenHan, trangThai);
        } else if (coLocQuyen) {
            return khoLuuTru.findByQuyenHan(quyenHan);
        } else if (coLocTrangThai) {
            return khoLuuTru.findByTrangThai(trangThai);
        }
        return khoLuuTru.findAll();
    }

    @PutMapping("/trang-thai-tai-khoan/{id}")
    public ResponseEntity<?> thayDoiTrangThaiTaiKhoan(@PathVariable Integer id, @RequestParam String trangThaiMoi) {
        NguoiDung nguoiDung = khoLuuTru.findById(id).orElse(null);
        if (nguoiDung != null) {
            nguoiDung.setTrangThai(trangThaiMoi);
            khoLuuTru.saveAndFlush(nguoiDung);
            return ResponseEntity.ok("OK");
        }
        return ResponseEntity.badRequest().body("LOI");
    }
    
}