import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    services: [
      { name: 'Electrician', href: '/services?category=electrician' },
      { name: 'Plumber', href: '/services?category=plumber' },
      { name: 'Carpenter', href: '/services?category=carpenter' },
      { name: 'Cleaning', href: '/services?category=cleaning' },
      { name: 'All Services', href: '/services' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
    providers: [
      { name: 'Become a Worker', href: '/register' },
      { name: 'Become a Seller', href: '/register' },
      { name: 'Delivery Partner', href: '/register' },
      { name: 'Partner Resources', href: '/resources' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQs', href: '/faqs' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', href: '#' },
    { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z', href: '#' },
    { name: 'Instagram', icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 0 0 3-3v-11a3 3 0 0 0-3-3h-11a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3z', href: '#' },
    { name: 'LinkedIn', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z', href: '#' },
  ]

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#0a0a0f', color: '#d4d4d8' }}>
      {/* Subtle gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, #6366f1, transparent)' }}></div>
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 group mb-5 no-underline">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}>
                S
              </div>
              <span className="text-2xl font-extrabold">
                <span className="bg-gradient-to-r from-indigo-400 to-indigo-500 bg-clip-text text-transparent">Skill</span>
                <span className="text-white">Link</span>
              </span>
            </Link>
            <p className="text-gray-500 mb-5 leading-relaxed text-sm max-w-xs">
              Your trusted platform for professional home services. Connecting skilled workers with customers for seamless service experiences.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-indigo-600 hover:border-indigo-600 hover:text-white hover:shadow-lg transition-all duration-300"
                  style={{ '--tw-shadow-color': 'rgba(99, 102, 241, 0.3)' }}
                  aria-label={social.name}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-500 text-sm hover:text-indigo-400 transition-colors duration-200 no-underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-500 text-sm hover:text-indigo-400 transition-colors duration-200 no-underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest">Providers</h4>
            <ul className="space-y-2.5">
              {footerLinks.providers.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-500 text-sm hover:text-indigo-400 transition-colors duration-200 no-underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4 text-xs uppercase tracking-widest">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-gray-500 text-sm hover:text-indigo-400 transition-colors duration-200 no-underline">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Stay in the loop</h3>
              <p className="text-gray-500 text-sm">Get the latest updates and exclusive offers.</p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600"
              />
              <button className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm border-0 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} SkillLink. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/terms" className="text-gray-600 text-sm hover:text-indigo-400 transition-colors no-underline">Terms</Link>
              <Link to="/privacy" className="text-gray-600 text-sm hover:text-indigo-400 transition-colors no-underline">Privacy</Link>
              <Link to="/cookies" className="text-gray-600 text-sm hover:text-indigo-400 transition-colors no-underline">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
