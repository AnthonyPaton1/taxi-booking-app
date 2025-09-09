import Link from "next/link";

function InfoBox({
  heading,
  backgroundColor = "bg-gray-100",
  textColor = "text-gray-800",
  buttonInfo,
  children,
}) {
  return (
    <div className={`${backgroundColor} p-6 rounded-lg shadow-md`}>
      <h2 className={`${textColor} text-2xl font-bold`}>{heading}</h2>
      <p className={`${textColor} mt-2 mb-4`}>{children}</p>

      {buttonInfo.onClick ? (
        <button
          onClick={buttonInfo.onClick}
          className={` ${buttonInfo.backgroundColor} inline-block text-white rounded-lg px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
          aria-label={buttonInfo.ariaLabel || buttonInfo.text}
        >
          {buttonInfo.text}
        </button>
      ) : (
        <Link
          href={buttonInfo.link}
          className={` ${buttonInfo.backgroundColor} inline-block text-white rounded-lg px-4 py-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
          aria-label={buttonInfo.ariaLabel || buttonInfo.text}
        >
          {buttonInfo.text}
        </Link>
      )}
    </div>
  );
}

export default InfoBox;
