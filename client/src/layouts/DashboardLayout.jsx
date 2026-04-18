import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from '../components/common/Sidebar'
import Header from '../components/common/Header'

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex flex-1" style={{ marginTop: '72px', paddingTop: '4px' }}>
        <Sidebar userRole={user?.role} />
        <main 
          className="flex-1 overflow-auto page-enter"
          style={{
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #eef2ff 100%)',
            minHeight: 'calc(100vh - 80px)',
            padding: '8px 0 0 0'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
