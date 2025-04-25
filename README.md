# BTL_LTW

## Sau khi clone

- Khởi động dự án trong IntelliJ  
- Run

## Truy cập trang admin

**URL:** [http://localhost:8080/admin.html](http://localhost:8080/admin.html)  
**Username:** `admin@gmail.com`  
**Password:** `password123`

## Cập nhật đường dẫn tới Database trong file `application.properties` hoặc `application.yaml`

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: "jdbc:mysql://localhost:3307/janypet" # Đổi thành url database
    username: 
    password:
    driver-class-name: com.mysql.cj.jdbc.Driver

file:
  # Điều chỉnh theo đường dẫn trong máy
  upload-dir: D:/BTL_LTW/uploads

