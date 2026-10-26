// One consistent, original stroke icon set; no additional icon dependency.
const paths = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  heart: <path d="m12 21-8-8C-2 7 6 0 12 7c6-7 14 0 8 6Z" />,
  car: (
    <>
      <path d="m4 10 2-6h12l2 6M3 10h18v9H3ZM5 19v2m14-2v2M6 14h2m8 0h2" />
    </>
  ),
  roof: (
    <>
      <path d="m2 10 10-7 10 7M5 9v12h14V9M9 21v-7h6v7" />
    </>
  ),
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  filter: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="9" cy="18" r="2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  qr: (
    <>
      <path d="M3 3h6v6H3ZM15 3h6v6h-6ZM3 15h6v6H3ZM15 15h3v3h3v3h-6ZM21 12v3M12 3v6M12 12v3M3 12h6" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 1v3M12 20v3M1 12h3M20 12h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
    </>
  ),
}
export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.pin}
    </svg>
  )
}
