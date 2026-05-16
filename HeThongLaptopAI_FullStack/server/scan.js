const apiKey = "AIzaSyBosabEgOGCg_siW3kJCUqyTgihmxAmGAQ"; // Lấy key trong file .env dán thẳng vào đây

async function scanGoogleModels() {
    console.log("Đang quét danh sách AI từ trạm vũ trụ Google...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("🚨 API KEY LỖI NẶNG:", data.error.message);
            return;
        }

        console.log("\n✅ DANH SÁCH CÁC AI ĐƯỢC PHÉP SỬ DỤNG:");
        data.models.forEach(m => {
            // Chỉ in ra những con AI hỗ trợ chat (generateContent)
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log("👉 Tên Model:", m.name.replace('models/', ''));
            }
        });
        console.log("\n(Bro hãy copy một cái Tên Model ở trên dán cho tôi xem nhé!)");

    } catch (err) {
        console.log("Lỗi mạng:", err);
    }
}

scanGoogleModels();