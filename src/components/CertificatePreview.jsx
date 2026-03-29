import sertificatImage from "../rasm/sertificat.png";

export default function CertificatePreview({ certificate, certificateRef }) {
  const formattedDate = (() => {
    const date = new Date(certificate.issueDate);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  })();

  return (
    <div ref={certificateRef} className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-premium">
      <img src={sertificatImage} alt="Sertifikat" className="block w-full h-auto object-contain" />
      <div className="pointer-events-none absolute bottom-[5.5%] left-[17.5%] h-[8.5%] w-[28%] rounded-md bg-[#f7f1e6]" />
      <div className="pointer-events-none absolute inset-x-[8%] top-[36.4%] -translate-y-1/2 text-center">
        <p className="font-serif text-[22px] font-semibold tracking-[0.01em] text-slate-900 drop-shadow-[0_2px_14px_rgba(255,255,255,0.98)] sm:text-[34px] lg:text-[48px]">
          {certificate.fullName}
        </p>
        <p className="mt-8 text-[18px] font-bold tracking-[0.14em] text-slate-800 drop-shadow-[0_2px_12px_rgba(255,255,255,0.98)] sm:text-[28px] lg:text-[40px]">
          {certificate.score}%
        </p>
      </div>
      <div className="pointer-events-none absolute bottom-[6.4%] left-[18.6%]">
        <p className="text-[15px] font-black tracking-[0.03em] text-slate-900 sm:text-[24px] lg:text-[34px]">
          {formattedDate}
        </p>
      </div>
    </div>
  );
}
