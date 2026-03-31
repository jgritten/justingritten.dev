import { Text } from '@radix-ui/themes'
import { metricsApi } from '@/api'
import { useIsDarkTheme } from '@/contexts/ThemeContext'
import './Footer.css'

/** Update these to your real URLs. Resume is served from public/ and deployed with the site. */
const FOOTER_LINKS = {
  resume: '/JustinGrittenResume.pdf',
  linkedIn: 'https://linkedin.com/in/justingritten',
  email: 'mailto:justin.gritten@gmail.com',
} as const

const FOOTER_METRIC_ROUTES = {
  resume: '/outbound/resume',
  linkedIn: '/outbound/linkedin',
  email: '/outbound/email',
} as const

export function Footer() {
  const isDark = useIsDarkTheme()
  const faviconSrc = isDark ? '/favicon_white.png' : '/favicon.png'
  const trackFooterAction = (route: string) => {
    metricsApi.recordVisit(route).catch(() => {})
  }

  return (
    <footer className="footer" role="contentinfo">
      <a href="/" className="footer__logo" aria-label="Home">
        <img
          src={faviconSrc}
          alt=""
          className="footer__favicon"
          width={24}
          height={24}
        />
      </a>
      <nav className="footer__links" aria-label="Footer links">
        <a
          href={FOOTER_LINKS.resume}
          target="_blank"
          rel="noopener noreferrer"
          className="footer__link"
          onClick={() => trackFooterAction(FOOTER_METRIC_ROUTES.resume)}
        >
          <Text size="1">Resume</Text>
        </a>
        <a
          href={FOOTER_LINKS.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className="footer__link"
          onClick={() => trackFooterAction(FOOTER_METRIC_ROUTES.linkedIn)}
        >
          <Text size="1">LinkedIn</Text>
        </a>
        <a
          href={FOOTER_LINKS.email}
          className="footer__link"
          onClick={() => trackFooterAction(FOOTER_METRIC_ROUTES.email)}
        >
          <Text size="1">Email</Text>
        </a>
      </nav>
    </footer>
  )
}
