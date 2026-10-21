// src/components/BirdEyeIcon.jsx
// Icon chú chim dùng cho nút hiện/ẩn mật khẩu.
// - covered = true  -> chim CHE MẮT (mật khẩu đang ẩn)
// - covered = false -> chim MỞ MẮT (mật khẩu đang hiện)

export default function BirdEyeIcon({ covered = false, size = 24 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {/* Thân chim */}
      <ellipse cx="11" cy="13" rx="9" ry="8" fill="#ffb52e" stroke="#1d2b33" strokeWidth="1.6" />

      {/* Bụng (màu nhạt) */}
      <ellipse cx="10" cy="16" rx="5.5" ry="4" fill="#ffd77a" />

      {/* Mỏ chim */}
      <path
        d="M 19 11 L 23.5 13 L 19 15 Z"
        fill="#ef5a3c"
        stroke="#1d2b33"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {covered ? (
        <>
          {/* Cánh che mắt */}
          <ellipse
            cx="15"
            cy="9.5"
            rx="4.2"
            ry="3.2"
            fill="#ffd77a"
            stroke="#1d2b33"
            strokeWidth="1.3"
            transform="rotate(-12 15 9.5)"
          />
          {/* Nét mắt nhắm */}
          <path
            d="M 12.5 10 Q 15 11.5 17.5 9.8"
            fill="none"
            stroke="#1d2b33"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {/* Mắt mở */}
          <circle cx="15" cy="9.5" r="3" fill="#ffffff" stroke="#1d2b33" strokeWidth="1.3" />
          {/* Con ngươi */}
          <circle cx="15.8" cy="9.5" r="1.4" fill="#1d2b33" />
        </>
      )}
    </svg>
  );
}
