export default function MosqueSilhouette({ compact = false }: { compact?: boolean }) {
  return (
    <svg
      className={compact ? 'absolute inset-x-0 bottom-0 h-24 w-full text-[#D9B45A]/10' : 'absolute inset-x-0 bottom-0 h-28 w-full text-[#D9B45A]/10'}
      viewBox="0 0 900 190"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0 190V110h48V74h18v36h36V86c0-27 27-51 55-51s55 24 55 51v24h38V60h18v50h40v80H0Zm348 0V94h44V58h18v36h40v-5c0-35 38-68 76-68s76 33 76 68v5h42V54h18v40h44v96H348Zm440 0v-72h30V84h16v34h32v-4c0-26 28-50 57-50s57 24 57 50v4h32V88h16v30h28v72H788Z"
      />
    </svg>
  );
}
