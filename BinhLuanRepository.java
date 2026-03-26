package com.trohd.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BinhLuanRepository extends JpaRepository<BinhLuan, Integer> {
    
    // Tìm danh sách bình luận theo mã phòng và sắp xếp cái mới nhất lên đầu
    List<BinhLuan> findByMaPhongOrderByMaBinhLuanDesc(Integer maPhong);
    
}