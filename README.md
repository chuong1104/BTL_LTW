# BTL_LTW

# Sau khi clone

- Khởi động dự án trong IntelliJ
- Run

# Truy cập trang admin: http://localhost:8080/admin.html
username: admin@gmail.com
password: password123

# Cập nhật đường dẫn tới Database trong file application.properties/ application.yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: "jdbc:mysql://localhost:3307/janypet" - Đổi thành url database
    username: 
    password:
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
    open-in-view: false
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
  web:
    resources:
      static-locations: classpath:/static/,file:${file.upload-dir}/
      add-mappings: true
  mvc:
    static-path-pattern: /**

logging:
  level:
    com.BTL_LTW.JanyPet.configuration: DEBUG
    org.springframework.web: INFO

file:
  - Nếu bạn chạy trên Windows, giữ nguyên D:/…; nếu trên Linux/Mac, có thể chuyển thành ./uploads
  upload-dir: D:/BTL_LTW/uploads

app:
  base-url: http://localhost:8080
  jwtSecret: uHqYj4Pk3mZqKmJ9Y2Ey2K8MdGnM9N9uRPv4RYjUDe4GHZ3xJv1pUlWHez2WUkcFZyrK52xVbbFwCWXEtZxpWg==
  jwtExpirationMs: 86400000
  jwtRefreshExpirationMs: 604800000

