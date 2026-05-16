export const calculateAIScore = (giaBan: number | string, maSP: number | string) => {
    const price = Number(giaBan) || 0;
    const id = Number(maSP) || 0;

    // Công thức: Base 65 + (Giá / 1 củ) * 0.7 + (ID % 5) để tạo sự xê dịch nhẹ
    const rawScore = 65 + (price / 1000000) * 0.7 + (id % 5);

    // Đảm bảo điểm kịch kim là 99
    return Math.min(99, Math.floor(rawScore));
};