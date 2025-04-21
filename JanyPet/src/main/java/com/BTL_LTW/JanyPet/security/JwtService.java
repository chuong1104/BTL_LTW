package com.BTL_LTW.JanyPet.security;

import com.BTL_LTW.JanyPet.entity.User;
import com.BTL_LTW.JanyPet.repository.UserRepository;
import com.BTL_LTW.JanyPet.service.Interface.UserService;
import io.jsonwebtoken.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    @Value("${app.jwtSecret}")
    private String jwtSecret;

    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Value("${app.jwtRefreshExpirationMs}")
    private int jwtRefreshExpirationMs;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService; // Add UserService dependency

    public String generateToken(Authentication authentication) {
        User userPrincipal = (User) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String generateRefreshToken(User user) {
        return Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtRefreshExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            // Chữ ký JWT không hợp lệ
        } catch (MalformedJwtException e) {
            // Token JWT không đúng định dạng
        } catch (ExpiredJwtException e) {
            // Token JWT đã hết hạn
        } catch (UnsupportedJwtException e) {
            // Token JWT không được hỗ trợ
        } catch (IllegalArgumentException e) {
            // Chuỗi claims rỗng
        }
        return false;
    }

    public String refreshToken(String refreshToken) {
        if (!validateToken(refreshToken)) {
            throw new RuntimeException("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        String userId = getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra refresh token có khớp với token trong database không
        if (!refreshToken.equals(user.getRefreshToken())) {
            throw new RuntimeException("Refresh token không khớp");
        }

        // Kiểm tra thời gian hết hạn của refresh token
        if (user.getTokenExpiry() < System.currentTimeMillis()) {
            throw new RuntimeException("Refresh token đã hết hạn");
        }

        // Tạo token mới
        String newToken = Jwts.builder()
                .setSubject(user.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(SignatureAlgorithm.HS512, jwtSecret)
                .compact();

        return newToken;
    }

    public Claims extractClaim(String token) {
        return Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
    }

    public Date getExpirationFromToken(String token) {
        return extractClaim(token).getExpiration();
    }
}
