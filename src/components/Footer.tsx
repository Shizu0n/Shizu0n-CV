export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-copy">&copy; {year} Paulo Shizuo</span>
        <span className="footer-tag">Minimal direction. Sharp contrast. Built to feel deliberate.</span>
      </div>
    </footer>
  )
}
