import pyodbc
import random
import json

# Cấu hình kết nối Database (Chuẩn như cũ)
conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=localhost\SQLEXPRESS;'
    r'DATABASE=QLCuaHangLaptop;'
    r'Trusted_Connection=yes;'
)

print("Đang kết nối tới SQL Server để đắp ảnh...")
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
except Exception as e:
    print("❌ Lỗi kết nối:", e)
    exit()

# Danh sách các link ảnh Laptop thực tế cực sắc nét từ Unsplash
real_images = [
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80", # Mang dáng dấp Dell XPS
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", # Mang dáng dấp Macbook
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80", # Laptop tinh tế mỏng nhẹ
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80", # Surface / Business
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80", # Mang phong cách Gaming / RGB
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80", # Ultrabook hiện đại
    "https://images.unsplash.com/photo-1602080858428-57174f9431cf?w=800&q=80", # Laptop đang mở
    "https://images.unsplash.com/photo-1531297172868-6cb1a80693eb?w=800&q=80"  # Chụp cận cảnh phím
]

# Lấy danh sách toàn bộ Laptop trong DB
cursor.execute("SELECT MaSP FROM SanPham")
laptops = cursor.fetchall()

print(f"Đã tìm thấy {len(laptops)} Laptop. Bắt đầu thay áo mới...")

# Lặp qua từng Laptop và gắn ảnh ngẫu nhiên
count = 0
for laptop in laptops:
    ma_sp = laptop[0]
    
    # Chọn ngẫu nhiên 1 link ảnh từ mảng trên
    random_img = random.choice(real_images)
    
    # Biến nó thành chuỗi JSON (VD: '["https://..."]') để đúng chuẩn DB của bro
    img_json = json.dumps([random_img])
    
    cursor.execute("UPDATE SanPham SET HinhAnh = ? WHERE MaSP = ?", (img_json, ma_sp))
    count += 1

conn.commit()
print(f"✅ HOÀN TẤT! Đã cập nhật ảnh mạng siêu nét cho {count} sản phẩm.")

cursor.close()
conn.close()