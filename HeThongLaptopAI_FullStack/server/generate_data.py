import pyodbc
from faker import Faker
import random
from datetime import datetime, timedelta

# Khởi tạo Faker chuẩn Tiếng Việt
fake = Faker('vi_VN')

# Cấu hình kết nối Database 
conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=localhost\SQLEXPRESS;'
    r'DATABASE=QLCuaHangLaptop;'
    r'Trusted_Connection=yes;'
)

print("Đang kết nối tới SQL Server...")
try:
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    print("✅ Kết nối Database thành công! Bắt đầu quá trình BƠM DỮ LIỆU...\n")
except Exception as e:
    print("❌ Lỗi kết nối:", e)
    exit()

NUM_USERS = 50
NUM_LAPTOPS = 50
NUM_ORDERS = 50

# ==========================================
# 1. BƠM TÀI KHOẢN KHÁCH HÀNG (ĐÃ FIX LỖI TRÙNG EMAIL)
# ==========================================
print(f"🔄 Đang tạo {NUM_USERS} tài khoản khách hàng...")
user_ids = []

# Lấy các ID cũ (nếu có) để nhỡ script chạy ít user hơn dự kiến vẫn có user để tạo đơn
cursor.execute("SELECT MaTK FROM TaiKhoan WHERE VaiTro = 'Customer'")
user_ids.extend([row[0] for row in cursor.fetchall()])

for i in range(NUM_USERS):
    hoten = fake.name()
    # Ép email độc nhất 100% bằng cách nối index và số ngẫu nhiên
    email = f"user{i}_{random.randint(100000, 999999)}@ailaptop.com" 
    sdt = fake.phone_number()
    diachi = fake.address().replace('\n', ', ')
    ngaytao = fake.date_between(start_date='-2y', end_date='today')
    
    try:
        cursor.execute("""
            INSERT INTO TaiKhoan (HoTen, Email, MatKhau, SoDienThoai, DiaChi, VaiTro, NgayTao, TrangThai)
            OUTPUT inserted.MaTK
            VALUES (?, ?, ?, ?, ?, 'Customer', ?, 1)
        """, (hoten, email, '123456', sdt, diachi, ngaytao))
        user_ids.append(cursor.fetchone()[0])
    except pyodbc.IntegrityError:
        # Nếu SQL vẫn báo trùng, tự động bỏ qua và tạo người tiếp theo (Không sập tool)
        continue 

conn.commit()
print(f"✅ Hoàn tất! Hiện có tổng cộng {len(user_ids)} Khách hàng để tạo đơn.\n")

# ==========================================
# 2. BƠM SẢN PHẨM LAPTOP MỚI
# ==========================================
print(f"🔄 Đang tạo {NUM_LAPTOPS} Laptop ngẫu nhiên...")
cursor.execute("SELECT MaHang FROM Hang")
hang_ids = [row[0] for row in cursor.fetchall()]
cursor.execute("SELECT MaDM FROM DanhMuc")
dm_ids = [row[0] for row in cursor.fetchall()]

if not hang_ids or not dm_ids:
    print("⚠️ BẠN CHƯA CÓ HÃNG HOẶC DANH MỤC TRONG DB. HÃY THÊM ÍT NHẤT 1 HÃNG VÀ 1 DANH MỤC NHÉ!")
    exit()

laptop_data = [] 
cpus = ['Core i5 12500H', 'Core i7 13700H', 'Ryzen 7 7735HS', 'Apple M2', 'Core i9 13900HX']
vgas = ['RTX 3050', 'RTX 4060', 'RTX 4070', 'Iris Xe Graphics', 'Radeon 680M']

for i in range(NUM_LAPTOPS):
    tensp = f"Laptop AI {fake.word().capitalize()} Series {i+1}"
    mahang = random.choice(hang_ids)
    madm = random.choice(dm_ids)
    giaban = random.randint(15, 60) * 1000000 
    cpu = random.choice(cpus)
    vga = random.choice(vgas)
    
    try:
        cursor.execute("""
            INSERT INTO SanPham (TenSP, MaHang, MaDM, GiaBan, SoLuongTon, HinhAnh, CPU, RAM, O_Cung, VGA, ManHinh, MoTa, TrangThai)
            OUTPUT inserted.MaSP, inserted.GiaBan
            VALUES (?, ?, ?, ?, 100, '["/laptop-demo.png"]', ?, '16GB', '512GB SSD', ?, '15.6 inch FHD', 'Laptop sinh tự động cho thuật toán AI', 1)
        """, (tensp, mahang, madm, giaban, cpu, vga))
        row = cursor.fetchone()
        laptop_data.append({"MaSP": row[0], "GiaBan": row[1]})
    except:
        continue
        
conn.commit()
print("✅ Hoàn tất tạo Laptop!\n")

# ==========================================
# 3. BƠM ĐƠN HÀNG VÀ CHI TIẾT ĐƠN HÀNG
# ==========================================
print(f"🔄 Đang tạo {NUM_ORDERS} Đơn hàng & Lịch sử mua sắm (Sẽ mất khoảng 1-2 phút)...")
phuong_thuc = ['COD', 'Chuyển khoản', 'VNPay', 'MoMo']
trang_thai = ['Đã giao', 'Đang xử lý', 'Chờ xác nhận', 'Đã hủy']

# Đề phòng mảng laptop_data bị trống nếu chạy script nhiều lần
if len(laptop_data) == 0:
    cursor.execute("SELECT MaSP, GiaBan FROM SanPham")
    for row in cursor.fetchall():
        laptop_data.append({"MaSP": row[0], "GiaBan": row[1]})

for i in range(NUM_ORDERS):
    if len(user_ids) == 0 or len(laptop_data) == 0:
        break
        
    matk = random.choice(user_ids)
    ngaydat = fake.date_time_between(start_date='-1y', end_date='now')
    pt = random.choice(phuong_thuc)
    tt = random.choice(trang_thai)
    
    is_spam = 1 if random.random() < 0.05 else 0
    risk_score = random.uniform(0.8, 1.0) if is_spam else random.uniform(0.0, 0.4)
    if is_spam: tt = 'Bị từ chối (Spam)'
    
    dathanhtoan = 1 if pt != 'COD' and tt != 'Đã hủy' and not is_spam else 0

    cursor.execute("""
        INSERT INTO DonHang (MaTK, NgayDat, TongTien, PhuongThucThanhToan, TrangThai, RiskScore_AI, IsSpam, DaThanhToan)
        OUTPUT inserted.MaDH
        VALUES (?, ?, 0, ?, ?, ?, ?, ?)
    """, (matk, ngaydat, pt, tt, risk_score, is_spam, dathanhtoan))
    madh = cursor.fetchone()[0]

    num_items = random.randint(1, 3)
    chosen_laptops = random.sample(laptop_data, min(num_items, len(laptop_data)))
    tong_tien_don = 0

    for laptop in chosen_laptops:
        soluong = random.randint(1, 2)
        giaban = laptop["GiaBan"]
        tong_tien_don += soluong * giaban
        
        cursor.execute("""
            INSERT INTO ChiTietDonHang (MaDH, MaSP, SoLuong, GiaBan)
            VALUES (?, ?, ?, ?)
        """, (madh, laptop["MaSP"], soluong, giaban))
        
    cursor.execute("UPDATE DonHang SET TongTien = ? WHERE MaDH = ?", (tong_tien_don, madh))

    if (i + 1) % 500 == 0:
        print(f"  ... Đã tạo {i + 1}/{NUM_ORDERS} đơn hàng")
        conn.commit() 

conn.commit()
print("\n🎉 THÀNH CÔNG RỰC RỠ! DATABASE ĐÃ SN SÀNG CHO MACHINE LEARNING!")

cursor.close()
conn.close()