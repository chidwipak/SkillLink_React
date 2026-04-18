import { Outlet } from 'react-router-dom'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import FloatingActionButton from '../components/common/FloatingActionButton'

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col position-relative" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      overflow: 'hidden'
    }}>
      {/* Animated Background Particles */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0, pointerEvents: 'none' }}>
        <div className="floating-particle floating-particle-1"></div>
        <div className="floating-particle floating-particle-2"></div>
        <div className="floating-particle floating-particle-3"></div>
      </div>
      
      <Header />
      <main className="flex-1 pt-20 animate-fade-in-up position-relative" style={{ zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
      <FloatingActionButton />
    </div>
  )
}

export default MainLayout
